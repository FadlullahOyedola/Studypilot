import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email)
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
        })

        if (error)
            return NextResponse.json({ error: error.message }, { status: 400 })

        return NextResponse.json({
            success: true,
            message: 'Password reset email sent. Please check your inbox.'
        })
    } catch (err) {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}
