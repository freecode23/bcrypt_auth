// any route that we want to protect we use this



module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {

            // no cache so when logged out, cant browser back button to reload page, forces reload
            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/users/login');
    },


    // what is this code doing? how come I can still see dashboard if this is not there
    // forwardAuthenticated: function(req, res, next) {
    //     if (!req.isAuthenticated()) {
    //         return next();
    //     }
    //     res.redirect('/dashboard');
    // }
};