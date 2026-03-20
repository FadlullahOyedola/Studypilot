import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, supabaseAdmin } from '@/lib/supabase'

async function getUser(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null
    return getUserFromToken(token)
}

export async function GET(req: NextRequest) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get tasks stats
    const { data: tasks } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)

    // Get sessions stats
    const { data: sessions } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Get exams
    const { data: exams } = await supabaseAdmin
        .from('exams')
        .select('*')
        .eq('user_id', user.id)
        .order('exam_date', { ascending: true })

    // Calculate stats
    const totalTasks = tasks?.length || 0
    const completedTasks = tasks?.filter(t => t.done).length || 0
    const totalMinutes = sessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10

    // Weekly hours
    const weeklyHours = Array(7).fill(0).map((_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const dateStr = date.toISOString().split('T')[0]
        const daySessions = sessions?.filter(s => s.date === dateStr) || []
        return {
            day: date.toLocaleDateString('en', { weekday: 'short' }),
            hours: Math.round(daySessions.reduce((acc, s) => acc + s.duration_minutes, 0) / 60 * 10) / 10
        }
    })

    // Subject breakdown
    const subjectMap: Record<string, number> = {}
    sessions?.forEach(s => {
        subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.duration_minutes
    })
    const subjectBreakdown = Object.entries(subjectMap).map(([subject, minutes]) => ({
        subject,
        hours: Math.round(minutes / 60 * 10) / 10
    }))

    return NextResponse.json({
        success: true,
        analytics: {
            totalHours,
            totalTasks,
            completedTasks,
            completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
            streak: user.streak,
            xp: user.xp,
            weeklyHours,
            subjectBreakdown,
            upcomingExams: exams?.slice(0, 5) || []
        }
    })
}
