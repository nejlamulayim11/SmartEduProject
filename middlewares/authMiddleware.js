import Blacklist from '../models/Blacklist.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let accessToken;

        if (authHeader && authHeader.startsWith('Bearer')) {
            accessToken = authHeader.split(' ')[1];
        }

        // 1. TOKEN YOKSA (F5 atıldıysa veya normal linke tıklandıysa)
        if (!accessToken) {
            // İstek tarayıcıdan (HTML) geliyorsa logine at, API ise JSON dön
            if (req.accepts('html')) return res.redirect('/login');
            return res.status(401).json({ status: 'fail', message: 'Lütfen giriş yapın (Token bulunamadı)' });
        }

        // 2. KARA LİSTE KONTROLÜ
        const isBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (isBlacklisted) {
            if (req.accepts('html')) return res.redirect('/login');
            return res.status(401).json({ status: 'fail', message: 'Bu oturum sonlandırılmış, tekrar giriş yapın' });
        }

        // 3. TOKEN DOĞRULAMA
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            
            if (!user) {
                if (req.accepts('html')) return res.redirect('/login');
                return res.status(401).json({ status: 'fail', message: 'Kullanıcı bulunamadı' });
            }

            res.locals.userIN = user;
            req.user = user; 
            next();

        } catch (error) {
            // Süresi dolmuşsa veya geçersizse
            if (req.accepts('html')) return res.redirect('/login');
            return res.status(401).json({ status: 'fail', message: 'Geçersiz veya süresi dolmuş Token' });
        }
    } catch (error) {
        if (req.accepts('html')) return res.redirect('/login');
        return res.status(500).json({ status: 'error', message: 'Sunucu hatası' });
    }
};