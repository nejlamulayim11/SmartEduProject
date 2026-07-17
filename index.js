import Blacklist from './models/Blacklist.js';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

// SWAGGER İMPORTLARI
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import pageRouter from './routers/pageRouter.js';
import coursesRouter from './routers/courseRouter.js';
import categoryRouter from './routers/categoryRouter.js';
import userRouter from './routers/userRouter.js';

const app = express();
dotenv.config();

// --- SWAGGER KONFİGÜRASYONU ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SmartEDU API',
            version: '1.0.0',
            description: 'SmartEDU Projesi API Dokümantasyonu'
        },
        servers: [{ url: 'http://localhost:3000' }],
        // Yetkilendirme butonunun aktif olması için gereken yapı:
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./routers/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Template Engine
app.set('view engine', 'ejs');

// Global Variable 
global.userIN = null;

// Middlewares
app.use(express.static('public'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.set('trust proxy', 1);
app.use(session({
    secret: 'my_keyboard_cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/smartedu' })
}));
app.use(flash());

// SWAGGER ROUTE
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
    res.locals.flashMessage = req.flash();
    next();
});
app.use(methodOverride('_method', {
    methods: ['POST', 'GET'],
}));

// Routers - BEARER TOKEN DESTEKLİ GÜNCEL GLOBAL MIDDLEWARE
app.use('*', async (req, res, next) => {
    global.userIN = null;
    res.locals.userIN = null;

    const authHeader = req.headers.authorization;
    let accessToken;

    if (authHeader && authHeader.startsWith('Bearer')) {
        accessToken = authHeader.split(' ')[1];
    }

    if (!accessToken) {
        return next();
    }

    try {
        const isBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (isBlacklisted) {
            return next(); 
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user) {
            global.userIN = user._id;
            res.locals.userIN = user;
        }
    } catch (error) {
        // Token geçersizse misafir olarak devam et
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