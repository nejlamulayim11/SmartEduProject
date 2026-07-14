import express from "express";
import { body } from 'express-validator';
import User from "../models/User.js";
import authController from "../controllers/authController.js";
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

// http://localhost:3000/users/signup
router.route('/signup').post(
    [
        body('name').not().isEmpty().withMessage('Please enter your name'),

        // Alttaki işlemle aynı görevi yapmaktadır.
        // body('email').isEmail().withMessage('Please enter valid email')
        //     .custom((userEmail) => {
        //         return User.findOne({ email: userEmail }).then(user => {
        //             if (user) {
        //                 return Promise.reject('Email is already exists!')
        //             }
        //         })
        //     }),
        body('email').custom(async (userEmail) => {
            const user = await User.findOne({ email: userEmail });
            if (user) {
                throw new Error('E-mail already in use!');
            }
        }),

        body('password').not().isEmpty().withMessage('Please enter your a password'),
    ],
    authController.createUser);
router.route('/login').post(authController.loginUser);
router.route('/logout').get(authController.logoutUser);
router.route('/dashboard').get(authMiddleware, authController.getDashboardPage);
router.route('/:id').delete(authController.deleteUser);

export default router;  