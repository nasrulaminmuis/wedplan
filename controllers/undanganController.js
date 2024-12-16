import { supabase } from '../models/supabase.js';

export const getUndangan = async (req, res) => {
  try {
    // Fetching the undangan data from Supabase based on the user_id
    const { data: undangan, error } = await supabase
      .from('catalog_invitations')
      .select('*')
      .eq('user_id', req.user.id)
      .single();  // Get only one record (assuming user has only one invitation)

      const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    // If data is found, render the undangan page
    res.render('undangan', {
      user: userData,
      undangan,
      error: null,
      isEdit: true
    });
  } catch (error) {
    // Log error to console for debugging
    console.error('Error fetching undangan:', error);
    
    // Render the undangan page with an error message or redirect to another route
    res.render('undangan', {
      user: req.user,
      undangan: null,  // Return null for undangan data if error occurs
      error: 'Something went wrong while fetching your invitation.',
      isEdit: false
    });
  }
};

export const createUndangan = async (req, res) => {
  try {
    // Mengambil data dari form yang dikirimkan oleh pengguna
    const { nama_pria, nama_wanita, akad, resepsi, alamat } = req.body;

    // Memastikan data yang diperlukan ada
    if (!nama_pria || !nama_wanita || !akad || !resepsi || !alamat) {
      return res.render('createUndangan', {
        error: 'Semua kolom wajib diisi.',
        user: req.user
      });
    }

    // Generate a new UUID (for the invitation)
    const template_url = `https://wedplan-five.vercel.app/undangandigital/${req.user.id}`;

    // Menyimpan data ke Supabase
    const { data, error } = await supabase
      .from('catalog_invitations')
      .insert([
        {
          user_id: req.user.id,  // ID pengguna yang sedang login (sudah UUID)
          nama_pria,
          nama_wanita,
          akad: new Date(akad),  // Konversi ke format tanggal yang benar
          resepsi: new Date(resepsi),  // Konversi ke format tanggal yang benar
          alamat,
          template_url  // URL template yang sudah dibentuk
        }
      ]);

    if (error) {
      throw error;
    }

    // Jika berhasil, alihkan ke halaman undangan dengan undangan baru yang ditambahkan
    res.redirect('/undangan');
  } catch (error) {
    console.error('Error menambah undangan:', error);
    res.render('createUndangan', {
      error: 'Terjadi kesalahan saat menambahkan undangan. Coba lagi nanti.',
      user: req.user
    });
  }
};