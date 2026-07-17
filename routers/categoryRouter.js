import express from "express";
import categoryController from '../controllers/categoryController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Kategori yönetimi işlemleri
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Yeni bir kategori oluşturur
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kategori başarıyla oluşturuldu
 */
router.route('/').post(categoryController.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Kategoriyi siler
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kategori başarıyla silindi
 */
router.route('/:id').delete(categoryController.deleteCategory);

export default router;