import Blacklist from './models/Blacklist.js';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser'; // EKLENDİ
import jwt from 'jsonwebtoken'; // EKLENDİ
import User from './models/User.js'; // EKLENDİ

import pageRouter from './routers/pageRouter.js';
import coursesRouter from './routers/courseRouter.js';
import categoryRouter from './routers/categoryRouter.js';
import userRouter from './routers/userRouter.js';

const app = express();
dotenv.config();

// Template Engine
app.set('view engine', 'ejs');

// Global Variable 
global.userIN = null;

// Middlewares
app.use(express.static('public'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); // EKLENDİ
app.set('trust proxy', 1);
app.use(session({
    secret: 'my_keyboard_cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/smartedu' })
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.flashMessage = req.flash();
    next();
});
app.use(methodOverride('_method', {
    methods: ['POST', 'GET'],
}));

// Routers - REFRESH TOKEN VE BLACKLIST DESTEKLİ GÜNCEL GLOBAL MIDDLEWARE
app.use('*', async (req, res, next) => {
    const accessToken = req.cookies.jwt;
    const refreshToken = req.cookies.refreshToken;

    // --- KARA LİSTE KONTROLÜ (EKLENDİ) ---
    if (accessToken) {
        const isBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (isBlacklisted) {
            global.userIN = null;
            res.locals.userIN = null;
            return next(); // Kara listedeyse sonraki middleware'e geç (misafir olarak devam et)
        }
    }

    if (refreshToken) {
        const isRefreshBlacklisted = await Blacklist.findOne({ token: refreshToken });
        if (isRefreshBlacklisted) {
            global.userIN = null;
            res.locals.userIN = null;
            return next(); // Refresh token da kara listedeyse misafir yap
        }
    }
    // ------------------------------------

    try {
        if (accessToken) {
            // 1. Access Token varsa ve geçerliyse doğrula
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (user) {
                global.userIN = user._id;
                res.locals.userIN = user;
                return next();
            }
        }
    } catch (error) {
        // Access Token süresi dolmuşsa hatayı görmezden gel, aşağıdaki Refresh Token adımına geçecek
    }

    // 2. Access Token yoksa veya süresi dolmuşsa Refresh Token'ı kontrol et
    if (refreshToken) {
        try {
            const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decodedRefresh.userId);

            if (user) {
                // Kullanıcıya hissettirmeden yeni bir Access Token üret (Örn: 15 dk)
                const newAccessToken = jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN }
                );

                // Yeni Access Token'ı çereze yaz
                res.cookie('jwt', newAccessToken, {
                    httpOnly: true,
                    maxAge: 1000 * 60 * 15 // 15 dakika
                });

                global.userIN = user._id;
                res.locals.userIN = user;
                return next();
            }
        } catch (refreshError) {
            // Refresh token da geçersiz veya süresi dolmuşsa yapacak bir şey yok
            global.userIN = null;
            res.locals.userIN = null;
        }
    } else {
        // Hiç token yoksa
        global.userIN = null;
        res.locals.userIN = null;
    }
    
    next();
});

app.use('/', pageRouter);
app.use('/courses', coursesRouter);
app.use('/categories', categoryRouter);
app.use('/users', userRouter);

const port = 3000;
app.listen(port, () => {
    mongoose.connect('mongodb://127.0.0.1:27017/smartedu', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connected DB'))
    .catch((error) => console.log(error));
});