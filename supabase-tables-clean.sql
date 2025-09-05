-- Student Portal - Supabase Database Schema (Clean Version)
-- This file contains all the SQL table definitions for the Student Portal application
-- This version handles existing policies and tables gracefully

-- Enable Row Level Security (RLS) for all tables
-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- AUTHENTICATION & USER MANAGEMENT TABLES
-- ========================================

-- Note: Supabase automatically creates auth.users table, but we extend it with custom tables

-- ========================================
-- 1. USER_ROLES TABLE
-- ========================================
-- Defines different user roles in the system
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE CHECK (role_name IN ('student', 'admin', 'instructor', 'staff')),
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. USER_ROLE_ASSIGNMENTS TABLE
-- ========================================
-- Links users to their roles
CREATE TABLE IF NOT EXISTS public.user_role_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.user_roles(id),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- ========================================
-- 3. USER_SESSIONS TABLE
-- ========================================
-- Track user login sessions for security and analytics
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    device_info JSONB,
    location_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. PASSWORD_RESET_REQUESTS TABLE
-- ========================================
-- Track password reset requests
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    reset_token TEXT NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. ADMIN_USERS TABLE
-- ========================================
-- Additional information for admin users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    admin_level TEXT DEFAULT 'basic' CHECK (admin_level IN ('basic', 'advanced', 'super')),
    department_access TEXT[] DEFAULT '{}',
    can_modify_users BOOLEAN DEFAULT false,
    can_modify_courses BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. INSTRUCTOR_USERS TABLE
-- ========================================
-- Additional information for instructor users
CREATE TABLE IF NOT EXISTS public.instructor_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    employee_id TEXT UNIQUE,
    department_id UUID REFERENCES public.departments(id),
    specialization TEXT,
    qualification TEXT,
    experience_years INTEGER DEFAULT 0,
    office_location TEXT,
    office_hours TEXT,
    contact_number TEXT,
    is_active BOOLEAN DEFAULT true,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. AUDIT_LOG TABLE
-- ========================================
-- Track all important actions in the system
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- ========================================
-- 8. PROFILES TABLE (Enhanced)
-- ========================================
-- Stores student profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    student_id TEXT UNIQUE,
    department TEXT,
    semester TEXT,
    phone TEXT,
    date_of_birth DATE,
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 9. DEPARTMENTS TABLE
-- ========================================
-- Stores department information
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    head_of_department TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 10. COURSES TABLE
-- ========================================
-- Stores course information
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_code TEXT NOT NULL UNIQUE,
    course_name TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    credits INTEGER NOT NULL DEFAULT 3,
    semester INTEGER NOT NULL,
    description TEXT,
    prerequisites TEXT[],
    instructor_name TEXT,
    instructor_email TEXT,
    max_capacity INTEGER DEFAULT 50,
    current_enrollment INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 11. COURSE_ENROLLMENTS TABLE
-- ========================================
-- Stores student course enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'completed', 'failed')),
    grade TEXT CHECK (grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W')),
    gpa_points DECIMAL(3,2),
    attendance_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- ========================================
-- 12. SEMESTERS TABLE
-- ========================================
-- Stores semester information
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    semester_name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    registration_start_date DATE,
    registration_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 13. SEMESTER_RESULTS TABLE
-- ========================================
-- Stores semester-wise results for students
CREATE TABLE IF NOT EXISTS public.semester_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES public.semesters(id),
    total_credits INTEGER NOT NULL DEFAULT 0,
    total_gpa_points DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    semester_gpa DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    cumulative_gpa DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    total_courses INTEGER NOT NULL DEFAULT 0,
    passed_courses INTEGER NOT NULL DEFAULT 0,
    failed_courses INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'probation', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, semester_id)
);

-- ========================================
-- 14. ASSIGNMENTS TABLE
-- ========================================
-- Stores assignment information
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    max_marks INTEGER NOT NULL DEFAULT 100,
    assignment_type TEXT DEFAULT 'assignment' CHECK (assignment_type IN ('assignment', 'quiz', 'exam', 'project', 'presentation')),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 15. ASSIGNMENT_SUBMISSIONS TABLE
