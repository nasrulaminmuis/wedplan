import { supabase } from '../models/supabase.js';

export const createKatalog = async (req, res) => {
  const { vendor_name, category, contact_info, alamat } = req.body;



  // Validasi: Pastikan semua field wajib diisi
  if (!vendor_name || !category || !contact_info || !alamat) {
    return res.status(400).json({
      success: false,
      message: 'Semua field wajib diisi.'
    });
  }

  try {
    // Menambahkan vendor baru ke database menggunakan Supabase
    const { data, error } = await supabase
      .from('manualvendors')
      .insert([{
        user_id: req.user.id,
        vendor_name,
        category,
        contact_info,
        alamat
      }]);

    if (error) {
      throw error; // Lemparkan error jika ada
    }

    // Jika berhasil, kirimkan response sukses
    res.status(200).json({
      success: true,
      message: 'Vendor berhasil ditambahkan.',
      data: data
    });

  } catch (error) {
    // Kirimkan pesan error jika ada kesalahan
    res.status(500).json({
      success: false,
      message: `Terjadi kesalahan: ${error.message}`
    });
  }
};


// Mendapatkan data vendor berdasarkan kategori
export const getKatalogs = async (req, res) => {
  try {
    // Daftar kategori yang ada
    const categories = ['catering', 'photography', 'decoration', 'venue', 'others'];

    // Ambil data vendor untuk setiap kategori
    const categoryVendors = await Promise.all(categories.map(async (category) => {
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*') // Ambil field yang diperlukan
        .eq('category', category);

      if (error) throw error;

      // Mengambil data vendor dan mengelompokkan berdasarkan kategori
      return {
        title: category.charAt(0).toUpperCase() + category.slice(1), // Mengubah kategori menjadi format judul
        vendors: vendors.map(vendor => ({
          id: vendor.id,
          vendor_name: vendor.vendor_name,
          image: vendor.image,
          contact_info: vendor.contact_info,  // Menambahkan contact_info
          alamat: vendor.alamat
        }))
      };
    }));

    // Mendapatkan data user (jika diperlukan)
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    // Kirim data ke tampilan (render view)
    res.render('katalog', { categories: categoryVendors, user: userData });

  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).send('Error fetching data');
  }
};


