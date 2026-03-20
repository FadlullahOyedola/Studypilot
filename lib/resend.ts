const RESEND_API_KEY = process.env.RESEND_API_KEY!
const FROM = `${process.env.SYSTEM_EMAIL_NAME} <${process.env.SYSTEM_EMAIL}>`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

async function sendEmail(to: string, subject: string, html: string) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: FROM, to, subject, html }),
    })
    return res.json()
}

// Welcome email
export async function sendWelcomeEmail(name: string, email: string) {
    return sendEmail(email, `Welcome to StudyPilot, ${name}! 🎓`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:linear-gradient(135deg,#7c3aed,#db2777);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
        <h1 style="color:white;font-size:28px;font-weight:900;margin:0">Welcome to StudyPilot! 🎓</h1>
        <p style="color:rgba(255,255,255,0.8);margin:12px 0 0">Your AI study journey starts now</p>
      </div>
      <p style="color:#374151;font-size:16px">Hi <strong>${name}</strong>,</p>
      <p style="color:#6b7280">You've just joined 2,400+ students studying smarter with AI. Here's what you can do right now:</p>
      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:8px 0;color:#374151">🤖 <strong>Generate your first AI study plan</strong></p>
        <p style="margin:8px 0;color:#374151">📅 <strong>Add your subjects and exam dates</strong></p>
        <p style="margin:8px 0;color:#374151">⏱️ <strong>Start a focus session</strong></p>
        <p style="margin:8px 0;color:#374151">🏆 <strong>Earn your first badge</strong></p>
      </div>
      <a href="${APP_URL}/dashboard" style="display:block;background:linear-gradient(135deg,#7c3aed,#db2777);color:white;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:24px 0">
        Go to Dashboard →
      </a>
      <p style="color:#9ca3af;font-size:13px;text-align:center">StudyPilot by Coderift Studio · Lagos, Nigeria</p>
    </div>
  `)
}

// Password reset email
export async function sendPasswordResetEmail(
    name: string,
    email: string,
    resetUrl: string
) {
    return sendEmail(email, 'Reset your StudyPilot password 🔑', `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:linear-gradient(135deg,#7c3aed,#db2777);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
        <h1 style="color:white;font-size:24px;font-weight:900;margin:0">Reset Your Password 🔑</h1>
      </div>
      <p style="color:#374151">Hi <strong>${name}</strong>,</p>
      <p style="color:#6b7280">We received a request to reset your StudyPilot password. Click the button below:</p>
      <a href="${resetUrl}" style="display:block;background:linear-gradient(135deg,#7c3aed,#db2777);color:white;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:24px 0">
        Reset Password →
      </a>
      <p style="color:#9ca3af;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      <p style="color:#9ca3af;font-size:13px;text-align:center">StudyPilot by Coderift Studio</p>
    </div>
  `)
}

// Weekly report email
export async function sendWeeklyReport(
    name: string,
    email: string,
    stats: {
        hoursStudied: number
        tasksCompleted: number
        streak: number
        aiReport: string
    }
) {
    return sendEmail(email, `Your Weekly StudyPilot Report 📊`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:linear-gradient(135deg,#7c3aed,#db2777);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
        <h1 style="color:white;font-size:24px;font-weight:900;margin:0">Your Weekly Report 📊</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Here's how you did this week</p>
      </div>
      <p style="color:#374151">Hi <strong>${name}</strong>,</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:20px 0">
        <div style="background:#f5f3ff;border-radius:12px;padding:16px;text-align:center">
          <p style="font-size:24px;font-weight:900;color:#7c3aed;margin:0">${stats.hoursStudied}h</p>
          <p style="color:#6b7280;font-size:12px;margin:4px 0 0">Hours Studied</p>
        </div>
        <div style="background:#fdf2f8;border-radius:12px;padding:16px;text-align:center">
          <p style="font-size:24px;font-weight:900;color:#db2777;margin:0">${stats.tasksCompleted}</p>
          <p style="color:#6b7280;font-size:12px;margin:4px 0 0">Tasks Done</p>
        </div>
        <div style="background:#fff7ed;border-radius:12px;padding:16px;text-align:center">
          <p style="font-size:24px;font-weight:900;color:#f59e0b;margin:0">${stats.streak}🔥</p>
          <p style="color:#6b7280;font-size:12px;margin:4px 0 0">Day Streak</p>
        </div>
      </div>
      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:20px 0">
        <p style="font-weight:700;color:#374151;margin:0 0 8px">🤖 StudyPilot AI Says:</p>
        <p style="color:#6b7280;margin:0;line-height:1.6">${stats.aiReport}</p>
      </div>
      <a href="${APP_URL}/dashboard" style="display:block;background:linear-gradient(135deg,#7c3aed,#db2777);color:white;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:24px 0">
        Continue Studying →
      </a>
      <p style="color:#9ca3af;font-size:13px;text-align:center">StudyPilot by Coderift Studio · Lagos, Nigeria</p>
    </div>
  `)
}

// Exam reminder email
export async function sendExamReminderEmail(
    name: string,
    email: string,
    subject: string,
    daysLeft: number
) {
    return sendEmail(email, `⚠️ ${subject} exam in ${daysLeft} days!`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:${daysLeft <= 3 ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#7c3aed,#db2777)'};border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
        <h1 style="color:white;font-size:24px;font-weight:900;margin:0">⏰ Exam Alert!</h1>
        <p style="color:rgba(255,255,255,0.9);font-size:18px;margin:12px 0 0;font-weight:700">${subject} in ${daysLeft} days</p>
      </div>
      <p style="color:#374151">Hi <strong>${name}</strong>,</p>
      <p style="color:#6b7280">Your <strong>${subject}</strong> exam is in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>. Make sure you're on track!</p>
      <a href="${APP_URL}/dashboard" style="display:block;background:linear-gradient(135deg,#7c3aed,#db2777);color:white;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:24px 0">
        Study Now →
      </a>
      <p style="color:#9ca3af;font-size:13px;text-align:center">StudyPilot by Coderift Studio</p>
    </div>
  `)
}

// Pro upgrade email
export async function sendProUpgradeEmail(
    name: string,
    email: string,
    plan: string
) {
    return sendEmail(email, `Welcome to StudyPilot Pro! ✨`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:linear-gradient(135deg,#7c3aed,#db2777);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
        <h1 style="color:white;font-size:24px;font-weight:900;margin:0">You're now Pro! ✨</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Unlimited AI study power unlocked</p>
      </div>
      <p style="color:#374151">Hi <strong>${name}</strong>,</p>
      <p style="color:#6b7280">Your <strong>${plan}</strong> Pro subscription is now active. You have access to:</p>
      <div style="background:#f5f3ff;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:8px 0;color:#374151">✅ Unlimited AI study plans</p>
        <p style="margin:8px 0;color:#374151">✅ Exam readiness score</p>
        <p style="margin:8px 0;color:#374151">✅ Advanced analytics</p>
        <p style="margin:8px 0;color:#374151">✅ AI Study Buddy chat</p>
        <p style="margin:8px 0;color:#374151">✅ Weekly AI report</p>
        <p style="margin:8px 0;color:#374151">✅ Priority support</p>
      </div>
      <a href="${APP_URL}/dashboard" style="display:block;background:linear-gradient(135deg,#7c3aed,#db2777);color:white;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:24px 0">
        Go to Dashboard →
      </a>
      <p style="color:#9ca3af;font-size:13px;text-align:center">StudyPilot by Coderift Studio · Lagos, Nigeria</p>
    </div>
  `)
}
