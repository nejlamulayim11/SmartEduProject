import asynchandler from 'express-async-handler';
import Category from '../models/Category.js';

const createCategory = asynchandler(async (req, res) => {
    try {
        const category = await Category.create(req.body);
        req.flash("success", `${category.name} category has been created successfully`);
        res.status(201).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            error,
        });
    }
});

const deleteCategory = asynchandler(async (req, res) => {
    try {
        const category = await Category.findByIdAndRemove(req.params.id);

        req.flash("success", `${category.name} has been removed successfully`);
        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            error,
        });
    }
});

export default {
    createCategory,
    deleteCategory,
};
