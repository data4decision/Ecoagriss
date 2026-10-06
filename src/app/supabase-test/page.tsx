'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SupabaseTestPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

async function handleTest() {
  setLoading(true)
  setResult('')

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    })

  if (authError) {
    setResult(`Authentication failed:\n${authError.message}`)
    setLoading(false)
    return
  }

  const { data: sessionData } = await supabase.auth.getSession()

  const user = authData.user
  const session = sessionData.session

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('country')
    .eq('id', user.id)
    .single()

  const { data: countries, error: databaseError } = await supabase
    .from('countries')
    .select('id, name, iso_code')
    .order('id')

  const { data: agriculturalInputs, error: agriculturalError } =
    await supabase
      .from('agricultural_inputs')
      .select('country_id, year')
      .order('year')

  const { data: livestockData, error: livestockError } =
    await supabase
      .from('livestock_data')
      .select('country_id, year')
      .order('year')

  const agriculturalCountryIds = [
    ...new Set(
      (agriculturalInputs ?? []).map((row) => row.country_id)
    ),
  ]

  const livestockCountryIds = [
    ...new Set(
      (livestockData ?? []).map((row) => row.country_id)
    ),
  ]

  setResult(
    JSON.stringify(
      {
        authentication: 'SUCCESS',
        user_id: user?.id ?? null,
        user_email: user?.email ?? null,
        session_exists: Boolean(session),
        access_token_exists: Boolean(session?.access_token),

        profile_country: profile?.country ?? null,
        profile_error: profileError?.message ?? null,

        countries_loaded: countries?.length ?? 0,
        countries_error: databaseError?.message ?? null,

        agricultural_inputs: {
          query_status: agriculturalError
            ? 'FAILED'
            : 'SUCCESS',
          rows_returned: agriculturalInputs?.length ?? 0,
          country_ids_returned: agriculturalCountryIds,
          error: agriculturalError?.message ?? null,
        },

        livestock_data: {
          query_status: livestockError
            ? 'FAILED'
            : 'SUCCESS',
          rows_returned: livestockData?.length ?? 0,
          country_ids_returned: livestockCountryIds,
          error: livestockError?.message ?? null,
        },
      },
      null,
      2
    )
  )

  setLoading(false)
}

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Supabase Authentication Test</h1>

      <p>Enter your temporary Supabase account details.</p>

      <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{ padding: '0.75rem' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ padding: '0.75rem' }}
        />

        <button
          type="button"
          onClick={handleTest}
          disabled={loading}
          style={{ padding: '0.75rem' }}
        >
          {loading ? 'Testing...' : 'Test Supabase'}
        </button>
      </div>

      {result && (
        <pre
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f5f5f5',
            overflowX: 'auto',
          }}
        >
          {result}
        </pre>
      )}
    </main>
  )
}
