import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Check auth first — RLS will also enforce this, but failing early
  // gives a clearer error than an empty result set
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status') // 'settled' | 'unsettled' | null
  const type = searchParams.get('type')     // 'owed_to_me' | 'i_owe' | null

  // Validate query params before hitting the DB
  const validStatuses = ['settled', 'unsettled']
  const validTypes = ['owed_to_me', 'i_owe']

  if (status && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    )
  }

  if (type && !validTypes.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
      { status: 400 }
    )
  }

  let query = supabase
    .from('debts')
    .select('*')
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  if (status === 'settled') {
    query = query.not('settled_at', 'is', null)
  } else if (status === 'unsettled') {
    query = query.is('settled_at', null)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching debts:', error)
    return NextResponse.json({ error: 'Failed to fetch debts' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { type, counterpart_name, amount, note, due_date } = body

  // Validation
  const validTypes = ['owed_to_me', 'i_owe']
  if (!type || !validTypes.includes(type)) {
    return NextResponse.json(
      { error: `type is required and must be one of: ${validTypes.join(', ')}` },
      { status: 400 }
    )
  }

  if (!counterpart_name || typeof counterpart_name !== 'string' || counterpart_name.trim() === '') {
    return NextResponse.json({ error: 'counterpart_name is required' }, { status: 400 })
  }

  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount is required and must be a positive integer' }, { status: 400 })
  }

  if (due_date && isNaN(Date.parse(due_date))) {
    return NextResponse.json({ error: 'due_date must be a valid date' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('debts')
    .insert({
      user_id: user.id,
      type,
      counterpart_name: counterpart_name.trim(),
      amount,
      note: note ?? null,
      due_date: due_date ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating debt:', error)
    return NextResponse.json({ error: 'Failed to create debt' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}