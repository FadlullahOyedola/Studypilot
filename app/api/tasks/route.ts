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
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, tasks: data })
}

export async function POST(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.plan === 'free') {
        const { count } = await supabaseAdmin
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('done', false)

        if ((count || 0) >= 20)
            return NextResponse.json({ error: 'Free plan limit reached. Upgrade to Pro.' }, { status: 403 })
    }

    const { title, subject, priority = 'medium', color = '#7c3aed', deadline } = await req.json()

    if (!title || !subject)
        return NextResponse.json({ error: 'Title and subject are required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
        .from('tasks')
        .insert({ user_id: user.id, title, subject, priority, color, deadline })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, task: data })
}

export async function PATCH(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })

    if (updates.done === true) {
        updates.completed_at = new Date().toISOString()
        await supabaseAdmin
            .from('users')
            .update({ xp: user.xp + 10 })
            .eq('id', user.id)
    }

    const { data, error } = await supabaseAdmin
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, task: data })
}

export async function DELETE(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })

    const { error } = await supabaseAdmin
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, message: 'Task deleted' })
}