-- ========================================
-- Stores student assignment submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    marks_obtained INTEGER,
    feedback TEXT,
    graded_by TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'late')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- ========================================
-- 16. ATTENDANCE TABLE
-- ========================================
-- Stores student attendance records
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    remarks TEXT,
    marked_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id, attendance_date)
);

-- ========================================
-- 17. FEES TABLE
-- ========================================
-- Stores fee structure information
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES public.semesters(id),
    fee_type TEXT NOT NULL CHECK (fee_type IN ('tuition', 'lab', 'library', 'sports', 'examination', 'miscellaneous')),
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_date DATE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'online', 'cheque')),
    transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue')),
    late_fee DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 18. FORMS TABLE
-- ========================================
-- Stores downloadable forms information
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_name TEXT NOT NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('fee_challan', 'scholarship', 'course_change', 'transcript', 'certificate', 'other')),
    description TEXT,
    file_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    required_for_semester INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 19. FORM_REQUESTS TABLE
-- ========================================
-- Stores student form requests
CREATE TABLE IF NOT EXISTS public.form_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    form_id UUID REFERENCES public.forms(id),
    request_type TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by TEXT,
    admin_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 20. NOTIFICATIONS TABLE
-- ========================================
-- Stores notifications for students
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'academic', 'fee', 'exam', 'assignment', 'system')),
    is_read BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 21. CONTACT_MESSAGES TABLE
-- ========================================
-- Stores contact messages from students to admin
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'academic', 'technical', 'fee', 'complaint', 'suggestion')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    admin_response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 22. USER_SETTINGS TABLE
-- ========================================
-- Stores user preferences and settings
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- DROP EXISTING POLICIES (IF ANY)
-- ========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view available roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role assignments" ON public.user_role_assignments;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all admin data" ON public.admin_users;
DROP POLICY IF EXISTS "Instructors can view own data" ON public.instructor_users;
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can view own results" ON public.semester_results;
DROP POLICY IF EXISTS "Students can view own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Students can insert own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Students can update own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Students can view own fees" ON public.fees;
DROP POLICY IF EXISTS "Students can view own form requests" ON public.form_requests;
DROP POLICY IF EXISTS "Students can insert own form requests" ON public.form_requests;
DROP POLICY IF EXISTS "Students can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Students can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Students can view own messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Students can insert own messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own session" ON public.user_sessions;
DROP POLICY IF EXISTS "System can insert sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Anyone can request password reset" ON public.password_reset_requests;
DROP POLICY IF EXISTS "Users can use password reset token" ON public.password_reset_requests;
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own admin profile" ON public.admin_users;
DROP POLICY IF EXISTS "Users can update own admin profile" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view all instructors" ON public.instructor_users;
DROP POLICY IF EXISTS "Admins can manage instructors" ON public.instructor_users;
DROP POLICY IF EXISTS "Users can view own instructor profile" ON public.instructor_users;
DROP POLICY IF EXISTS "Users can update own instructor profile" ON public.instructor_users;
DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view semesters" ON public.semesters;
DROP POLICY IF EXISTS "Anyone can view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Anyone can view forms" ON public.forms;

-- ========================================
-- CREATE ROW LEVEL SECURITY POLICIES
-- ========================================

-- Authentication and user management policies
CREATE POLICY "Users can view available roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Users can view own role assignments" ON public.user_role_assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all admin data" ON public.admin_users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_role_assignments ura
        JOIN public.user_roles ur ON ura.role_id = ur.id
        WHERE ura.user_id = auth.uid() AND ur.role_name = 'admin'
    )
);
CREATE POLICY "Instructors can view own data" ON public.instructor_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view audit log" ON public.audit_log FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_role_assignments ura
        JOIN public.user_roles ur ON ura.role_id = ur.id
        WHERE ura.user_id = auth.uid() AND ur.role_name = 'admin'
    )
);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Course enrollments policies
CREATE POLICY "Students can view own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own enrollments" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Semester results policies
CREATE POLICY "Students can view own results" ON public.semester_results FOR SELECT USING (auth.uid() = student_id);

