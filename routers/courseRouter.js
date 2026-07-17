import express from "express";
import courseController from '../controllers/courseController.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Kurs yönetimi işlemleri
 */

// KURS OLUŞTURMA VE LİSTELEME
/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Yeni kurs oluşturur (Sadece öğretmen/admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201: { description: "Kurs oluşturuldu" }
 *   get:
 *     summary: Tüm kursları listeler
 *     tags: [Courses]
 *     responses:
 *       200: { description: "Kurs listesi" }
 */
router.route('/').post(authMiddleware, roleMiddleware(['teacher', 'admin']), courseController.createCourse)
              .get(courseController.getAllCourses);

// KURS DETAY, SİLME VE GÜNCELLEME
/**
 * @swagger
 * /courses/{slug}:
 *   get:
 *     summary: Kurs detayını getirir
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Kurs detayı" }
 *   delete:
 *     summary: Kursu siler (Sadece öğretmen/admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Kurs silindi" }
 *   put:
 *     summary: Kursu günceller (Sadece öğretmen/admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Kurs güncellendi" }
 */
router.route('/:slug').get(courseController.getCourse)
    .delete(authMiddleware, roleMiddleware(['teacher', 'admin']), courseController.deleteCourse)
    .put(authMiddleware, roleMiddleware(['teacher', 'admin']), courseController.updateCourse);

// KURSA KAYIT
/**
 * @swagger
 * /courses/enroll:
 *   post:
 *     summary: Kurssa kayıt olur
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: "Kayıt başarılı" }
 */
router.route('/enroll').post(authMiddleware, courseController.enrollCourse);

// KURSTAN ÇIKMA
/**
 * @swagger
 * /courses/release:
 *   post:
 *     summary: Kurstan çık
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: "Kurstan çıkıldı" }
 */
router.route('/release').post(authMiddleware, courseController.releaseCourse);

export default router;