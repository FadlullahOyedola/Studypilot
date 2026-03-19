'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useSpring, useMotionValue, animate } from 'framer-motion'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
type Page = 'home' | 'login' | 'signup' | 'dashboard' | 'pricing' | 'forgot' | 'logout' | 'about' | 'contact' | 'privacy' | 'terms' | '404'
type DashTab = 'overview' | 'planner' | 'tasks' | 'calendar' | 'focus' | 'analytics' | 'notes' | 'badges' | 'profile' | 'settings' | 'notifications' | 'ai-buddy'
interface Task { id: string; title: string; subject: string; done: boolean; color: string; priority: 'high' | 'medium' | 'low'; deadline: string }
interface PlanDay { day: string; sessions: { subject: string; time: string; color: string; duration: number }[] }
interface Badge { id: string; name: string; icon: string; desc: string; earned: boolean; earnedAt?: string }
interface Notification { id: string; message: string; type: 'exam' | 'streak' | 'tip' | 'system'; read: boolean; time: string }
interface Note { id: string; subject: string; content: string; updatedAt: string; color: string }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MOCK DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const COLORS = ['#7c3aed', '#db2777', '#6d28d9', '#d97706', '#059669', '#dc2626', '#0891b2', '#7c3aed']

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Complete Calculus Chapter 5', subject: 'Mathematics', done: false, color: '#7c3aed', priority: 'high', deadline: '2026-03-20' },
  { id: '2', title: 'Review Wave Motion Notes', subject: 'Physics', done: true, color: '#db2777', priority: 'medium', deadline: '2026-03-18' },
  { id: '3', title: 'Practice Organic Reactions', subject: 'Chemistry', done: false, color: '#6d28d9', priority: 'high', deadline: '2026-03-21' },
  { id: '4', title: 'Write Essay Draft', subject: 'English', done: false, color: '#d97706', priority: 'low', deadline: '2026-03-22' },
  { id: '5', title: 'Biology Cell Theory Reading', subject: 'Biology', done: false, color: '#059669', priority: 'medium', deadline: '2026-03-23' },
]

const MOCK_NOTES: Note[] = [
  { id: '1', subject: 'Mathematics', content: 'Integration by parts: ∫u dv = uv - ∫v du\nRemember to identify u and dv carefully before integrating.', updatedAt: '2 hours ago', color: '#7c3aed' },
  { id: '2', subject: 'Physics', content: 'Wave equation: v = fλ\nFrequency and wavelength are inversely proportional at constant wave speed.', updatedAt: 'Yesterday', color: '#db2777' },
  { id: '3', subject: 'Chemistry', content: 'Organic reactions — nucleophilic substitution happens when nucleophile attacks electrophilic carbon.', updatedAt: '2 days ago', color: '#6d28d9' },
]

const MOCK_BADGES: Badge[] = [
  { id: '1', name: 'First Step', icon: '🎯', desc: 'Complete your first task', earned: true, earnedAt: 'Mar 15' },
  { id: '2', name: '7-Day Warrior', icon: '🔥', desc: 'Study 7 days in a row', earned: true, earnedAt: 'Mar 16' },
  { id: '3', name: 'Plan Master', icon: '🗓️', desc: 'Generate your first AI study plan', earned: true, earnedAt: 'Mar 14' },
  { id: '4', name: 'Night Owl', icon: '🦉', desc: 'Study after 10 PM', earned: false },
  { id: '5', name: 'Early Bird', icon: '🌅', desc: 'Study before 7 AM', earned: false },
  { id: '6', name: 'Exam Slayer', icon: '⚔️', desc: 'Complete all tasks before an exam', earned: false },
  { id: '7', name: 'Century', icon: '💯', desc: 'Complete 100 tasks total', earned: false },
  { id: '8', name: 'Scholar', icon: '🎓', desc: 'Reach Level 10', earned: false },
  { id: '9', name: 'Streak Legend', icon: '👑', desc: '30-day study streak', earned: false },
]

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', message: 'Your Mathematics exam is in 3 days! 📚', type: 'exam', read: false, time: '2 min ago' },
  { id: '2', message: 'Amazing! You just hit a 9-day study streak 🔥', type: 'streak', read: false, time: '1 hour ago' },
  { id: '3', message: 'Study tip: Review notes within 24 hours of learning for better retention', type: 'tip', read: true, time: 'Yesterday' },
  { id: '4', message: 'You earned the "Plan Master" badge! 🗓️', type: 'system', read: true, time: '2 days ago' },
]

const TESTIMONIALS = [
  { name: 'Chioma Okafor', role: 'Medical Student, UNILAG', rating: 5, text: 'StudyPilot completely transformed how I prepare for exams. The AI timetable actually fits my real schedule and the readiness score keeps me accountable.', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80&fit=crop&crop=face' },
  { name: 'Emeka Nwachukwu', role: 'Engineering Student, OAU', rating: 5, text: "I went from failing two courses to making Dean's List in one semester. The AI knows exactly how much time I need and adjusts when I fall behind.", avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&fit=crop&crop=face' },
  { name: 'Fatima Al-Hassan', role: 'Law Student, ABU', rating: 5, text: 'The analytics are incredible. I can see exactly where I spend study time and the AI gives weekly insights. Worth every single naira.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80&fit=crop&crop=face' },
  { name: 'James Okonkwo', role: 'Computer Science, University of London', rating: 5, text: 'As an international student I tried many apps. StudyPilot is the only one that actually understands exam pressure and creates realistic schedules.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80&fit=crop&crop=face' },
]

const FEATURES = [
  { icon: '🤖', title: 'AI Study Generator', desc: 'Personalized study timetable built by AI based on your subjects, deadlines, and available hours. Ready in seconds.' },
  { icon: '📅', title: 'Study Calendar', desc: 'Full weekly calendar view with color-coded subjects. Never miss a session again.' },
  { icon: '⏱️', title: 'Focus Timer', desc: 'Pomodoro-style focus sessions with breaks to maximize deep work and minimize burnout.' },
  { icon: '📊', title: 'Progress Analytics', desc: 'Study heatmap, subject breakdown, readiness scores and weekly insights all in one dashboard.' },
]

const STUDY_TIPS = [
  'Review your notes within 24 hours of learning for 70% better retention 🧠',
  'The Pomodoro technique — 25 min focus + 5 min break — boosts productivity by 40% ⏱️',
  'Teaching a concept to someone else is the fastest way to master it 👥',
  'Sleep is when your brain consolidates memories — never skip sleep before exams 😴',
  'Spaced repetition beats cramming every time — review topics over multiple days 📅',
]

const CALENDAR_COLORS: Record<string, string> = {
  Mathematics: '#7c3aed',
  Physics: '#db2777',
  Chemistry: '#6d28d9',
  English: '#d97706',
  Biology: '#059669',
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ANIMATION VARIANTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const spring = { type: 'spring', damping: 20, stiffness: 300 }
const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: .6, ease: [.22, 1, .36, 1] } } }
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: .4 } } }
const scaleIn = { hidden: { opacity: 0, scale: .9 }, show: { opacity: 1, scale: 1, transition: spring } }
const slideRight = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: .4, ease: [.22, 1, .36, 1] } } }
const stagger = (d = .08) => ({ hidden: {}, show: { transition: { staggerChildren: d } } })

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'}
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: .65, delay, ease: [.22, 1, .36, 1] } } }}
      className={className}>
      {children}
    </motion.div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UTILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function getGreeting(name = '') {
  const h = new Date().getHours()
  if (h < 12) return `Good morning${name ? ', ' + name : ''} ☀️`
  if (h < 17) return `Good afternoon${name ? ', ' + name : ''} 👋`
  if (h < 21) return `Good evening${name ? ', ' + name : ''} 🌆`
  return `Study time${name ? ', ' + name : ''} 🌙`
}

function getXPLevel(xp: number) {
  const level = Math.floor(xp / 100) + 1
  const progress = xp % 100
  const titles = ['Beginner', 'Student', 'Scholar', 'Academic', 'Expert', 'Master', 'Champion', 'Legend', 'Elite', 'Genius']
  return { level, progress, title: titles[Math.min(level - 1, titles.length - 1)] }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SHARED UI COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Btn({ children, onClick, outline = false, white = false, sm = false, className = '', type = 'button', disabled = false }: any) {
  const base = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sm ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-sm'}`
  const v = white ? 'bg-white text-purple-700 hover:bg-purple-50 shadow-lg'
    : outline ? 'border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-50'
      : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-200'
  return (
    <motion.button type={type} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: .97 }}
      onClick={onClick} disabled={disabled} className={`${base} ${v} ${className}`}>
      {children}
    </motion.button>
  )
}

function Stars({ n = 5 }: { n?: number }) {
  return <div className="flex gap-0.5">{Array(n).fill(0).map((_, i) => <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}</div>
}

function Logo({ onClick, dark = false }: { onClick?: () => void; dark?: boolean }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-200">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className={`font-extrabold text-lg tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
        Study<span className="text-purple-500">Pilot</span>
      </span>
    </button>
  )
}