-- Assignment submissions policies
CREATE POLICY "Students can view own submissions" ON public.assignment_submissions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own submissions" ON public.assignment_submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own submissions" ON public.assignment_submissions FOR UPDATE USING (auth.uid() = student_id);

-- Attendance policies
CREATE POLICY "Students can view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id);

-- Fees policies
CREATE POLICY "Students can view own fees" ON public.fees FOR SELECT USING (auth.uid() = student_id);

-- Form requests policies
CREATE POLICY "Students can view own form requests" ON public.form_requests FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own form requests" ON public.form_requests FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Notifications policies
CREATE POLICY "Students can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = student_id);

-- Contact messages policies
CREATE POLICY "Students can view own messages" ON public.contact_messages FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own messages" ON public.contact_messages FOR INSERT WITH CHECK (auth.uid() = student_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_role_assignments ura
        JOIN public.user_roles ur ON ura.role_id = ur.id
        WHERE ura.user_id = auth.uid() AND ur.role_name = 'admin' AND ura.is_active = true
    )
);

-- Sessions policies
CREATE POLICY "Users can update own session" ON public.user_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert sessions" ON public.user_sessions FOR INSERT WITH CHECK (true);

-- Password reset requests policies
CREATE POLICY "Anyone can request password reset" ON public.password_reset_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can use password reset token" ON public.password_reset_requests FOR UPDATE USING (auth.uid() = user_id);

-- Admin users policies
CREATE POLICY "Admins can view all admin users" ON public.admin_users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_role_assignments ura
        JOIN public.user_roles ur ON ura.role_id = ur.id
        WHERE ura.user_id = auth.uid() AND ur.role_name = 'admin' AND ura.is_active = true
    )
);
CREATE POLICY "Admins can manage admin users" ON public.admin_users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_role_assignments ura
        JOIN public.user_roles ur ON ura.role_id = ur.id
        WHERE ura.user_id = auth.uid() AND ur.role_name = 'admin' AND ura.is_active = true
    )
);
CREATE POLICY "Users can view own admin profile" ON public.admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own admin profile" ON public.admin_users FOR UPDATE USING (auth.uid() = id);

-- Instructor users policies
CREATE POLICY "Admins can view all instructors" ON public.instructor_users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_role_assignments ura
        JOIN public.user_roles ur ON ura.role_id = ur.id
        WHERE ura.user_id = auth.uid() AND ur.role_name = 'admin' AND ura.is_active = true
    )
);
CREATE POLICY "Admins can manage instructors" ON public.instructor_users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_role_assignments ura
        JOIN public.user_roles ur ON ura.role_id = ur.id
        WHERE ura.user_id = auth.uid() AND ur.role_name = 'admin' AND ura.is_active = true
    )
);
CREATE POLICY "Users can view own instructor profile" ON public.instructor_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own instructor profile" ON public.instructor_users FOR UPDATE USING (auth.uid() = id);

-- Audit log policies
CREATE POLICY "System can insert audit log" ON public.audit_log FOR INSERT WITH CHECK (true);

-- Public read access for reference tables
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Anyone can view semesters" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Anyone can view assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Anyone can view forms" ON public.forms FOR SELECT USING (true);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Authentication and user management indexes
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON public.user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role_id ON public.user_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_at ON public.user_sessions(login_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON public.password_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON public.password_reset_requests(reset_token);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);

-- Course enrollments indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.course_enrollments(status);

-- Semester results indexes
CREATE INDEX IF NOT EXISTS idx_results_student_id ON public.semester_results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_semester_id ON public.semester_results(semester_id);

-- Assignment submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.assignment_submissions(student_id);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON public.attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(attendance_date);

