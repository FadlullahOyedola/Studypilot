-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STUDYPILOT DATABASE SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- HOW TO RUN:
-- 1. Go to supabase.com → your project
-- 2. Click SQL Editor in left sidebar
-- 3. Click New Query
-- 4. Paste this entire file
-- 5. Click Run
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  university TEXT DEFAULT '',
  course TEXT DEFAULT '',
  level TEXT DEFAULT '',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','pro')),
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_study_date DATE,
  currency TEXT DEFAULT 'ngn' CHECK (currency IN ('ngn','usd')),
  onboarded BOOLEAN DEFAULT false,
  dark_mode BOOLEAN DEFAULT false,
  notify_exams BOOLEAN DEFAULT true,
  notify_streak BOOLEAN DEFAULT true,
  notify_tips BOOLEAN DEFAULT true,
  notify_weekly BOOLEAN DEFAULT false,
  reminder_time TEXT DEFAULT '20:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#7c3aed',
  hours_studied NUMERIC DEFAULT 0,
  target_hours NUMERIC DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXAMS
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  exam_date DATE NOT NULL,
  readiness INTEGER DEFAULT 0 CHECK (readiness >= 0 AND readiness <= 100),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  done BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#7c3aed',
  deadline DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDY PLANS
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '7-Day Study Plan',
  subjects TEXT[] NOT NULL,
  hours_per_day NUMERIC NOT NULL,
  plan_data JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDY SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT DEFAULT 'pomodoro' CHECK (session_type IN ('pomodoro','regular')),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTES
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  color TEXT DEFAULT '#7c3aed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BADGES
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system' CHECK (type IN ('exam','streak','tip','system')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paystack_ref TEXT UNIQUE,
  paystack_subscription_code TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('monthly','yearly')),
  currency TEXT DEFAULT 'ngn' CHECK (currency IN ('ngn','usd')),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROW LEVEL SECURITY
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "Users can manage own subjects" ON subjects FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can manage own exams" ON exams FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can manage own plans" ON study_plans FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can manage own sessions" ON sessions FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can view own badges" ON badges FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Service can insert badges" ON badges FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Service can manage subscriptions" ON subscriptions FOR ALL WITH CHECK (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (auth_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
