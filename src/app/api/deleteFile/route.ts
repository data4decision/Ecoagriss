import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

interface DeleteRequestBody {
  public_id?: string;
  doc_id?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DeleteRequestBody;

    const publicId = body.public_id?.trim();
    const docId = body.doc_id?.trim();

    if (!publicId || !docId) {
      return NextResponse.json(
        {
          error:
            'Invalid request: public_id and doc_id are required.',
        },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !cloudName ||
      !apiKey ||
      !apiSecret
    ) {
      console.error(
        'Cloudinary server configuration is incomplete.'
      );

      return NextResponse.json(
        {
          error: 'Cloudinary is not properly configured.',
        },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        'Supabase server configuration is incomplete.'
      );

      return NextResponse.json(
        {
          error: 'Supabase is not properly configured.',
        },
        { status: 500 }
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Delete the file from Cloudinary.
    const cloudinaryResult =
      await cloudinary.uploader.destroy(publicId);

    if (
      !['ok', 'not found'].includes(
        cloudinaryResult.result
      )
    ) {
      throw new Error(
        `Cloudinary delete failed: ${cloudinaryResult.result}`
      );
    }

    // 2. Delete the file record from Supabase.
    const { error: databaseError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', docId);

    if (databaseError) {
      throw databaseError;
    }

    return NextResponse.json({
      message:
        'File deleted permanently from Cloudinary and database.',
    });
  } catch (error: unknown) {
    console.error('Delete file error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to delete file.',
        details: message,
      },
      { status: 500 }
    );
  }
}