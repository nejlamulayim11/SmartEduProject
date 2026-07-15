import express from "express";
import courseController from '../controllers/courseController.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // EKLENDİ: Bekçiyi içeri aldık

const router = express.Router();

// http://localhost:3000/courses/

// KURS OLUŞTURMA: Sadece giriş yapmış olan Öğretmenler ve Adminler
router.route('/').post(
    authMiddleware, 
    roleMiddleware(['teacher', 'admin']), 
    courseController.createCourse
);

// KURS LİSTELEME VE DETAY: Herkese açık
router.route('/').get(courseController.getAllCourses);
router.route('/:slug').get(courseController.getCourse);

// KURS SİLME: Sadece giriş yapmış olan Öğretmenler ve Adminler
router.route('/:slug').delete(
    authMiddleware, 
    roleMiddleware(['teacher', 'admin']), 
    courseController.deleteCourse
);

// KURS GÜNCELLEME: Sadece giriş yapmış olan Öğretmenler ve Adminler
router.route('/:slug').put(
    authMiddleware, 
    roleMiddleware(['teacher', 'admin']), 
    courseController.updateCourse
);

// KURSA KAYIT OLMA (Enroll): Sadece giriş yapmış kullanıcılar (Öğrenciler vs.)
router.route('/enroll').post(
    authMiddleware, 
    courseController.enrollCourse
);

// KURSTAN ÇIKMA (Release): Sadece giriş yapmış kullanıcılar
router.route('/release').post(
    authMiddleware, 
    courseController.releaseCourse
);

export default router;