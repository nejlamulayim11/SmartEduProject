import User from '../models/User.js';

export default async (req, res, next) => {
    await User.findById(req.session.userID)
        .then((user) => {
            if (!user) {
                return res.redirect('/login');
            }
            next();
        })
        .catch((err) => { return res.redirect('/login'); });
}
