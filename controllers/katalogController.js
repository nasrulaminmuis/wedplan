import { supabase } from '../models/supabase.js';

export const createKatalog = async (req, res) => {
  const { katalog_name, katalog_date, location, notes } = req.body;
  
  try {
    const { error } = await supabase
      .from('katalogs')
      .insert([{
        user_id: req.user.id,
        katalog_name,
        katalog_date,
        location,
        notes
      }]);

    if (error) throw error;
    res.redirect('/katalog');
  } catch (error) {
    res.render('form/katalog', { 
      error: error.message,
      user: req.user,
      katalog: req.body
    });
  }
};

export const getKatalogs = async (req, res) => {
  try {
    const { data: katalogs, error } = await supabase
      .from('katalogs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('katalog_date', { ascending: true });

    if (error) throw error;

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    res.render('katalog', { 
      katalogs, 
      user: userData,
      error: null 
    });
  } catch (error) {
    res.render('katalog', { 
      katalogs: [], 
      user: req.user,
      error: error.message 
    });
  }
};

export const getKatalog = async (req, res) => {
  try {
    const { data: katalog, error } = await supabase
      .from('katalogs')
      .select('*')
      .eq('katalog_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    res.render('form/katalog', {
      user: req.user,
      katalog,
      error: null,
      isEdit: true
    });
  } catch (error) {
    res.redirect('/katalog');
  }
};

export const updateKatalog = async (req, res) => {
  const { katalog_name, katalog_date, location, notes } = req.body;
  const katalogId = req.params.id;

  try {
    const { error } = await supabase
      .from('katalogs')
      .update({
        katalog_name,
        katalog_date,
        location,
        notes
      })
      .eq('katalog_id', katalogId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.redirect('/katalog');
  } catch (error) {
    res.render('form/katalog', {
      error: error.message,
      user: req.user,
      katalog: req.body,
      isEdit: true
    });
  }
};

export const deleteKatalog = async (req, res) => {
  try {
    const { error } = await supabase
      .from('katalogs')
      .delete()
      .eq('katalog_id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.redirect('/katalog');
  } catch (error) {
    res.redirect('/katalog');
  }
};