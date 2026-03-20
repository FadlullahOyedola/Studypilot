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
    return NextResponse.json({ success: true, user })
}

export async function PATCH(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const updates = await req.json()

    // Remove fields that should not be updated directly
    delete updates.id
    delete updates.auth_id
    delete updates.email
    delete updates.plan
    delete updates.xp
    delete updates.streak
    delete updates.created_at

    const { data, error } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, user: data })
}

export async function DELETE(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, message: 'Account deleted successfully' })
}