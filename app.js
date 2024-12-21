import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { requireAuth } from './middleware/auth.js';
import { handleLogin, handleRegister, handleLogout } from './controllers/authController.js';
import { supabase } from './models/supabase.js';
import midtransClient from 'midtrans-client';
import { config } from 'dotenv';  // Import dotenv to load environment variables
config();  // Load the .env file

import { checkSubscription } from './middleware/subscription.js';



// Controller untuk Event
import { createEvent, getEvents, deleteEvent, updateEvent, getEvent } from './controllers/eventController.js';
// Controller untuk Dana
import { createDana, getDanas, deleteDana, updateDana, getDana } from './controllers/danaController.js';
// Controller untuk Vendor
import { createVendor, getVendors, deleteVendor, updateVendor, getVendor } from './controllers/vendorController.js';
import { createVendorAdmin, getVendorsAdmin, deleteVendorAdmin, updateVendorAdmin, getVendorAdmin } from './controllers/vendorAdminController.js';
// Controller untuk RSVP
import { createRsvp, getRsvps, deleteRsvp, updateRsvp, getRsvp } from './controllers/rsvpController.js';
// Controller untuk Katalog
import { createKatalog, getKatalogs } from './controllers/katalogController.js';
import { getUndangan, createUndangan } from './controllers/undanganController.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Gunakan middleware untuk semua routes
app.use(checkSubscription);

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
app.get('/', async (req, res) => {
  const token = req.cookies.session;
  let userData = null;

  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    userData = user;
  }

  res.render('index', { user: userData });
});
app.get("/login", (req, res) => res.render('login', { error: null }));
app.get("/daftar", (req, res) => res.render('daftar', { error: null }));

// Protected routes
app.get("/dashboard", requireAuth, checkSubscription, async (req, res) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    // Get user_id from session/auth
    const user_id = req.user.id; // Adjust based on your auth implementation

    // Fetch upcoming events
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user_id)
      .order('event_date', { ascending: true })
      .limit(3);

    // Fetch budget information
    const { data: danas } = await supabase
      .from('danas')
      .select('*')
      .eq('user_id', user_id);

    // Calculate total savings and expenses
    const savings = danas
      .filter(dana => dana.budget_type === 'Masuk')
      .reduce((sum, dana) => sum + Number(dana.total_amount), 0);

    const expenses = danas
      .filter(dana => dana.budget_type === 'Keluar')
      .reduce((sum, dana) => sum + Number(dana.total_amount), 0);

    // Fetch vendor information
    const { data: vendors } = await supabase
      .from('manualvendors')
      .select('*')
      .eq('user_id', user_id);

    // Fetch RSVP list
    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('guest_name, contact, status')
      .eq('user_id', user_id);

    res.render('dashboard', {
      events,
      savings,
      expenses,
      vendors,
      user : userData,
      rsvps
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.redirect('/login');
  }
});

// Vendor Routes
app.get('/admin', requireAuth, checkSubscription, getVendorsAdmin);
app.post('/admin/create', requireAuth, checkSubscription, createVendorAdmin);
app.post('/admin/delete/:id', requireAuth, checkSubscription, deleteVendorAdmin);
app.get('/admin/edit/:id', requireAuth, checkSubscription, getVendorAdmin);
app.post('/admin/update/:id', requireAuth, checkSubscription, updateVendorAdmin);

// Acara Routes
app.get('/acara', requireAuth, checkSubscription, checkSubscription, getEvents);
app.post('/acara/create', requireAuth, checkSubscription, createEvent);
app.post('/acara/delete/:id', requireAuth, checkSubscription, deleteEvent);
app.get('/acara/edit/:id', requireAuth, checkSubscription, getEvent);
app.post('/acara/update/:id', requireAuth, checkSubscription, updateEvent);

// Dana Routes
app.get('/dana', requireAuth, checkSubscription, getDanas);
app.post('/dana/create', requireAuth, checkSubscription, createDana);
app.post('/dana/delete/:id', requireAuth, checkSubscription, deleteDana);
app.get('/dana/edit/:id', requireAuth, checkSubscription, getDana);
app.post('/dana/update/:id', requireAuth, checkSubscription, updateDana);

