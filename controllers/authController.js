import asynchandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Category from '../models/Category.js'
import Course from '../models/Course.js';

const createUser = asynchandler(async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).redirect('/login');
    } catch (error) {
        const errors = validationResult(req);

        for (let i = 0; i < errors.array().length; i++) {
            req.flash("error", `${errors.array()[i].msg}`);
        }
        res.status(400).redirect('/register');
    }
});

const loginUser = asynchandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            bcrypt.compare(password, user.password, (err, same) => {
                if (same) {
                    req.session.userID = user._id;
                    res.status(200).redirect('/users/dashboard');
                } else {
                    req.flash("error", "Your password is not correct!");
                    res.status(400).redirect('/login');
                }
            });
        } else {
            req.flash("error", "User is not exist!");
            res.status(400).redirect('/login');
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status: 'fail',
            error,
        });
    }
});

const logoutUser = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

// Kullanıcı giriş yaptıktan sonra görünen bir sayfa ve 
// kullanıcı rollerine göre şekilleneceği için buırda tanımlı
const getDashboardPage = asynchandler(async (req, res) => {
    const user = await User.findOne({ _id: req.session.userID }).populate('courses')
    const users = await User.find();
    const categories = await Category.find();
    const courses = await Course.find({ user: req.session.userID }).sort('-createdAt')
    res.status(200).render('dashboard', {
        page_name: 'dashboard',
        user,
        users,
        categories,
        courses,
    });
});

const deleteUser = asynchandler(async (req, res) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id);
        await Course.deleteMany({ user: req.params.id })

        req.flash("success", `${user.name} has been removed successfully`);
        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            error,
        });
    }
});

export default {
    createUser,
    loginUser,
    logoutUser,
    getDashboardPage,
    deleteUser,
};
