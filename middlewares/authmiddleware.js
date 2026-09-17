export const isAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

export const isGuest = (req, res, next) => {
    if (req.session && req.session.user) {
        if (req.session.user.role === 'admin' || req.session.user.role === 'charge_clientele') {
            return res.redirect('/admin/dashboard');
        }
        return res.redirect('/client/dashboard');
    }
    next();
};

export const hasRole = (roles) => {
    return (req, res, next) => {
        if (req.session.user && roles.includes(req.session.user.role)) {
            return next();
        }
        res.status(403).send('Accès refusé.');
    };
};