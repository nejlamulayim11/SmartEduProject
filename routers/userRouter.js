import express from "express";
import { body } from 'express-validator';
import User from "../models/User.js";
import authController from "../controllers/authController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// http://localhost:3000/users/signup
router.route('/signup').post(
    [
        body('name').not().isEmpty().withMessage('Please enter your name'),
        body('email').custom(async (userEmail) => {
            const user = await User.findOne({ email: userEmail });
            if (user) {
                throw new Error('E-mail already in use!');
            }
        }),
        body('password').not().isEmpty().withMessage('Please enter a password'),
    ],
    authController.createUser
);

router.route('/login').post(authController.loginUser);
router.route('/logout').get(authController.logoutUser);
router.route('/refresh-token').get(authController.refreshToken); // Eklendi
router.route('/dashboard').get(authMiddleware, authController.getDashboardPage);

router.route('/:id')
    .delete(authController.deleteUser)
    .put(authController.updateUser);

export default router;