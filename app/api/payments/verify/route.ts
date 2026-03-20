import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, supabaseAdmin } from '@/lib/supabase'
import { verifyPayment } from '@/lib/paystack'
import { sendProUpgradeEmail } from '@/lib/resend'

async function getUser(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null
    return getUserFromToken(token)
}

export async function POST(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { reference } = await req.json()
    if (!reference)
        return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 })

    const response = await verifyPayment(reference)

    if (!response.status || response.data.status !== 'success')
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })

    const { metadata, plan } = response.data
    const planType = metadata?.plan_type || 'monthly'

    // Update user to Pro
    await supabaseAdmin
        .from('users')
        .update({ plan: 'pro' })
        .eq('id', user.id)

    // Save subscription
    const endsAt = new Date()
    if (planType === 'yearly') endsAt.setFullYear(endsAt.getFullYear() + 1)
    else endsAt.setMonth(endsAt.getMonth() + 1)

    await supabaseAdmin.from('subscriptions').insert({
        user_id: user.id,
        paystack_ref: reference,
        plan: planType,
        currency: 'ngn',
        amount: planType === 'monthly' ? 9000 : 54000,
        status: 'active',
        ends_at: endsAt.toISOString()
    })

    // Send upgrade email
    try {
        await sendProUpgradeEmail(user.name, user.email, planType)
    } catch (e) {
        console.error('Email error:', e)
    }

    return NextResponse.json({
        success: true,
        message: 'Payment verified! Welcome to Pro.',
        plan: 'pro'
    })
}
