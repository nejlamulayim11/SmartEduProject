import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Category from '../models/Category.js';

const getIndexPage = async (req, res) => {

    const courses = await Course.find().sort('-createdAt').limit(2)
    const totalCourse = await Course.find().countDocuments();
    const totalTeacher = await User.countDocuments({ role: 'teacher' });
    const totalStudent = await User.countDocuments({ role: 'student' });

    res.status(200).render('index', {
        page_name: 'index',
        courses,
        totalCourse,
        totalTeacher,
        totalStudent,
    });
};

const getAboutPage = (req, res) => {
    res.status(200).render('about', {
        page_name: 'about',
    });
};

const getRegisterPage = (req, res) => {
    res.status(200).render('register', {
        page_name: 'register',
    });
};

const getLoginPage = (req, res) => {
    res.status(200).render('login', {
        page_name: 'login',
    });
};

const getContactPage = (req, res) => {
    res.status(200).render('contact', {
        page_name: 'contact',
    });
};

const sendEmail = async (req, res) => {

    try {
        // Formdan gelen verileri terminalde görmek için eklendi:
        console.log("FORM'DAN GELEN VERİLER: ", req.body);

        // req.body.name yerine ejs dosyasındaki name attribute'u olan req.body.fname kullanıldı:
        const outputMessage = `
        <h1> Message Detail </h1>
        <ul>
            <li>Name: ${req.body.fname} </li>
            <li>Email: ${req.body.email} </li>
        <ul>
        <h1> Message </h1>
        <p>${req.body.message}</p>
        `
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: 'examplemail@gmail.com', // Kendi gmail adresini yazmalısın
                pass: 'password'  // Gmail 16 haneli uygulama şifreni yazmalısın
            }
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Smart EDU Contact Form 👻" <examplesender@gmail.com>', // Kimden gittiği
            to: "exampleto@gmail.com", // Kime gideceği (kendine gönderiyorsun)
            subject: "Smart EDU Contact Form New Message ✔", // Subject line
            html: outputMessage, // html body
        });

        console.log("Message sent: %s", info.messageId);

        req.flash("success", "We Received your message succesfully")
        res.status(200).redirect('/contact')
    } catch (err) {
        // Hatayı VS Code terminalinde görebilmek için eklendi:
        console.log("MAIL GÖNDERME HATASI: ", err);

        req.flash("error", `Something happened: ERROR!`)
        res.status(400).redirect('/contact')
    }
};

export default {
    getIndexPage,
    getAboutPage,
    getRegisterPage,
    getLoginPage,
    getContactPage,
    sendEmail,
}