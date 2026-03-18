'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPES & MOCK DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
type Page = 'home' | 'login' | 'signup' | 'dashboard' | 'pricing' | 'forgot' | 'logout'
type DashboardTab = 'overview' | 'planner' | 'tasks' | 'analytics'

interface Task {
  id: string
  title: string
  subject: string
  done: boolean
  color: string
  priority: 'high' | 'medium' | 'low'
}

interface PlanDay {
  day: string
  sessions: { subject: string; time: string; color: string }[]
}

interface Testimonial {
  name: string
  role: string
  rating: number
  text: string
  avatar: string
}

const COLORS = ['#7c3aed', '#db2777', '#6d28d9', '#d97706', '#059669', '#dc2626']

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Complete Calculus Chapter 5', subject: 'Mathematics', done: false, color: '#7c3aed', priority: 'high' },
  { id: '2', title: 'Review Wave Motion Notes', subject: 'Physics', done: true, color: '#db2777', priority: 'medium' },
  { id: '3', title: 'Practice Organic Reactions', subject: 'Chemistry', done: false, color: '#6d28d9', priority: 'high' },
  { id: '4', title: 'Write Essay Draft', subject: 'English', done: false, color: '#d97706', priority: 'low' },
]

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Chioma Okafor',
    role: 'Medical Student, UNILAG',
    rating: 5,
    text: 'StudyPilot completely transformed how I prepare for exams. The AI timetable actually fits my real schedule and the readiness score keeps me accountable.',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80&fit=crop&crop=face',
  },
  {
    name: 'Emeka Nwachukwu',
    role: 'Engineering Student, OAU',
    rating: 5,
    text: "I went from failing two courses to making Dean's List in one semester. The AI knows exactly how much time I need and adjusts when I fall behind.",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&fit=crop&crop=face',
  },
  {
    name: 'Fatima Al-Hassan',
    role: 'Law Student, ABU',
    rating: 5,
    text: 'The analytics are incredible. I can see exactly where I spend study time and the AI gives weekly insights. Worth every single naira.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80&fit=crop&crop=face',
  },
]

const FEATURES = [
  { icon: '🤖', title: 'AI Study Generator', desc: 'Personalized study timetable in seconds based on your subjects, deadlines, and available hours.' },
  { icon: '📅', title: 'Study Calendar', desc: 'A clear weekly calendar so you always know what to study and when.' },
  { icon: '⏱️', title: 'Focus Timer', desc: 'Pomodoro-style sessions to stay focused and avoid burnout.' },
  { icon: '📊', title: 'Progress Analytics', desc: 'Track study hours, completion rates, and exam readiness over time.' },
]

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ANIMATION HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = (d = 0.1) => ({ hidden: {}, show: { transition: { staggerChildren: d } } })

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SHARED COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  outline?: boolean
  white?: boolean
  sm?: boolean
}

