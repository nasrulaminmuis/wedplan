// controllers/authController.js
import { supabase } from '../models/supabase.js';

export const handleRegister = async (req, res) => {
  const { username, email, address, password } = req.body;

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;

    // Get user id from auth response
    const userId = authData.user.id;

    // Insert user profile data
    const { error: profileError } = await supabase
      .from('users')
      .insert([{ 
        user_id: userId,
        name: username,
        email,
        password: 'hashed_' + password, // In production use proper hashing
        address 
      }]);

    if (profileError) throw profileError;

    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('daftar', { error: error.message });
  }
};

export const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Authenticate the user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Fetch the user profile from the 'users' table using the user id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('name')
      .eq('user_id', data.user.id)
      .single(); // Assuming each user has a unique profile

    if (profileError) throw profileError;

    // Set the session cookie for the user
    res.cookie('session', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    // If the username is 'admin', redirect to the admin page
    if (userProfile.name === 'admin') {
      return res.redirect('/admin');
    }

    // Otherwise, redirect to the regular dashboard
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: error.message });
  }
};

export const handleLogout = async (req, res) => {
  res.clearCookie('session');
  const { error } = await supabase.auth.signOut();
  res.redirect('/');
};