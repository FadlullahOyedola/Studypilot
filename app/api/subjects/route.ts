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
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, subjects: data })
}

export async function POST(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.plan === 'free') {
        const { count } = await supabaseAdmin
            .from('subjects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if ((count || 0) >= 3)
            return NextResponse.json({ error: 'Free plan limited to 3 subjects. Upgrade to Pro.' }, { status: 403 })
    }

    const { name, color = '#7c3aed', target_hours = 20 } = await req.json()

    if (!name)
        return NextResponse.json({ error: 'Subject name is required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
        .from('subjects')
        .insert({ user_id: user.id, name, color, target_hours })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, subject: data })
}

export async function DELETE(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 })

    const { error } = await supabaseAdmin
        .from('subjects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, message: 'Subject deleted' })
}
