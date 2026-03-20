import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password)
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })

        if (password.length < 8)
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
        })

        if (error)
            return NextResponse.json({ error: error.message }, { status: 400 })

        try { await sendWelcomeEmail(name, email) } catch (e) { console.error('Email error:', e) }

        return NextResponse.json({
            success: true,
            message: 'Account created! Check your email to verify.',
            session: data.session,
            user: { id: data.user?.id, email: data.user?.email, name }
        })
    } catch (err) {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}
