import { supabase } from '../models/supabase.js';

// Create Budget
export const createDana = async (req, res) => {
  const { budget_name, total_amount, budget_type, notes } = req.body;

  try {
    const { error } = await supabase
      .from('danas')
      .insert([{
        user_id: req.user.id,
        budget_name,
        total_amount,
        budget_type
      }]);

    if (error) throw error;
    res.redirect('/dana');
  } catch (error) {
    res.render('form/dana', { 
      error: error.message,
      user: req.user,
      dana: req.body,
      isEdit: false // Setting `isEdit` to false for adding a new record
    });
  }
};


// Get all Datasets (Budgets)
export const getDanas = async (req, res) => {
  try {
    const { data: danas, error } = await supabase
      .from('danas')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    res.render('dana', { 
      danas, 
      user: userData,
      error: null 
    });
  } catch (error) {
    res.render('dana', { 
      danas: [], 
      user: req.user,
      error: error.message 
    });
  }
};

// Get Single Budget Data for Edit
export const getDana = async (req, res) => {
  try {
    const { data: dana, error } = await supabase
      .from('danas')
      .select('*')
      .eq('budget_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    res.render('form/dana', {
      user: req.user,
      dana,
      error: null,
      isEdit: true // Setting `isEdit` to true for editing a record
    });
  } catch (error) {
    res.redirect('/dana');
  }
};

// Update Budget
export const updateDana = async (req, res) => {
  const { budget_name, total_amount, budget_type, notes } = req.body;
  const danaId = req.params.id;

  try {
    const { error } = await supabase
      .from('danas')
      .update({
        budget_name,
        total_amount,
        budget_type,
        notes
      })
      .eq('budget_id', danaId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.redirect('/dana');
  } catch (error) {
    res.render('form/dana', {
      error: error.message,
      user: req.user,
      dana: req.body,
      isEdit: true
    });
  }
};

// Delete Budget
export const deleteDana = async (req, res) => {
  try {
    const { error } = await supabase
      .from('danas')
      .delete()
      .eq('budget_id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.redirect('/dana');
  } catch (error) {
    res.redirect('/dana');
  }
};
