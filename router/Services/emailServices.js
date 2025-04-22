const sendEmail = require('../libs/mailer');
const pool = require('../../libs/postgres.pool');
class emailService{
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.error(err));
      }
    async enviarCorreoEmpresa (empresaId, datosUsuario) {
        // Obtener datos SMTP de la empresa desde la BD
        const configCorreo = await pool.getConfigCorreoEmpresa(empresaId);
        // Ejemplo del resultado:
        // {
        //   host: 'smtp.gmail.com',
        //   port: 587,
        //   user: 'correo@empresa.com',
        //   pass: 'clave',
        //   nombreEmpresa: 'Empresa X'
        // }
      
        const html = `<h1>Hola ${datosUsuario.nombre}</h1><p>Bienvenido a ${configCorreo.nombreEmpresa}</p>`;
      
        await sendEmail(configCorreo, {
          to: datosUsuario.email,
          subject: `¡Bienvenido a ${configCorreo.nombreEmpresa}!`,
          html
        });
      };
}
module.exports=emailService;
