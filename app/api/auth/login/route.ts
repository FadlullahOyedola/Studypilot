import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()

        if (!email || !password)
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error)
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

        // Get user profile
        const { data: profile } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('auth_id', data.user.id)
            .single()

        // Update streak
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const lastStudy = profile?.last_study_date

        let newStreak = profile?.streak || 0
        if (lastStudy === yesterday) newStreak += 1
        else if (lastStudy !== today) newStreak = 1

        await supabaseAdmin
            .from('users')
            .update({ last_study_date: today, streak: newStreak })
            .eq('auth_id', data.user.id)

        return NextResponse.json({
            success: true,
            session: data.session,
            user: { ...profile, streak: newStreak }
        })
    } catch (err) {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}