function BackBtn({ onClick, label = 'Back', dark = false }: { onClick: () => void; label?: string; dark?: boolean }) {
  return (
    <motion.button whileHover={{ x: -3 }} whileTap={{ scale: .97 }} onClick={onClick}
      className={`flex items-center gap-2 text-sm font-medium mb-7 transition-colors group ${dark ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-purple-600'}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="group-hover:-translate-x-1 transition-transform duration-200">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      {label}
    </motion.button>
  )
}

/* Google Logo SVG */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

/* GitHub Logo SVG */
function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

/* Confetti */
function Confetti({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array(40).fill(0).map((_, i) => (
        <motion.div key={i}
          initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1, scale: Math.random() * .8 + .4 }}
          animate={{ y: window.innerHeight + 100, x: Math.random() * window.innerWidth, opacity: 0, rotate: Math.random() * 720 }}
          transition={{ duration: Math.random() * 2 + 1.5, delay: Math.random() * .5, ease: 'easeIn' }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ background: COLORS[Math.floor(Math.random() * COLORS.length)] }}
        />
      ))}
    </div>
  )
}

/* Animated counter */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 60
    const t = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(t) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(t)
  }, [inView, to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* Cookie banner */
function CookieBanner() {
  const [show, setShow] = useState(true)
  if (!show) return null
  return (
    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-white border border-gray-200 rounded-2xl p-5 shadow-2xl">
      <p className="text-sm text-gray-600 mb-4">🍪 We use cookies to improve your experience. By continuing you agree to our <button className="text-purple-600 font-semibold">Privacy Policy</button>.</p>
      <div className="flex gap-3">
        <Btn sm onClick={() => setShow(false)}>Accept All</Btn>
        <Btn sm outline onClick={() => setShow(false)}>Decline</Btn>
      </div>
    </motion.div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NAVBAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Navbar({ setPage, dark = false }: { setPage: (p: Page) => void; dark?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <>
      <motion.nav initial={{ y: -56, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .5 }}
        className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 ${scrolled || dark ? 'bg-white/96 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Logo onClick={() => setPage('home')} />
          <div className="hidden md:flex items-center gap-7">
            {[['Features', 'home'], ['How it Works', 'home'], ['Pricing', 'pricing'], ['About', 'about']].map(([l, p]) => (
              <button key={l} onClick={() => setPage(p as Page)}
                className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">{l}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setPage('login')} className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">Log in</button>
            <Btn sm onClick={() => setPage('signup')}>Get Started Free</Btn>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="space-y-1.5 w-5">
              <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }} className="block h-0.5 bg-gray-800 rounded-full" />
              <motion.span animate={{ opacity: open ? 0 : 1 }} className="block h-0.5 bg-gray-800 rounded-full" />
              <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }} className="block h-0.5 bg-gray-800 rounded-full" />
            </div>
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="fixed top-16 inset-x-0 z-40 bg-white border-b border-gray-100 overflow-hidden md:hidden shadow-lg">
            <div className="p-5 space-y-3">
              {[['Features', 'home'], ['How it Works', 'home'], ['Pricing', 'pricing'], ['About', 'about'], ['Contact', 'contact']].map(([l, p]) => (
                <button key={l} onClick={() => { setPage(p as Page); setOpen(false) }}
                  className="block w-full text-left text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">{l}</button>
              ))}
              <div className="flex flex-col gap-3 pt-2">
                <button onClick={() => { setPage('login'); setOpen(false) }} className="text-sm text-gray-600 py-2">Log in</button>
                <Btn className="w-full" onClick={() => { setPage('signup'); setOpen(false) }}>Get Started Free</Btn>
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
  const [currency, setCurrency] = useState<'usd' | 'ngn'>('usd')

  return (
    <div className="bg-white min-h-screen">
      <Navbar setPage={setPage} />

      {/* HERO */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-40 w-[600px] h-[600px] rounded-full bg-purple-50 blur-[120px]" />
          <div className="absolute top-40 -left-32 w-[400px] h-[400px] rounded-full bg-pink-50 blur-[100px]" />
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-32 right-[15%] text-4xl">📚</motion.div>
          <motion.div animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-48 left-[10%] text-3xl">⏱️</motion.div>
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: .5 }}
            className="absolute bottom-32 right-[20%] text-3xl">🎯</motion.div>
          <motion.div animate={{ y: [0, 15, 0], rotate: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-48 left-[20%] text-2xl">🏆</motion.div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div variants={stagger(.1)} initial="hidden" animate="show" className="max-w-xl">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                AI-Powered Study Planning
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-5xl lg:text-[56px] font-black text-gray-900 leading-[1.08] tracking-tight mb-5">
                Your AI-Powered<br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Study Planner</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-gray-500 text-lg leading-relaxed mb-8">
                Plan smarter, study better. StudyPilot uses AI to create personalized study plans, track your progress, and help you ace every exam — automatically.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
                <Btn onClick={() => setPage('signup')} className="px-8 py-3.5 text-base">Get Started Free →</Btn>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
                  className="flex items-center gap-2 text-gray-500 font-semibold text-sm px-4 py-3.5 rounded-xl hover:text-purple-600 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#7c3aed"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  Watch Demo
                </motion.button>
              </motion.div>
              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {TESTIMONIALS.slice(0, 4).map((t, i) => (
                    <img key={i} src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
                  ))}
                </div>
                <div>
                  <Stars n={5} />
                  <p className="text-xs text-gray-400 mt-0.5">
                    <strong className="text-gray-700"><Counter to={2400} suffix="+" /></strong> students already planning smarter
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero mockup */}
            <motion.div initial={{ opacity: 0, y: 40, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: .8, delay: .35, ease: [.22, 1, .36, 1] }} className="relative">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_24px_80px_rgba(0,0,0,.12)] overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-gray-400 border border-gray-200 ml-2 truncate">studypilot.app/dashboard</div>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-purple-50/30 to-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-black text-gray-900">Good morning, Amaka! ☀️</p>
                        <p className="text-[10px] text-gray-400">Day 9 streak 🔥 Keep it up!</p>
                      </div>
                      <div className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">+ New Plan</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[['🔥', '9d', 'Streak'], ['⏱', '3.5h', 'Today'], ['✅', '72%', 'Done'], ['🎯', '78%', 'Ready']].map(([ic, v, l]) => (
                        <div key={l} className="bg-white rounded-xl p-2 border border-gray-100 shadow-sm text-center">
                          <div className="text-sm mb-0.5">{ic}</div>
                          <div className="text-xs font-black text-purple-600">{v}</div>
                          <div className="text-[8px] text-gray-400">{l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100 mb-3">
                      <p className="text-[10px] font-bold text-gray-600 mb-2">Today&apos;s Tasks</p>
                      {MOCK_TASKS.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center gap-2 py-1">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                            {t.done && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                          </div>
                          <span className={`text-[9px] font-medium ${t.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.title}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 text-white">
                      <p className="text-[10px] font-bold mb-1">💡 Study Tip</p>
                      <p className="text-[9px] opacity-90">Review notes within 24hrs for 70% better retention!</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: 1, type: 'spring', bounce: .4 }}
                className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <div><p className="text-xs font-bold text-gray-900">Level 5 Scholar</p><p className="text-[10px] text-gray-400">450 XP earned</p></div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0, x: -20 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: 1.2, type: 'spring', bounce: .4 }}
                className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">✅</div>
                <div><p className="text-xs font-bold text-gray-900">Plan Generated!</p><p className="text-[10px] text-gray-400">7-day AI timetable ready</p></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* UNIVERSITIES STRIP */}
      <div className="bg-gray-50 border-y border-gray-100 py-6 px-6 overflow-hidden">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Trusted by students from</p>
        <div className="flex items-center justify-center flex-wrap gap-6 md:gap-10">
          {['UNILAG', 'OAU', 'ABU', 'LASU', 'FUTA', 'UniAbuja', 'University of London', 'MIT'].map(u => (
            <span key={u} className="text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors cursor-default">{u}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-bold text-purple-600 tracking-widest uppercase bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-5 mb-3 tracking-tight">Get Started in Three Simple Steps</h2>
            <p className="text-gray-400 max-w-md mx-auto">From sign-up to your first AI study plan in under 2 minutes.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', icon: '📚', title: 'Add Your Subjects', desc: 'Enter your subjects, exam dates, and daily available hours. Done in 30 seconds.' },
              { n: '02', icon: '🤖', title: 'AI Generates Plan', desc: 'AI calculates your optimal timetable — weighted by urgency, difficulty, and available time.' },
              { n: '03', icon: '🚀', title: 'Track & Succeed', desc: 'Follow your plan, check tasks, earn badges and watch your exam readiness score climb.' },
            ].map((step, i) => (
              <Reveal key={i} delay={i * .12}>
                <motion.div whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(124,58,237,.12)' }}
                  className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm transition-all duration-300 group">
                  <motion.div whileHover={{ scale: 1.2, rotate: 5 }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 flex items-center justify-center text-3xl mx-auto mb-5 transition-all">
                    {step.icon}
                  </motion.div>
                  <p className="text-xs font-black text-purple-400 tracking-[.15em] mb-2">{step.n}</p>
                  <h3 className="font-bold text-gray-900 text-lg mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-gray-50/70">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-bold text-purple-600 tracking-widest uppercase bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">Features</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-5 mb-3 tracking-tight">Everything You Need to Excel</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * .08}>
                <motion.div whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(124,58,237,.1)', borderColor: '#e9d5ff' }}
                  className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm cursor-default group transition-all duration-300">
                  <motion.div whileHover={{ scale: 1.15, rotate: -5 }} className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 flex items-center justify-center text-2xl mb-5 transition-all">{f.icon}</motion.div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg,#3b0764 0%,#7c3aed 55%,#9d174d 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: 2400, suffix: '+', label: 'Active Students' },
              { val: 15000, suffix: '+', label: 'Study Plans Generated' },
              { val: 98, suffix: '%', label: 'Satisfaction Rate' },
              { val: 40, suffix: '%', label: 'Grade Improvement' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * .1}>
                <div>
                  <p className="font-black text-4xl text-white mb-2"><Counter to={s.val} suffix={s.suffix} /></p>
                  <p className="text-purple-200 text-sm font-medium">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-bold text-purple-600 tracking-widest uppercase bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-5 mb-3 tracking-tight">Loved by Students Worldwide</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * .08}>
                <motion.div whileHover={{ y: -6, boxShadow: '0 20px 48px rgba(124,58,237,.12)', borderColor: '#e9d5ff' }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm transition-all duration-300 flex flex-col h-full">
                  <Stars n={t.rating} />
                  <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-6 flex-1 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 flex-shrink-0" />
                    <div><p className="font-bold text-gray-900 text-sm">{t.name}</p><p className="text-gray-400 text-xs">{t.role}</p></div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-6 bg-gray-50/70">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-10">
            <span className="text-xs font-bold text-purple-600 tracking-widest uppercase bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-5 mb-3 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">Start free. No hidden fees. Upgrade when you need more.</p>
            {/* Currency toggle */}
            <div className="inline-flex bg-white border border-gray-200 rounded-full p-1 gap-1 shadow-sm">
              <button onClick={() => setCurrency('usd')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currency === 'usd' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-gray-600'}`}>🌍 USD $</button>
              <button onClick={() => setCurrency('ngn')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currency === 'ngn' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-gray-600'}`}>🇳🇬 NGN ₦</button>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Reveal delay={.1}>
              <motion.div whileHover={{ y: -4 }} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm h-full flex flex-col transition-all">
                <p className="text-gray-400 text-sm font-semibold mb-2">Student Plan</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-black text-4xl text-gray-900">{currency === 'usd' ? '$0' : '₦0'}</span>
                  <span className="text-gray-400 text-sm">/month</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">Free forever. No credit card.</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {['3 active subjects', 'Basic AI planning (3/month)', 'Focus timer', 'Task management', '7-day study history'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg></div>{f}
                    </li>
                  ))}
                  {['Advanced analytics', 'Exam readiness score', 'Smart reminders'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><span className="text-[10px] text-gray-300">✕</span></div>{f}
                    </li>
                  ))}
                </ul>
                <Btn outline onClick={() => setPage('signup')} className="w-full">Get Started Free</Btn>
              </motion.div>
            </Reveal>
            <Reveal delay={.18}>
              <motion.div whileHover={{ y: -4 }} className="relative h-full flex flex-col">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-sm">Most Popular</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 shadow-xl flex-1 flex flex-col">
                  <p className="text-purple-200 text-sm font-semibold mb-2">Pro Plan</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-black text-4xl text-white">{currency === 'usd' ? '$8' : '₦9,000'}</span>
                    <span className="text-purple-200 text-sm">/month</span>
                  </div>
                  <p className="text-xs text-purple-300 mb-6">
                    {currency === 'usd' ? 'or $60/year (save $36)' : 'or ₦54,000/year (save ₦54,000)'}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {['Unlimited subjects', 'Full AI planning + insights', 'Exam readiness score', 'Advanced analytics', 'Smart reminders', 'Weekly AI report', 'Badges + XP system', 'Priority support'].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-purple-100">
                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg></div>{f}
                      </li>
                    ))}
                  </ul>
                  <Btn white onClick={() => setPage('signup')} className="w-full">Start 7-Day Free Trial →</Btn>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1e0a3c 0%,#4c1d95 50%,#831843 100%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/20 blur-[80px] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Ready to Transform Your<br />Study Routine?</h2>
            <p className="text-purple-200 text-lg mb-10">Join <Counter to={2400} />+ students already studying smarter with AI.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Btn white onClick={() => setPage('signup')} className="px-8 py-4 text-base">Get Started Free →</Btn>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                onClick={() => setPage('pricing')}
                className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-xl text-base transition-colors">
                View Pricing
              </motion.button>
            </div>
            <p className="text-purple-400 text-sm mt-6">No credit card · Free forever · Cancel anytime</p>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <Logo />
              <p className="text-gray-400 text-sm leading-relaxed mt-4 mb-5">AI-powered study planning for students who want real results. Built by Coderift Studio.</p>
              <div className="flex gap-2">
                {['𝕏', 'in', '📷', '💬'].map((s, i) => (
                  <motion.a key={i} href="#" whileHover={{ scale: 1.1, background: '#f3e8ff' }}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold hover:text-purple-600 transition-colors">
                    {s}
                  </motion.a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: [['Features', 'home'], ['Pricing', 'pricing'], ['About', 'about'], ['Contact', 'contact']] },
              { title: 'Legal', links: [['Privacy Policy', 'privacy'], ['Terms of Service', 'terms'], ['Cookie Policy', 'privacy']] },
              { title: 'Support', links: [['Help Center', 'contact'], ['Contact Us', 'contact'], ['Report Bug', 'contact']] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-bold text-gray-900 text-sm mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(([l, p]) => (
                    <li key={l}><button onClick={() => setPage(p as Page)} className="text-gray-400 text-sm hover:text-purple-600 transition-colors text-left">{l}</button></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-gray-400 text-sm">© 2026 StudyPilot by Coderift Studio. All rights reserved.</p>
            <p className="text-gray-400 text-sm">Built for students, by builders 🚀</p>
          </div>
        </div>
      </footer>
      <CookieBanner />
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AUTH COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 50%, #fdf2f8 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-100/40 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-pink-100/40 blur-[80px]" />
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-20 left-[10%] text-3xl opacity-20">📚</motion.div>
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute bottom-20 right-[10%] text-3xl opacity-20">🎯</motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 28, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .5, ease: [.22, 1, .36, 1] }}
        className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_24px_80px_rgba(124,58,237,.15)] border border-gray-100 overflow-hidden relative z-10">
        <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
        <div className="p-8 md:p-10">{children}</div>
      </motion.div>
    </div>
  )
}

function SocialButtons({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <>
      <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-gray-100" /><span className="text-gray-400 text-xs">or continue with</span><div className="flex-1 h-px bg-gray-100" /></div>
      <div className="grid grid-cols-2 gap-3">
        <motion.button whileHover={{ scale: 1.02, borderColor: '#c084fc' }} whileTap={{ scale: .98 }}
          className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all">
          <GoogleIcon /> Google
        </motion.button>
        <motion.button whileHover={{ scale: 1.02, borderColor: '#c084fc' }} whileTap={{ scale: .98 }}
          className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all">
          <GitHubIcon /> GitHub
        </motion.button>
      </div>
    </>
  )
}

/* LOGIN */
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
    setErr(e); return !Object.keys(e).length
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!validate()) return
    setLoading(true); await new Promise(r => setTimeout(r, 1200)); setPage('dashboard')
  }

  return (
    <AuthCard>
      <BackBtn onClick={() => setPage('home')} />
      <Logo onClick={() => setPage('home')} />
      <div className="mt-7 mb-7">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back 👋</h1>
        <p className="text-gray-400 text-sm mt-1.5">Sign in to continue your study journey.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {[{ key: 'email', label: 'Email Address', type: 'email', ph: 'you@email.com' }, { key: 'password', label: 'Password', type: 'password', ph: 'Enter your password' }].map(field => (
          <div key={field.key}>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{field.label}</label>
              {field.key === 'password' && <button type="button" onClick={() => setPage('forgot')} className="text-xs text-purple-600 font-semibold hover:text-purple-700">Forgot password?</button>}
            </div>
            <input type={field.type} placeholder={field.ph} value={(f as any)[field.key]}
              onChange={e => setF({ ...f, [field.key]: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-300 ${(err as any)[field.key] ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100'}`} />
            {(err as any)[field.key] && <p className="text-red-500 text-xs mt-1">⚠ {(err as any)[field.key]}</p>}
          </div>
        ))}
        <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: .98 }} disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-purple-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
          {loading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Signing in...</> : 'Sign In →'}
        </motion.button>
      </form>
      <SocialButtons setPage={setPage} />
      <p className="text-center text-gray-400 text-sm mt-4">No account?{' '}<button onClick={() => setPage('signup')} className="text-purple-600 font-bold hover:text-purple-700">Create one free →</button></p>
    </AuthCard>
  )
}

/* SIGNUP */
function Signup({ setPage }: { setPage: (p: Page) => void }) {
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' })
  const [err, setErr] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const str = f.password.length === 0 ? 0 : f.password.length < 6 ? 1 : f.password.length < 10 ? 2 : 3

  function validate() {
    const e: Record<string, string> = {}
    if (!f.name.trim()) e.name = 'Full name is required'
    if (!f.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = 'Enter a valid email'
    if (!f.password) e.password = 'Password is required'
    else if (f.password.length < 8) e.password = 'Minimum 8 characters'
    if (f.password !== f.confirm) e.confirm = 'Passwords do not match'
    setErr(e); return !Object.keys(e).length
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!validate()) return
    setLoading(true); await new Promise(r => setTimeout(r, 1400)); setPage('dashboard')
  }

  return (
    <AuthCard>
      <BackBtn onClick={() => setPage('home')} />
      <Logo onClick={() => setPage('home')} />
      <div className="mt-7 mb-7">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Account 🚀</h1>
        <p className="text-gray-400 text-sm mt-1.5">Start your AI study journey free — no card needed.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {[{ key: 'name', label: 'Full Name', type: 'text', ph: 'Amaka Johnson' }, { key: 'email', label: 'Email Address', type: 'email', ph: 'you@email.com' }].map(field => (
          <div key={field.key}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{field.label}</label>
            <input type={field.type} placeholder={field.ph} value={(f as any)[field.key]}
              onChange={e => setF({ ...f, [field.key]: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-300 ${(err as any)[field.key] ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100'}`} />
            {(err as any)[field.key] && <p className="text-red-500 text-xs mt-1">⚠ {(err as any)[field.key]}</p>}
          </div>
        ))}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
          <input type="password" placeholder="Create a strong password" value={f.password}
            onChange={e => setF({ ...f, password: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-300 ${err.password ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100'}`} />
          {f.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= str ? (str === 1 ? 'bg-red-400' : str === 2 ? 'bg-amber-400' : 'bg-green-500') : 'bg-gray-200'}`} />)}
              </div>
              <p className={`text-xs ${str === 1 ? 'text-red-400' : str === 2 ? 'text-amber-400' : 'text-green-500'}`}>{['', 'Weak', 'Good', 'Strong'][str]} password</p>
            </div>
          )}
          {err.password && <p className="text-red-500 text-xs mt-1">⚠ {err.password}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
          <input type="password" placeholder="Repeat your password" value={f.confirm}
            onChange={e => setF({ ...f, confirm: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-300 ${err.confirm ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100'}`} />
          {err.confirm && <p className="text-red-500 text-xs mt-1">⚠ {err.confirm}</p>}
        </div>
        <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: .98 }} disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-purple-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
          {loading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account...</> : 'Create Account →'}
        </motion.button>
      </form>
      <SocialButtons setPage={setPage} />
      <p className="text-center text-gray-300 text-xs mt-4">By signing up you agree to our <button onClick={() => setPage('terms')} className="text-purple-600">Terms</button> & <button onClick={() => setPage('privacy')} className="text-purple-600">Privacy Policy</button></p>
      <p className="text-center text-gray-400 text-sm mt-3">Already have an account?{' '}<button onClick={() => setPage('login')} className="text-purple-600 font-bold hover:text-purple-700">Sign in →</button></p>
    </AuthCard>
  )
}

/* FORGOT PASSWORD */
function ForgotPassword({ setPage }: { setPage: (p: Page) => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }
    setLoading(true); await new Promise(r => setTimeout(r, 1400)); setLoading(false); setSent(true)
  }

  return (
    <AuthCard>
      <BackBtn onClick={() => setPage('login')} label="Back to login" />
      {!sent ? (
        <>
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forgot password? 🔑</h1>
            <p className="text-gray-400 text-sm mt-1.5">No worries. Enter your email and we'll send a reset link.</p>
          </div>
          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm">⚠ {error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" placeholder="you@email.com" value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300" />
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: .98 }} disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-purple-200 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending...</> : 'Send Reset Link →'}
            </motion.button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">Remember your password?{' '}<button onClick={() => setPage('login')} className="text-purple-600 font-bold hover:text-purple-700">Sign in →</button></p>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Check your inbox! 📬</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">We sent a reset link to<br /><strong className="text-gray-700">{email}</strong></p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setSent(false)} className="text-purple-600 font-semibold text-sm hover:text-purple-700">Try a different email</button>
            <button onClick={() => setPage('login')} className="text-gray-400 text-sm hover:text-gray-600">Back to login</button>
          </div>
        </motion.div>
      )}
    </AuthCard>
  )
}

/* LOGOUT */
function LogoutPage({ setPage }: { setPage: (p: Page) => void }) {
  useEffect(() => { const t = setTimeout(() => setPage('home'), 2500); return () => clearTimeout(t) }, [setPage])
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .5 }} className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">You've been logged out</h1>
        <p className="text-gray-400 mb-6">Redirecting you to the home page...</p>
        <div className="flex justify-center gap-1.5 mb-8">{[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * .15}s` }} />)}</div>
        <button onClick={() => setPage('home')} className="text-purple-600 font-semibold text-sm hover:text-purple-700">Go home now →</button>
      </motion.div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ONBOARDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ university: '', course: '', level: '', subjects: [''], hours: '3', examDate: '' })

  const steps = [
    { title: 'Welcome to StudyPilot! 🎉', subtitle: 'Let\'s set up your personalized study experience in 4 quick steps.' },
    { title: 'Tell us about yourself 🎓', subtitle: 'This helps us personalize your dashboard.' },
    { title: 'Add your subjects 📚', subtitle: 'What are you currently studying?' },
    { title: 'Almost done! ⏰', subtitle: 'How much time can you study daily?' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="h-1 bg-gray-100">
          <motion.div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }} transition={{ duration: .4 }} />
        </div>
        <div className="p-8">
          <div className="flex gap-2 mb-6">
            {steps.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-purple-600' : 'bg-gray-100'}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .3 }}>
              <h2 className="text-2xl font-black text-gray-900 mb-2">{steps[step].title}</h2>
              <p className="text-gray-400 text-sm mb-8">{steps[step].subtitle}</p>

              {step === 0 && (
                <div className="space-y-4">
                  {[['🤖', 'AI Study Plans', 'Get personalized timetables'], ['🎯', 'Exam Readiness', 'Track how ready you are'], ['🔥', 'Streak System', 'Stay consistent with streaks'], ['🏆', 'Earn Badges', 'Get rewarded for studying']].map(([icon, title, desc]) => (
                    <div key={title} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="text-2xl">{icon}</span>
                      <div><p className="font-bold text-gray-900 text-sm">{title}</p><p className="text-gray-400 text-xs">{desc}</p></div>
                    </div>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">University</label>
                    <input placeholder="e.g. University of Lagos" value={data.university} onChange={e => setData({ ...data, university: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all" /></div>
                  <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Course / Department</label>
                    <input placeholder="e.g. Computer Science" value={data.course} onChange={e => setData({ ...data, course: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all" /></div>
                  <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Level / Year</label>
                    <select value={data.level} onChange={e => setData({ ...data, level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all appearance-none">
                      <option value="">Select your level</option>
                      {['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', 'Postgraduate', 'A-Level', 'GCSE', 'Other'].map(l => <option key={l}>{l}</option>)}
                    </select></div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {data.subjects.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={s} placeholder={`Subject ${i + 1} e.g. Mathematics`} onChange={e => setData({ ...data, subjects: data.subjects.map((x, idx) => idx === i ? e.target.value : x) })}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all" />
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${COLORS[i % COLORS.length]}15` }}>
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      </div>
                      {data.subjects.length > 1 && <button onClick={() => setData({ ...data, subjects: data.subjects.filter((_, idx) => idx !== i) })}
                        className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 text-red-400 flex items-center justify-center text-sm hover:bg-red-100 transition-colors">✕</button>}
                    </div>
                  ))}
                  {data.subjects.length < 8 && (
                    <button onClick={() => setData({ ...data, subjects: [...data.subjects, ''] })}
                      className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-purple-300 hover:text-purple-500 transition-all">
                      + Add subject
                    </button>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hours available to study per day</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8+'].map(h => (
                        <button key={h} onClick={() => setData({ ...data, hours: h })}
                          className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${data.hours === h ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-400 hover:border-purple-300'}`}>
                          {h}h
                        </button>
                      ))}
                    </div></div>
                  <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Next exam date (optional)</label>
                    <input type="date" value={data.examDate} onChange={e => setData({ ...data, examDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all" /></div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {step > 0 && <Btn outline onClick={() => setStep(step - 1)} className="flex-1">← Back</Btn>}
            <Btn onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="flex-1">
              {step === steps.length - 1 ? '🚀 Generate My Plan!' : 'Continue →'}
            </Btn>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Dashboard({ setPage }: { setPage: (p: Page) => void }) {
  const [tab, setTab] = useState<DashTab>('overview')
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [mobSidebar, setMobSidebar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [xp, setXp] = useState(450)
  const [streak, setStreak] = useState(9)
  const xpData = getXPLevel(xp)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t) }, [])

  function toggleTask(id: string) {
    setTasks(p => {
      const updated = p.map(t => t.id === id ? { ...t, done: !t.done } : t)
      const wasCompleted = updated.find(t => t.id === id)?.done
      if (wasCompleted) { setXp(x => x + 10); setConfetti(true); setTimeout(() => setConfetti(false), 3000) }
      return updated
    })
  }

  const nav = [
    { id: 'overview', icon: '⊞', label: 'Overview' },
    { id: 'planner', icon: '🤖', label: 'AI Planner' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'focus', icon: '⏱️', label: 'Focus Mode' },
    { id: 'tasks', icon: '✓', label: 'Tasks' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'notes', icon: '📝', label: 'Notes' },
    { id: 'ai-buddy', icon: '💬', label: 'AI Buddy' },
    { id: 'badges', icon: '🏆', label: 'Badges' },
  ]

  const bottomNav = [
    { id: 'overview', icon: '⊞', label: 'Home' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'focus', icon: '⏱️', label: 'Focus' },
    { id: 'tasks', icon: '✓', label: 'Tasks' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ]

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50'
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'

  const SidebarContent = () => (
    <div className={`flex flex-col h-full border-r w-60 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
      <div className={`p-5 border-b ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}>
        <Logo onClick={() => setPage('home')} dark={darkMode} />
      </div>

      {/* XP Bar */}
      <div className={`mx-4 mt-4 p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs font-bold ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Level {xpData.level} {xpData.title}</span>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{xp} XP</span>
        </div>
        <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
          <motion.div animate={{ width: `${xpData.progress}%` }} className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full" transition={{ duration: .8 }} />
        </div>
        <p className={`text-[10px] mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{100 - xpData.progress} XP to next level</p>
      </div>

      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => (
          <button key={item.id} onClick={() => { setTab(item.id as DashTab); setMobSidebar(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === item.id
                ? darkMode ? 'bg-purple-900/50 text-purple-300 border border-purple-800' : 'bg-purple-50 text-purple-700 border border-purple-100'
                : darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
            <span>{item.icon}</span>
            {item.label}
            {tab === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />}
          </button>
        ))}
        <div className={`my-2 h-px ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        {[{ id: 'profile', icon: '👤', label: 'Profile' }, { id: 'settings', icon: '⚙️', label: 'Settings' }].map(item => (
          <button key={item.id} onClick={() => { setTab(item.id as DashTab); setMobSidebar(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === item.id
                ? darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-50 text-purple-700'
                : darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}>
        <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-1 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
          onClick={() => setTab('profile')}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AJ</div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${textPrimary}`}>Amaka Johnson</p>
            <p className="text-xs text-purple-500 font-medium">✨ Pro Plan · {streak}🔥</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: .97 }}
          onClick={() => setPage('logout')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 hover:text-red-500 transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </motion.button>
      </div>
    </div>
  )

  return (
    <div className={`flex h-screen overflow-hidden ${bg}`}>
      <Confetti active={confetti} />

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full"><SidebarContent /></div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobSidebar(false)} className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', damping: 24 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 shadow-2xl">
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className={`border-b px-6 py-4 flex items-center justify-between ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobSidebar(true)} className={`lg:hidden p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>☰</button>
            <div>
              <h1 className={`font-black text-lg tracking-tight ${textPrimary}`}>{nav.find(n => n.id === tab)?.label || 'Dashboard'}</h1>
              <p className={`text-xs mt-0.5 ${textSecondary}`}>{getGreeting('Amaka')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark mode */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-colors ${darkMode ? 'bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-400'}`}>
              {darkMode ? '☀️' : '🌙'}
            </motion.button>
            {/* Notifications */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
              onClick={() => setTab('notifications')}
              className={`relative p-2.5 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}>
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">{unreadCount}</span>
              )}
            </motion.button>
            <Btn onClick={() => setTab('planner')} sm>+ New Plan</Btn>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: .25 }}>
              {tab === 'overview' && <OverviewTab tasks={tasks} toggleTask={toggleTask} setTab={setTab} loading={loading} darkMode={darkMode} xp={xp} streak={streak} />}
              {tab === 'planner' && <PlannerTab darkMode={darkMode} />}
              {tab === 'calendar' && <CalendarTab darkMode={darkMode} />}
              {tab === 'focus' && <FocusTab darkMode={darkMode} />}
              {tab === 'tasks' && <TasksTab tasks={tasks} setTasks={setTasks} toggleTask={toggleTask} darkMode={darkMode} />}
              {tab === 'analytics' && <AnalyticsTab darkMode={darkMode} />}
              {tab === 'notes' && <NotesTab notes={notes} setNotes={setNotes} darkMode={darkMode} />}
              {tab === 'ai-buddy' && <AIBuddyTab darkMode={darkMode} />}
              {tab === 'badges' && <BadgesTab darkMode={darkMode} />}
              {tab === 'profile' && <ProfileTab darkMode={darkMode} setPage={setPage} />}
              {tab === 'settings' && <SettingsTab darkMode={darkMode} setDarkMode={setDarkMode} />}
              {tab === 'notifications' && <NotificationsTab notifications={notifications} setNotifications={setNotifications} darkMode={darkMode} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile bottom nav */}
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 border-t px-2 py-2 z-30 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-around">
            {bottomNav.map(item => (
              <button key={item.id} onClick={() => setTab(item.id as DashTab)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${tab === item.id ? 'text-purple-600' : 'text-gray-400'}`}>
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] font-semibold">{item.label}</span>
                {tab === item.id && <div className="w-1 h-1 rounded-full bg-purple-600" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Onboarding */}
      {showOnboarding && <div className="fixed inset-0 z-50"><Onboarding onComplete={() => setShowOnboarding(false)} /></div>}
    </div>
  )
}

/* ── OVERVIEW TAB ── */
function OverviewTab({ tasks, toggleTask, setTab, loading, darkMode, xp, streak }: any) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'
  const tip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl border ${darkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/30 border-purple-800' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className={`font-black text-xl ${textPrimary}`}>{getGreeting('Amaka')} 👋</h2>
            <p className={`text-sm mt-1 ${textSecondary}`}>You have {tasks.filter((t: Task) => !t.done).length} tasks remaining today. Keep pushing!</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-center px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className="font-black text-2xl text-orange-500">{streak}🔥</p>
              <p className={`text-xs ${textSecondary}`}>Day streak</p>
            </div>
            <div className={`text-center px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className="font-black text-2xl text-purple-600">{xp}</p>
              <p className={`text-xs ${textSecondary}`}>XP earned</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className={`${cardBg} rounded-2xl p-5 border h-28 animate-pulse`} />)
        ) : (
          [
            { label: 'Tasks Today', value: '8', sub: '3 completed', icon: '📋', color: 'text-purple-600', bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-50' },
            { label: 'Hours Studied', value: '3.5h', sub: 'This week: 14h', icon: '⏱', color: 'text-pink-500', bg: darkMode ? 'bg-pink-900/30' : 'bg-pink-50' },
            { label: 'Completion', value: '72%', sub: 'Above average!', icon: '✅', color: 'text-green-500', bg: darkMode ? 'bg-green-900/30' : 'bg-green-50' },
            { label: 'Exam Readiness', value: '78%', sub: 'Mathematics next', icon: '🎯', color: 'text-amber-500', bg: darkMode ? 'bg-amber-900/30' : 'bg-amber-50' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: i * .07 } }}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,.08)' }}
              className={`${cardBg} rounded-2xl p-5 border shadow-sm transition-all cursor-default`}>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
              <p className={`font-black text-2xl ${s.color}`}>{s.value}</p>
              <p className={`text-xs font-medium mt-0.5 ${textSecondary}`}>{s.label}</p>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>{s.sub}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Study tip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-5 flex items-start gap-4">
        <span className="text-3xl">💡</span>
        <div>
          <p className="text-white font-bold text-sm mb-1">Study Tip of the Day</p>
          <p className="text-purple-100 text-sm leading-relaxed">{tip}</p>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className={`${cardBg} rounded-2xl p-5 border shadow-sm`}>
        <p className={`font-bold text-sm mb-4 ${textPrimary}`}>Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🤖', label: 'Generate Plan', action: () => setTab('planner'), color: 'from-purple-500 to-purple-600' },
            { icon: '⏱️', label: 'Start Focus', action: () => setTab('focus'), color: 'from-pink-500 to-pink-600' },
            { icon: '✓', label: 'Add Task', action: () => setTab('tasks'), color: 'from-green-500 to-green-600' },
            { icon: '📊', label: 'View Analytics', action: () => setTab('analytics'), color: 'from-blue-500 to-blue-600' },
          ].map((a, i) => (
            <motion.button key={i} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: .97 }} onClick={a.action}
              className={`bg-gradient-to-br ${a.color} text-white rounded-xl p-4 text-center shadow-md`}>
              <span className="text-2xl block mb-2">{a.icon}</span>
              <span className="text-xs font-bold">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tasks + Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className={`font-bold ${textPrimary}`}>Today&apos;s Tasks</h3>
            <button onClick={() => setTab('tasks')} className="text-xs text-purple-600 font-bold hover:text-purple-700">View all →</button>
          </div>
          {loading ? <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className={`h-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl animate-pulse`} />)}</div> : (
            <div className="space-y-2">
              {tasks.map((task: Task, i: number) => (
                <motion.div key={task.id} layout
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors group ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                  <motion.button whileTap={{ scale: .85 }} onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-purple-400'}`}>
                    {task.done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                  </motion.button>
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: task.color }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${task.done ? 'line-through text-gray-400' : textPrimary}`}>{task.title}</p>
                    <p className={`text-xs mt-0.5 ${textSecondary}`}>{task.subject}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${task.priority === 'high' ? 'bg-red-50 text-red-500' : task.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-600'}`}>
                    {task.priority}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
          <h3 className={`font-bold mb-5 ${textPrimary}`}>Upcoming Exams</h3>
          <div className="space-y-4">
            {[
              { s: 'Mathematics', date: 'Mar 25', days: 8, pct: 72, c: '#7c3aed' },
              { s: 'Physics', date: 'Mar 28', days: 11, pct: 55, c: '#db2777' },
              { s: 'Chemistry', date: 'Apr 2', days: 16, pct: 40, c: '#6d28d9' },
              { s: 'English', date: 'Apr 5', days: 19, pct: 65, c: '#d97706' },
            ].map((e, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className={`font-semibold ${textPrimary}`}>{e.s}</span>
                  <span className={`${e.days <= 3 ? 'text-red-500 font-bold' : textSecondary}`}>{e.days}d left · {e.date}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${e.pct}%` }} transition={{ duration: .8, delay: i * .15 }}
                    className="h-full rounded-full" style={{ background: e.c }} />
                </div>
                <p className="text-right text-xs font-black mt-0.5" style={{ color: e.c }}>{e.pct}%</p>
              </div>
            ))}
            <Btn onClick={() => setTab('planner')} outline sm className="w-full mt-2">Generate Study Plan →</Btn>
          </div>
        </div>
      </div>

      {/* Weekly progress */}
      <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`font-bold ${textPrimary}`}>Weekly Study Progress</h3>
          <span className={`text-xs ${textSecondary}`}>This week: 22h</span>
        </div>
        <div className="flex items-end gap-2 h-24">
          {[['M', 60, 'Mon'], ['T', 40, 'Tue'], ['W', 85, 'Wed'], ['T', 30, 'Thu'], ['F', 100, 'Fri'], ['S', 65, 'Sat'], ['S', 50, 'Sun']].map(([d, h, full], i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: .65, delay: i * .07, ease: 'easeOut' }}
                className="w-full rounded-t-lg cursor-default"
                style={{ background: i === 4 ? 'linear-gradient(to top,#7c3aed,#db2777)' : darkMode ? 'rgba(124,58,237,0.2)' : '#f3e8ff' }}
                title={`${full}: ${Math.round(Number(h) / 100 * 5)}h`} />
              <span className={`text-[10px] font-medium ${textSecondary}`}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── PLANNER TAB ── */
function PlannerTab({ darkMode }: { darkMode: boolean }) {
  const [subjects, setSubjects] = useState([''])
  const [hours, setHours] = useState('3')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<PlanDay[] | null>(null)
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    const valid = subjects.filter(s => s.trim())
    if (!valid.length) return
    setLoading(true); setPlan(null)
    await new Promise(r => setTimeout(r, 2000))
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    setPlan(days.map(day => ({
      day,
      sessions: valid.slice(0, 3).map((s, i) => ({
        subject: s, time: `${8 + i * 2}:00 — ${10 + i * 2}:00`, color: COLORS[i % COLORS.length], duration: 120
      }))
    })))
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className={`${cardBg} rounded-2xl p-6 border`}>
        <h2 className={`font-black text-xl tracking-tight mb-1 ${textPrimary}`}>🤖 AI Study Planner</h2>
        <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Tell the AI your subjects and get a personalized 7-day timetable instantly.</p>
        <form onSubmit={generate} className="space-y-5">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your Subjects</label>
            <div className="space-y-2">
              {subjects.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s} placeholder={`Subject ${i + 1} e.g. Mathematics`} onChange={e => setSubjects(p => p.map((x, idx) => idx === i ? e.target.value : x))}
                    className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500' : 'bg-gray-50 border-gray-200 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100'}`} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${COLORS[i % COLORS.length]}15` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  </div>
                  {subjects.length > 1 && <button type="button" onClick={() => setSubjects(p => p.filter((_, idx) => idx !== i))}
                    className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center text-sm transition-colors">✕</button>}
                </div>
              ))}
              {subjects.length < 8 && (
                <button type="button" onClick={() => setSubjects(p => [...p, ''])}
                  className={`w-full py-2.5 border-2 border-dashed rounded-xl text-sm transition-all ${darkMode ? 'border-gray-700 text-gray-500 hover:border-purple-700 hover:text-purple-400' : 'border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500'}`}>
                  + Add subject
                </button>
              )}
            </div>
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hours Available Per Day</label>
            <div className="grid grid-cols-6 gap-2">
              {['1', '2', '3', '4', '5', '6+'].map(h => (
                <button key={h} type="button" onClick={() => setHours(h)}
                  className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${hours === h ? 'border-purple-600 bg-purple-50 text-purple-600' : darkMode ? 'border-gray-700 text-gray-400 hover:border-purple-700' : 'border-gray-200 text-gray-400 hover:border-purple-300'}`}>
                  {h}h
                </button>
              ))}
            </div>
          </div>
          <Btn type="submit" className="w-full py-3.5 text-base" disabled={loading}>
            {loading ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>AI is building your plan...</span> : '🤖 Generate My Study Plan'}
          </Btn>
        </form>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`${cardBg} rounded-2xl p-12 border flex flex-col items-center gap-4 text-center`}>
            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-3xl">🤖</motion.div>
            <div><p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI is thinking...</p><p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Building your personalized 7-day timetable</p></div>
            <div className="flex gap-1.5">{[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: `${i * .15}s` }} />)}</div>
          </motion.div>
        )}
        {plan && !loading && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className={`${cardBg} border rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3`}
              style={{ background: darkMode ? undefined : 'linear-gradient(135deg,#faf5ff,#fdf2f8)' }}>
              <div><h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>✨ Your 7-Day Plan is Ready!</h3><p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>AI generated your personalized timetable</p></div>
              <div className="flex gap-2"><Btn sm>Save Plan</Btn><Btn outline sm onClick={() => setPlan(null)}>Regenerate</Btn></div>
            </div>
            {plan.map((day, i) => (
              <motion.div key={day.day} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0, transition: { delay: i * .05 } }}
                className={`${cardBg} rounded-2xl p-5 border`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{day.day}</h4>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${darkMode ? 'bg-purple-900/30 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>{day.sessions.length} sessions</span>
                </div>
                <div className="space-y-2">
                  {day.sessions.map((s, j) => (
                    <div key={j} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
                      <div className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <div className="flex-1"><p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.subject}</p><p className="text-xs text-gray-400">{s.time} · {s.duration} min</p></div>
                      <span className="text-xs bg-white/80 text-gray-600 px-2 py-0.5 rounded-full border font-medium">📖 Study</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── CALENDAR TAB ── */
function CalendarTab({ darkMode }: { darkMode: boolean }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = ['8am', '10am', '12pm', '2pm', '4pm', '6pm']
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'

  const schedule: Record<string, { subject: string; color: string }[]> = {
    Mon: [{ subject: 'Mathematics', color: '#7c3aed' }, { subject: 'Physics', color: '#db2777' }],
    Tue: [{ subject: 'Chemistry', color: '#6d28d9' }],
    Wed: [{ subject: 'Mathematics', color: '#7c3aed' }, { subject: 'Biology', color: '#059669' }],
    Thu: [{ subject: 'Physics', color: '#db2777' }, { subject: 'English', color: '#d97706' }],
    Fri: [{ subject: 'Chemistry', color: '#6d28d9' }],
    Sat: [{ subject: 'Mathematics', color: '#7c3aed' }],
    Sun: [],
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className={`${cardBg} rounded-2xl border overflow-hidden`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">‹</motion.button>
            <h3 className="text-white font-black text-lg">March 17 – 23, 2026</h3>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">›</motion.button>
          </div>
          <div className="flex gap-2">
            {['Week', 'Month'].map(v => (
              <button key={v} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${v === 'Week' ? 'bg-white text-purple-600' : 'text-white/70 hover:text-white'}`}>{v}</button>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 border-b" style={{ borderColor: darkMode ? '#374151' : '#f3f4f6' }}>
              <div className="p-3" />
              {days.map((d, i) => (
                <div key={d} className={`p-3 text-center border-l ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>{d}</p>
                  <p className={`text-lg font-black mt-0.5 ${i === 0 ? 'text-purple-600' : textPrimary}`}>{17 + i}</p>
                </div>
              ))}
            </div>
            {/* Schedule rows */}
            {hours.map((hour, hi) => (
              <div key={hour} className={`grid grid-cols-8 border-b min-h-[80px] ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                <div className={`p-3 flex items-start justify-end pr-4 ${textSecondary} text-xs font-medium`}>{hour}</div>
                {days.map((d, di) => (
                  <div key={d} className={`border-l p-1.5 ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                    {schedule[d]?.filter((_, i) => i === hi % schedule[d]?.length).map((s, si) => (
                      hi < (schedule[d]?.length || 0) && si === 0 ? (
                        <motion.div key={si} whileHover={{ scale: 1.02 }}
                          className="h-16 rounded-xl p-2 text-white cursor-pointer shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}bb)` }}>
                          <p className="text-[10px] font-bold truncate">{s.subject}</p>
                          <p className="text-[9px] opacity-75 mt-0.5">2 hours</p>
                        </motion.div>
                      ) : null
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject legend */}
      <div className={`${cardBg} rounded-2xl p-5 border`}>
        <p className={`font-bold text-sm mb-3 ${textPrimary}`}>Subject Colors</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(CALENDAR_COLORS).map(([subject, color]) => (
            <div key={subject} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className={`text-xs font-medium ${textSecondary}`}>{subject}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── FOCUS TAB ── */
function FocusTab({ darkMode }: { darkMode: boolean }) {
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(25 * 60)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [subject, setSubject] = useState('Mathematics')
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime(t => {
          if (t <= 0) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setSessions(s => s + 1)
            if (mode === 'focus') { setMode('break'); setTime(5 * 60) }
            else { setMode('focus'); setTime(25 * 60) }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else clearInterval(intervalRef.current)
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  const mins = Math.floor(time / 60).toString().padStart(2, '0')
  const secs = (time % 60).toString().padStart(2, '0')
  const progress = mode === 'focus' ? 1 - (time / (25 * 60)) : 1 - (time / (5 * 60))
  const circumference = 2 * Math.PI * 80

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: running ? 'linear-gradient(135deg,#3b0764,#7c3aed,#9d174d)' : 'linear-gradient(135deg,#1e1b4b,#312e81,#3b0764)' }}>
        <div className="p-8 md:p-12">
          {/* Subject */}
          <div className="text-center mb-8">
            <p className="text-purple-200 text-sm font-medium mb-2">Currently studying</p>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="bg-white/10 border border-white/20 text-white font-bold text-lg px-4 py-2 rounded-xl outline-none appearance-none cursor-pointer">
              {Object.keys(CALENDAR_COLORS).map(s => <option key={s} className="text-gray-900">{s}</option>)}
            </select>
          </div>

          {/* Timer circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-52 h-52">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <motion.circle cx="90" cy="90" r="80" fill="none" stroke="url(#timerGrad)" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={circumference}
                  animate={{ strokeDashoffset: circumference * (1 - progress) }}
                  transition={{ duration: .5 }} />
                <defs>
                  <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.p key={time} className="text-5xl font-black text-white tracking-tight"
                  initial={{ scale: 1.05 }} animate={{ scale: 1 }}>
                  {mins}:{secs}
                </motion.p>
                <p className="text-purple-200 text-sm font-medium mt-1">{mode === 'focus' ? 'Focus Session' : 'Short Break'}</p>
              </div>
            </div>
          </div>

          {/* Mode selector */}
          <div className="flex justify-center gap-3 mb-8">
            {[{ label: 'Focus', mins: 25, m: 'focus' as const }, { label: 'Short Break', mins: 5, m: 'break' as const }, { label: 'Long Break', mins: 15, m: 'break' as const }].map(item => (
              <button key={item.label} onClick={() => { setMode(item.m); setTime(item.mins * 60); setRunning(false) }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${mode === item.m && item.label === 'Focus' ? 'bg-white text-purple-700' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                {item.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
              onClick={() => { setTime(25 * 60); setRunning(false); setMode('focus') }}
              className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              ↺
            </motion.button>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: .92 }}
              onClick={() => setRunning(!running)}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl">
              {running
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="#7c3aed"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="#7c3aed"><path d="M8 5v14l11-7z" /></svg>}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
              onClick={() => { setRunning(false); setTime(mode === 'focus' ? 25 * 60 : 5 * 60) }}
              className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              ⏹
            </motion.button>
          </div>

          {/* Session count */}
          <div className="text-center mt-8">
            <div className="flex justify-center gap-2 mb-2">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < sessions % 4 ? 'bg-purple-400' : 'bg-white/20'}`} />
              ))}
            </div>
            <p className="text-purple-200 text-sm">{sessions} sessions completed today</p>
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      <div className={`mt-5 rounded-2xl p-5 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'}`}>
        <p className={`font-bold text-sm mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Focus Tips 💡</p>
        <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <li>📵 Put your phone in another room during focus sessions</li>
          <li>💧 Keep a glass of water on your desk</li>
          <li>🎵 Try lo-fi music to boost concentration</li>
          <li>📝 Write your goal for this session before starting</li>
        </ul>
      </div>
    </div>
  )
}

/* ── TASKS TAB ── */
function TasksTab({ tasks, setTasks, toggleTask, darkMode }: any) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'high'>('all')
  const [showForm, setShowForm] = useState(false)
  const [nt, setNt] = useState({ title: '', subject: '', priority: 'medium' as Task['priority'], deadline: '' })
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const inputCls = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500' : 'bg-gray-50 border-gray-200 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100'

  const filtered = tasks.filter((t: Task) =>
    filter === 'all' ? true : filter === 'pending' ? !t.done : filter === 'done' ? t.done : t.priority === 'high' && !t.done
  )

  function add(e: React.FormEvent) {
    e.preventDefault()
    if (!nt.title.trim()) return
    setTasks((p: Task[]) => [...p, { id: Date.now().toString(), ...nt, done: false, color: COLORS[p.length % COLORS.length] }])
    setNt({ title: '', subject: '', priority: 'medium', deadline: '' }); setShowForm(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-black text-xl tracking-tight ${textPrimary}`}>Tasks</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{tasks.filter((t: Task) => !t.done).length} pending · {tasks.filter((t: Task) => t.done).length} done</p>
        </div>
        <Btn sm onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Add Task'}</Btn>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className={`${cardBg} rounded-2xl p-6 border`}>
              <form onSubmit={add} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Task Title</label>
                    <input value={nt.title} placeholder="e.g. Complete Chapter 5" onChange={e => setNt({ ...nt, title: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${inputCls}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Subject</label>
                    <input value={nt.subject} placeholder="e.g. Mathematics" onChange={e => setNt({ ...nt, subject: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${inputCls}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Priority</label>
                    <select value={nt.priority} onChange={e => setNt({ ...nt, priority: e.target.value as Task['priority'] })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all appearance-none ${inputCls}`}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Deadline</label>
                    <input type="date" value={nt.deadline} onChange={e => setNt({ ...nt, deadline: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${inputCls}`} />
                  </div>
                </div>
                <div className="flex gap-3"><Btn type="submit" sm>Add Task</Btn><Btn outline sm onClick={() => setShowForm(false)}>Cancel</Btn></div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 flex-wrap">
        {([['all', 'All'], ['pending', 'Pending'], ['high', '🔥 Urgent'], ['done', 'Done']] as const).map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-purple-50 text-purple-700 border border-purple-100' : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
            {label} ({f === 'all' ? tasks.length : f === 'pending' ? tasks.filter((t: Task) => !t.done).length : f === 'done' ? tasks.filter((t: Task) => t.done).length : tasks.filter((t: Task) => t.priority === 'high' && !t.done).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="text-6xl mb-4">🎉</div>
              <p className={`font-bold text-lg ${textPrimary}`}>All done!</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>No {filter === 'done' ? 'completed' : 'pending'} tasks. You're crushing it!</p>
            </motion.div>
          ) : filtered.map((task: Task, i: number) => (
            <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * .04 } }} exit={{ opacity: 0, x: -20 }}
              className={`${cardBg} rounded-2xl p-5 border flex items-center gap-4 group hover:shadow-md transition-all`}>
              <motion.button whileTap={{ scale: .8 }} onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-purple-400'}`}>
                {task.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
              </motion.button>
              <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: task.color }} />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${task.done ? 'line-through text-gray-400' : textPrimary}`}>{task.title}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{task.subject} {task.deadline ? `· Due ${task.deadline}` : ''}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${task.priority === 'high' ? 'bg-red-50 text-red-500' : task.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-600'}`}>
                {task.priority}
              </span>
              <button onClick={() => setTasks((p: Task[]) => p.filter((t: Task) => t.id !== task.id))}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── ANALYTICS TAB ── */
function AnalyticsTab({ darkMode }: { darkMode: boolean }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'

  // Heatmap data
  const heatmapData = Array(52).fill(0).map(() => Array(7).fill(0).map(() => Math.random() > 0.4 ? Math.floor(Math.random() * 4) : 0))

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className={`font-black text-xl tracking-tight ${textPrimary}`}>Analytics</h2>
        <p className={`text-sm mt-0.5 ${textSecondary}`}>Your complete study performance overview.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[['89h', 'Total Hours', '#7c3aed'], ['12 days', 'Streak', '#db2777'], ['3.2h', 'Daily Avg', '#059669'], ['47', 'Tasks Done', '#d97706']].map(([v, l, c], i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: i * .07 } }}
            whileHover={{ y: -4 }} className={`${cardBg} rounded-2xl p-5 border shadow-sm transition-all`}>
            <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center" style={{ background: `${c}18` }}>
              <div className="w-3 h-3 rounded-full" style={{ background: c as string }} />
            </div>
            <p className="font-black text-2xl mb-0.5" style={{ color: c as string }}>{v}</p>
            <p className={`text-xs font-medium ${textSecondary}`}>{l}</p>
          </motion.div>
        ))}
      </div>

      {/* Study Heatmap */}
      <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
        <h3 className={`font-bold mb-5 ${textPrimary}`}>Study Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {heatmapData.slice(-16).map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <motion.div key={di} whileHover={{ scale: 1.5 }}
                    className="w-3 h-3 rounded-sm cursor-pointer"
                    style={{ background: day === 0 ? darkMode ? '#1f2937' : '#f3f4f6' : day === 1 ? '#e9d5ff' : day === 2 ? '#a855f7' : day === 3 ? '#7c3aed' : '#581c87' }}
                    title={`${day} hours`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-xs ${textSecondary}`}>Less</span>
            {['#f3f4f6', '#e9d5ff', '#a855f7', '#7c3aed', '#581c87'].map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
            ))}
            <span className={`text-xs ${textSecondary}`}>More</span>
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`font-bold ${textPrimary}`}>Study Hours — Past 6 Weeks</h3>
          <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${darkMode ? 'bg-purple-900/30 text-purple-300 border border-purple-800' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>↑ 31%</span>
        </div>
        <div className="flex items-end gap-3 h-36">
          {[[14, 'W1'], [18, 'W2'], [12, 'W3'], [22, 'W4'], [19, 'W5'], [25, 'W6']].map(([h, label], i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div initial={{ height: 0 }} animate={{ height: `${(Number(h) / 25) * 100}%` }} transition={{ duration: .65, delay: i * .1, ease: 'easeOut' }}
                className="w-full rounded-t-xl cursor-pointer" whileHover={{ scale: 1.05 }}
                style={{ background: i === 5 ? 'linear-gradient(to top,#7c3aed,#db2777)' : darkMode ? 'rgba(124,58,237,0.2)' : '#f3e8ff' }}
                title={`${h}h`} />
              <span className={`text-xs font-medium ${textSecondary}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Exam readiness */}
      <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
        <h3 className={`font-bold mb-5 ${textPrimary}`}>Exam Readiness</h3>
        <div className="space-y-5">
          {[
            { s: 'Mathematics', pct: 72, days: 8, c: '#7c3aed', msg: '📚 On track — keep going!' },
            { s: 'Physics', pct: 55, days: 11, c: '#db2777', msg: '📚 Getting there, push harder' },
            { s: 'Chemistry', pct: 40, days: 16, c: '#6d28d9', msg: '⚠️ Needs more study time' },
            { s: 'English', pct: 80, days: 19, c: '#d97706', msg: '✅ Great shape — maintain pace' },
          ].map((exam, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${textPrimary}`}>{exam.s}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-400'}`}>{exam.days}d left</span>
                </div>
                <span className="text-sm font-black" style={{ color: exam.c }}>{exam.pct}%</span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${exam.pct}%` }} transition={{ duration: .9, delay: i * .15 }}
                  className="h-full rounded-full" style={{ background: exam.c }} />
              </div>
              <p className={`text-xs mt-1.5 ${textSecondary}`}>{exam.msg}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subject breakdown */}
      <div className={`${cardBg} rounded-2xl p-6 border shadow-sm`}>
        <h3 className={`font-bold mb-5 ${textPrimary}`}>Subject Breakdown</h3>
        <div className="space-y-4">
          {[['Mathematics', 12, 20, '#7c3aed'], ['Physics', 8, 15, '#db2777'], ['Chemistry', 6, 18, '#6d28d9'], ['English', 4, 10, '#d97706'], ['Biology', 9, 14, '#059669']].map(([name, done, total, color], i) => {
            const pct = Math.round((Number(done) / Number(total)) * 100)
            return (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: color as string }} /><span className={`font-medium ${textPrimary}`}>{name}</span></div>
                  <span className={textSecondary}>{done}h / {total}h · {pct}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .8, delay: i * .1 }}
                    className="h-full rounded-full" style={{ background: color as string }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── NOTES TAB ── */
function NotesTab({ notes, setNotes, darkMode }: any) {
  const [active, setActive] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState(false)
  const [form, setForm] = useState({ subject: '', content: '' })
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputCls = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className={`font-black text-xl ${textPrimary}`}>Notes 📝</h2>
        <Btn sm onClick={() => { setNewNote(true); setActive(null) }}>+ New Note</Btn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Note list */}
        <div className="space-y-3">
          {newNote && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={`${cardBg} rounded-2xl p-4 border-2 border-purple-400`}>
              <input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none mb-2 transition-all ${inputCls}`} />
              <textarea placeholder="Write your note..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                rows={3} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none transition-all ${inputCls}`} />
              <div className="flex gap-2 mt-2">
                <Btn sm onClick={() => {
                  if (!form.subject || !form.content) return
                  const note: Note = { id: Date.now().toString(), ...form, updatedAt: 'Just now', color: COLORS[notes.length % COLORS.length] }
                  setNotes((p: Note[]) => [note, ...p]); setForm({ subject: '', content: '' }); setNewNote(false)
                }}>Save</Btn>
                <Btn outline sm onClick={() => setNewNote(false)}>Cancel</Btn>
              </div>
            </motion.div>
          )}
          {notes.map((note: Note) => (
            <motion.div key={note.id} whileHover={{ scale: 1.01 }}
              onClick={() => { setActive(note); setNewNote(false) }}
              className={`${cardBg} rounded-2xl p-4 border cursor-pointer transition-all ${active?.id === note.id ? 'border-purple-400 shadow-md' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: note.color }} />
                <p className={`font-bold text-sm truncate ${textPrimary}`}>{note.subject}</p>
              </div>
              <p className={`text-xs leading-relaxed line-clamp-2 ${textSecondary}`}>{note.content}</p>
              <p className={`text-[10px] mt-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>{note.updatedAt}</p>
            </motion.div>
          ))}
        </div>

        {/* Note editor */}
        <div className="md:col-span-2">
          {active ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${cardBg} rounded-2xl p-6 border h-full`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: active.color }} />
                  <h3 className={`font-bold text-lg ${textPrimary}`}>{active.subject}</h3>
                </div>
                <div className="flex gap-2">
                  <Btn sm outline onClick={() => setNotes((p: Note[]) => p.filter(n => n.id !== active.id)) as any || setActive(null)}>Delete</Btn>
                </div>
              </div>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${textSecondary}`}>{active.content}</p>
              <p className={`text-xs mt-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>Updated {active.updatedAt}</p>
            </motion.div>
          ) : (
            <div className={`${cardBg} rounded-2xl border h-64 flex flex-col items-center justify-center text-center p-8`}>
              <span className="text-4xl mb-3">📝</span>
              <p className={`font-bold ${textPrimary}`}>Select a note to view it</p>
              <p className={`text-sm mt-1 ${textSecondary}`}>Or create a new one to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── AI BUDDY TAB ── */
function AIBuddyTab({ darkMode }: { darkMode: boolean }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m StudyPilot AI 🤖 I can help you understand any topic, quiz you on your subjects, or give you study tips. What would you like to work on?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const inputCls = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200'

  const suggestions = ['Explain integration by parts', 'Quiz me on wave motion', 'Give me a study plan for Physics', 'What is organic chemistry?']

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text?: string) {
    const msg = text || input.trim()
    if (!msg) return
    setMessages(p => [...p, { role: 'user', text: msg }])
    setInput(''); setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    const responses: Record<string, string> = {
      'Explain integration by parts': "Integration by parts uses the formula: ∫u dv = uv - ∫v du\n\nThe trick is choosing u and dv wisely. Use the LIATE rule:\n• L - Logarithmic\n• I - Inverse trig\n• A - Algebraic\n• T - Trigonometric\n• E - Exponential\n\nChoose u as whatever comes first in LIATE. Want me to work through an example?",
      'Quiz me on wave motion': "Great! Let's quiz you on wave motion 📚\n\nQuestion 1: What is the relationship between wave frequency (f), wavelength (λ), and wave speed (v)?\n\nA) v = f + λ\nB) v = f × λ ✓\nC) v = f ÷ λ\nD) v = λ ÷ f\n\nType your answer (A, B, C, or D)!",
    }
    const reply = responses[msg] || `Great question about "${msg}"! 🤖\n\nThis is a connected live AI feature — once the backend is set up with OpenAI, I'll give you detailed, accurate answers about any topic, create quizzes, explain concepts step by step, and even adapt to your learning style.\n\nFor now I'm in demo mode! 🚀`
    setMessages(p => [...p, { role: 'assistant', text: reply }])
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-200px)]">
      <div className={`${cardBg} rounded-2xl border flex flex-col flex-1 overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: darkMode ? '#374151' : '#f3f4f6' }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-xl">🤖</div>
          <div>
            <p className={`font-bold text-sm ${textPrimary}`}>StudyPilot AI</p>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-xs text-green-500 font-medium">Online</span></div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-sm'
                  : darkMode ? 'bg-gray-800 text-gray-200 rounded-bl-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="flex gap-1">{[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * .15}s` }} />)}</div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${darkMode ? 'border-gray-700 text-gray-400 hover:border-purple-600 hover:text-purple-400' : 'border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600'}`}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className={`p-4 border-t flex gap-3`} style={{ borderColor: darkMode ? '#374151' : '#f3f4f6' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask me anything about your subjects..."
            className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all ${inputCls} focus:border-purple-400`} />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-200 disabled:opacity-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 19-7z" /></svg>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ── BADGES TAB ── */
function BadgesTab({ darkMode }: { darkMode: boolean }) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'
  const earned = MOCK_BADGES.filter(b => b.earned)
  const locked = MOCK_BADGES.filter(b => !b.earned)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className={`font-black text-xl ${textPrimary}`}>Badges 🏆</h2>
        <p className={`text-sm mt-0.5 ${textSecondary}`}>{earned.length} earned · {locked.length} to unlock</p>
      </div>

      {/* XP Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-purple-100 text-sm font-medium mb-1">Your Progress</p>
            <p className="font-black text-4xl">Level 5</p>
            <p className="text-purple-200 text-sm mt-1">Scholar · 450 XP</p>
          </div>
          <div className="text-center">
            <p className="font-black text-6xl">🎓</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-purple-200 mb-1.5"><span>Level 5</span><span>Level 6 — 50 XP to go</span></div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '50%' }} />
          </div>
        </div>
      </div>

      {/* Earned */}
      <div>
        <p className={`font-bold text-sm mb-3 ${textPrimary}`}>Earned Badges ({earned.length})</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {earned.map(badge => (
            <motion.div key={badge.id} whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(124,58,237,.15)' }}
              className={`${cardBg} rounded-2xl p-5 border text-center shadow-sm transition-all`}>
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                className="text-4xl mb-3">{badge.icon}</motion.div>
              <p className={`font-bold text-sm ${textPrimary}`}>{badge.name}</p>
              <p className={`text-xs mt-1 ${textSecondary}`}>{badge.desc}</p>
              <p className="text-xs text-purple-500 font-medium mt-2">Earned {badge.earnedAt}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Locked */}
      <div>
        <p className={`font-bold text-sm mb-3 ${textPrimary}`}>Locked Badges ({locked.length})</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {locked.map(badge => (
            <div key={badge.id} className={`${cardBg} rounded-2xl p-5 border text-center opacity-50`}>
              <div className="text-4xl mb-3 grayscale">{badge.icon}</div>
              <p className={`font-bold text-sm ${textPrimary}`}>{badge.name}</p>
              <p className={`text-xs mt-1 ${textSecondary}`}>{badge.desc}</p>
              <p className={`text-xs mt-2 ${textSecondary}`}>🔒 Locked</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── PROFILE TAB ── */
function ProfileTab({ darkMode, setPage }: { darkMode: boolean; setPage: (p: Page) => void }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: 'Amaka Johnson', university: 'University of Lagos', course: 'Computer Science', level: '300 Level', email: 'amaka@studypilot.app' })
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputCls = darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Avatar + name */}
      <div className={`${cardBg} rounded-2xl p-8 border text-center`}>
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-purple-200">
            AJ
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white text-xs shadow-md">
            ✏️
          </motion.button>
        </div>
        <h2 className={`font-black text-2xl ${textPrimary}`}>{form.name}</h2>
        <p className={`text-sm mt-1 ${textSecondary}`}>{form.university} · {form.course}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-full font-bold">✨ Pro Plan</span>
          <span className="text-xs bg-orange-50 text-orange-500 border border-orange-100 px-3 py-1 rounded-full font-bold">9🔥 Streak</span>
          <span className="text-xs bg-blue-50 text-blue-500 border border-blue-100 px-3 py-1 rounded-full font-bold">Level 5</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[['89h', 'Total Study Hours'], ['12', 'Day Streak'], ['47', 'Tasks Completed']].map(([v, l], i) => (
          <div key={i} className={`${cardBg} rounded-2xl p-4 border text-center shadow-sm`}>
            <p className="font-black text-2xl text-purple-600">{v}</p>
            <p className={`text-xs mt-1 ${textSecondary}`}>{l}</p>
          </div>
        ))}
      </div>

      {/* Edit profile */}
      <div className={`${cardBg} rounded-2xl p-6 border`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`font-bold ${textPrimary}`}>Profile Details</h3>
          <Btn sm outline onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit Profile'}</Btn>
        </div>
        <div className="space-y-4">
          {[
            { key: 'name', label: 'Full Name' },
            { key: 'email', label: 'Email Address' },
            { key: 'university', label: 'University' },
            { key: 'course', label: 'Course / Department' },
            { key: 'level', label: 'Level / Year' },
          ].map(field => (
            <div key={field.key}>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${textSecondary}`}>{field.label}</label>
              {editing ? (
                <input value={(form as any)[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${inputCls} focus:border-purple-400`} />
              ) : (
                <p className={`text-sm font-medium ${textPrimary}`}>{(form as any)[field.key]}</p>
              )}
            </div>
          ))}
          {editing && <Btn onClick={() => setEditing(false)} className="w-full">Save Changes</Btn>}
        </div>
      </div>

      {/* Danger zone */}
      <div className={`${cardBg} rounded-2xl p-6 border border-red-200`}>
        <h3 className="font-bold text-red-500 mb-3">Danger Zone</h3>
        <p className={`text-sm mb-4 ${textSecondary}`}>These actions are permanent and cannot be undone.</p>
        <div className="flex gap-3 flex-wrap">
          <Btn outline sm onClick={() => setPage('logout')} className="border-red-300 text-red-500 hover:bg-red-50">Log Out</Btn>
          <button className="px-4 py-2 text-sm font-semibold text-red-400 border border-red-200 rounded-xl hover:bg-red-50 transition-all">Delete Account</button>
        </div>
      </div>
    </div>
  )
}

/* ── SETTINGS TAB ── */
function SettingsTab({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const [currency, setCurrency] = useState<'usd' | 'ngn'>('usd')
  const [notifications, setNotifications] = useState({ exams: true, streak: true, tips: true, weekly: false })
  const [reminderTime, setReminderTime] = useState('20:00')
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'

  function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <motion.button onClick={onToggle} className={`w-12 h-6 rounded-full transition-colors flex items-center ${on ? 'bg-purple-600' : 'bg-gray-300'}`}>
        <motion.div animate={{ x: on ? 24 : 2 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-5 h-5 rounded-full bg-white shadow-sm" />
      </motion.button>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h2 className={`font-black text-xl ${textPrimary}`}>Settings ⚙️</h2>

      {/* Appearance */}
      <div className={`${cardBg} rounded-2xl p-6 border`}>
        <h3 className={`font-bold mb-4 ${textPrimary}`}>Appearance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className={`text-sm font-semibold ${textPrimary}`}>Dark Mode</p><p className={`text-xs ${textSecondary}`}>Switch to dark theme</p></div>
            <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className={`text-sm font-semibold ${textPrimary}`}>Currency</p><p className={`text-xs ${textSecondary}`}>Display prices in your currency</p></div>
            <div className="flex gap-2">
              {[['usd', '$ USD'], ['ngn', '₦ NGN']].map(([c, label]) => (
                <button key={c} onClick={() => setCurrency(c as 'usd' | 'ngn')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${currency === c ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-400'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={`${cardBg} rounded-2xl p-6 border`}>
        <h3 className={`font-bold mb-4 ${textPrimary}`}>Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'exams', label: 'Exam Reminders', desc: 'Get notified 3 days before exams' },
            { key: 'streak', label: 'Streak Alerts', desc: 'Reminders to maintain your study streak' },
            { key: 'tips', label: 'Study Tips', desc: 'Daily study tips and insights' },
            { key: 'weekly', label: 'Weekly Report', desc: 'Weekly summary of your progress' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div><p className={`text-sm font-semibold ${textPrimary}`}>{item.label}</p><p className={`text-xs ${textSecondary}`}>{item.desc}</p></div>
              <Toggle on={(notifications as any)[item.key]} onToggle={() => setNotifications(p => ({ ...p, [item.key]: !(p as any)[item.key] }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Study reminder */}
      <div className={`${cardBg} rounded-2xl p-6 border`}>
        <h3 className={`font-bold mb-4 ${textPrimary}`}>Study Reminder Time</h3>
        <p className={`text-sm mb-4 ${textSecondary}`}>We'll remind you to study at this time every day</p>
        <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
          className={`px-4 py-3 rounded-xl border text-sm outline-none transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'} focus:border-purple-400`} />
      </div>

      {/* Account */}
      <div className={`${cardBg} rounded-2xl p-6 border`}>
        <h3 className={`font-bold mb-4 ${textPrimary}`}>Account</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors">Change Password →</button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors">Manage Subscription →</button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors">Export My Data →</button>
        </div>
      </div>
    </div>
  )
}

/* ── NOTIFICATIONS TAB ── */
function NotificationsTab({ notifications, setNotifications, darkMode }: any) {
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'

  const icons: Record<string, string> = { exam: '📅', streak: '🔥', tip: '💡', system: '🎉' }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`font-black text-xl ${textPrimary}`}>Notifications 🔔</h2>
        <button onClick={() => setNotifications((p: Notification[]) => p.map(n => ({ ...n, read: true })))}
          className="text-xs text-purple-600 font-bold hover:text-purple-700">Mark all read</button>
      </div>
      {notifications.map((n: Notification) => (
        <motion.div key={n.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} rounded-2xl p-5 border flex items-start gap-4 cursor-pointer transition-all ${!n.read ? darkMode ? 'border-purple-800 bg-purple-900/20' : 'border-purple-100 bg-purple-50/50' : ''}`}
          onClick={() => setNotifications((p: Notification[]) => p.map((x: Notification) => x.id === n.id ? { ...x, read: true } : x))}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {icons[n.type]}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${textPrimary}`}>{n.message}</p>
            <p className={`text-xs mt-1 ${textSecondary}`}>{n.time}</p>
          </div>
          {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-purple-600 flex-shrink-0 mt-1.5" />}
        </motion.div>
      ))}
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRICING PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Pricing({ setPage }: { setPage: (p: Page) => void }) {
  const [yearly, setYearly] = useState(false)
  const [currency, setCurrency] = useState<'usd' | 'ngn'>('usd')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const price = { monthly: currency === 'usd' ? '$8' : '₦9,000', yearly: currency === 'usd' ? '$5' : '₦4,500', yearlySave: currency === 'usd' ? '$36' : '₦54,000' }

  const faqs = [
    { q: 'Can I cancel anytime?', a: 'Yes! No contracts. Cancel from your account settings and keep access until your billing period ends.' },
    { q: 'Is the free plan really free forever?', a: 'Yes — free forever with no credit card required. Includes 3 subjects and 3 AI plans per month.' },
    { q: 'How does the AI generate my plan?', a: 'You enter your subjects, exam dates, and available hours. The AI builds an optimal day-by-day timetable in seconds.' },
    { q: 'Do you support Paystack?', a: 'Yes! Paystack is fully supported for Nigerian users — card, bank transfer, and USSD. International users can pay via card in USD.' },
    { q: "What's the 7-day free trial?", a: 'Sign up for Pro and get full access free for 7 days. No charge until the trial ends. Cancel anytime before.' },
    { q: 'Is my data secure?', a: 'Yes. All data is encrypted in transit and at rest. We use Supabase for secure data storage and never sell your data to third parties.' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar setPage={setPage} />
      <section className="pt-28 pb-16 px-6 text-center bg-gradient-to-b from-purple-50/40 to-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-100/40 blur-[100px] pointer-events-none" />
        <motion.div initial="hidden" animate="show" variants={stagger(.1)} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-600 text-xs font-bold px-4 py-2 rounded-full mb-6">Pricing</motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Simple, Transparent Pricing</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-8 max-w-md mx-auto">Start free. No hidden fees. Upgrade only when you need more.</motion.p>
          {/* Currency toggle */}
          <motion.div variants={fadeUp} className="flex justify-center gap-3 mb-4 flex-wrap">
            <div className="inline-flex bg-white border border-gray-200 rounded-full p-1 gap-1 shadow-sm">
              <button onClick={() => setCurrency('usd')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currency === 'usd' ? 'bg-purple-600 text-white shadow' : 'text-gray-400'}`}>🌍 USD $</button>
              <button onClick={() => setCurrency('ngn')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currency === 'ngn' ? 'bg-purple-600 text-white shadow' : 'text-gray-400'}`}>🇳🇬 NGN ₦</button>
            </div>
            <div className="inline-flex bg-gray-100 rounded-full p-1.5 gap-1">
              <button onClick={() => setYearly(false)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!yearly ? 'bg-white shadow text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>Monthly</button>
              <button onClick={() => setYearly(true)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${yearly ? 'bg-white shadow text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
                Yearly <span className="text-green-500 text-xs font-black">Save 40%</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal delay={.1}>
            <motion.div whileHover={{ y: -4 }} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm h-full flex flex-col transition-all">
              <p className="text-gray-400 text-sm font-semibold mb-3">Student Plan</p>
              <div className="flex items-baseline gap-1 mb-1"><span className="font-black text-4xl text-gray-900">{currency === 'usd' ? '$0' : '₦0'}</span><span className="text-gray-400 text-sm">/mo</span></div>
              <p className="text-xs text-gray-400 mb-6">Free forever. No credit card.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['3 active subjects', 'Basic AI planning (3/month)', 'Focus timer', 'Task management', '7-day history', 'Badge system'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg></div>{f}
                  </li>
                ))}
                {['Advanced analytics', 'Exam readiness score', 'Smart reminders'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><span className="text-[10px] text-gray-300">✕</span></div>{f}
                  </li>
                ))}
              </ul>
              <Btn outline onClick={() => setPage('signup')} className="w-full">Get Started Free</Btn>
            </motion.div>
          </Reveal>

          <Reveal delay={.18}>
            <motion.div whileHover={{ y: -4 }} className="relative h-full flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-sm">Most Popular</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 shadow-xl flex-1 flex flex-col">
                <p className="text-purple-200 text-sm font-semibold mb-3">Pro Plan</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-black text-4xl text-white">{yearly ? price.yearly : price.monthly}</span>
                  <span className="text-purple-200 text-sm">/month</span>
                </div>
                <p className="text-xs text-purple-300 mb-6">{yearly ? `Billed yearly — save ${price.yearlySave}/year` : 'Billed monthly'}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Unlimited subjects', 'Full AI planning + insights', 'Exam readiness score', 'Advanced analytics', 'Smart reminders', 'Weekly AI study report', 'AI Study Buddy chat', 'All badges + XP system', 'Priority support'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-purple-100">
                      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg></div>{f}
                    </li>
                  ))}
                </ul>
                <Btn white onClick={() => setPage('signup')} className="w-full">Start 7-Day Free Trial →</Btn>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Frequently Asked Questions</h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * .05}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:border-purple-100 hover:shadow-md transition-all">
                  <div className="flex justify-between items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">{faq.q}</span>
                    <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} className="text-purple-500 font-black text-xl leading-none flex-shrink-0">+</motion.span>
                  </div>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="text-gray-400 text-sm mt-3 leading-relaxed overflow-hidden">{faq.a}</motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo onClick={() => setPage('home')} />
          <p className="text-gray-400 text-sm">© 2026 StudyPilot by Coderift Studio.</p>
          <div className="flex gap-5">
            {[['Privacy', 'privacy'], ['Terms', 'terms'], ['Contact', 'contact']].map(([l, p]) => (
              <button key={l} onClick={() => setPage(p as Page)} className="text-gray-400 text-sm hover:text-purple-600 transition-colors">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ABOUT PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function About({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar setPage={setPage} />
      <section className="pt-28 pb-16 px-6 text-center bg-gradient-to-b from-purple-50/40 to-white">
        <motion.div initial="hidden" animate="show" variants={stagger(.1)}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-600 text-xs font-bold px-4 py-2 rounded-full mb-6">About Us</motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900 mb-4">We&apos;re building the future<br />of student productivity</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-2xl mx-auto">StudyPilot was built by Coderift Studio — a team of designers, developers, and project managers who believe every student deserves a smart, personalized way to study.</motion.p>
        </motion.div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <Reveal>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-500 leading-relaxed mb-4">We believe the biggest barrier to academic success isn&apos;t intelligence — it&apos;s poor planning and inconsistency. Most students know what to study, they just don&apos;t know how to organize their time effectively.</p>
              <p className="text-gray-500 leading-relaxed">StudyPilot uses AI to solve exactly that. We build personalized study plans that adapt to your schedule, track your progress automatically, and keep you motivated with a gamified experience that makes studying feel rewarding.</p>
            </Reveal>
            <Reveal delay={.2}>
              <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-8 text-white text-center">
                <div className="text-6xl mb-4">🎓</div>
                <p className="font-black text-2xl mb-2">Built for Students</p>
                <p className="text-purple-100">From Nigeria and beyond — every feature is designed with real student needs in mind.</p>
              </div>
            </Reveal>
          </div>

          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Built by Coderift Studio</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Coderift Studio is a curated team of designers, developers, and project managers building innovative digital products across web, mobile, and AI.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: '🎯', title: 'Precision Execution', desc: 'Every feature is built with care, tested thoroughly, and refined before release.' },
              { icon: '💡', title: 'Student-First Design', desc: 'Every decision starts with one question — does this make studying better for students?' },
              { icon: '🌍', title: 'Built for Africa & Beyond', desc: 'Designed with Nigerian students in mind but built for students worldwide.' },
            ].map((v, i) => (
              <Reveal key={i} delay={i * .1}>
                <motion.div whileHover={{ y: -4 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
                  <div className="text-3xl mb-4">{v.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <div className="text-center">
            <Btn onClick={() => setPage('signup')} className="mr-3">Get Started Free →</Btn>
            <Btn outline onClick={() => setPage('contact')}>Contact Us</Btn>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo onClick={() => setPage('home')} />
          <p className="text-gray-400 text-sm">© 2026 StudyPilot by Coderift Studio.</p>
          <div className="flex gap-5">
            {[['Pricing', 'pricing'], ['Privacy', 'privacy'], ['Contact', 'contact']].map(([l, p]) => (
              <button key={l} onClick={() => setPage(p as Page)} className="text-gray-400 text-sm hover:text-purple-600 transition-colors">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONTACT PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Contact({ setPage }: { setPage: (p: Page) => void }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); await new Promise(r => setTimeout(r, 1200)); setLoading(false); setSent(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar setPage={setPage} />
      <section className="pt-28 pb-16 px-6 text-center bg-gradient-to-b from-purple-50/40 to-white">
        <motion.div initial="hidden" animate="show" variants={stagger(.1)}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-600 text-xs font-bold px-4 py-2 rounded-full mb-6">Contact Us</motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900 mb-4">We&apos;d love to hear from you</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-md mx-auto">Have a question, bug report, or just want to say hi? We reply within 24 hours.</motion.p>
        </motion.div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <Reveal>
            <div className="space-y-6">
              {[
                { icon: '✉️', title: 'Email', info: 'hello@studypilot.app', desc: 'We reply within 24 hours' },
                { icon: '💬', title: 'WhatsApp', info: '+234 900 000 0000', desc: 'Chat with us directly' },
                { icon: '🐦', title: 'Twitter/X', info: '@studypilot', desc: 'DM us anytime' },
                { icon: '📍', title: 'Location', info: 'Lagos, Nigeria', desc: 'Operating worldwide' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-purple-600 font-medium text-sm">{item.info}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={.2}>
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-black text-gray-900 text-xl mb-2">Message sent!</h3>
                <p className="text-gray-400">We'll get back to you within 24 hours.</p>
                <Btn onClick={() => setSent(false)} className="mt-6">Send another →</Btn>
              </motion.div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <form onSubmit={submit} className="space-y-4">
                  {[{ key: 'name', label: 'Full Name', type: 'text', ph: 'Amaka Johnson' }, { key: 'email', label: 'Email', type: 'email', ph: 'you@email.com' }, { key: 'subject', label: 'Subject', type: 'text', ph: 'How can we help?' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                      <input type={f.type} placeholder={f.ph} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message</label>
                    <textarea rows={4} placeholder="Tell us more..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300 resize-none" />
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: .98 }} disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-purple-200 disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending...</> : 'Send Message →'}
                  </motion.button>
                </form>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo onClick={() => setPage('home')} />
          <p className="text-gray-400 text-sm">© 2026 StudyPilot by Coderift Studio.</p>
          <div className="flex gap-5">
            {[['Privacy', 'privacy'], ['Terms', 'terms']].map(([l, p]) => (
              <button key={l} onClick={() => setPage(p as Page)} className="text-gray-400 text-sm hover:text-purple-600">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRIVACY + TERMS PAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function LegalPage({ setPage, type }: { setPage: (p: Page) => void; type: 'privacy' | 'terms' }) {
  const isPrivacy = type === 'privacy'
  return (
    <div className="min-h-screen bg-white">
      <Navbar setPage={setPage} />
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <BackBtn onClick={() => setPage('home')} />
          <h1 className="text-4xl font-black text-gray-900 mb-2">{isPrivacy ? 'Privacy Policy' : 'Terms of Service'}</h1>
          <p className="text-gray-400 mb-10">Last updated: March 17, 2026</p>

          <div className="prose space-y-8">
            {isPrivacy ? (
              <>
                {[
                  { title: 'Information We Collect', content: 'We collect information you provide directly: name, email, university, and study data (subjects, tasks, study plans). We also collect usage data to improve the app.' },
                  { title: 'How We Use Your Information', content: 'We use your information to provide and improve StudyPilot, generate AI study plans, send important notifications, and personalize your experience.' },
                  { title: 'Data Storage', content: 'Your data is stored securely using Supabase infrastructure. All data is encrypted in transit and at rest. We never sell your personal data to third parties.' },
                  { title: 'Cookies', content: 'We use essential cookies to keep you logged in and remember your preferences. You can disable non-essential cookies at any time.' },
                  { title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal data at any time. Contact us at hello@studypilot.app to exercise these rights.' },
                  { title: 'Contact Us', content: 'For privacy concerns, contact us at hello@studypilot.app. We respond within 48 hours.' },
                ].map((section, i) => (
                  <div key={i}>
                    <h2 className="text-xl font-black text-gray-900 mb-3">{i + 1}. {section.title}</h2>
                    <p className="text-gray-500 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { title: 'Acceptance of Terms', content: 'By using StudyPilot, you agree to these Terms of Service. If you do not agree, please do not use our service.' },
                  { title: 'Use of Service', content: 'StudyPilot is intended for educational use by students. You must be 13 years or older to use this service. You are responsible for maintaining the security of your account.' },
                  { title: 'Free and Paid Plans', content: 'The free plan is available indefinitely with limited features. Pro plans are billed monthly or yearly. Prices are shown in USD and NGN. All payments are processed securely via Paystack.' },
                  { title: 'Cancellation', content: 'You can cancel your subscription at any time from account settings. You retain access until the end of your current billing period. We do not offer refunds for partial months.' },
                  { title: 'Intellectual Property', content: 'StudyPilot and all its content are owned by Coderift Studio. You may not copy, reproduce, or redistribute any part of the service without written permission.' },
                  { title: 'Limitation of Liability', content: 'StudyPilot is provided "as is". We make no guarantees about academic performance. We are not liable for any indirect, incidental, or consequential damages.' },
                  { title: 'Contact', content: 'Questions about these terms? Email us at hello@studypilot.app' },
                ].map((section, i) => (
                  <div key={i}>
                    <h2 className="text-xl font-black text-gray-900 mb-3">{i + 1}. {section.title}</h2>
                    <p className="text-gray-500 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="mt-12 p-6 bg-purple-50 border border-purple-100 rounded-2xl">
            <p className="text-gray-600 text-sm">Questions? Contact us at <a href="mailto:hello@studypilot.app" className="text-purple-600 font-semibold">hello@studypilot.app</a></p>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   404 PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function NotFound({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl mb-6">😕</motion.div>
        <h1 className="text-8xl font-black text-purple-600 mb-4">404</h1>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Page not found</h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">Looks like this page took a study break and never came back.</p>
        <div className="flex gap-3 justify-center">
          <Btn onClick={() => setPage('home')}>← Back to home</Btn>
          <Btn outline onClick={() => setPage('dashboard')}>Go to dashboard</Btn>
        </div>
      </motion.div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ROOT APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function App() {
  const [page, setPage] = useState<Page>('home')
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  return (
    <AnimatePresence mode="wait">
      <motion.div key={page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
        {page === 'home' && <Landing setPage={setPage} />}
        {page === 'login' && <Login setPage={setPage} />}
        {page === 'signup' && <Signup setPage={setPage} />}
        {page === 'dashboard' && <Dashboard setPage={setPage} />}
        {page === 'pricing' && <Pricing setPage={setPage} />}
        {page === 'about' && <About setPage={setPage} />}
        {page === 'contact' && <Contact setPage={setPage} />}
        {page === 'privacy' && <LegalPage setPage={setPage} type="privacy" />}
        {page === 'terms' && <LegalPage setPage={setPage} type="terms" />}
        {page === 'forgot' && <ForgotPassword setPage={setPage} />}
        {page === 'logout' && <LogoutPage setPage={setPage} />}
        {page === '404' && <NotFound setPage={setPage} />}
      </motion.div>
    </AnimatePresence>
  )
}