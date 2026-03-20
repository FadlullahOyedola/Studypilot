import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/supabase'
import { initializePayment, getPlanCode, getAmount } from '@/lib/paystack'

async function getUser(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null
    return getUserFromToken(token)
}

export async function POST(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await req.json()

    if (!plan || !['monthly', 'yearly'].includes(plan))
        return NextResponse.json({ error: 'Valid plan is required (monthly or yearly)' }, { status: 400 })

    const planCode = getPlanCode(plan)
    const amount = getAmount(plan)

    const response = await initializePayment({
        email: user.email,
        amount,
        currency: 'NGN',
        plan: planCode,
        metadata: {
            user_id: user.id,
            plan_type: plan,
            name: user.name
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    })

    if (!response.status)
        return NextResponse.json({ error: response.message || 'Payment initialization failed' }, { status: 400 })

    return NextResponse.json({
        success: true,
        authorization_url: response.data.authorization_url,
        reference: response.data.reference
    })
}
