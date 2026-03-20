import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/supabase'
import { generateAIResponse } from '@/lib/gemini'

async function getUser(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null
    return getUserFromToken(token)
}

export async function POST(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // AI chat only for Pro users
    if (user.plan === 'free')
        return NextResponse.json({ error: 'AI Study Buddy is a Pro feature. Upgrade to access it.' }, { status: 403 })

    const { message, subject } = await req.json()

    if (!message)
        return NextResponse.json({ error: 'Message is required' }, { status: 400 })

    const reply = await generateAIResponse(message, subject)

    return NextResponse.json({ success: true, reply })
}
