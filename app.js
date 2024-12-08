import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { requireAuth } from './middleware/auth.js';
import { handleLogin, handleRegister, handleLogout } from './controllers/authController.js';
import { supabase } from './models/supabase.js';

// Controller untuk Event
import { createEvent, getEvents, deleteEvent, updateEvent, getEvent } from './controllers/eventController.js';
// Controller untuk Dana
import { createDana, getDanas, deleteDana, updateDana, getDana } from './controllers/danaController.js';
// Controller untuk Vendor
import { createVendor, getVendors, deleteVendor, updateVendor, getVendor } from './controllers/vendorController.js';
// Controller untuk RSVP
import { createRsvp, getRsvps, deleteRsvp, updateRsvp, getRsvp } from './controllers/rsvpController.js';
// Controller untuk Katalog
import { createKatalog, getKatalogs, deleteKatalog, updateKatalog, getKatalog } from './controllers/katalogController.js';

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

// Acara Routes
app.get('/acara', requireAuth, getEvents);
app.post('/acara/create', requireAuth, createEvent);
app.post('/acara/delete/:id', requireAuth, deleteEvent);
app.get('/acara/edit/:id', requireAuth, getEvent);
app.post('/acara/update/:id', requireAuth, updateEvent);

// Dana Routes
app.get('/dana', requireAuth, getDanas);
app.post('/dana/create', requireAuth, createDana);
app.post('/dana/delete/:id', requireAuth, deleteDana);
app.get('/dana/edit/:id', requireAuth, getDana);
app.post('/dana/update/:id', requireAuth, updateDana);

// Vendor Routes
app.get('/vendor', requireAuth, getVendors);
app.post('/vendor/create', requireAuth, createVendor);
app.post('/vendor/delete/:id', requireAuth, deleteVendor);
app.get('/vendor/edit/:id', requireAuth, getVendor);
app.post('/vendor/update/:id', requireAuth, updateVendor);

// RSVP Routes
app.get('/rsvp', requireAuth, getRsvps);
app.post('/rsvp/create', requireAuth, createRsvp);
app.post('/rsvp/delete/:id', requireAuth, deleteRsvp);
app.get('/rsvp/edit/:id', requireAuth, getRsvp);
app.post('/rsvp/update/:id', requireAuth, updateRsvp);

// Katalog Routes
app.get('/katalog', requireAuth, getKatalogs);
app.post('/katalog/create', requireAuth, createKatalog);
app.post('/katalog/delete/:id', requireAuth, deleteKatalog);
app.get('/katalog/edit/:id', requireAuth, getKatalog);
app.post('/katalog/update/:id', requireAuth, updateKatalog);

// Form Routes
// Form Routes
app.get('/form/acara', requireAuth, (req, res) => {
  res.render('form/acara', { 
    user: req.user, 
    error: null, 
    event: null,  // Entitas baru
    isEdit: false // Menandakan form ini untuk create (bukan edit)
  });
});

app.get("/form/dana", requireAuth, (req, res) => {
  res.render('form/dana', { 
    user: req.user, 
    error: null, 
    dana: null,   // Entitas baru
    isEdit: false // Form untuk create dana
  });
});

app.get("/form/vendor", requireAuth, (req, res) => {
  res.render('form/vendor', { 
    user: req.user, 
    error: null, 
    vendor: null, // Entitas baru
    isEdit: false // Form untuk create vendor
  });
});

app.get("/form/rsvp", requireAuth, (req, res) => {
  res.render('form/rsvp', { 
    user: req.user, 
    error: null, 
    rsvp: null,   // Entitas baru
    isEdit: false // Form untuk create rsvp
  });
});

app.get("/form/katalog", requireAuth, (req, res) => {
  res.render('form/katalog', { 
    user: req.user, 
    error: null, 
    katalog: null, // Entitas baru
    isEdit: false  // Form untuk create katalog
  });
});


// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

