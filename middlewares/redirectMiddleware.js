export default async (req, res, next) => {
    if (req.session.userID) {
        return res.redirect('/');
    }
    next();
}
