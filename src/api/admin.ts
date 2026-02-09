// src/api/admin.ts
import { supabase } from '../supabaseClient'
import type { Gardener } from './gardeners'

export async function getAllGardeners(): Promise<Gardener[]> {
  const { data, error } = await supabase
    .from('gardeners')
    .select('*')
    .order('line_position', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function updateGardener(
  id: string,
  updates: Partial<Omit<Gardener, 'id' | 'created_at' | 'updated_at'>>
): Promise<Gardener> {
  const { data, error } = await supabase
    .from('gardeners')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteGardener(id: string): Promise<void> {
  const { error } = await supabase
    .from('gardeners')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function addGardenerAdmin(payload: {
  name: string
  email: string
  phone?: string
  address?: string
  experience?: string
  notes?: string
}): Promise<Gardener> {
  // Get next line position
  const { data: maxRows, error: maxErr } = await supabase
    .from('gardeners')
    .select('line_position')
    .order('line_position', { ascending: false })
    .limit(1)

  if (maxErr) throw new Error(maxErr.message)

  const max = maxRows && maxRows.length > 0 ? maxRows[0].line_position : 0
  const nextPosition = max + 1

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('gardeners')
    .insert([
      {
        ...payload,
        line_position: nextPosition,
        created_at: now,
        updated_at: now,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function reorderGardeners(updates: { id: string; line_position: number }[]): Promise<void> {
  // Update all positions in a transaction-like manner
  for (const update of updates) {
    const { error } = await supabase
      .from('gardeners')
      .update({ line_position: update.line_position })
      .eq('id', update.id)

    if (error) throw new Error(error.message)
  }
}
