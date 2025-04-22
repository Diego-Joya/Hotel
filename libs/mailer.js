const nodemailer = require('nodemailer');

/**
 * Envía un correo con configuración dinámica
 * @param {Object} config - Configuración SMTP
 * @param {Object} correo - Datos del correo
 */
const sendEmail = async (config, correo) => {
  const transporter = nodemailer.createTransport({
    host: config.host,        // ej: smtp.gmail.com
    port: config.port || 587, // puedes ajustar según el servidor
    secure: config.secure || false, // true para 465, false para otros
    auth: {
      user: config.user,      // correo de la empresa
      pass: config.pass       // clave del correo
    }
  });

  return transporter.sendMail({
    from: `"${config.nombreEmpresa}" <${config.user}>`,
    to: correo.to,
    subject: correo.subject,
    html: correo.html,
    text: correo.text
  });
};

module.exports = sendEmail;
