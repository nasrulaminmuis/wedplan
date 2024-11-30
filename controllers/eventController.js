import { supabase } from '../models/supabase.js';

export const createEvent = async (req, res) => {
  const { event_name, event_date, location, notes } = req.body;
  
  try {
    const { error } = await supabase
      .from('events')
      .insert([{
        user_id: req.user.id,
        event_name,
        event_date,
        location,
        notes
      }]);

    if (error) throw error;
    res.redirect('/acara');
  } catch (error) {
    res.render('form/acara', { 
      error: error.message,
      user: req.user,
      event: req.body
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', req.user.id)
      .order('event_date', { ascending: true });

    if (error) throw error;

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    res.render('acara', { 
      events, 
      user: userData,
      error: null 
    });
  } catch (error) {
    res.render('acara', { 
      events: [], 
      user: req.user,
      error: error.message 
    });
  }
};

export const getEvent = async (req, res) => {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    res.render('form/acara', {
      user: req.user,
      event,
      error: null,
      isEdit: true
    });
  } catch (error) {
    res.redirect('/acara');
  }
};

export const updateEvent = async (req, res) => {
  const { event_name, event_date, location, notes } = req.body;
  const eventId = req.params.id;

  try {
    const { error } = await supabase
      .from('events')
      .update({
        event_name,
        event_date,
        location,
        notes
      })
      .eq('event_id', eventId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.redirect('/acara');
  } catch (error) {
    res.render('form/acara', {
      error: error.message,
      user: req.user,
      event: req.body,
      isEdit: true
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('event_id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.redirect('/acara');
  } catch (error) {
    res.redirect('/acara');
  }
};