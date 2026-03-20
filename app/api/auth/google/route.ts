import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        })

        if (error)
            return NextResponse.json({ error: error.message }, { status: 400 })

        return NextResponse.json({ success: true, url: data.url })
    } catch (err) {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}
