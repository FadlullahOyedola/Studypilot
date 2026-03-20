import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyWebhookSignature } from '@/lib/paystack'

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const signature = req.headers.get('x-paystack-signature') || ''

        // Verify webhook is from Paystack
        if (!verifyWebhookSignature(body, signature))
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

        const event = JSON.parse(body)

        switch (event.event) {
            case 'charge.success': {
                const { reference, metadata } = event.data
                const userId = metadata?.user_id
                if (userId) {
                    await supabaseAdmin
                        .from('users')
                        .update({ plan: 'pro' })
                        .eq('id', userId)
                }
                break
            }

            case 'subscription.disable': {
                const { customer } = event.data
                const { data: user } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('email', customer.email)
                    .single()

                if (user) {
                    await supabaseAdmin
                        .from('users')
                        .update({ plan: 'free' })
                        .eq('id', user.id)

                    await supabaseAdmin
                        .from('subscriptions')
                        .update({ status: 'cancelled' })
                        .eq('user_id', user.id)
                        .eq('status', 'active')
                }
                break
            }

            case 'invoice.payment_failed': {
                const { customer } = event.data
                const { data: user } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('email', customer.email)
                    .single()

                if (user) {
                    await supabaseAdmin
                        .from('notifications')
                        .insert({
                            user_id: user.id,
                            message: 'Your Pro payment failed. Please update your payment method.',
                            type: 'system'
                        })
                }
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (err) {
        console.error('Webhook error:', err)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
