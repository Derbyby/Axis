// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Crear el transporter (Usando Gmail como ejemplo)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ed.saucedo1020@gmail.com', // <--- CORREO REAL AQUÍ
            pass: 'nvae sdtd kzlr gikm' // <--- APP PASSWORD DE GMAIL AQUÍ
        }
    });

    // 2. Definir el email
    const mailOptions = {
        from: '"Axis App" <ed.saucedo1020@gmail.com>',
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // 3. Enviar
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;