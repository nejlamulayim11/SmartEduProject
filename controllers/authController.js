import Blacklist from '../models/Blacklist.js'; // EKLENDİ
import asynchandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';

const createUser = asynchandler(async (req, res) => {
    try {
        const user = await User.create(req.body);
        if (res.locals.userIN && res.locals.userIN.role === 'admin') {
            req.flash("success", "User created successfully");
            res.status(201).redirect('/users/dashboard');
        } else {
            res.status(201).redirect('/login');
        }
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
                    // 1. Kısa ömürlü Access Token (örn: 15 Dakika)
                    const accessToken = jwt.sign(
                        { userId: user._id },
                        process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_EXPIRES_IN }
                    );

                    // 2. Uzun ömürlü Refresh Token (örn: 7 Gün)
                    const refreshToken = jwt.sign(
                        { userId: user._id },
                        process.env.REFRESH_TOKEN_SECRET,
                        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
                    );

                    // 3. Access Token'ı Cookie'ye yaz (15 Dakika)
                    res.cookie('jwt', accessToken, {
                        httpOnly: true,
                        maxAge: 1000 * 60 * 1 
                    });

                    // 4. Refresh Token'ı Cookie'ye yaz (7 Gün)
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        maxAge: 1000 * 60 * 60 * 24 * 7 
                    });

                    res.status(200).redirect('/users/dashboard');
                } else {
                    req.flash("error", "Your password is not correct!");
                    res.status(400).redirect('/login');
                }
            });
        } else {
            req.flash("error", "User does not exist!");
            res.status(400).redirect('/login');
        }
    } catch (error) {
        res.status(400).json({ status: 'fail', error });
    }
});

const logoutUser = asynchandler(async (req, res) => {
    const accessToken = req.cookies.jwt;
    const refreshToken = req.cookies.refreshToken;

    // Eğer tarayıcıda token varsa, onları veritabanındaki Kara Listeye ekle
    if (accessToken) {
        await Blacklist.create({ token: accessToken });
    }
    if (refreshToken) {
        await Blacklist.create({ token: refreshToken });
    }

    // Kara listeye aldıktan sonra çerezleri sil ve anasayfaya at
    res.cookie('jwt', '', { maxAge: 1 });
    res.cookie('refreshToken', '', { maxAge: 1 });
    res.redirect('/');
});

const getDashboardPage = asynchandler(async (req, res) => {
    const user = await User.findOne({ _id: res.locals.userIN._id }).populate('courses');
    const users = await User.find();
    const categories = await Category.find();
    const courses = await Course.find({ user: res.locals.userIN._id }).sort('-createdAt');
    const totalCourses = await Course.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });

    res.status(200).render('dashboard', {
        page_name: 'dashboard',
        user, users, categories, courses,
        totalCourses, totalTeachers
    });
});

const deleteUser = asynchandler(async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        await Course.deleteMany({ user: req.params.id });
        req.flash("success", `${user.name} has been removed successfully`);
        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).json({ status: 'fail', error });
    }
});

const updateUser = asynchandler(async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { name, email, role }, { new: true });
        req.flash("success", `${user.name} updated successfully`);
        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).json({ status: 'fail', error });
    }
});

export default {
    createUser,
    loginUser,
    logoutUser,
    getDashboardPage,
    deleteUser,
    updateUser
};