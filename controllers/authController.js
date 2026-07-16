import Blacklist from '../models/Blacklist.js';
import asynchandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';

// 1. Kayıt Olma (Yönlendirme için 'redirect' bilgisi ekledik)
const createUser = asynchandler(async (req, res) => {
    try {
        await User.create(req.body);
        res.status(201).json({ status: 'success', message: 'Kullanıcı başarıyla oluşturuldu', redirect: '/login' });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: 'Kullanıcı oluşturulamadı', error: error.message });
    }
});

// 2. Giriş Yapma
const loginUser = asynchandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ status: 'fail', message: 'Kullanıcı bulunamadı!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ status: 'fail', message: 'Şifre hatalı!' });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });

    res.status(200).json({ status: 'success', accessToken, refreshToken });
});

// 3. Çıkış Yapma
const logoutUser = asynchandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        const token = authHeader.split(' ')[1];
        await Blacklist.create({ token });
    }
    res.status(200).json({ status: 'success', message: 'Çıkış yapıldı' });
});

// 4. Token Yenileme (Refresh)
const refreshToken = asynchandler(async (req, res) => {
    const refreshToken = req.headers['x-refresh-token'];
    if (!refreshToken) return res.status(401).json({ status: 'fail', message: 'Refresh token eksik' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ status: 'fail', message: 'Geçersiz kullanıcı' });

        const newAccessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(200).json({ status: 'success', accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ status: 'fail', message: 'Refresh token geçersiz veya süresi dolmuş' });
    }
});

// 5. Dashboard (Render işlemi - Sadece authMiddleware ile gelen kullanıcı için)
const getDashboardPage = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('courses');
    const courses = await Course.find({ user: req.user._id }).sort('-createdAt');
    const users = await User.find();
    const categories = await Category.find();
    
    res.status(200).render('dashboard', {
        page_name: 'dashboard',
        user, users, categories, courses
    });
});

// 6. Silme ve Güncelleme
const deleteUser = asynchandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    await Course.deleteMany({ user: req.params.id });
    res.status(200).json({ status: 'success', message: 'Kullanıcı silindi' });
});

const updateUser = asynchandler(async (req, res) => {
    const { name, email, role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, email, role }, { new: true });
    res.status(200).json({ status: 'success', message: 'Kullanıcı güncellendi' });
});

export default {
    createUser, loginUser, logoutUser, refreshToken, getDashboardPage, deleteUser, updateUser
};