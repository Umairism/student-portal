-- Simplified Student Portal Schema for Automated Execution
-- This version excludes complex functions and focuses on tables and basic setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE CHECK (role_name IN ('student', 'admin', 'instructor', 'staff')),
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User role assignments
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

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    student_id TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Pakistan',
    department TEXT,
    academic_year TEXT,
    semester INTEGER,
    admission_date DATE,
    graduation_date DATE,
    is_active BOOLEAN DEFAULT true,
    profile_image_url TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    head_of_department TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_code TEXT NOT NULL UNIQUE,
    course_name TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    instructor_id UUID REFERENCES auth.users(id),
    credits INTEGER NOT NULL DEFAULT 3,
    semester INTEGER NOT NULL DEFAULT 1,
    academic_year TEXT,
    description TEXT,
    prerequisites TEXT,
    course_type TEXT CHECK (course_type IN ('core', 'elective', 'lab', 'project')) DEFAULT 'core',
    max_enrollment INTEGER DEFAULT 50,
    current_enrollment INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Semesters table
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    semester_name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(semester_name, academic_year)
);

-- Course enrollments table
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id),
    semester_id UUID REFERENCES public.semesters(id),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('enrolled', 'dropped', 'completed', 'failed')) DEFAULT 'enrolled',
    grade TEXT,
    gpa NUMERIC(3,2),
    attendance_percentage NUMERIC(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- Profiles policies
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Public read access for reference tables
CREATE POLICY IF NOT EXISTS "Anyone can view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view semesters" ON public.semesters FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view user roles" ON public.user_roles FOR SELECT USING (true);

-- Course enrollments policies
CREATE POLICY IF NOT EXISTS "Students can view own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY IF NOT EXISTS "Students can insert own enrollments" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

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
ON CONFLICT (semester_name, academic_year) DO NOTHING;
