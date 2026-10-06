'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function blockUserAction(
  userId: string,
  status: 'active' | 'blocked'
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        status,
        last_active: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    revalidatePath('/admin/users');

    return { success: true };
  } catch (error: unknown) {
    console.error('Block user error:', error);
    return {
      success: false,
      error: 'Failed to update user status',
    };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }

    revalidatePath('/admin/users');

    return { success: true };
  } catch (error: unknown) {
    console.error('Delete user error:', error);
    return {
      success: false,
      error: 'Failed to delete user',
    };
  }
}