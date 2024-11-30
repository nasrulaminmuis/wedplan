// middleware/auth.js
import { supabase } from '../models/supabase.js';

export const requireAuth = async (req, res, next) => {
  const token = req.cookies.session;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.clearCookie('session');
      return res.redirect('/login');
    }

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('session');
    res.redirect('/login');
  }
};