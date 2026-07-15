import Blacklist from '../models/Blacklist.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async (req, res, next) => {
    try {
        const accessToken = req.cookies.jwt;
        const refreshToken = req.cookies.refreshToken;

        // Hiç token yoksa direkt login'e at
        if (!accessToken && !refreshToken) {
            return res.redirect('/login');
        }

        // --- KARA LİSTE (BLACKLIST) KONTROLLERİ BAŞLANGICI ---
        if (accessToken) {
            const isBlacklisted = await Blacklist.findOne({ token: accessToken });
            if (isBlacklisted) {
                return res.redirect('/login'); // Token kara listedeyse direkt reddet
            }
        }

        if (refreshToken) {
            const isRefreshBlacklisted = await Blacklist.findOne({ token: refreshToken });
            if (isRefreshBlacklisted) {
                return res.redirect('/login'); // Refresh token kara listedeyse direkt reddet
            }
        }
        // --- KARA LİSTE KONTROLLERİ BİTİŞİ ---

        try {
            // 1. ADIM: Access Token'ı doğrulamaya çalış
            if (accessToken) {
                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId);
                if (user) return next(); // Her şey yolundaysa devam et
            }
        } catch (error) {
            // Eğer Access Token'ın SÜRESİ DOLMUŞSA (TokenExpiredError) hatayı yakala
            if (error.name !== 'TokenExpiredError') {
                return res.redirect('/login'); // Başka bir hataysa (sahte token vs) login'e at
            }
        }

        // 2. ADIM: Access Token yok veya süresi dolmuş, o zaman Refresh Token'a bak
        if (refreshToken) {
            try {
                // Refresh token geçerli mi?
                const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                const user = await User.findById(decodedRefresh.userId);

                if (!user) return res.redirect('/login');

                // SİHİR BURADA: Kullanıcıya çaktırmadan yeni bir Access Token üret
                const newAccessToken = jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN }
                );

                // Yeni Access Token'ı çereze yaz (15 dakika)
                res.cookie('jwt', newAccessToken, {
                    httpOnly: true,
                    maxAge: 1000 * 60 * 15
                });

                return next(); // İşleme kaldığı yerden devam etmesini sağla
            } catch (refreshError) {
                // Refresh token da bozuk veya süresi dolmuşsa yapacak bir şey yok, tekrar giriş yapmalı
                return res.redirect('/login');
            }
        } else {
            return res.redirect('/login');
        }

    } catch (error) {
        return res.redirect('/login');
    }
};