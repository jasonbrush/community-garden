// src/api/gardeners.ts

export type Gardener = {
  id: string
  line_position: number
  name: string
  email: string
  phone: string | null
  address: string | null
  experience: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Public form goes through Netlify Function (handles reCAPTCHA + Supabase)
export async function addGardenerPublic(payload: {
  name: string
  email: string
  phone?: string
  address?: string
  experience?: string
  notes?: string
  captchaToken: string
}): Promise<Gardener> {
  const res = await fetch('/.netlify/functions/submit-gardener', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error: any = new Error(data.message || 'Request failed')
    if (data.code) error.code = data.code
    throw error
  }

  return data as Gardener
}