import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["student", 'teacher', 'admin'],
        default: 'student',
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }]
});


UserSchema.pre('validate', function (next) {
    const user = this;
    // NOTE: Şifre hashleme işlemini burda yapınca mongoose paketi şifreyi
    // değiştirebiliyor o yüzden fonksyonu ` isModified ` fonksyonu ile yazdık.
    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, 10, (error, hash) => {
        user.password = hash;
        next();
    });
});

export default mongoose.model('User', UserSchema);
