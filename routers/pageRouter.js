import express from "express";
import pageController from '../controllers/pageController.js';
import redirectMiddleware from '../middlewares/redirectMiddleware.js'

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pages
 *   description: Sayfa yönlendirmeleri ve içerik sayfaları
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Ana sayfayı getirir
 *     tags: [Pages]
 *     responses:
 *       200: { description: "Ana sayfa yüklendi" }
 */
router.route('/').get(pageController.getIndexPage);

/**
 * @swagger
 * /about:
 *   get:
 *     summary: Hakkımızda sayfasını getirir
 *     tags: [Pages]
 *     responses:
 *       200: { description: "Hakkımızda sayfası yüklendi" }
 */
router.route('/about').get(pageController.getAboutPage);

/**
 * @swagger
 * /contact:
 *   get:
 *     summary: İletişim sayfasını getirir
 *     tags: [Pages]
 *     responses:
 *       200: { description: "İletişim sayfası yüklendi" }
 *   post:
 *     summary: İletişim formundan mail gönderir
 *     tags: [Pages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               message: { type: string }
 *     responses:
 *       200: { description: "Mail gönderildi" }
 */
router.route('/contact').get(pageController.getContactPage).post(pageController.sendEmail);

/**
 * @swagger
 * /register:
 *   get:
 *     summary: Kayıt sayfasını getirir
 *     tags: [Pages]
 *     responses:
 *       200: { description: "Kayıt sayfası yüklendi" }
 */
router.route('/register').get(redirectMiddleware, pageController.getRegisterPage);

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Giriş sayfasını getirir
 *     tags: [Pages]
 *     responses:
 *       200: { description: "Giriş sayfası yüklendi" }
 */
router.route('/login').get(redirectMiddleware, pageController.getLoginPage);

export default router;