import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, supabaseAdmin } from '@/lib/supabase'

async function getUser(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null
    return getUserFromToken(token)
}

export async function GET(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, notes: data })
}

export async function POST(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { subject, content, color = '#7c3aed' } = await req.json()

    if (!subject || !content)
        return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
        .from('notes')
        .insert({ user_id: user.id, subject, content, color })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, note: data })
}

export async function PATCH(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
        .from('notes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, note: data })
}

export async function DELETE(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })

    const { error } = await supabaseAdmin
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, message: 'Note deleted' })
}
