import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, supabaseAdmin } from '@/lib/supabase'
import { generateStudyPlan } from '@/lib/gemini'

async function getUser(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null
    return getUserFromToken(token)
}

export async function GET(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, plans: data })
}

export async function POST(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check free plan limit
    if (user.plan === 'free') {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count } = await supabaseAdmin
            .from('study_plans')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth.toISOString())

        if ((count || 0) >= 3)
            return NextResponse.json({ error: 'Free plan limited to 3 AI plans per month. Upgrade to Pro.' }, { status: 403 })
    }

    const { subjects, hours_per_day, exam_dates } = await req.json()

    if (!subjects || !hours_per_day)
        return NextResponse.json({ error: 'Subjects and hours per day are required' }, { status: 400 })

    // Generate plan with Gemini AI
    const planData = await generateStudyPlan(subjects, hours_per_day, exam_dates)

    // Save to database
    const { data, error } = await supabaseAdmin
        .from('study_plans')
        .insert({
            user_id: user.id,
            subjects,
            hours_per_day,
            plan_data: planData,
            active: true
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Award XP for generating a plan
    await supabaseAdmin
        .from('users')
        .update({ xp: user.xp + 20 })
        .eq('id', user.id)

    return NextResponse.json({ success: true, plan: data })
}

export async function DELETE(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })

    const { error } = await supabaseAdmin
        .from('study_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, message: 'Plan deleted' })
}
