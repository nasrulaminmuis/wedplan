import { supabase } from '../models/supabase.js';

export const createVendor = async (req, res) => {
  const { vendor_name, category, contact_info, alamat } = req.body;

  try {
    const { error } = await supabase
      .from('manualvendors')
      .insert([{
        user_id: req.user.id,
        vendor_name,
        category,
        contact_info,
        alamat
      }]);

    if (error) throw error;
    res.redirect('/vendor');
  } catch (error) {
    res.render('form/vendor', { 
      error: error.message,
      user: req.user,
      vendor: req.body,
      isEdit: false
    });
  }
};

export const getVendors = async (req, res) => {
  try {
    const { data: manualvendors, error } = await supabase
      .from('manualvendors')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    res.render('vendor', { 
      manualvendors, 
      user: userData,
      error: null 
    });
  } catch (error) {
    res.render('vendor', { 
      manualvendors: [], 
      user: req.user,
      error: error.message 
    });
  }
};

export const getVendor = async (req, res) => {
  try {
    const { data: vendor, error } = await supabase
      .from('manualvendors')
      .select('*')
      .eq('vendor_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    res.render('form/vendor', {
      user: req.user,
      vendor,
      error: null,
      isEdit: true
    });
  } catch (error) {
    res.redirect('/vendor');
  }
};

export const updateVendor = async (req, res) => {
  const { vendor_name, category, contact_info, alamat } = req.body;
  const vendorId = req.params.id;

  try {
    const { error } = await supabase
      .from('manualvendors')
      .update({
        vendor_name,
        category,
        contact_info,
        alamat
      })
      .eq('vendor_id', vendorId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.redirect('/vendor');
  } catch (error) {
    res.render('form/vendor', {
      error: error.message,
      user: req.user,
      vendor: req.body,
      isEdit: true
    });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { error } = await supabase
      .from('manualvendors')
      .delete()
      .eq('vendor_id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.redirect('/vendor');
  } catch (error) {
    res.redirect('/vendor');
  }
};
