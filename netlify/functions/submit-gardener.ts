// netlify/functions/submit-gardener.ts
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL as string
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET as string

function checkEnv() {
  const missing: string[] = []
  if (!SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!RECAPTCHA_SECRET) missing.push('RECAPTCHA_SECRET')
  if (missing.length) {
    return { ok: false, message: `Missing env vars: ${missing.join(', ')}. Add them in Netlify → Site settings → Environment variables.` }
  }
  return { ok: true }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export const handler: Handler = async (event) => {
  const envCheck = checkEnv()
  if (!envCheck.ok) {
    console.error(envCheck.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server configuration error' }),
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const {
      name,
      email,
      phone,
      address,
      experience,
      notes,
      captchaToken,
    } = body

    if (!captchaToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing CAPTCHA token' }),
      }
    }

    // 1) Verify reCAPTCHA with Google[web:393]
    const verifyRes = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: RECAPTCHA_SECRET,
          response: captchaToken,
        }),
      },
    )

    const verifyJson = await verifyRes.json()
    if (!verifyJson.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'reCAPTCHA verification failed' }),
      }
    }

    // 2) Compute next line_position
    const { data: maxRows, error: maxErr } = await supabase
      .from('gardeners')
      .select('line_position')
      .order('line_position', { ascending: false })
      .limit(1)

    if (maxErr) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: maxErr.message }),
      }
    }

    const max = maxRows && maxRows.length > 0 ? maxRows[0].line_position : 0
    const nextPosition = max + 1

    // 3) Insert new gardener row
    const { data, error } = await supabase
      .from('gardeners')
      .insert([
        {
          name,
          email,
          phone: phone ?? null,
          address: address ?? null,
          experience: experience ?? null,
          notes: notes ?? null,
          line_position: nextPosition,
        },
      ])
      .select()
      .single()

    if (error) {
      // 23505 = unique constraint violation (e.g., unique email)[web:338][web:353]
      if ((error as any).code === '23505') {
        return {
          statusCode: 409,
          body: JSON.stringify({
            code: '23505',
            message: 'Email already signed up',
          }),
        }
      }

      return {
        statusCode: 400,
        body: JSON.stringify({ message: error.message }),
      }
    }

    // 4) Success: return created row
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (err: any) {
    console.error('submit-gardener error', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' }),
    }
  }
}