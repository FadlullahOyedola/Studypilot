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
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, sessions: data })
}

export async function POST(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { subject, duration_minutes, session_type = 'pomodoro' } = await req.json()

    if (!subject || !duration_minutes)
        return NextResponse.json({ error: 'Subject and duration are required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
        .from('sessions')
        .insert({ user_id: user.id, subject, duration_minutes, session_type })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Award XP for completing a session
    const xpEarned = Math.floor(duration_minutes / 5)
    await supabaseAdmin
        .from('users')
        .update({ xp: user.xp + xpEarned })
        .eq('id', user.id)

    return NextResponse.json({ success: true, session: data, xpEarned })
}
