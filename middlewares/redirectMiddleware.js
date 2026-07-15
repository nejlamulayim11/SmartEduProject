import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        // Eğer token varsa doğruluğunu kontrol et
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Token geçersizse sayfaya girmesine izin ver
                next();
            } else {
                // Token geçerliyse ana sayfaya yolla
                return res.redirect('/');
            }
        });
    } else {
        // Hiç token yoksa login sayfasına girmesine izin ver
        next();
    }
};