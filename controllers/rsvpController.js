import { supabase } from '../models/supabase.js';

// Create RSVP
export const createRsvp = async (req, res) => {
  const { guest_name, contact, status } = req.body;

  try {
    const { error } = await supabase
      .from('rsvps')
      .insert([{
        user_id: req.user.id,
        guest_name,
        contact,
        status
      }]);

    if (error) throw error;
    res.redirect('/rsvp');
  } catch (error) {
    res.render('form/rsvp', {
      error: error.message,
      user: req.user,
      rsvp: req.body
    });
  }
};

// Get all RSVPs for the user
export const getRsvps = async (req, res) => {
  try {
    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.render('rsvp', {
      rsvps,
      user: req.user,
      error: null
    });
  } catch (error) {
    res.render('rsvp', {
      rsvps: [],
      user: req.user,
      error: error.message
    });
  }
};

// Get a single RSVP
export const getRsvp = async (req, res) => {
  try {
    const { data: rsvp, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('rsvp_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    res.render('form/rsvp', {
      user: req.user,
      rsvp,
      error: null,
      isEdit: true
    });
  } catch (error) {
    res.redirect('/rsvp');
  }
};

// Update RSVP
export const updateRsvp = async (req, res) => {
  const { guest_name, contact, status } = req.body;
  const rsvpId = req.params.id;

  try {
    const { error } = await supabase
      .from('rsvps')
      .update({
        guest_name,
        contact,
        status
      })
      .eq('rsvp_id', rsvpId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.redirect('/rsvp');
  } catch (error) {
    res.render('form/rsvp', {
      error: error.message,
      user: req.user,
      rsvp: req.body,
      isEdit: true
    });
  }
};

// Delete RSVP
export const deleteRsvp = async (req, res) => {
  try {
    const { error } = await supabase
      .from('rsvps')
      .delete()
      .eq('rsvp_id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.redirect('/rsvp');
  } catch (error) {
    res.redirect('/rsvp');
  }
};