-- Fees indexes
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON public.fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON public.fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON public.fees(due_date);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON public.notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
DROP TRIGGER IF EXISTS update_user_role_assignments_updated_at ON public.user_role_assignments;
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
DROP TRIGGER IF EXISTS update_instructor_users_updated_at ON public.instructor_users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS update_enrollments_updated_at ON public.course_enrollments;
DROP TRIGGER IF EXISTS update_semesters_updated_at ON public.semesters;
DROP TRIGGER IF EXISTS update_results_updated_at ON public.semester_results;
DROP TRIGGER IF EXISTS update_assignments_updated_at ON public.assignments;
DROP TRIGGER IF EXISTS update_submissions_updated_at ON public.assignment_submissions;
DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
DROP TRIGGER IF EXISTS update_fees_updated_at ON public.fees;
DROP TRIGGER IF EXISTS update_forms_updated_at ON public.forms;
DROP TRIGGER IF EXISTS update_form_requests_updated_at ON public.form_requests;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON public.contact_messages;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_role_assignments_updated_at BEFORE UPDATE ON public.user_role_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instructor_users_updated_at BEFORE UPDATE ON public.instructor_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.course_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON public.semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON public.semester_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON public.fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_requests_updated_at BEFORE UPDATE ON public.form_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to automatically assign student role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a profile for the new user
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    
    -- Assign student role to new user
    INSERT INTO public.user_role_assignments (user_id, role_id)
    SELECT NEW.id, id 
    FROM public.user_roles 
    WHERE role_name = 'student';
    
    -- Insert default user settings
    INSERT INTO public.user_settings (id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to automatically handle new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to track user login sessions
CREATE OR REPLACE FUNCTION public.track_user_login()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert session record when user logs in
    IF NEW.last_sign_in_at IS NOT NULL AND (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at) THEN
        INSERT INTO public.user_sessions (user_id, login_at)
        VALUES (NEW.id, NEW.last_sign_in_at);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;

-- Trigger to track user logins
CREATE TRIGGER on_auth_user_login
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.track_user_login();

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT ur.role_name INTO user_role
    FROM public.user_role_assignments ura
    JOIN public.user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = user_uuid AND ura.is_active = true
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := false;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM public.user_role_assignments ura
        JOIN public.user_roles ur ON ura.role_id = ur.id
        WHERE ura.user_id = user_uuid 
        AND ura.is_active = true
        AND ur.permissions ? permission_name
        AND (ur.permissions->>permission_name)::boolean = true
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SAMPLE DATA INSERTION (Optional)
-- ========================================

-- Insert default user roles
INSERT INTO public.user_roles (role_name, description, permissions) VALUES 
('student', 'Student users with access to academic features', '{"can_view_profile": true, "can_edit_profile": true, "can_view_courses": true, "can_enroll_courses": true}'),
('admin', 'Administrative users with full system access', '{"can_manage_users": true, "can_manage_courses": true, "can_view_reports": true, "can_modify_system": true}'),
('instructor', 'Teaching staff with course management access', '{"can_manage_courses": true, "can_grade_assignments": true, "can_view_students": true, "can_manage_attendance": true}'),
('staff', 'Support staff with limited administrative access', '{"can_view_students": true, "can_manage_forms": true, "can_respond_messages": true}')
ON CONFLICT (role_name) DO NOTHING;

-- Insert sample departments
INSERT INTO public.departments (name, code, description) VALUES 
('Computer Science', 'CS', 'Department of Computer Science and Engineering'),
('Mathematics', 'MATH', 'Department of Mathematics'),
('Physics', 'PHY', 'Department of Physics'),
('Chemistry', 'CHEM', 'Department of Chemistry'),
('Business Administration', 'BBA', 'Department of Business Administration')
ON CONFLICT (code) DO NOTHING;

-- Insert sample semester
INSERT INTO public.semesters (semester_name, academic_year, start_date, end_date, is_current) VALUES 
('Fall 2024', '2024-2025', '2024-09-01', '2024-12-31', true),
('Spring 2025', '2024-2025', '2025-01-15', '2025-05-15', false)
ON CONFLICT DO NOTHING;

-- Insert sample forms
INSERT INTO public.forms (form_name, form_type, description, file_url) VALUES 
('Fee Challan Form', 'fee_challan', 'Form for fee payment', '/forms/fee-challan.pdf'),
('Scholarship Application', 'scholarship', 'Application form for scholarships', '/forms/scholarship-form.pdf'),
('Course Change Request', 'course_change', 'Form to request course changes', '/forms/course-change.pdf'),
('Transcript Request', 'transcript', 'Form to request official transcripts', '/forms/transcript-request.pdf')
ON CONFLICT DO NOTHING;
