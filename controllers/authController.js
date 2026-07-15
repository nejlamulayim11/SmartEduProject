import asynchandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';

const createUser = asynchandler(async (req, res) => {
    try {
        const user = await User.create(req.body);
        if (req.session.role === 'admin') {
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
                    req.session.userID = user._id;
                    req.session.role = user.role;
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

const logoutUser = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

const getDashboardPage = asynchandler(async (req, res) => {
    const user = await User.findOne({ _id: req.session.userID }).populate('courses');
    const users = await User.find();
    const categories = await Category.find();
    const courses = await Course.find({ user: req.session.userID }).sort('-createdAt');
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