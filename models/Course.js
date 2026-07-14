import mongoose from 'mongoose';
import slugify from 'slugify';

const CourseSchema = new mongoose.Schema({
    name: {
        type: String, 
        unique: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    slug: {
        type: String,
        unique: true,
    },
    category: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

// We created slug for course ids
CourseSchema.pre('validate', function (next) {
    this.slug = slugify(this.name, {
        lower: true,
        strict: true,
    });
    next();
});

export default mongoose.model('Course', CourseSchema);
