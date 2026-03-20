import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const { error } = await supabase.auth.signOut()

        if (error)
            return NextResponse.json({ error: error.message }, { status: 400 })

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        })
    } catch (err) {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}