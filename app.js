import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { requireAuth } from './middleware/auth.js';
import { handleLogin, handleRegister, handleLogout } from './controllers/authController.js';
import { supabase } from './models/supabase.js';
import { createEvent, getEvents, deleteEvent, updateEvent, getEvent } from './controllers/eventController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/landing/css', express.static(path.join(__dirname, 'views/landing/css')));
app.use('/landing/js', express.static(path.join(__dirname, 'views/landing/js')));
app.use('/landing/img', express.static(path.join(__dirname, 'views/landing/img')));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Auth routes  
app.post('/login', handleLogin);
app.post('/daftar', handleRegister);
app.get('/logout', handleLogout);

// Public routes
app.get("/", (req, res) => res.render('index'));
app.get("/login", (req, res) => res.render('login', { error: null }));
app.get("/daftar", (req, res) => res.render('daftar', { error: null }));

// Protected routes
app.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
      
    if (error) throw error;
    
    res.render('dashboard', { user: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.redirect('/login');
  }
});


app.get('/acara', requireAuth, getEvents);
app.post('/acara/create', requireAuth, createEvent);
app.post('/acara/delete/:id', requireAuth, deleteEvent);
app.get('/acara/edit/:id', requireAuth, getEvent);
app.post('/acara/update/:id', requireAuth, updateEvent);

// Protected routes
app.get("/dana", requireAuth, async (req, res) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
      
    if (error) throw error;
    
    res.render('dana', { user: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.redirect('/login');
  }
});

// Protected routes
app.get("/vendor", requireAuth, async (req, res) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
      
    if (error) throw error;
    
    res.render('vendor', { user: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.redirect('/login');
  }
});
// Protected routes
app.get("/rsvp", requireAuth, async (req, res) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
      
    if (error) throw error;
    
    res.render('rsvp', { user: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.redirect('/login');
  }
});

// Protected routes
app.get("/katalog", requireAuth, async (req, res) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
      
    if (error) throw error;
    
    res.render('katalog', { user: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.redirect('/login');
  }
});

// Form routes
app.get('/form/acara', requireAuth, (req, res) => {
  res.render('form/acara', { 
    user: req.user, 
    error: null, 
    event: null,
    isEdit: false 
  });
});


app.get("/form/dana", requireAuth, (req, res) => res.render('form/dana'));
app.get("/form/vendor", requireAuth, (req, res) => res.render('form/vendor'));
app.get("/form/rsvp", requireAuth, (req, res) => res.render('form/rsvp'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));