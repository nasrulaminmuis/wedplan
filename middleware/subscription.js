import { supabase } from '../models/supabase.js';

export const checkSubscription = async (req, res, next) => {
    try {
        // Jika user belum login, skip middleware
        if (!req.user) {
            res.locals.subscription = { plan_name: 'Gratis' };
            return next();
        }

        // Cek subscription aktif user
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Subscription check error:', error);
        }

        // Set subscription info ke res.locals agar bisa diakses di view
        res.locals.subscription = subscription || { plan_name: 'Gratis' };
        
        next();
    } catch (error) {
        console.error('Middleware error:', error);
        res.locals.subscription = { plan_name: 'Gratis' };
        next();
    }
};
