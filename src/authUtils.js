// User authentication and role management utilities
import { supabase } from './supabase.js';

/**
 * Get the current user's role
 * @returns {Promise<string>} User role (student, admin, instructor, staff)
 */
export const getUserRole = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_role_assignments')
      .select(`
        user_roles (
          role_name
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data?.user_roles?.role_name || 'student';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'student'; // Default to student role
  }
};

/**
 * Check if user has a specific permission
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} Whether user has permission
 */
export const hasPermission = async (permission) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_role_assignments')
      .select(`
        user_roles (
          permissions
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;

    return data?.some(assignment => 
      assignment.user_roles?.permissions?.[permission] === true
    ) || false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Check if user is an admin
 * @returns {Promise<boolean>} Whether user is admin
 */
export const isAdmin = async () => {
  const role = await getUserRole();
  return role === 'admin';
};

/**
 * Check if user is an instructor
 * @returns {Promise<boolean>} Whether user is instructor
 */
export const isInstructor = async () => {
  const role = await getUserRole();
  return role === 'instructor';
};

/**
 * Check if user is a student
 * @returns {Promise<boolean>} Whether user is student
 */
export const isStudent = async () => {
  const role = await getUserRole();
  return role === 'student';
};

/**
 * Get user's profile with role information
 * @returns {Promise<object>} User profile with role data
 */
export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const { data: roleData, error: roleError } = await supabase
      .from('user_role_assignments')
      .select(`
        user_roles (
          role_name,
          permissions
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (roleError) {
      console.warn('Error getting role data:', roleError);
    }

    return {
      ...profile,
      role: roleData?.user_roles?.role_name || 'student',
      permissions: roleData?.user_roles?.permissions || {}
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Log user action for audit trail
 * @param {string} action - Action performed
 * @param {string} tableName - Table affected
 * @param {string} recordId - Record ID affected
 * @param {object} oldValues - Old values
 * @param {object} newValues - New values
 */
export const logUserAction = async (action, tableName = null, recordId = null, oldValues = null, newValues = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('audit_log')
      .insert({
        user_id: user.id,
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: '127.0.0.1', // In production, get real IP
        user_agent: navigator.userAgent
      });
  } catch (error) {
    console.error('Error logging user action:', error);
  }
};

/**
 * Track user login session
 * @param {object} additionalInfo - Additional session info
 */
export const trackUserSession = async (additionalInfo = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        ip_address: '127.0.0.1', // In production, get real IP
        user_agent: navigator.userAgent,
        device_info: additionalInfo.device || {},
        location_info: additionalInfo.location || {}
      });
  } catch (error) {
    console.error('Error tracking user session:', error);
  }
};

/**
 * Sign out user and log the session end
 */
export const signOutUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Update current session as logged out
      await supabase
        .from('user_sessions')
        .update({ 
          logout_at: new Date().toISOString(),
          is_active: false 
        })
        .eq('user_id', user.id)
        .eq('is_active', true);
    }

    // Sign out from Supabase
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    // Still attempt to sign out even if session update fails
    await supabase.auth.signOut();
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 */
export const requestPasswordReset = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;

    // Log the reset request
    await supabase
      .from('password_reset_requests')
      .insert({
        email,
        reset_token: 'pending', // Supabase handles the token
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        ip_address: '127.0.0.1'
      });

    return { success: true };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return { error: error.message };
  }
};

export default {
  getUserRole,
  hasPermission,
  isAdmin,
  isInstructor,
  isStudent,
  getUserProfile,
  logUserAction,
  trackUserSession,
  signOutUser,
  requestPasswordReset
};









