import express from "express";
import { body } from 'express-validator';
import User from "../models/User.js";
import authController from "../controllers/authController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Kullanıcı yönetimi işlemleri
 */

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: "Kullanıcı başarıyla oluşturuldu" }
 */
router.route('/signup').post(
    [
        body('name').not().isEmpty().withMessage('Please enter your name'),
        body('email').custom(async (userEmail) => {
            const user = await User.findOne({ email: userEmail });
            if (user) throw new Error('E-mail already in use!');
        }),
        body('password').not().isEmpty().withMessage('Please enter a password'),
    ],
    authController.createUser
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Kullanıcı girişi yapar
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: "Giriş başarılı, token döndürülür" }
 */
router.route('/login').post(authController.loginUser);

/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Kullanıcı çıkışı yapar
 *     tags: [Users]
 *     responses:
 *       200: { description: "Çıkış başarılı" }
 */
router.route('/logout').get(authController.logoutUser);

/**
 * @swagger
 * /users/dashboard:
 *   get:
 *     summary: Kullanıcı dashboard sayfasını getirir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: "Dashboard sayfası yüklendi" }
 */
router.route('/dashboard').get(authMiddleware, authController.getDashboardPage);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Kullanıcıyı siler
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Kullanıcı silindi" }
 */
router.route('/:id')
    .delete(authController.deleteUser)
    .put(authController.updateUser);

export default router;