function Btn({
  children,
  outline = false,
  white = false,
  sm = false,
  className = '',
  type = 'button',
  ...props
}: BtnProps) {
  const base = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ${sm ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-sm'
    }`
  const variant = white
    ? 'bg-white text-purple-700 hover:bg-purple-50 shadow-lg'
    : outline
      ? 'border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-50'
      : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'

  import React from 'react'
  import { motion, type HTMLMotionProps } from 'framer-motion'

  type BtnProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
    children: React.ReactNode
    outline?: boolean
    white?: boolean
    sm?: boolean
  }

  function Btn({
    children,
    outline = false,
    white = false,
    sm = false,
    className = '',
    type = 'button',
    ...rest
  }: BtnProps) {
    const sizeClass = sm ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-sm'
    const base = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ${sizeClass}`

    const variant = white
      ? 'bg-white text-purple-700 hover:bg-purple-50 shadow-lg'
      : outline
        ? 'border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-50'
        : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'

    return (
      <motion.button
        type={type}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.97 }}
        className={`${base} ${variant} ${className}`}
        {...rest}
      >
        {children}
      </motion.button>
    )
  }

  function Stars({ n = 5 }: { n?: number }) {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: n }).map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    )
  }

  function Logo({ onClick }: { onClick?: () => void }) {
    return (
      <button onClick={onClick} className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-extrabold text-lg text-gray-900 tracking-tight">
          Study<span className="text-purple-600">Pilot</span>
        </span>
      </button>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     NAVBAR
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function Navbar({ setPage }: { setPage: (p: Page) => void }) {
    const [scrolled, setScrolled] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
      const fn = () => setScrolled(window.scrollY > 12)
      window.addEventListener('scroll', fn, { passive: true })
      return () => window.removeEventListener('scroll', fn)
    }, [])

    return (
      <>
        <motion.nav
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white'
            }`}
        >
          <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
            <Logo onClick={() => setPage('home')} />

            <div className="hidden md:flex items-center gap-7">
              {['Features', 'How it Works', 'Pricing'].map((label) => (
                <button key={label} onClick={() => setPage(label === 'Pricing' ? 'pricing' : 'home')} className="text-sm font-medium text-gray-500 hover:text-purple-600">
                  {label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => setPage('login')} className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-3 py-2">
                Log in
              </button>
              <Btn sm onClick={() => setPage('signup')}>
                Get Started Free
              </Btn>
            </div>

            <button onClick={() => setOpen((p) => !p)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <motion.div className="space-y-1.5 w-5">
                <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }} className="block h-0.5 bg-gray-800 rounded-full" />
                <motion.span animate={{ opacity: open ? 0 : 1 }} className="block h-0.5 bg-gray-800 rounded-full" />
                <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }} className="block h-0.5 bg-gray-800 rounded-full" />
              </motion.div>
            </button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="fixed top-16 inset-x-0 z-40 bg-white border-b border-gray-100 overflow-hidden md:hidden">
              <div className="p-5 space-y-3">
                {['Features', 'How it Works', 'Pricing'].map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      setPage(label === 'Pricing' ? 'pricing' : 'home')
                      setOpen(false)
                    }}
                    className="block w-full text-left text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50"
                  >
                    {label}
                  </button>
                ))}
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={() => {
                      setPage('login')
                      setOpen(false)
                    }}
                    className="text-sm text-gray-600 py-2"
                  >
                    Log in
                  </button>
                  <Btn
                    className="w-full"
                    onClick={() => {
                      setPage('signup')
                      setOpen(false)
                    }}
                  >
                    Get Started Free
                  </Btn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     LANDING PAGE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function Landing({ setPage }: { setPage: (p: Page) => void }) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar setPage={setPage} />

        {/* HERO */}
        <section className="pt-28 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-40 w-[600px] h-[600px] rounded-full bg-purple-50 blur-[120px]" />
            <div className="absolute top-40 -left-32 w-[400px] h-[400px] rounded-full bg-pink-50 blur-[100px]" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div variants={stagger(0.1)} initial="hidden" animate="show" className="max-w-xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                AI-Powered Study Planning
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl lg:text-[56px] font-black text-gray-900 leading-[1.08] tracking-tight mb-5">
                Your AI-Powered
                <br />
                <span className="text-purple-600">Study Planner</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-gray-500 text-lg leading-relaxed mb-8">
                Plan smarter, study better. StudyPilot creates personalized plans, tracks progress, and helps you ace exams — automatically.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
                <Btn onClick={() => setPage('signup')} className="px-8 py-3.5 text-base">
                  Get Started Free →
                </Btn>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 text-gray-500 font-semibold text-sm px-4 py-3.5 rounded-xl hover:text-purple-600">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#7c3aed">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  Watch Demo
                </motion.button>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {TESTIMONIALS.map((t, i) => (
                    <img key={i} src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
                  ))}
                </div>
                <div>
                  <Stars n={5} />
                  <p className="text-xs text-gray-400 mt-0.5">
                    <strong className="text-gray-700">2,400+</strong> students already planning smarter
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_24px_80px_rgba(0,0,0,.12)] overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-gray-400 border border-gray-200 ml-2 truncate">studypilot.app/dashboard</div>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-50/30 to-white">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      ['8', 'Tasks', '#7c3aed'],
                      ['3.5h', 'Studied', '#db2777'],
                      ['72%', 'Ready', '#059669'],
                    ].map(([v, l, c]) => (
                      <div key={l} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                        <p className="text-base font-black" style={{ color: c as string }}>
                          {v}
                        </p>
                        <p className="text-[9px] text-gray-400 font-medium mt-0.5">{l}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    {MOCK_TASKS.slice(0, 3).map((t) => (
                      <div key={t.id} className="flex items-center gap-2 py-1.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                          {t.done && (
                            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium ${t.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 px-6 bg-gray-50/70">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-14">
              <span className="text-xs font-bold text-purple-600 tracking-widest uppercase bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">Features</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-5 mb-3 tracking-tight">Everything You Need to Excel</h2>
              <p className="text-gray-400 max-w-md mx-auto">All the tools you need to plan, focus, and track your way to academic success.</p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {FEATURES.map((f, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <motion.div whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(124,58,237,.1)' }} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 flex items-center justify-center text-2xl mb-5">{f.icon}</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-14">
              <span className="text-xs font-bold text-purple-600 tracking-widest uppercase bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-5 mb-3 tracking-tight">Loved by Students</h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <motion.div whileHover={{ y: -4 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                    <Stars n={t.rating} />
                    <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-6 flex-1 italic">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                      <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                        <p className="text-gray-400 text-xs">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-700">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">Ready to Transform Your Study Routine?</h2>
              <p className="text-purple-200 text-lg mb-10">Join thousands of students studying smarter with AI.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Btn white onClick={() => setPage('signup')} className="px-8 py-4 text-base">
                  Get Started Free →
                </Btn>
                <Btn outline onClick={() => setPage('pricing')} className="px-8 py-4 text-base border-white text-white hover:bg-white/10">
                  View Pricing
                </Btn>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     LOGIN PAGE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function Login({ setPage }: { setPage: (p: Page) => void }) {
    const [f, setF] = useState({ email: '', password: '' })
    const [err, setErr] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    function validate() {
      const e: Record<string, string> = {}
      if (!f.email) e.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = 'Enter a valid email'
      if (!f.password) e.password = 'Password is required'
      else if (f.password.length < 6) e.password = 'Minimum 6 characters'
      setErr(e)
      return Object.keys(e).length === 0
    }

    async function submit(e: React.FormEvent) {
      e.preventDefault()
      if (!validate()) return
      setLoading(true)
      await new Promise((r) => setTimeout(r, 1000))
      setPage('dashboard')
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
          <div className="p-8 md:p-10">
            <button onClick={() => setPage('home')} className="flex items-center gap-2 text-gray-400 hover:text-purple-600 text-sm font-medium mb-6">
              ← Back to home
            </button>

            <Logo onClick={() => setPage('home')} />
            <div className="mt-8 mb-7">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
              <p className="text-gray-400 text-sm mt-1.5">Sign in to continue your study journey.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={f.email}
                  onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${err.email ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white'}`}
                />
                {err.email && <p className="text-red-500 text-xs mt-1">⚠ {err.email}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <button type="button" onClick={() => setPage('forgot')} className="text-xs text-purple-600 font-semibold">
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={f.password}
                  onChange={(e) => setF((p) => ({ ...p, password: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${err.password ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white'}`}
                />
                {err.password && <p className="text-red-500 text-xs mt-1">⚠ {err.password}</p>}
              </div>

              <Btn type="submit" className="w-full py-3.5" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </Btn>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              No account?{' '}
              <button onClick={() => setPage('signup')} className="text-purple-600 font-bold">
                Create one free →
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SIGNUP PAGE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function Signup({ setPage }: { setPage: (p: Page) => void }) {
    const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' })
    const [err, setErr] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    function validate() {
      const e: Record<string, string> = {}
      if (!f.name.trim()) e.name = 'Full name is required'
      if (!f.email) e.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = 'Enter a valid email'
      if (!f.password) e.password = 'Password is required'
      else if (f.password.length < 8) e.password = 'Minimum 8 characters'
      if (f.password !== f.confirm) e.confirm = 'Passwords do not match'
      setErr(e)
      return Object.keys(e).length === 0
    }

    async function submit(e: React.FormEvent) {
      e.preventDefault()
      if (!validate()) return
      setLoading(true)
      await new Promise((r) => setTimeout(r, 1200))
      setPage('dashboard')
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
          <div className="p-8 md:p-10">
            <button onClick={() => setPage('home')} className="flex items-center gap-2 text-gray-400 hover:text-purple-600 text-sm font-medium mb-6">
              ← Back to home
            </button>

            <Logo onClick={() => setPage('home')} />
            <div className="mt-8 mb-7">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h1>
              <p className="text-gray-400 text-sm mt-1.5">Start your AI study journey free.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${err.name ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50'}`} />
                {err.name && <p className="text-red-500 text-xs mt-1">⚠ {err.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" value={f.email} onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${err.email ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50'}`} />
                {err.email && <p className="text-red-500 text-xs mt-1">⚠ {err.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <input type="password" value={f.password} onChange={(e) => setF((p) => ({ ...p, password: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${err.password ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50'}`} />
                {err.password && <p className="text-red-500 text-xs mt-1">⚠ {err.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input type="password" value={f.confirm} onChange={(e) => setF((p) => ({ ...p, confirm: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${err.confirm ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50'}`} />
                {err.confirm && <p className="text-red-500 text-xs mt-1">⚠ {err.confirm}</p>}
              </div>

              <Btn type="submit" className="w-full py-3.5" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </Btn>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              Already have an account?{' '}
              <button onClick={() => setPage('login')} className="text-purple-600 font-bold">
                Sign in →
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FORGOT PASSWORD PAGE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function ForgotPassword({ setPage }: { setPage: (p: Page) => void }) {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function submit(e: React.FormEvent) {
      e.preventDefault()
      if (!email) {
        setError('Please enter your email')
        return
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Enter a valid email')
        return
      }
      setLoading(true)
      await new Promise((r) => setTimeout(r, 1000))
      setLoading(false)
      setSent(true)
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
          <div className="p-8 md:p-10">
            <button onClick={() => setPage('login')} className="text-sm text-gray-400 hover:text-purple-600 mb-6">
              ← Back to login
            </button>

            {!sent ? (
              <>
                <h1 className="text-2xl font-black text-gray-900">Forgot password?</h1>
                <p className="text-gray-400 text-sm mt-1 mb-5">Enter your email and we’ll send a reset link.</p>

                {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm">⚠ {error}</div>}

                <form onSubmit={submit} className="space-y-4">
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400"
                  />
                  <Btn type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link →'}
                  </Btn>
                </form>
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-black text-gray-900">Check your inbox!</h2>
                <p className="text-gray-400 text-sm mt-2 mb-6">
                  We sent a reset link to <strong className="text-gray-700">{email}</strong>
                </p>
                <Btn onClick={() => setPage('login')}>Back to login</Btn>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     LOGOUT PAGE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function LogoutPage({ setPage }: { setPage: (p: Page) => void }) {
    useEffect(() => {
      const t = setTimeout(() => setPage('home'), 1200)
      return () => clearTimeout(t)
    }, [setPage])

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-6 text-white text-2xl">✓</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">You&apos;ve been logged out</h1>
          <p className="text-gray-400 mb-6">Redirecting you to the home page...</p>
          <button onClick={() => setPage('home')} className="text-purple-600 font-semibold text-sm hover:text-purple-700">
            Go home now →
          </button>
        </motion.div>
      </div>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DASHBOARD TABS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  interface OverviewTabProps {
    tasks: Task[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    setTab: (tab: DashboardTab) => void
    loading: boolean
  }

  function OverviewTab({ tasks, setTasks, setTab, loading }: OverviewTabProps) {
    const bars: [string, number][] = [
      ['M', 60],
      ['T', 40],
      ['W', 85],
      ['T', 30],
      ['F', 100],
      ['S', 65],
      ['S', 50],
    ]

    return (
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-28 animate-pulse" />)
            : [
              { label: 'Tasks Today', value: '8', sub: '3 completed', icon: '📋' },
              { label: 'Hours Studied', value: '3.5h', sub: 'This week: 14h', icon: '⏱' },
              { label: 'Study Streak', value: '9 days', sub: 'Personal best 🔥', icon: '🔥' },
              { label: 'Exam Readiness', value: '72%', sub: 'Mathematics next', icon: '🎯' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="text-xl mb-2">{s.icon}</div>
                <p className="font-black text-2xl text-gray-900">{s.value}</p>
                <p className="text-gray-400 text-xs font-medium mt-0.5">{s.label}</p>
                <p className="text-gray-300 text-xs mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">Study Hours This Week</h3>
                <p className="text-gray-400 text-xs mt-0.5">Daily breakdown</p>
              </div>
              <span className="text-xs bg-purple-50 text-purple-600 font-bold px-3 py-1.5 rounded-full border border-purple-100">22h total</span>
            </div>

            <div className="flex items-end gap-2 h-36">
              {bars.map(([d, h], i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} className="w-full rounded-t-lg bg-purple-100" />
                  <span className="text-[10px] text-gray-400 font-medium">{d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5">Upcoming Exams</h3>
            <div className="space-y-4">
              {[
                { s: 'Mathematics', days: 8, pct: 72, c: '#7c3aed' },
                { s: 'Physics', days: 11, pct: 55, c: '#db2777' },
                { s: 'Chemistry', days: 16, pct: 40, c: '#6d28d9' },
              ].map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-gray-700">{e.s}</span>
                    <span className="text-gray-400">{e.days}d left</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${e.pct}%` }} className="h-full rounded-full" style={{ background: e.c }} />
                  </div>
                </div>
              ))}
              <Btn outline sm className="w-full mt-1" onClick={() => setTab('planner')}>
                Generate Plan →
              </Btn>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Today&apos;s Tasks</h3>
            <button onClick={() => setTab('tasks')} className="text-xs text-purple-600 font-bold">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                <button onClick={() => setTasks((p) => p.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {task.done && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
                <div className="w-1 h-8 rounded-full" style={{ background: task.color }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${task.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                  <p className="text-xs text-gray-400">{task.subject}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700">{task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function PlannerTab() {
    const [subjects, setSubjects] = useState([''])
    const [hours, setHours] = useState('3')
    const [loading, setLoading] = useState(false)
    const [plan, setPlan] = useState<PlanDay[] | null>(null)

    async function generate(e: React.FormEvent) {
      e.preventDefault()
      const valid = subjects.filter((s) => s.trim())
      if (!valid.length) return

      setLoading(true)
      setPlan(null)
      await new Promise((r) => setTimeout(r, 1200))

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const sessionsPerDay = Math.max(1, Math.min(3, Math.floor(Number(hours) / 2) || 1))

      setPlan(
        days.map((day) => ({
          day,
          sessions: valid.slice(0, sessionsPerDay).map((s, i) => ({
            subject: s,
            time: `${8 + i * 2}:00 — ${10 + i * 2}:00`,
            color: COLORS[i % COLORS.length],
          })),
        }))
      )
      setLoading(false)
    }

    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-black text-gray-900 text-xl mb-1">🤖 AI Study Planner</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your subjects and available hours to generate a 7-day plan.</p>

          <form onSubmit={generate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Subjects</label>
              <div className="space-y-2">
                {subjects.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={s}
                      placeholder={`Subject ${i + 1} e.g. Mathematics`}
                      onChange={(e) => setSubjects((p) => p.map((x, idx) => (idx === i ? e.target.value : x)))}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400"
                    />
                    {subjects.length > 1 && (
                      <button type="button" onClick={() => setSubjects((p) => p.filter((_, idx) => idx !== i))} className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 text-red-400 hover:bg-red-100">
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {subjects.length < 8 && (
                  <button
                    type="button"
                    onClick={() => setSubjects((p) => [...p, ''])}
                    className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-purple-300 hover:text-purple-500 transition-all"
                  >
                    + Add subject
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hours Available Per Day</label>
              <input type="number" min="1" max="12" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400" />
            </div>

            <Btn type="submit" className="w-full py-3.5 text-base">
              {loading ? 'AI is building your plan...' : '🤖 Generate My Study Plan'}
            </Btn>
          </form>
        </div>

        {plan && !loading && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900">✨ Your 7-Day Plan is Ready!</h3>
              <p className="text-gray-400 text-sm mt-0.5">Personalized timetable generated successfully.</p>
            </div>
            {plan.map((day) => (
              <div key={day.day} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3">{day.day}</h4>
                <div className="space-y-2">
                  {day.sessions.map((s, j) => (
                    <div key={j} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                      <div className="w-1.5 h-7 rounded-full" style={{ background: s.color }} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.subject}</p>
                        <p className="text-xs text-gray-400">{s.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  interface TasksTabProps {
    tasks: Task[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  }

  function TasksTab({ tasks, setTasks }: TasksTabProps) {
    const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all')
    const [showForm, setShowForm] = useState(false)
    const [nt, setNt] = useState({ title: '', subject: '', priority: 'medium' as Task['priority'] })

    const filtered = tasks.filter((t) => (filter === 'all' ? true : filter === 'pending' ? !t.done : t.done))

    function add(e: React.FormEvent) {
      e.preventDefault()
      if (!nt.title.trim()) return
      setTasks((p) => [...p, { id: Date.now().toString(), ...nt, done: false, color: COLORS[p.length % COLORS.length] }])
      setNt({ title: '', subject: '', priority: 'medium' })
      setShowForm(false)
    }

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-gray-900 text-xl">Tasks</h2>
            <p className="text-gray-400 text-sm">
              {tasks.filter((t) => !t.done).length} pending · {tasks.filter((t) => t.done).length} done
            </p>
          </div>
          <Btn sm onClick={() => setShowForm((p) => !p)}>
            {showForm ? '✕ Cancel' : '+ Add Task'}
          </Btn>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
                <form onSubmit={add} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input value={nt.title} placeholder="Task title" onChange={(e) => setNt((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none" />
                    <input value={nt.subject} placeholder="Subject" onChange={(e) => setNt((p) => ({ ...p, subject: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none" />
                  </div>
                  <div className="flex gap-3">
                    <Btn sm type="submit">
                      Add Task
                    </Btn>
                    <Btn outline sm onClick={() => setShowForm(false)}>
                      Cancel
                    </Btn>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          {(['all', 'pending', 'done'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize ${filter === f ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">✅</div>
              <p className="font-bold text-gray-900">All caught up!</p>
              <p className="text-gray-400 text-sm mt-1">No tasks in this filter.</p>
            </div>
          ) : (
            filtered.map((task) => (
              <div key={task.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 group">
                <button onClick={() => setTasks((p) => p.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {task.done && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
                <div className="w-1 h-10 rounded-full" style={{ background: task.color }} />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{task.subject}</p>
                </div>
                <button onClick={() => setTasks((p) => p.filter((t) => t.id !== task.id))} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  function AnalyticsTab() {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h2 className="font-black text-gray-900 text-xl">Analytics</h2>
          <p className="text-gray-400 text-sm mt-0.5">Your study performance at a glance.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['89h', 'Total Hours', '#7c3aed'],
            ['12 days', 'Study Streak', '#db2777'],
            ['3.2h', 'Avg Daily', '#059669'],
            ['47', 'Tasks Done', '#d97706'],
          ].map(([v, l, c], i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="font-black text-2xl mb-0.5" style={{ color: c as string }}>
                {v}
              </p>
              <p className="text-gray-400 text-xs font-medium">{l}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Exam Readiness Tracker</h3>
          <div className="space-y-5">
            {[
              { s: 'Mathematics', pct: 72, days: 8, c: '#7c3aed' },
              { s: 'Physics', pct: 55, days: 11, c: '#db2777' },
              { s: 'Chemistry', pct: 40, days: 16, c: '#6d28d9' },
            ].map((exam, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900 text-sm">{exam.s}</span>
                  <span className="text-xs text-gray-400">{exam.days}d left</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${exam.pct}%` }} className="h-full rounded-full" style={{ background: exam.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DASHBOARD
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function Dashboard({ setPage }: { setPage: (p: Page) => void }) {
    const [tab, setTab] = useState<DashboardTab>('overview')
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
    const [mobSidebar, setMobSidebar] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const t = setTimeout(() => setLoading(false), 700)
      return () => clearTimeout(t)
    }, [])

    const nav: { id: DashboardTab; icon: string; label: string }[] = [
      { id: 'overview', icon: '⊞', label: 'Overview' },
      { id: 'planner', icon: '🗓', label: 'Study Planner' },
      { id: 'tasks', icon: '✓', label: 'Tasks' },
      { id: 'analytics', icon: '📊', label: 'Analytics' },
    ]

    const SidebarContent = () => (
      <div className="flex flex-col h-full bg-white border-r border-gray-100 w-64">
        <div className="p-5 border-b border-gray-50">
          <Logo onClick={() => setPage('home')} />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id)
                setMobSidebar(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${tab === item.id ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <Btn outline className="w-full" onClick={() => setPage('logout')}>
            Log Out
          </Btn>
        </div>
      </div>
    )

    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className="hidden lg:flex h-full">
          <SidebarContent />
        </div>

        <AnimatePresence>
          {mobSidebar && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobSidebar(false)} className="lg:hidden fixed inset-0 z-40 bg-black/25" />
              <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', damping: 24 }} className="lg:hidden fixed left-0 top-0 bottom-0 z-50 shadow-2xl">
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobSidebar(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                ☰
              </button>
              <div>
                <h1 className="font-black text-gray-900 text-lg">{nav.find((n) => n.id === tab)?.label}</h1>
                <p className="text-gray-400 text-xs mt-0.5">Tuesday, March 17, 2026</p>
              </div>
            </div>
            <Btn sm onClick={() => setTab('planner')}>
              + New Plan
            </Btn>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}>
                {tab === 'overview' && <OverviewTab tasks={tasks} setTasks={setTasks} setTab={setTab} loading={loading} />}
                {tab === 'planner' && <PlannerTab />}
                {tab === 'tasks' && <TasksTab tasks={tasks} setTasks={setTasks} />}
                {tab === 'analytics' && <AnalyticsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PRICING PAGE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function Pricing({ setPage }: { setPage: (p: Page) => void }) {
    const [yearly, setYearly] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const faqs = [
      { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no penalties. Cancel anytime from your settings.' },
      { q: 'Is the free plan really free forever?', a: 'Yes. No card required for the free plan.' },
      { q: 'How does the AI generate my plan?', a: 'You enter subjects and hours, then AI builds your weekly schedule.' },
    ]

    return (
      <div className="min-h-screen bg-white">
        <Navbar setPage={setPage} />

        <section className="pt-28 pb-16 px-6 text-center bg-gradient-to-b from-purple-50/40 to-white">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Simple, Transparent Pricing</h1>
          <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">Start free and upgrade when you need more.</p>

          <div className="inline-flex bg-gray-100 rounded-full p-1.5 gap-1">
            <button onClick={() => setYearly(false)} className={`px-5 py-2 rounded-full text-sm font-bold ${!yearly ? 'bg-white shadow text-purple-600' : 'text-gray-400'}`}>
              Monthly
            </button>
            <button onClick={() => setYearly(true)} className={`px-5 py-2 rounded-full text-sm font-bold ${yearly ? 'bg-white shadow text-purple-600' : 'text-gray-400'}`}>
              Yearly
            </button>
          </div>
        </section>

        <section className="pb-20 px-6">
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <p className="text-gray-400 text-sm font-semibold mb-3">Student Plan</p>
              <div className="text-4xl font-black text-gray-900 mb-1">{'$0'}</div>
              <p className="text-xs text-gray-400 mb-6">Free forever.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                <li>• 3 active subjects</li>
                <li>• Basic AI planning</li>
                <li>• Focus timer</li>
              </ul>
              <Btn outline className="w-full" onClick={() => setPage('signup')}>
                Get Started Free
              </Btn>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 text-white shadow-lg">
              <p className="text-purple-200 text-sm font-semibold mb-3">Pro Plan</p>
              <div className="text-4xl font-black mb-1">{yearly ? '$5' : '$8'}</div>
              <p className="text-xs text-purple-200 mb-6">per month</p>
              <ul className="space-y-2 text-sm text-purple-100 mb-8">
                <li>• Unlimited subjects</li>
                <li>• Full AI planning + insights</li>
                <li>• Advanced analytics</li>
              </ul>
              <Btn white className="w-full" onClick={() => setPage('signup')}>
                Start 7-Day Free Trial →
              </Btn>
            </div>
          </div>
        </section>

        <section className="pb-20 px-6">
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <button key={i} onClick={() => setOpenFaq((p) => (p === i ? null : i))} className="w-full text-left bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-bold text-gray-900 text-sm">{faq.q}</span>
                  <span className="text-purple-500 font-black text-xl">{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && <p className="text-gray-400 text-sm mt-3 leading-relaxed">{faq.a}</p>}
              </button>
            ))}
          </div>
        </section>
      </div>
    )
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ROOT APP
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  export default function App() {
    const [page, setPage] = useState<Page>('home')

    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [page])

    return (
      <AnimatePresence mode="wait">
        <motion.div key={page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className="min-h-screen">
          {page === 'home' && <Landing setPage={setPage} />}
          {page === 'login' && <Login setPage={setPage} />}
          {page === 'signup' && <Signup setPage={setPage} />}
          {page === 'dashboard' && <Dashboard setPage={setPage} />}
          {page === 'pricing' && <Pricing setPage={setPage} />}
          {page === 'forgot' && <ForgotPassword setPage={setPage} />}
          {page === 'logout' && <LogoutPage setPage={setPage} />}
        </motion.div>
      </AnimatePresence>
    )
  }