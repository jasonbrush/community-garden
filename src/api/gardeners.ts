import { supabase } from '../supabaseClient'

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

export async function addGardenerPublic(payload: {
  name: string
  email: string
  phone?: string
  address?: string
  experience?: string
  notes?: string
}) {
  const { data: maxRows, error: maxErr } = await supabase
    .from('gardeners')
    .select('line_position')
    .order('line_position', { ascending: false })
    .limit(1)

  if (maxErr) throw maxErr
  const max = maxRows && maxRows.length > 0 ? maxRows[0].line_position : 0
  const nextPosition = max + 1

  const { data, error } = await supabase
    .from('gardeners')
    .insert([{ ...payload, line_position: nextPosition }])
    .select()
    .single()

  if (error) throw error
  return data as Gardener
}

export async function listGardeners(): Promise<Gardener[]> {
  const { data, error } = await supabase
    .from('gardeners')
    .select('*')
    .order('line_position', { ascending: true })

  if (error) throw error
  return data as Gardener[]
}