// Vendor Routes
app.get('/vendor', requireAuth, checkSubscription, getVendors);
app.post('/vendor/create', requireAuth, checkSubscription, createVendor);
app.post('/vendor/delete/:id', requireAuth, checkSubscription, deleteVendor);
app.get('/vendor/edit/:id', requireAuth, checkSubscription, getVendor);
app.post('/vendor/update/:id', requireAuth, checkSubscription, updateVendor);

// RSVP Routes
app.get('/rsvp', requireAuth, checkSubscription, getRsvps);
app.post('/rsvp/create', requireAuth, checkSubscription, createRsvp);
app.post('/rsvp/delete/:id', requireAuth, checkSubscription, deleteRsvp);
app.get('/rsvp/edit/:id', requireAuth, checkSubscription, getRsvp);
app.post('/rsvp/update/:id', requireAuth, checkSubscription, updateRsvp);

// Katalog Routes
app.get('/katalog', requireAuth, checkSubscription, getKatalogs);
app.post('/katalog/create', requireAuth, checkSubscription, createKatalog);


// Form Routes
app.get('/form/acara', requireAuth, checkSubscription, async (req, res) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error) throw error;
  res.render('form/acara', {
    user: userData,
    error: null,
    event: null,  // Entitas baru
    isEdit: false // Menandakan form ini untuk create (bukan edit)
  });
});

app.get("/form/dana", requireAuth, checkSubscription, async (req, res) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error) throw error;
  res.render('form/dana', {
    user: userData,
    error: null,
    dana: null,   // Entitas baru
    isEdit: false // Form untuk create dana
  });
});

app.get("/form/vendor", requireAuth, checkSubscription, async (req, res) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error) throw error;

  res.render('form/vendor', {
    user: userData,
    error: null,
    vendor: null, // Entitas baru
    isEdit: false // Form untuk create vendor
  });
});

app.get("/form/vendoradmin", requireAuth, checkSubscription, async (req, res) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error) throw error;
  res.render('form/vendoradmin', {
    user: userData,
    error: null,
    vendor: null, // Entitas baru
    isEdit: false // Form untuk create vendor
  });
});

app.get("/form/rsvp", requireAuth, checkSubscription, async (req, res) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error) throw error;
  res.render('form/rsvp', {
    user: userData,
    error: null,
    rsvp: null,   // Entitas baru
    isEdit: false // Form untuk create rsvp
  });
});

app.get("/form/katalog", requireAuth, checkSubscription, async (req, res) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error) throw error;
  res.render('form/katalog', {
    user: userData,
    error: null,
    katalog: null, // Entitas baru
    isEdit: false  // Form untuk create katalog
  });
});

app.post("/createKatalog", requireAuth, checkSubscription, createKatalog)
// Route untuk membuat atau mengupdate undangan
// Rute untuk halaman undangan
app.get("/undangan", requireAuth, checkSubscription, getUndangan);
// Menampilkan form tambah undangan
app.get('/undangan/create', requireAuth, checkSubscription, async (req, res) => {
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', req.user.id)
    .single();
  res.render('undanganform', { user: userData });
});
// Menyimpan undangan baru ke Supabase
app.post('/undangan', requireAuth, checkSubscription, createUndangan);

app.get("/undangandigital/:uuid", async (req, res) => {
  const { uuid } = req.params; // Mendapatkan UUID dari URL

  try {
    // Mengambil data pengguna berdasarkan UUID dari parameter URL
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', uuid)  // Mencari pengguna berdasarkan UUID dari parameter URL
      .single();

    if (userError) throw userError;  // Jika ada error saat mengambil data pengguna

    // Mengambil data undangan berdasarkan user_id yang sesuai
    const { data: undangan, error: undanganError } = await supabase
      .from('catalog_invitations')
      .select('*')
      .eq('user_id', uuid)  // Mencari undangan berdasarkan UUID pengguna
      .single();

    if (undanganError) throw undanganError;  // Jika ada error saat mengambil data undangan

    // Mengirim data ke template untuk ditampilkan
    res.render('undangan/template', {
      user: userData,
      undangan,
      error: null,
      katalog: null,  // Entitas baru
      isEdit: false  // Form untuk create katalog
    });

  } catch (error) {
    console.error('Error:', error);
    res.render('undangan/template', {
      user: null,
      undangan: null,
      error: 'Terjadi kesalahan saat memuat data undangan.',
      katalog: null,
      isEdit: false
    });
  }
});

