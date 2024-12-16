import { supabase } from '../models/supabase.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Konfigurasi multer untuk menyimpan file sementara
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder sementara untuk menyimpan file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Menyimpan file dengan nama unik
  }
});

const upload = multer({ storage });

// Endpoint untuk membuat vendor
export const createVendorAdmin = async (req, res) => {
  // Middleware multer untuk menangani upload file
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).send('Error uploading file');
    }

    // Pastikan req.file ada sebelum mengakses req.file.filename
    if (!req.file) {
      console.error('Multer error:', err);
      return res.status(400).send('File is required');
    }

    const { vendor_name, category, contact_info, alamat } = req.body;
    const file = req.file; // Mengambil file yang diupload

    try {
      console.log('File to upload:', file);
      console.log('File path:', file.path);
      // Upload gambar ke bucket Supabase
      const { data: imageData, error: uploadError } = await supabase
        .storage
        .from('wedplan')
        .upload(`vendors/${file.filename}`, fs.readFileSync(file.path), {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Mendapatkan URL gambar
      const imageUrl = `https://uikfsdqpjarcmazypmns.supabase.co/storage/v1/object/public/wedplan/vendors/${file.filename}`;

      // Menyimpan data vendor ke database
      const { error } = await supabase
        .from('vendors')
        .insert([{
          vendor_name,
          category,
          contact_info,
          alamat,
          image: imageUrl // Menyimpan URL gambar
        }]);

      if (error) throw error;

      // Menghapus file sementara setelah upload
      fs.unlinkSync(file.path);

      res.redirect('/admin');
    } catch (error) {
      res.render('form/vendor', {
        error: error.message,
        user: req.user,
        vendor: req.body,
        isEdit: false
      });
    }
  });
};
// Endpoint untuk mendapatkan semua vendor
// Endpoint untuk mendapatkan semua vendor
export const getVendorsAdmin = async (req, res) => {
  try {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error; // Pastikan untuk melempar error jika ada

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (userError) throw userError; // Pastikan untuk melempar error jika ada
    

    res.render('admin', {
      vendors, // Menggunakan vendors
      user: userData,
      error: null
    });
  } catch (error) {
    console.error('Error fetching vendors:', error); // Log error untuk debugging
    const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (userError) throw userError;
    res.render('admin', {
      vendors: [],
      user: userData,
      error: error.message // Menampilkan pesan error
    });
  }
};

// Endpoint untuk mendapatkan vendor berdasarkan ID
export const getVendorAdmin = async (req, res) => {
  try {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', req.params.id)
      .single();

    const { data: userData} = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();


    if (error) throw error;

    res.render('form/vendoradmin', {
      user: userData,
      vendor,
      error: null,
      isEdit: true
    });
  } catch (error) {
    res.redirect('/admin');
  }
};

// Endpoint untuk memperbarui vendor
export const updateVendorAdmin = async (req, res) => {
  // Middleware multer untuk menangani upload file
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).send('Error uploading file');
    }

    console.log("Request Body:", req.body); // Cek data yang diterima
    console.log("Request File:", req.file); // Cek file yang diupload

    const { vendor_name, category, contact_info, alamat } = req.body;
    const vendorId = req.params.id;
    const file = req.file; // Mengambil file yang diupload (jika ada)

    try {
      // Ambil vendor lama untuk mendapatkan URL gambar lama
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('image') // Hanya ambil kolom image
        .eq('vendor_id', vendorId)
        .single();

      if (vendorError) throw vendorError;

      let imageUrl = vendor.image; // Jika tidak ada gambar baru, gunakan gambar lama

      // Jika ada file baru yang di-upload, upload gambar ke Supabase
      if (file) {
        // Jika ada gambar lama, hapus gambar lama dari Supabase
        if (imageUrl) {
          const oldFileName = imageUrl.split('/').pop(); // Ambil nama file lama
          const { error: deleteFileError } = await supabase
            .storage
            .from('wedplan') // Nama bucket
            .remove([`vendors/${oldFileName}`]); // Hapus gambar lama

          if (deleteFileError) throw deleteFileError; // Jika ada error saat menghapus file lama
          console.log(`File ${oldFileName} berhasil dihapus.`);
        }

        // Upload gambar baru
        const { data: imageData, error: uploadError } = await supabase
          .storage
          .from('wedplan')
          .upload(`vendors/${file.filename}`, fs.readFileSync(file.path), {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Mendapatkan URL gambar baru
        imageUrl = `https://uikfsdqpjarcmazypmns.supabase.co/storage/v1/object/public/wedplan/vendors/${file.filename}`;

        // Menghapus file sementara setelah upload
        fs.unlinkSync(file.path);
      }

      // Memperbarui data vendor
      const { error } = await supabase
        .from('vendors')
        .update({
          vendor_name,
          category,
          contact_info,
          alamat,
          image: imageUrl // Update dengan gambar baru atau gambar lama
        })
        .eq('vendor_id', vendorId);

      if (error) throw error;

      // Redirect setelah berhasil memperbarui vendor
      res.redirect('/admin');
    } catch (error) {
      console.error('Error updating vendor:', error);
      res.render('form/vendoradmin', {
        error: error.message,
        user: req.user,
        vendor: req.body,
        isEdit: true
      });
    }
  });
};



// Endpoint untuk menghapus vendor
export const deleteVendorAdmin = async (req, res) => {
  try {
    // Ambil data vendor berdasarkan ID
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('image') // Hanya ambil URL gambar
      .eq('vendor_id', req.params.id)
      .single(); // Menggunakan .single() untuk memastikan hanya satu baris data yang diambil

    if (vendorError) {
      // Tangani error jika tidak ada vendor yang ditemukan
      throw new Error(`Vendor tidak ditemukan atau error saat mengambil data: ${vendorError.message}`);
    }

    // Jika ada file gambar yang terhubung dengan vendor, hapus dari bucket
    if (vendor && vendor.image) {
      // Ambil nama file dari URL gambar
      const fileName = vendor.image.split('/').pop(); // Ambil bagian terakhir dari URL (nama file)

      // Hapus file dari bucket Supabase
      const { error: deleteFileError } = await supabase
        .storage
        .from('wedplan') // Nama bucket (sesuaikan dengan bucket Anda)
        .remove([`vendors/${fileName}`]); // Hapus file dengan path yang sesuai

      if (deleteFileError) {
        throw new Error(`Error saat menghapus file: ${deleteFileError.message}`);
      }
      console.log(`File ${fileName} berhasil dihapus dari bucket.`);
    }

    // Hapus data vendor dari database
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('vendor_id', req.params.id)

    if (error) {
      throw new Error(`Error saat menghapus vendor: ${error.message}`);
    }

    // Redirect setelah berhasil menghapus vendor
    res.redirect('/admin');
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).send(`Gagal menghapus vendor: ${error.message}`);
  }
};

