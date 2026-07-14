import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import flash from 'connect-flash';
import methodOverride from 'method-override';
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
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'my_keyboard_cat',
    resave: false,
    saveUninitialized: true,
 
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/smartedu' })
}))
app.use(flash());
app.use((req, res, next) => {
    res.locals.flashMessage = req.flash();
    next();
})
app.use(methodOverride('_method', {
    methods: ['POST', 'GET'],
})
);


//Routers
app.use('*', (req, res, next) => {
    userIN = req.session.userID;
    next();
});
app.use('/', pageRouter);
app.use('/courses', coursesRouter);
app.use('/categories', categoryRouter);
app.use('/users', userRouter);

const port = 3000;
app.listen(port, () => {
    //console.log(`Server started on port ${port}...`);
    
        mongoose.connect('mongodb://127.0.0.1:27017/smartedu', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
        .then(() => console.log('Connnected DB'))
        .catch((error) => console.log(error));
});
