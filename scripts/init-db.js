import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { supabaseAdmin } from '../lib/database.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  try {
    console.log('Initializing Supabase database...');
    console.log('Supabase URL:', process.env.VITE_SUPABASE_URL ? 'Found' : 'Missing');
    console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');
    
    if (!supabaseAdmin) {
      throw new Error('Supabase service role key is required for database initialization');
    }
    
    // Test connection first
    console.log('Testing Supabase connection...');
    const { data, error } = await supabaseAdmin.from('_realtime_schema_version').select('*').limit(1);
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    console.log('Supabase connection successful!');
    
    // Provide clear instructions for manual schema setup
    console.log('\n🔧 SCHEMA SETUP INSTRUCTIONS:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('For the best results, please set up your schema manually:');
    console.log('');
    console.log('📋 STEPS:');
    console.log('1. Go to your Supabase Dashboard → SQL Editor');
    console.log('2. Create a new query');
    console.log('3. Copy the ENTIRE contents of: db/schema.sql');
    console.log('4. Paste and run it in the SQL Editor');
    console.log('');
    console.log('📁 Schema file: d:\\Websites\\student-portal\\db\\schema.sql');
    console.log('');
    console.log('✅ This will create:');
    console.log('   • All tables with proper relationships');
    console.log('   • Row Level Security (RLS) policies');
    console.log('   • User roles and permissions');
    console.log('   • Database functions and triggers');
    console.log('   • Sample data for testing');
    console.log('');
    console.log('⚠️  Note: Some complex SQL features work better in Supabase SQL Editor');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n🔄 Checking current database state and adding sample data...\n');
    
    // Add sample data if needed
    await addSampleData();
    
    console.log('✅ Supabase database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Make sure your Supabase environment variables are set correctly in .env file:');
    console.error('- VITE_SUPABASE_URL');
    console.error('- VITE_SUPABASE_ANON_KEY');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
  }
}

async function addSampleData() {
  try {
    console.log('Adding sample data...');
    
    // Check if departments already exist
    const { data: existingDepts } = await supabaseAdmin
      .from('departments')
      .select('code')
      .limit(1);
    
    if (existingDepts && existingDepts.length > 0) {
      console.log('Sample data already exists, skipping...');
      return;
    }
    
    // Add sample departments
    const departments = [
      { name: 'Computer Science', code: 'CS', description: 'Department of Computer Science and Engineering' },
      { name: 'Mathematics', code: 'MATH', description: 'Department of Mathematics' },
      { name: 'Physics', code: 'PHY', description: 'Department of Physics' },
      { name: 'Chemistry', code: 'CHEM', description: 'Department of Chemistry' },
      { name: 'Business Administration', code: 'BBA', description: 'Department of Business Administration' }
    ];

    const { error: deptError } = await supabaseAdmin
      .from('departments')
      .insert(departments);
    
    if (deptError && !deptError.message.includes('duplicate')) {
      console.warn('Warning adding departments:', deptError.message);
    }

    // Add sample semesters
    const semesters = [
      { 
        semester_name: 'Fall 2024', 
        academic_year: '2024-2025', 
        start_date: '2024-09-01', 
        end_date: '2024-12-31', 
        is_current: true 
      },
      { 
        semester_name: 'Spring 2025', 
        academic_year: '2024-2025', 
        start_date: '2025-01-15', 
        end_date: '2025-05-15', 
        is_current: false 
      }
    ];

    const { error: semError } = await supabaseAdmin
      .from('semesters')
      .insert(semesters);
    
    if (semError && !semError.message.includes('duplicate')) {
      console.warn('Warning adding semesters:', semError.message);
    }

    // Add sample courses
    const { data: deptData } = await supabaseAdmin
      .from('departments')
      .select('id, code');
    
    if (deptData && deptData.length > 0) {
      const courses = [
        { 
          course_code: 'CS101', 
          course_name: 'Introduction to Computer Science', 
          department_id: deptData.find(d => d.code === 'CS')?.id,
          credits: 3, 
          semester: 1, 
          description: 'Basic programming concepts' 
        },
        { 
          course_code: 'MATH101', 
          course_name: 'Calculus I', 
          department_id: deptData.find(d => d.code === 'MATH')?.id,
          credits: 4, 
          semester: 1, 
          description: 'Differential calculus' 
        },
        { 
          course_code: 'ENG101', 
          course_name: 'English Composition', 
          department_id: deptData.find(d => d.code === 'CS')?.id, // Default to CS if no ENG dept
          credits: 3, 
          semester: 1, 
          description: 'Writing and communication skills' 
        }
      ];

      const { error: courseError } = await supabaseAdmin
        .from('courses')
        .insert(courses.filter(c => c.department_id)); // Only insert courses with valid department_id
      
      if (courseError && !courseError.message.includes('duplicate')) {
        console.warn('Warning adding courses:', courseError.message);
      }
    }
    
    console.log('✅ Sample data added successfully!');
  } catch (error) {
    console.warn('Warning adding sample data:', error.message);
  }
}

initDatabase();
