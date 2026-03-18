'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPES & MOCK DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface Task { id:string; title:string; subject:string; done:boolean; color:string; priority:'high'|'medium'|'low' }
interface PlanDay { day:string; sessions:{ subject:string; time:string; color:string }[] }

const MOCK_TASKS: Task[] = [
  { id:'1', title:'Complete Calculus Chapter 5', subject:'Mathematics', done:false, color:'#7c3aed', priority:'high' },
  { id:'2', title:'Review Wave Motion Notes', subject:'Physics', done:true, color:'#db2777', priority:'medium' },
  { id:'3', title:'Practice Organic Reactions', subject:'Chemistry', done:false, color:'#6d28d9', priority:'high' },
  { id:'4', title:'Write Essay Draft', subject:'English', done:false, color:'#d97706', priority:'low' },
]

/* ✅ FIX 1 — Real Unsplash photos in TESTIMONIALS */
const TESTIMONIALS = [
  { name:'Chioma Okafor', role:'Medical Student, UNILAG', rating:5, text:'StudyPilot completely transformed how I prepare for exams. The AI timetable actually fits my real schedule and the readiness score keeps me accountable.', avatar:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80&fit=crop&crop=face' },
  { name:'Emeka Nwachukwu', role:'Engineering Student, OAU', rating:5, text:"I went from failing two courses to making Dean's List in one semester. The AI knows exactly how much time I need and adjusts when I fall behind.", avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&fit=crop&crop=face' },
  { name:'Fatima Al-Hassan', role:'Law Student, ABU', rating:5, text:'The analytics are incredible. I can see exactly where I spend study time and the AI gives weekly insights. Worth every single naira.', avatar:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80&fit=crop&crop=face' },
]

const FEATURES = [
  { icon:'🤖', title:'AI Study Generator', desc:'Get a fully personalized study timetable built by AI based on your subjects, deadlines, and available hours. Ready in seconds.' },
  { icon:'📅', title:'Your Study Calendar', desc:'View all your study sessions laid out in a clean weekly calendar. Never miss a session again.' },
  { icon:'⏱️', title:'Focus Study Timer', desc:'Pomodoro-based deep work sessions designed to maximize focus and minimize burnout.' },
  { icon:'📊', title:'Progress Analytics', desc:'Visual dashboards showing your study hours, completion rates, and exam readiness across all subjects.' },
]

const COLORS = ['#7c3aed','#db2777','#6d28d9','#d97706','#059669','#dc2626']

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ANIMATION HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const fadeUp = { hidden:{opacity:0,y:32}, show:{opacity:1,y:0,transition:{duration:.6,ease:[.22,1,.36,1]}} }
const stagger = (d=.1) => ({ hidden:{}, show:{ transition:{ staggerChildren:d } } })

function Reveal({ children, className='', delay=0 }: { children:React.ReactNode; className?:string; delay?:number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-60px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView?'show':'hidden'}
      variants={{ hidden:{opacity:0,y:30}, show:{opacity:1,y:0,transition:{duration:.65,delay,ease:[.22,1,.36,1]}} }}
      className={className}>
      {children}
    </motion.div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SHARED COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Btn({ children, onClick, outline=false, white=false, sm=false, className='', type='button', disabled=false }: any) {
  const base = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${sm?'px-4 py-2 text-sm':'px-6 py-3 text-sm'}`
  const variant = white
    ? 'bg-white text-purple-700 hover:bg-purple-50 shadow-lg'
    : outline
    ? 'border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-50'
    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
  return (
    <motion.button type={type} whileHover={{ scale:1.025,y:-1 }} whileTap={{ scale:.97 }}
      onClick={onClick} disabled={disabled} className={`${base} ${variant} ${className}`}>
      {children}
    </motion.button>
  )
}

function Stars({ n=5 }: { n?:number }) {
  return <div className="flex gap-0.5">{Array(n).fill(0).map((_,i) => <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</div>
}

function Logo({ onClick }: { onClick?:()=>void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-sm">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <span className="font-extrabold text-lg text-gray-900 tracking-tight">Study<span className="text-purple-600">Pilot</span></span>
    </button>
  )
}

/* ✅ FIX 5 — Back button component */
function BackBtn({ onClick, label='Back to home' }: { onClick:()=>void; label?:string }) {
  return (
    <motion.button whileHover={{ x:-3 }} whileTap={{ scale:.97 }} onClick={onClick}
      className="flex items-center gap-2 text-gray-400 hover:text-purple-600 text-sm font-medium mb-7 transition-colors group">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="group-hover:-translate-x-1 transition-transform duration-200">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      {label}
    </motion.button>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NAVBAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Navbar({ setPage }: { setPage:(p:string)=>void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <>
      <motion.nav initial={{ y:-56,opacity:0 }} animate={{ y:0,opacity:1 }} transition={{ duration:.5 }}
        className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 ${scrolled?'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100':'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Logo onClick={() => setPage('home')} />
          <div className="hidden md:flex items-center gap-7">
            {['Features','How it Works','Pricing'].map(l => (
              <button key={l} onClick={() => setPage(l==='Pricing'?'pricing':'home')}
                className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">{l}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setPage('login')} className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">Log in</button>
            <Btn sm onClick={() => setPage('signup')}>Get Started Free</Btn>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="space-y-1.5 w-5">
              <motion.span animate={{ rotate:open?45:0,y:open?7:0 }} className="block h-0.5 bg-gray-800 rounded-full" />
              <motion.span animate={{ opacity:open?0:1 }} className="block h-0.5 bg-gray-800 rounded-full" />
              <motion.span animate={{ rotate:open?-45:0,y:open?-7:0 }} className="block h-0.5 bg-gray-800 rounded-full" />
            </div>
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }}
            className="fixed top-16 inset-x-0 z-40 bg-white border-b border-gray-100 overflow-hidden md:hidden">
            <div className="p-5 space-y-3">
              {['Features','How it Works','Pricing'].map(l => (
                <button key={l} onClick={() => { setPage(l==='Pricing'?'pricing':'home'); setOpen(false) }}
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
function Landing({ setPage }: { setPage:(p:string)=>void }) {
  return (
    <div className="bg-white min-h-screen">

      {/* HERO */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-40 w-[600px] h-[600px] rounded-full bg-purple-50 blur-[120px]" />
          <div className="absolute top-40 -left-32 w-[400px] h-[400px] rounded-full bg-pink-50 blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <motion.div variants={stagger(.1)} initial="hidden" animate="show" className="max-w-xl">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                AI-Powered Study Planning
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-5xl lg:text-[56px] font-black text-gray-900 leading-[1.08] tracking-tight mb-5">
                Your AI-Powered<br /><span className="text-purple-600">Study Planner</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-gray-500 text-lg leading-relaxed mb-8">
                Plan smarter, study better. StudyPilot uses AI to create personalized study plans, track your progress, and help you ace every exam — automatically.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
                <Btn onClick={() => setPage('signup')} className="px-8 py-3.5 text-base">Get Started Free →</Btn>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
                  className="flex items-center gap-2 text-gray-500 font-semibold text-sm px-4 py-3.5 rounded-xl hover:text-purple-600 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#7c3aed"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  Watch Demo
                </motion.button>
              </motion.div>
              {/* ✅ FIX 1 — Real photos for hero avatars */}
              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&fit=crop&crop=face',
                  ].map((src,i) => (
                    <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
                  ))}
                </div>
                <div>
                  <Stars n={5} />
                  <p className="text-xs text-gray-400 mt-0.5"><strong className="text-gray-700">2,400+</strong> students already planning smarter</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — mockup */}
            <motion.div initial={{ opacity:0,y:40,scale:.96 }} animate={{ opacity:1,y:0,scale:1 }}
              transition={{ duration:.8,delay:.35,ease:[.22,1,.36,1] }} className="relative">
              <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:5,repeat:Infinity,ease:'easeInOut' }}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_24px_80px_rgba(0,0,0,.12)] overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div>
                    <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-gray-400 border border-gray-200 ml-2 truncate">studypilot.app/dashboard</div>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-purple-50/30 to-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-black text-gray-900">Good morning, Amaka! 👋</p>
                        <p className="text-[10px] text-gray-400">Let's crush today's goals</p>
                      </div>
                      <div className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">+ New Plan</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[['8','Tasks','#7c3aed'],['3.5h','Studied','#db2777'],['72%','Ready','#059669']].map(([v,l,c]) => (
                        <div key={l} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                          <p className="text-base font-black" style={{color:c as string}}>{v}</p>
                          <p className="text-[9px] text-gray-400 font-medium mt-0.5">{l}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100 mb-3">
                      <p className="text-[10px] font-bold text-gray-600 mb-2">Subject Progress</p>
                      {[['Mathematics',75,'#7c3aed'],['Physics',50,'#db2777'],['Chemistry',35,'#6d28d9']].map(([s,p,c]) => (
                        <div key={s as string} className="mb-2">
                          <div className="flex justify-between text-[9px] mb-1"><span className="text-gray-600">{s}</span><span className="text-gray-400">{p}%</span></div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width:0 }} animate={{ width:`${p}%` }} transition={{ duration:1,delay:.9 }}
                              className="h-full rounded-full" style={{background:c as string}} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      {MOCK_TASKS.slice(0,3).map(t => (
                        <div key={t.id} className="flex items-center gap-2 py-1.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.done?'bg-green-500 border-green-500':'border-gray-300'}`}>
                            {t.done && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                          </div>
                          <span className={`text-[9px] font-medium ${t.done?'line-through text-gray-400':'text-gray-700'}`}>{t.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity:0,scale:0,x:20 }} animate={{ opacity:1,scale:1,x:0 }} transition={{ delay:1,type:'spring',bounce:.4 }}
                className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <div><p className="text-xs font-bold text-gray-900">Exam Ready</p><p className="text-[10px] text-gray-400">Score: 78%</p></div>
              </motion.div>
              <motion.div initial={{ opacity:0,scale:0,x:-20 }} animate={{ opacity:1,scale:1,x:0 }} transition={{ delay:1.2,type:'spring',bounce:.4 }}
                className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">✅</div>
                <div><p className="text-xs font-bold text-gray-900">Plan Generated!</p><p className="text-[10px] text-gray-400">7-day timetable ready</p></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-bold text-purple-600 tracking-widest uppercase bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-5 mb-3 tracking-tight">Get Started in Three Simple Steps</h2>
            <p className="text-gray-400 max-w-md mx-auto">From sign-up to your first AI study plan in under 2 minutes.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[38%] right-[38%] h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
            {[
              { n:'01',icon:'📚',title:'Add Your Subjects',desc:'Enter your subjects, exam dates, and daily available hours. Done in 30 seconds.' },
              { n:'02',icon:'🤖',title:'AI Generates Plan',desc:'AI calculates your optimal timetable — weighted by urgency, difficulty, and time.' },
              { n:'03',icon:'🚀',title:'Track & Succeed',desc:'Follow your plan, check off tasks, and watch your exam readiness climb daily.' },
            ].map((step,i) => (
              <Reveal key={i} delay={i*.12}>
                <motion.div whileHover={{ y:-4,boxShadow:'0 12px 36px rgba(124,58,237,.1)' }}
                  className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm transition-all duration-300 group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
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
            <p className="text-gray-400 max-w-md mx-auto">All the tools you need to plan, focus, and track your way to academic success.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f,i) => (
              <Reveal key={i} delay={i*.08}>
                <motion.div whileHover={{ y:-4,boxShadow:'0 12px 36px rgba(124,58,237,.1)',borderColor:'#e9d5ff' }}
                  className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm cursor-default group transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW — DARK PURPLE */}
      <section className="py-20 px-6" style={{ background:'linear-gradient(135deg,#3b0764 0%,#7c3aed 55%,#9d174d 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-bold text-purple-200 tracking-widest uppercase bg-white/10 px-4 py-2 rounded-full border border-white/20">Dashboard</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-5 mb-3 tracking-tight">A Dashboard That Keeps You Organized</h2>
            <p className="text-purple-200 max-w-md mx-auto">Everything you need to manage your study life — in one beautiful workspace.</p>
          </Reveal>
          <Reveal delay={.2}>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-white/5 border-b border-white/15 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold text-white">SP</div>
                  <div><p className="text-white font-bold text-sm">Good morning, Amaka! 👋</p><p className="text-purple-200 text-xs">Here's your study overview for today</p></div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-purple-200 text-xs bg-white/10 px-3 py-1.5 rounded-lg">📅 March 17, 2026</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">AJ</div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[['📋','9 Days','Study Streak'],['⏱','14.5h','This Week'],['✅','23','Tasks Done'],['🎯','78%','Readiness']].map(([ic,v,l]) => (
                    <div key={l} className="bg-white/10 border border-white/15 rounded-xl p-4">
                      <div className="text-xl mb-2">{ic}</div>
                      <div className="text-white font-black text-xl leading-none mb-1">{v}</div>
                      <div className="text-purple-200 text-xs font-medium">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <p className="text-white font-bold text-sm mb-4">Your Plan This Week</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { day:'Monday',tasks:['Calculus — Ch.5','Physics review'],done:true },
                      { day:'Tuesday',tasks:['Organic Chemistry','Essay draft'],done:false },
                      { day:'Wednesday',tasks:['Biology reading','Math practice'],done:false },
                    ].map((item,i) => (
                      <div key={i} className={`rounded-xl p-4 border ${item.done?'bg-white/10 border-white/20':'bg-white/5 border-white/10'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done?'bg-green-400':'bg-white/20'}`}>
                            {item.done?<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>:<div className="w-2 h-2 rounded-full bg-white/50"/>}
                          </div>
                          <p className="text-white text-xs font-bold">{item.day}</p>
                        </div>
                        {item.tasks.map(t => <p key={t} className="text-purple-200 text-xs py-0.5">{t}</p>)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-bold text-purple-600 tracking-widest uppercase bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-5 mb-3 tracking-tight">Loved by Students Worldwide</h2>
            <p className="text-gray-400 max-w-md mx-auto">Real results from real students across Nigeria and beyond.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t,i) => (
              <Reveal key={i} delay={i*.1}>
                <motion.div whileHover={{ y:-5,boxShadow:'0 16px 48px rgba(124,58,237,.12)',borderColor:'#e9d5ff' }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm transition-all duration-300 flex flex-col h-full">
                  <Stars n={t.rating} />
                  <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-6 flex-1 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    {/* ✅ FIX 2 — Real photo in testimonials */}
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 flex-shrink-0" />
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

      {/* PRICING */}
      <section className="py-20 px-6 bg-gray-50/70">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-bold text-purple-600 tracking-widest uppercase bg-purple-50 border border-purple-100 px-4 py-2 rounded-full">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-5 mb-3 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 max-w-md mx-auto">Start free. Upgrade when you need more power. No hidden fees ever.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Reveal delay={.1}>
              <motion.div whileHover={{ y:-4 }} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm transition-all duration-300 h-full flex flex-col">
                <p className="text-gray-400 text-sm font-semibold mb-2">Student Plan</p>
                <div className="flex items-baseline gap-1 mb-1"><span className="font-black text-4xl text-gray-900">$0</span><span className="text-gray-400 text-sm">/month</span></div>
                <p className="text-xs text-gray-400 mb-6">Free forever. No credit card required.</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {['3 active subjects','Basic AI planning (3/month)','Focus timer','Task management','7-day study history'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></div>{f}
                    </li>
                  ))}
                </ul>
                <Btn outline onClick={() => setPage('signup')} className="w-full">Get Started Free</Btn>
              </motion.div>
            </Reveal>
            <Reveal delay={.2}>
              <motion.div whileHover={{ y:-4 }} className="relative h-full flex flex-col">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">Most Popular</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 shadow-xl flex-1 flex flex-col">
                  <p className="text-purple-200 text-sm font-semibold mb-2">Pro Plan</p>
                  <div className="flex items-baseline gap-1 mb-1"><span className="font-black text-4xl text-white">$8</span><span className="text-purple-200 text-sm">/month</span></div>
                  <p className="text-xs text-purple-300 mb-6">Everything you need to ace every exam.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {['Unlimited subjects','Full AI planning + insights','Exam readiness score','Advanced analytics','Smart reminders','Weekly AI report','Priority support'].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-purple-100">
                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></div>{f}
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
      <section className="py-20 px-6 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#1e0a3c 0%,#4c1d95 50%,#831843 100%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/20 blur-[80px] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">Ready to Transform Your<br />Study Routine?</h2>
            <p className="text-purple-200 text-lg mb-10">Join 2,400+ students already studying smarter with AI.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Btn white onClick={() => setPage('signup')} className="px-8 py-4 text-base">Get Started Free →</Btn>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }}
                className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-xl text-base transition-colors">
                View Live Demo
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
              <p className="text-gray-400 text-sm leading-relaxed mt-4 mb-5">AI-powered study planning for students who want real results.</p>
              <div className="flex gap-2">
                {['T','L','I','G'].map((s,i) => (
                  <motion.a key={i} href="#" whileHover={{ scale:1.1 }}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    {s}
                  </motion.a>
                ))}
              </div>
            </div>
            {[
              { title:'Product', links:['Features','How it Works','Pricing','Changelog'] },
              { title:'Students', links:['Study Tips','Blog','Community','Help Center'] },
              { title:'Legal', links:['Privacy','Terms','Cookies','Contact'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-bold text-gray-900 text-sm mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(l => <li key={l}><a href="#" className="text-gray-400 text-sm hover:text-purple-600 transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-gray-400 text-sm">© 2026 StudyPilot. All rights reserved.</p>
            <p className="text-gray-400 text-sm">Built for students, by builders 🚀</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LOGIN PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Login({ setPage }: { setPage:(p:string)=>void }) {
  const [f, setF] = useState({ email:'', password:'' })
  const [err, setErr] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e:Record<string,string> = {}
    if (!f.email) e.email='Email is required'
    else if (!/\S+@\S+\.\S+/.test(f.email)) e.email='Enter a valid email'
    if (!f.password) e.password='Password is required'
    else if (f.password.length < 6) e.password='Minimum 6 characters'
    setErr(e); return !Object.keys(e).length
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!validate()) return
    setLoading(true); await new Promise(r => setTimeout(r,1200)); setPage('dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity:0,y:28,scale:.97 }} animate={{ opacity:1,y:0,scale:1 }} transition={{ duration:.5,ease:[.22,1,.36,1] }}
        className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_24px_80px_rgba(124,58,237,.15)] border border-gray-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
        <div className="p-8 md:p-10">
          {/* ✅ FIX 5 — Back button */}
          <BackBtn onClick={() => setPage('home')} />
          <Logo onClick={() => setPage('home')} />
          <div className="mt-7 mb-7">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-gray-400 text-sm mt-1.5">Sign in to continue your study journey.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {[
              { key:'email', label:'Email Address', type:'email', ph:'you@email.com' },
              { key:'password', label:'Password', type:'password', ph:'Enter your password' },
            ].map(field => (
              <div key={field.key}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{field.label}</label>
                  {/* ✅ FIX 4 — Forgot password link */}
                  {field.key==='password' && (
                    <button type="button" onClick={() => setPage('forgot')}
                      className="text-xs text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <input type={field.type} placeholder={field.ph} value={(f as any)[field.key]}
                  onChange={e => setF({...f,[field.key]:e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-300 ${(err as any)[field.key]?'border-red-300 bg-red-50/50':'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100'}`} />
                {(err as any)[field.key] && <p className="text-red-500 text-xs mt-1">⚠ {(err as any)[field.key]}</p>}
              </div>
            ))}
            <motion.button type="submit" whileHover={{ scale:1.01 }} whileTap={{ scale:.98 }} disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
              {loading?<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>:'Sign In →'}
            </motion.button>
          </form>
          <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-gray-100"/><span className="text-gray-400 text-xs">or</span><div className="flex-1 h-px bg-gray-100"/></div>
          <div className="grid grid-cols-2 gap-3">
            {[['🌐','Google'],['💻','GitHub']].map(([ic,name]) => (
              <motion.button key={name} whileHover={{ scale:1.02,borderColor:'#c084fc' }} whileTap={{ scale:.98 }}
                className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all">
                {ic} {name}
              </motion.button>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-6">
            No account?{' '}
            <button onClick={() => setPage('signup')} className="text-purple-600 font-bold hover:text-purple-700 transition-colors">Create one free →</button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SIGNUP PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Signup({ setPage }: { setPage:(p:string)=>void }) {
  const [f, setF] = useState({ name:'', email:'', password:'', confirm:'' })
  const [err, setErr] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)
  const str = f.password.length===0?0:f.password.length<6?1:f.password.length<10?2:3

  function validate() {
    const e:Record<string,string> = {}
    if (!f.name.trim()) e.name='Full name is required'
    if (!f.email) e.email='Email is required'
    else if (!/\S+@\S+\.\S+/.test(f.email)) e.email='Enter a valid email'
    if (!f.password) e.password='Password is required'
    else if (f.password.length<8) e.password='Minimum 8 characters'
    if (f.password!==f.confirm) e.confirm='Passwords do not match'
    setErr(e); return !Object.keys(e).length
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!validate()) return
    setLoading(true); await new Promise(r => setTimeout(r,1400)); setPage('dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity:0,y:28,scale:.97 }} animate={{ opacity:1,y:0,scale:1 }} transition={{ duration:.5,ease:[.22,1,.36,1] }}
        className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_24px_80px_rgba(124,58,237,.15)] border border-gray-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
        <div className="p-8 md:p-10">
          {/* ✅ FIX 5 — Back button */}
          <BackBtn onClick={() => setPage('home')} />
          <Logo onClick={() => setPage('home')} />
          <div className="mt-7 mb-7">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1.5">Start your AI study journey free — no card needed.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {[
              { key:'name', label:'Full Name', type:'text', ph:'Amaka Johnson' },
              { key:'email', label:'Email Address', type:'email', ph:'you@email.com' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{field.label}</label>
                <input type={field.type} placeholder={field.ph} value={(f as any)[field.key]}
                  onChange={e => setF({...f,[field.key]:e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-300 ${(err as any)[field.key]?'border-red-300 bg-red-50/50':'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100'}`} />
                {(err as any)[field.key] && <p className="text-red-500 text-xs mt-1">⚠ {(err as any)[field.key]}</p>}
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" placeholder="Create a strong password" value={f.password}
                onChange={e => setF({...f,password:e.target.value})}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-300 ${err.password?'border-red-300 bg-red-50/50':'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100'}`} />
              {f.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i<=str?(str===1?'bg-red-400':str===2?'bg-amber-400':'bg-green-500'):'bg-gray-200'}`}/>)}
                  </div>
                  <p className={`text-xs ${str===1?'text-red-400':str===2?'text-amber-400':'text-green-500'}`}>{['','Weak','Good','Strong'][str]} password</p>
                </div>
              )}
              {err.password && <p className="text-red-500 text-xs mt-1">⚠ {err.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input type="password" placeholder="Repeat your password" value={f.confirm}
                onChange={e => setF({...f,confirm:e.target.value})}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-300 ${err.confirm?'border-red-300 bg-red-50/50':'border-gray-200 bg-gray-50 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100'}`} />
              {err.confirm && <p className="text-red-500 text-xs mt-1">⚠ {err.confirm}</p>}
            </div>
            <motion.button type="submit" whileHover={{ scale:1.01 }} whileTap={{ scale:.98 }} disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
              {loading?<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account...</>:'Create Account →'}
            </motion.button>
          </form>
          <p className="text-center text-gray-300 text-xs mt-4">By signing up you agree to our <a href="#" className="text-purple-600">Terms</a> & <a href="#" className="text-purple-600">Privacy</a></p>
          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{' '}
            <button onClick={() => setPage('login')} className="text-purple-600 font-bold hover:text-purple-700">Sign in →</button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ FIX 4 — FORGOT PASSWORD PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ForgotPassword({ setPage }: { setPage:(p:string)=>void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r,1400))
    setLoading(false); setSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity:0,y:28,scale:.97 }} animate={{ opacity:1,y:0,scale:1 }} transition={{ duration:.5,ease:[.22,1,.36,1] }}
        className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_24px_80px_rgba(124,58,237,.15)] border border-gray-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
        <div className="p-8 md:p-10">
          <BackBtn onClick={() => setPage('login')} label="Back to login" />
          {!sent ? (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-5">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forgot password?</h1>
                <p className="text-gray-400 text-sm mt-1.5">No worries. Enter your email and we'll send you a reset link.</p>
              </div>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm">⚠ {error}</div>}
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" placeholder="you@email.com" value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300" />
                </div>
                <motion.button type="submit" whileHover={{ scale:1.01 }} whileTap={{ scale:.98 }} disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading?<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending...</>:'Send Reset Link →'}
                </motion.button>
              </form>
              <p className="text-center text-gray-400 text-sm mt-6">
                Remember your password?{' '}
                <button onClick={() => setPage('login')} className="text-purple-600 font-bold hover:text-purple-700">Sign in →</button>
              </p>
            </>
          ) : (
            <motion.div initial={{ opacity:0,scale:.95 }} animate={{ opacity:1,scale:1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Check your inbox!</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">We sent a reset link to<br/><strong className="text-gray-700">{email}</strong></p>
              <p className="text-gray-400 text-xs mb-6">Didn't get it? Check your spam or try again.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setSent(false)} className="text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors">Try a different email</button>
                <button onClick={() => setPage('login')} className="text-gray-400 text-sm hover:text-gray-600 transition-colors">Back to login</button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ FIX 3 — LOGOUT PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function LogoutPage({ setPage }: { setPage:(p:string)=>void }) {
  useEffect(() => {
    const t = setTimeout(() => setPage('home'), 2500)
    return () => clearTimeout(t)
  }, [setPage])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity:0,y:24,scale:.97 }} animate={{ opacity:1,y:0,scale:1 }} transition={{ duration:.5,ease:[.22,1,.36,1] }}
        className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">You've been logged out</h1>
        <p className="text-gray-400 mb-6">Redirecting you to the home page...</p>
        <div className="flex justify-center gap-1.5 mb-8">
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay:`${i*.15}s` }}/>)}
        </div>
        <button onClick={() => setPage('home')} className="text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors">Go home now →</button>
      </motion.div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Dashboard({ setPage }: { setPage:(p:string)=>void }) {
  const [tab, setTab] = useState<'overview'|'planner'|'tasks'|'analytics'>('overview')
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [mobSidebar, setMobSidebar] = useState(false)
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false),900); return () => clearTimeout(t) }, [])

  const nav = [
    { id:'overview', icon:'⊞', label:'Overview' },
    { id:'planner',  icon:'🗓', label:'Study Planner' },
    { id:'tasks',    icon:'✓', label:'Tasks' },
    { id:'analytics',icon:'📊', label:'Analytics' },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-60">
      <div className="p-5 border-b border-gray-50"><Logo onClick={() => setPage('home')} /></div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => (
          <button key={item.id} onClick={() => { setTab(item.id as any); setMobSidebar(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab===item.id?'bg-purple-50 text-purple-700 border border-purple-100':'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <span>{item.icon}</span>
            {item.label}
            {tab===item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600"/>}
          </button>
        ))}
      </nav>
      {/* ✅ FIX 3 — Logout button in sidebar */}
      <div className="p-4 border-t border-gray-50">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors mb-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AJ</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Amaka Johnson</p>
            <p className="text-xs text-purple-500 font-medium">✨ Pro Plan</p>
          </div>
        </div>
        <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:.97 }}
          onClick={() => setPage('logout')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 hover:text-red-500 transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </motion.button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:flex h-full"><SidebarContent /></div>
      <AnimatePresence>
        {mobSidebar && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setMobSidebar(false)} className="lg:hidden fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"/>
            <motion.div initial={{ x:-260 }} animate={{ x:0 }} exit={{ x:-260 }} transition={{ type:'spring',damping:24 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 shadow-2xl">
              <SidebarContent/>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobSidebar(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">☰</button>
            <div>
              <h1 className="font-black text-gray-900 text-lg tracking-tight">{nav.find(n => n.id===tab)?.label}</h1>
              <p className="text-gray-400 text-xs mt-0.5">Tuesday, March 17, 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
              🔔<span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 border-2 border-white"/>
            </button>
            <Btn onClick={() => setTab('planner')} sm>+ New Plan</Btn>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-14 }} transition={{ duration:.28 }}>
              {tab==='overview'  && <OverviewTab tasks={tasks} setTasks={setTasks} setTab={setTab} loading={loading}/>}
              {tab==='planner'   && <PlannerTab/>}
              {tab==='tasks'     && <TasksTab tasks={tasks} setTasks={setTasks}/>}
              {tab==='analytics' && <AnalyticsTab/>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ── OVERVIEW TAB ── */
function OverviewTab({ tasks, setTasks, setTab, loading }: any) {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_,i) => <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-28 animate-pulse bg-gray-50"/>)
        ) : (
          [
            { label:'Tasks Today',    value:'8',      sub:'3 completed',      icon:'📋', color:'text-purple-600', bg:'bg-purple-50',  border:'border-purple-100' },
            { label:'Hours Studied',  value:'3.5h',   sub:'This week: 14h',   icon:'⏱', color:'text-pink-500',   bg:'bg-pink-50',    border:'border-pink-100'   },
            { label:'Study Streak',   value:'9 days', sub:'Personal best 🔥', icon:'🔥', color:'text-orange-500', bg:'bg-orange-50',  border:'border-orange-100' },
            { label:'Exam Readiness', value:'72%',    sub:'Mathematics next', icon:'🎯', color:'text-green-600',  bg:'bg-green-50',   border:'border-green-100'  },
          ].map((s,i) => (
            <motion.div key={i} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0,transition:{ delay:i*.07 } }}
              className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm hover:shadow-md transition-all`}>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
              <p className={`font-black text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs font-medium mt-0.5">{s.label}</p>
              <p className="text-gray-300 text-xs mt-0.5">{s.sub}</p>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div><h3 className="font-bold text-gray-900">Study Hours This Week</h3><p className="text-gray-400 text-xs mt-0.5">Daily breakdown</p></div>
            <span className="text-xs bg-purple-50 text-purple-600 font-bold px-3 py-1.5 rounded-full border border-purple-100">22h total</span>
          </div>
          {loading ? <div className="h-36 bg-gray-50 rounded-xl animate-pulse"/> : (
            <div className="flex items-end gap-2 h-36">
              {[['M',60],['T',40],['W',85],['T',30],['F',100],['S',65],['S',50]].map(([d,h],i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div initial={{ height:0 }} animate={{ height:`${h}%` }} transition={{ duration:.65,delay:i*.07,ease:'easeOut' }}
                    className="w-full rounded-t-lg" style={{ background:i===4?'linear-gradient(to top,#7c3aed,#db2777)':'#f3e8ff' }}/>
                  <span className="text-[10px] text-gray-400 font-medium">{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Upcoming Exams</h3>
          <div className="space-y-4">
            {[
              { s:'Mathematics', days:8,  pct:72, c:'#7c3aed' },
              { s:'Physics',     days:11, pct:55, c:'#db2777' },
              { s:'Chemistry',   days:16, pct:40, c:'#6d28d9' },
            ].map((e,i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5"><span className="font-semibold text-gray-700">{e.s}</span><span className="text-gray-400">{e.days}d left</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${e.pct}%` }} transition={{ duration:.8,delay:i*.15 }}
                    className="h-full rounded-full" style={{ background:e.c }}/>
                </div>
                <p className="text-right text-xs font-black mt-0.5" style={{ color:e.c }}>{e.pct}%</p>
              </div>
            ))}
            <Btn onClick={() => setTab('planner')} outline sm className="w-full mt-1">Generate Plan →</Btn>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Today's Tasks</h3>
            <button onClick={() => setTab('tasks')} className="text-xs text-purple-600 font-bold hover:text-purple-700">View all →</button>
          </div>
          {loading ? <div className="space-y-3">{Array(4).fill(0).map((_,i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse"/>)}</div> : (
            <div className="space-y-3">
              {tasks.map((task: Task, i: number) => (
                <motion.div key={task.id} layout className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-colors">
                  <button onClick={() => setTasks((p: Task[]) => p.map((t: Task) => t.id===task.id?{...t,done:!t.done}:t))}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.done?'bg-green-500 border-green-500':'border-gray-300 hover:border-purple-400'}`}>
                    {task.done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                  </button>
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background:task.color }}/>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${task.done?'line-through text-gray-400':'text-gray-900'}`}>{task.title}</p>
                    <p className="text-xs text-gray-400">{task.subject}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${task.priority==='high'?'bg-red-50 text-red-500':task.priority==='medium'?'bg-amber-50 text-amber-500':'bg-green-50 text-green-600'}`}>
                    {task.priority}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Subject Progress</h3>
          <div className="space-y-4">
            {[['Mathematics',12,20,'#7c3aed'],['Physics',8,15,'#db2777'],['Chemistry',6,18,'#6d28d9'],['English',4,10,'#d97706'],['Biology',9,14,'#059669']].map(([name,done,total,color],i) => {
              const pct = Math.round((Number(done)/Number(total))*100)
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background:color as string }}/><span className="font-medium text-gray-700">{name}</span></div>
                    <span className="text-gray-400">{done}h / {total}h</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:.8,delay:i*.1 }}
                      className="h-full rounded-full" style={{ background:color as string }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── PLANNER TAB ── */
function PlannerTab() {
  const [subjects, setSubjects] = useState([''])
  const [hours, setHours] = useState('3')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<PlanDay[]|null>(null)

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    const valid = subjects.filter(s => s.trim())
    if (!valid.length) return
    setLoading(true); setPlan(null)
    await new Promise(r => setTimeout(r,1800))
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    setPlan(days.map(day => ({
      day,
      sessions: valid.slice(0,2).map((s,i) => ({ subject:s, time:`${8+i*2}:00 — ${10+i*2}:00`, color:COLORS[i%COLORS.length] }))
    })))
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-black text-gray-900 text-xl tracking-tight mb-1">🤖 AI Study Planner</h2>
        <p className="text-gray-400 text-sm mb-6">Enter your subjects and available hours — get a personalized 7-day plan instantly.</p>
        <form onSubmit={generate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Subjects</label>
            <div className="space-y-2">
              {subjects.map((s,i) => (
                <div key={i} className="flex gap-2">
                  <input value={s} placeholder={`Subject ${i+1} e.g. Mathematics`} onChange={e => setSubjects(p => p.map((x,idx) => idx===i?e.target.value:x))}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"/>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${COLORS[i%COLORS.length]}15` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background:COLORS[i%COLORS.length] }}/>
                  </div>
                  {subjects.length>1 && (
                    <button type="button" onClick={() => setSubjects(p => p.filter((_,idx) => idx!==i))}
                      className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center text-sm transition-colors">✕</button>
                  )}
                </div>
              ))}
              {subjects.length<8 && (
                <button type="button" onClick={() => setSubjects(p => [...p,''])}
                  className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-purple-300 hover:text-purple-500 transition-all">
                  + Add subject
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hours Available Per Day</label>
            <input type="number" min="1" max="12" step="0.5" value={hours} onChange={e => setHours(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"/>
          </div>
          <Btn type="submit" className="w-full py-3.5 text-base" disabled={loading}>
            {loading
              ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>AI is building your plan...</span>
              : '🤖 Generate My Study Plan'}
          </Btn>
        </form>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="bg-white rounded-2xl p-12 border border-purple-100 shadow-sm flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-3xl animate-pulse">🤖</div>
            <div><p className="font-bold text-gray-900 text-lg">AI is thinking...</p><p className="text-gray-400 text-sm mt-1">Building your personalized 7-day timetable</p></div>
            <div className="flex gap-1.5">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay:`${i*.15}s` }}/>)}</div>
          </motion.div>
        )}
        {plan && !loading && (
          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} className="space-y-3">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
              <div><h3 className="font-bold text-gray-900">✨ Your 7-Day Plan is Ready!</h3><p className="text-gray-400 text-sm mt-0.5">Personalized AI timetable generated</p></div>
              <div className="flex gap-2"><Btn sm>Save Plan</Btn><Btn outline sm onClick={() => setPlan(null)}>Regenerate</Btn></div>
            </div>
            {plan.map((day,i) => (
              <motion.div key={day.day} initial={{ opacity:0,x:16 }} animate={{ opacity:1,x:0,transition:{ delay:i*.05 } }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{day.day}</h4>
                  <span className="text-xs bg-purple-50 text-purple-600 font-semibold px-2.5 py-1 rounded-full border border-purple-100">{day.sessions.length} sessions</span>
                </div>
                <div className="space-y-2">
                  {day.sessions.map((s,j) => (
                    <div key={j} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background:`${s.color}10`,border:`1px solid ${s.color}25` }}>
                      <div className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ background:s.color }}/>
                      <div><p className="text-sm font-semibold text-gray-900">{s.subject}</p><p className="text-xs text-gray-400">{s.time}</p></div>
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

/* ── TASKS TAB ── */
function TasksTab({ tasks, setTasks }: { tasks:Task[]; setTasks:React.Dispatch<React.SetStateAction<Task[]>> }) {
  const [filter, setFilter] = useState<'all'|'pending'|'done'>('all')
  const [showForm, setShowForm] = useState(false)
  const [nt, setNt] = useState({ title:'', subject:'', priority:'medium' as Task['priority'] })

  const filtered = tasks.filter(t => filter==='all'?true:filter==='pending'?!t.done:t.done)

  function add(e: React.FormEvent) {
    e.preventDefault()
    if (!nt.title.trim()) return
    setTasks(p => [...p, { id:Date.now().toString(), ...nt, done:false, color:COLORS[p.length%COLORS.length] }])
    setNt({ title:'', subject:'', priority:'medium' }); setShowForm(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-gray-900 text-xl tracking-tight">Tasks</h2>
          <p className="text-gray-400 text-sm">{tasks.filter(t=>!t.done).length} pending · {tasks.filter(t=>t.done).length} done</p>
        </div>
        <Btn sm onClick={() => setShowForm(!showForm)}>{showForm?'✕ Cancel':'+ Add Task'}</Btn>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }} className="overflow-hidden">
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <form onSubmit={add} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Task Title</label>
                    <input value={nt.title} placeholder="e.g. Complete Chapter 5" onChange={e => setNt({...nt,title:e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 transition-all"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                    <input value={nt.subject} placeholder="e.g. Mathematics" onChange={e => setNt({...nt,subject:e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 transition-all"/>
                  </div>
                </div>
                <div className="flex gap-3"><Btn type="submit" sm>Add Task</Btn><Btn outline sm onClick={() => setShowForm(false)}>Cancel</Btn></div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        {(['all','pending','done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter===f?'bg-purple-50 text-purple-700 border border-purple-100':'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length===0 ? (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-16">
              <div className="text-5xl mb-3">✅</div>
              <p className="font-bold text-gray-900">All caught up!</p>
              <p className="text-gray-400 text-sm mt-1">No {filter==='done'?'completed':'pending'} tasks here.</p>
            </motion.div>
          ) : filtered.map((task,i) => (
            <motion.div key={task.id} layout initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0,transition:{ delay:i*.04 } }} exit={{ opacity:0,x:-20 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <button onClick={() => setTasks(p => p.map(t => t.id===task.id?{...t,done:!t.done}:t))}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.done?'bg-green-500 border-green-500':'border-gray-300 hover:border-purple-400'}`}>
                {task.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
              </button>
              <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background:task.color }}/>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${task.done?'line-through text-gray-400':'text-gray-900'}`}>{task.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{task.subject}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${task.priority==='high'?'bg-red-50 text-red-500':task.priority==='medium'?'bg-amber-50 text-amber-500':'bg-green-50 text-green-600'}`}>
                {task.priority}
              </span>
              <button onClick={() => setTasks(p => p.filter(t => t.id!==task.id))}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── ANALYTICS TAB ── */
function AnalyticsTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div><h2 className="font-black text-gray-900 text-xl tracking-tight">Analytics</h2><p className="text-gray-400 text-sm mt-0.5">Your study performance at a glance.</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[['89h','Total Hours','#7c3aed'],['12 days','Study Streak','#db2777'],['3.2h','Avg Daily','#059669'],['47','Tasks Done','#d97706']].map(([v,l,c],i) => (
          <motion.div key={i} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0,transition:{ delay:i*.07 } }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center" style={{ background:`${c}18` }}>
              <div className="w-3 h-3 rounded-full" style={{ background:c as string }}/>
            </div>
            <p className="font-black text-2xl mb-0.5" style={{ color:c as string }}>{v}</p>
            <p className="text-gray-400 text-xs font-medium">{l}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div><h3 className="font-bold text-gray-900">Study Hours — Past 6 Weeks</h3><p className="text-gray-400 text-xs mt-0.5">Weekly totals</p></div>
          <span className="text-xs bg-purple-50 text-purple-600 font-bold px-3 py-1.5 rounded-full border border-purple-100">↑ 31% this week</span>
        </div>
        <div className="flex items-end gap-3 h-36">
          {[[14,'W1'],[18,'W2'],[12,'W3'],[22,'W4'],[19,'W5'],[25,'W6']].map(([h,label],i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div initial={{ height:0 }} animate={{ height:`${(Number(h)/25)*100}%` }} transition={{ duration:.65,delay:i*.1,ease:'easeOut' }}
                className="w-full rounded-t-xl" style={{ background:i===5?'linear-gradient(to top,#7c3aed,#db2777)':'#f3e8ff' }}/>
              <span className="text-xs text-gray-400 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-5">Exam Readiness Tracker</h3>
        <div className="space-y-5">
          {[
            { s:'Mathematics', pct:72, days:8,  c:'#7c3aed', msg:'📚 On track — keep going!' },
            { s:'Physics',     pct:55, days:11, c:'#db2777', msg:'📚 Getting there, push harder' },
            { s:'Chemistry',   pct:40, days:16, c:'#6d28d9', msg:'⚠️ Needs more study time' },
          ].map((exam,i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">{exam.s}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{exam.days}d left</span>
                </div>
                <span className="text-sm font-black" style={{ color:exam.c }}>{exam.pct}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width:0 }} animate={{ width:`${exam.pct}%` }} transition={{ duration:.9,delay:i*.15 }}
                  className="h-full rounded-full" style={{ background:exam.c }}/>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{exam.msg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRICING PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Pricing({ setPage }: { setPage:(p:string)=>void }) {
  const [yearly, setYearly] = useState(false)
  const [openFaq, setOpenFaq] = useState<number|null>(null)

  const faqs = [
    { q:'Can I cancel anytime?', a:'Yes! No contracts. Cancel from your account settings and keep access until your billing period ends.' },
    { q:'Is the free plan really free forever?', a:'Yes — free forever with no credit card required. Includes 3 subjects and 3 AI plans per month.' },
    { q:'How does the AI generate my plan?', a:'You enter your subjects, exam dates, and available hours. The AI builds an optimal day-by-day timetable in seconds.' },
    { q:'Do you support Paystack?', a:'Yes! Paystack is fully supported — card, bank transfer, and USSD. All prices shown in your local currency.' },
    { q:"What's the 7-day free trial?", a:'Sign up for Pro and get full access free for 7 days. No charge until the trial ends. Cancel anytime before.' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar setPage={setPage} />

      <section className="pt-28 pb-16 px-6 text-center bg-gradient-to-b from-purple-50/40 to-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-100/40 blur-[100px] pointer-events-none"/>
        <motion.div initial="hidden" animate="show" variants={stagger(.1)} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-600 text-xs font-bold px-4 py-2 rounded-full mb-6">Pricing</motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Simple, Transparent Pricing</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-10 max-w-md mx-auto">Start free. No hidden fees. Upgrade only when you need more.</motion.p>
          <motion.div variants={fadeUp} className="inline-flex bg-gray-100 rounded-full p-1.5 gap-1">
            <button onClick={() => setYearly(false)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!yearly?'bg-white shadow text-purple-600':'text-gray-400 hover:text-gray-600'}`}>Monthly</button>
            <button onClick={() => setYearly(true)}  className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${yearly?'bg-white shadow text-purple-600':'text-gray-400 hover:text-gray-600'}`}>
              Yearly <span className="text-green-500 text-xs font-black">Save 30%</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal delay={.1}>
            <motion.div whileHover={{ y:-4 }} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm h-full flex flex-col transition-all">
              <p className="text-gray-400 text-sm font-semibold mb-3">Student Plan</p>
              <div className="flex items-baseline gap-1 mb-1"><span className="font-black text-4xl text-gray-900">$0</span><span className="text-gray-400 text-sm">/mo</span></div>
              <p className="text-xs text-gray-400 mb-6">Free forever. No credit card.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['3 active subjects','Basic AI planning (3/month)','Focus timer','Task management','7-day history'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></div>{f}
                  </li>
                ))}
                {['Advanced analytics','Exam readiness score','Smart reminders'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><span className="text-gray-300 text-xs">✕</span></div>{f}
                  </li>
                ))}
              </ul>
              <Btn outline onClick={() => setPage('signup')} className="w-full">Get Started Free</Btn>
            </motion.div>
          </Reveal>

          <Reveal delay={.18}>
            <motion.div whileHover={{ y:-4 }} className="relative h-full flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-sm">Most Popular</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 shadow-xl flex-1 flex flex-col">
                <p className="text-purple-200 text-sm font-semibold mb-3">Pro Plan</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-black text-4xl text-white">${yearly?'5':'8'}</span>
                  <span className="text-purple-200 text-sm">/month</span>
                </div>
                <p className="text-xs text-purple-300 mb-6">{yearly?'Billed yearly — save $36/year':'Billed monthly'}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Unlimited subjects','Full AI planning + insights','Exam readiness score','Advanced analytics','Smart reminders','Weekly AI study report','Priority support'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-purple-100">
                      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></div>{f}
                    </li>
                  ))}
                </ul>
                <Btn white onClick={() => setPage('signup')} className="w-full">Start 7-Day Free Trial →</Btn>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Frequently Asked Questions</h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((faq,i) => (
              <Reveal key={i} delay={i*.06}>
                <button onClick={() => setOpenFaq(openFaq===i?null:i)}
                  className="w-full text-left bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:border-purple-100 hover:shadow-md transition-all">
                  <div className="flex justify-between items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">{faq.q}</span>
                    <motion.span animate={{ rotate:openFaq===i?45:0 }} className="text-purple-500 font-black text-xl leading-none flex-shrink-0">+</motion.span>
                  </div>
                  <AnimatePresence>
                    {openFaq===i && (
                      <motion.p initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }}
                        className="text-gray-400 text-sm mt-3 leading-relaxed overflow-hidden">
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 px-6">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-12 shadow-sm">
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Still have questions?</h2>
            <p className="text-gray-400 mb-7">Our team is happy to help you find the right plan.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Btn onClick={() => setPage('signup')}>Start Free →</Btn>
              <a href="mailto:hello@studypilot.app"><Btn outline>Contact Support</Btn></a>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo onClick={() => setPage('home')} />
          <p className="text-gray-400 text-sm">© 2026 StudyPilot. All rights reserved.</p>
          <div className="flex gap-5">
            {['Privacy','Terms','Contact'].map(l => <a key={l} href="#" className="text-gray-400 text-sm hover:text-purple-600 transition-colors">{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ROOT APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function App() {
  const [page, setPage] = useState('home')
  useEffect(() => { window.scrollTo({ top:0, behavior:'smooth' }) }, [page])

  return (
    <AnimatePresence mode="wait">
      <motion.div key={page} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:.22 }}>
        {page==='home'      && <><Navbar setPage={setPage}/><Landing setPage={setPage}/></>}
        {page==='login'     && <Login setPage={setPage}/>}
        {page==='signup'    && <Signup setPage={setPage}/>}
        {page==='dashboard' && <Dashboard setPage={setPage}/>}
        {page==='pricing'   && <Pricing setPage={setPage}/>}
        {page==='logout'    && <LogoutPage setPage={setPage}/>}
        {page==='forgot'    && <ForgotPassword setPage={setPage}/>}
      </motion.div>
    </AnimatePresence>
  )
}