const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE = 'https://api.paystack.co'

const headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    'Content-Type': 'application/json',
}

// Initialize a payment
export async function initializePayment(params: {
    email: string
    amount: number
    currency: 'NGN' | 'USD'
    plan: string
    metadata?: Record<string, any>
    callback_url?: string
}) {
    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            email: params.email,
            amount: params.amount,
            currency: params.currency,
            plan: params.plan,
            metadata: params.metadata || {},
            callback_url: params.callback_url || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        }),
    })
    return res.json()
}

// Verify a payment
export async function verifyPayment(reference: string) {
    const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, { headers })
    return res.json()
}

// Get subscription details
export async function getSubscription(code: string) {
    const res = await fetch(`${PAYSTACK_BASE}/subscription/${code}`, { headers })
    return res.json()
}

// Cancel subscription
export async function cancelSubscription(code: string, token: string) {
    const res = await fetch(`${PAYSTACK_BASE}/subscription/disable`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, token }),
    })
    return res.json()
}

// Get plan code
export function getPlanCode(plan: 'monthly' | 'yearly') {
    if (plan === 'monthly') return process.env.PAYSTACK_NGN_MONTHLY_PLAN!
    return process.env.PAYSTACK_NGN_YEARLY_PLAN!
}

// Get amount in kobo
export function getAmount(plan: 'monthly' | 'yearly') {
    if (plan === 'monthly') return 900000 // ₦9,000
    return 5400000 // ₦54,000
}

// Verify Paystack webhook signature
export function verifyWebhookSignature(body: string, signature: string): boolean {
    const crypto = require('crypto')
    const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET)
        .update(body)
        .digest('hex')
    return hash === signature
}