app.post('/midtrans-notification', requireAuth, async (req, res) => {
  try {
    const paymentResult = req.body;
    console.log('Payment Result:', paymentResult);

    // Extract order_id dari payment result
    const orderId = paymentResult.order_id;

    // Extract transaction status
    const transactionStatus = paymentResult.transaction_status || paymentResult.status_code;

    let subscriptionStatus = 'inactive';

    // Tentukan subscription status
    if (transactionStatus === 'capture' || transactionStatus === 'settlement' || transactionStatus === '200') {
      subscriptionStatus = 'active';
    }

    if (subscriptionStatus === 'active') {
      // Extract package name dari order ID (3 huruf terakhir)
      const packageCode = orderId.slice(-3);
      let planName;

      switch (packageCode) {
        case 'BRO':
          planName = 'Basic';
          break;
        case 'PLA':
          planName = 'Premium';
          break;
        case 'PRO':
          planName = 'Professional';
          break;
        default:
          planName = 'Premium';
      }

      // Set tanggal
      const startDate = new Date();
      let endDate = new Date();

      // Set durasi berdasarkan paket
      switch (planName.toLowerCase()) {
        case 'basic':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'premium':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case 'professional':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1);
      }

      // Format tanggal untuk PostgreSQL
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // Insert ke tabel subscriptions
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: req.user.id, // Dari requireAuth middleware
            plan_name: planName,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            status: subscriptionStatus
          }
        ])
        .select();

      if (subscriptionError) {
        console.error('Subscription Error:', subscriptionError);
        throw subscriptionError;
      }

      console.log('Subscription created:', subscription);
      res.status(200).json({
        status: 'success',
        message: 'Subscription berhasil dibuat',
        data: subscription
      });
    } else {
      res.status(200).json({
        status: 'pending',
        message: 'Pembayaran belum selesai'
      });
    }
  } catch (error) {
    console.error('Error processing notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal memproses notifikasi',
      error: error.message
    });
  }
});


// Update create-transaction endpoint untuk menyertakan user_id
app.post('/create-transaction', requireAuth, async (req, res) => {
  try {
    const { packageName, amount } = req.body;
    const userId = req.user.id; // Get user_id from authenticated user

    if (!packageName || !amount) {
      return res.status(400).json({ error: 'Paket atau jumlah tidak valid' });
    }

    // Generate order ID
    const timestamp = Date.now().toString().slice(-8);
    const packageCode = packageName.slice(0, 3).toUpperCase();
    const orderId = `OR${timestamp}${packageCode}`;

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY
    });

    const transactionParams = {
      transaction_details: {
        order_id: orderId,
        gross_amount: parseInt(amount)
      },
      item_details: [
        {
          id: packageName.toLowerCase(),
          price: parseInt(amount),
          quantity: 1,
          name: `Paket ${packageName}`
        }
      ],
      customer_details: {
        first_name: req.user.email.split('@')[0] || "User",
        email: req.user.email,
        phone: req.user.phone || "081234567890"
      },
      callbacks: {
        finish: `${req.protocol}://${req.get('host')}/dashboard`,
        error: `${req.protocol}://${req.get('host')}/error`,
        pending: `${req.protocol}://${req.get('host')}/pending`
      },
      custom_field1: userId // Menyimpan user_id untuk digunakan di notification handler
    };

    const transaction = await snap.createTransaction(transactionParams);

    res.status(200).json({
      success: true,
      token: transaction.token
    });

  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal membuat transaksi, silakan coba beberapa saat lagi'
    });
  }
});




// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

