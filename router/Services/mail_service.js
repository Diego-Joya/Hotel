const nodemailer = require("nodemailer");
const pool = require("../../libs/postgres.pool");

class mail_service {
  constructor() {
    this.pool = pool;
  }

  // Envío genérico: recibe la config SMTP y la info del correo
  async sendMail(config, info) {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.sendMail(info);
    return { ok: true, message: "correo enviado exitosamente" };
  }

  // Config fija del sistema (variables de entorno) — para recovery, notificaciones internas, etc.
  getConfigSistema() {
    return {
      host: "smtp.gmail.com",
      port: 465,
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    };
  }

  // Config dinámica por empresa/hotel desde la BD
  async getConfigCorreoEmpresa(empresaId) {
    const { rows } = await this.pool.query(
      `SELECT host, port, usuario AS user, clave AS pass, nombre_empresa
       FROM config_correo
       WHERE empresa_id = $1`,
      [empresaId]
    );
    if (!rows[0]) {
      throw new Error(`No hay configuración de correo para empresa ${empresaId}`);
    }
    return rows[0];
  }

  // --- Plantillas ---

  buildRecoveryEmail(toEmail, link) {
    return {
      from: process.env.MAIL_FROM,
      to: toEmail,
      subject: "SOLICITUD CAMBIO DE CLAVE",
      text: "Hello world?", // plain text body
      html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
          <head>

                  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <meta name="x-apple-disable-message-reformatting">
                  <meta http-equiv="X-UA-Compatible" content="IE=edge">

              <title>recuperacion de contraseña</title>
              <meta charset="UTF-8">

          </head>
          <style>
          .one{
       font-family:'Lato',sans-serif;
       bleed:presentation;
      scroll-padding:"0";
      letter-spacing:"0";
      width:"100%"
      border="0";

      }
      .td1{
       overflow-wrap:break-word;word-break:break-word;
       padding:40px 40px 30px;
       font-family:'Lato',sans-serif;
       box-align:"center"
      }
      .div1{
      line-height: 110%;
       text-align: center;
       word-wrap: break-word;
      }
      .p1{
      font-size: 14px;
       line-height: 110%;
      }
      .p2{
      font-size: 14px;
       line-height: 110%;
      }
      .p3{
       font-size: 14px;
        line-height: 110%;
      }
      .p4{
       font-size: 14px;
       line-height: 110%;
      }
      .p5{
      font-size: 14px;
       line-height: 110%;
      }
      .v-button{
       box-sizing: border-box;display: inline-block;
       font-family:'Lato',sans-serif;text-decoration: none;
      -webkit-text-size-adjust: none;
      text-align: center;
      color: #FFFFFF;
      background-color: #2c295e;
      border-radius: 1px;
      -webkit-border-radius: 1px;
      -moz-border-radius: 1px; width:auto;
      max-width:100%;
      overflow-wrap: break-word;
       word-break: break-word;
      word-wrap:break-word;
      mask-border-outset: none;

      }
      .span1{
       display:block;
      padding:15px 40px;
       line-height:120%;
       color:#FFFFFF;

      }
      .two{
       font-family:'Lato',sans-serif;
      bleed:presentacion;
      scroll-padding:"0";
      letter-spacing:"0";
      width:100%;
      border:0;
      }
      .td2{
      overflow-wrap:break-word;
      word-break:break-word;padding:40px 40px 30px;
       font-family:'Lato',sans-serif;
       box-align:"left";
      }
      .div2{
      line-height: 140%;
       text-align: center;
        word-wrap: break-word;
      }
      .p6{
      font-size: 14px;
      line-height: 140%;
      }
      .u-row-container {
      padding: 0px;
      background-color:transparent;
      }
      .u-row{Margin:0 auto;
       min-width: 320px;max-width: 600px;
       overflow-wrap: break-word;
       word-wrap: break-word;
       word-break: break-word;
       background-color: #1d195c;
      }
      .u-col #u-col-50{
      max-width: 320px;
      min-width: 300px;
      display: table-cell;
      vertical-align: top;}

      .u-col #u-col-50{
      max-width: 320px;
       min-width: 300px;
       display: table-cell;
       vertical-align: top;
      }
      .u-col #u-col-100{
       max-width: 320px;
       min-width: 600px;
       display: table-cell;
       vertical-align: top;}
       .u-row-container{
      padding: 0px;
       background-color: transparent;
      }
       .u-row{
       Margin: 0 auto;
      min-width: 320px;
      max-width: 600px;
       overflow-wrap: break-word;
       word-wrap: break-word;
       word-break: break-word;
       background-color:transparent;}

       .u-col #u-col-100{
       max-width: 320px;
      min-width: 600px;
      display: table-cell;
       vertical-align: top;}

       @media only screen and (min-width: 620px) {
          .u-row {
          width: 600px !important;
          }
          .u-row .u-col {
          vertical-align: top;
          }

          .u-row .u-col-50 {
          width: 300px !important;
          }

          .u-row .u-col-100 {
          width: 600px !important;
          }

          }

      @media (max-width: 620px) {
          .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
          }
          .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
          }
          .u-row {
          width: 100% !important;
          }
          .u-col {
          width: 100% !important;
          }
          .u-col > div {
          margin: 0 auto;
          }
          }
          body {
          margin: 0;
          padding: 0;
          align:center
          }

          table,
          tr,
          td {
          vertical-align: top;
          border-collapse: collapse;
          }

          p {
          margin: 0;
          }

          .ie-container table,
          .mso-container table {
          table-layout: fixed;
          }

          * {
          line-height: inherit;
          }

          a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
          }

          table, td { color: #000000; } #u_body a { color: #071477; text-decoration: underline; }
          .clean-body #u_body{
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: 100%;
              background-color:transparent;
              color: #000000}
             .clean-body #u_body{
              box-align:center
             }
          </style>
          <body class="clean-body u_body" >

        <table id="u_body">
          <tbody>
          <tr style="vertical-align: top">
            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">


        <div class="u-row-container"
          <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;">
            <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">


        <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
          <div style="height: 100%;width: 100% !important;">
         <div style="height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">

        <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:15px;font-family:'Lato',sans-serif;" align="left">

          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #f9f9f9;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                  <span>&#160;</span>
                </td>
              </tr>
            </tbody>
          </table>

              </td>
            </tr>
          </tbody>
        </table>

          </div>
          </div>
        </div>

            </div>
       </div>
        </div>



        <div class="u-row-container" style="padding: 0px;background-color: transparent">
          <div class="u-row"
          <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

        <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
          <div style="height: 100%;width: 100% !important;">
         <div style="height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">

        <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:25px 10px;font-family:'Lato',sans-serif;" align="left">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right: 0px;padding-left: 0px;" align="center">

              <img align="center" border="0" src="imagenes/logo.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 29%;max-width: 100px;" width="100px"/>

            </td>
          </tr>
        </table>

              </td>
            </tr>
          </tbody>
        </table>
        </div>
          </div>
        </div>

            </div>
          </div>
        </div>



        <div class="u-row-container" style="padding: 0px;background-color: transparent">
          <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #161a39;">
            <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

        <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
          <div style="height: 100%;width: 100% !important;">
        <div style="height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->

        <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:35px 10px 10px;font-family:'Lato',sans-serif;" align="left">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right: 0px;padding-left: 0px;" align="center">

              <img align="center" border="0" src="imagenes/logotipo.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 10%;max-width: 58px;" width="58"/>

            </td>
          </tr>
        </table>

              </td>
            </tr>
          </tbody>
        </table>

        <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 30px;font-family:'Lato',sans-serif;" align="left">

          <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
            <p style="line-height: 140%; text-align: center; font-size: 14px;"><span style="color: #ffffff;"><span style="font-size: 28px; line-height: 39.2px;">POR FAVOR, CAMBIE SU CONTRASEÑA</span></span></p>
          </div>

              </td>
            </tr>
          </tbody>
        </table>

          </div>
          </div>
        </div>

            </div>
          </div>
        </div>
              <div class="u-row-container" style="padding: 0px;background-color: transparent">
                  <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

                <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                  <div style="height: 100%;width: 100% !important;">
                  <div style="height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">

              <table class="one">
                  <tbody>
                    <tr>
                      <td class="td1" >

                  <div class="div1">
                    <p class="p1">Hola,</p>
                <p class="p2"> </p>
                <p class="p3"><br />Le hemos enviado este correo electrónico en respuesta a su solicitud de restablecer su contraseña en el nombre de la empresa.</p>
                <p class="p4"> </p>
                <p class="p5"><br />Para restablecer su contraseña, por favor siga el siguiente enlace:</p>
                  </div>

                      </td>
                    </tr>
                  </tbody>
                </table>
                 <div align="center">
                  <a href="${link}" target="_blank" class="v-button" >
                    <span class="span1">RESTABLECER CONTRASEÑA</span>
                  </a></div>
                  <table class="two">
              <tbody>
                <tr>
             <td class="td2">

                      <div class="div2">
                        <p class="p6">Ignore este correo electrónico si no solicitó un cambio de contraseña.</p>
                      </div>

                          </td>
                        </tr>
                      </tbody>
                    </table>
              </div>
          </body>
          <div class="u-row-container" >
              <div class="u-row" >
                <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

            <div class="u-col u-col-50" >
              <div style="height: 100%;width: 100% !important;">
              <div style="height: 100%; padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">

              </div>
              </div>
            </div>

            <div class="u-col u-col-50">
              <div style="height: 100%;width: 100% !important;">
              <div style="height: 100%; padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"> </div>
              </div>
            </div>

                </div>
              </div>
            </div>


      <div class="u-col u-col-100">
          <div style="height: 100%;width: 100% !important;">
         <div style="height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">

        <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:15px;font-family:'Lato',sans-serif;" align="left">

          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #1c103b;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                  <span>&#160;</span>
                </td>
              </tr>
            </tbody>
          </table>

              </td>
            </tr>
          </tbody>
        </table>

          </div>
          </div>
        </div>

            </div>
          </div>
        </div>
        <div class="u-row-container" >
          <div class="u-row">
            <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

        <div class="u-col u-col-100" >
          <div style="height: 100%;width: 100% !important;">
        <div style="height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->

        </div>
          </div>
        </div>

            </div>
          </div>
        </div>



            </td>
          </tr>
          </tbody>
          </table>
      </html>`
    };
  }

  buildBienvenidaEmpresaEmail(toEmail, datosUsuario, nombreEmpresa) {
    return {
      from: process.env.MAIL_FROM,
      to: toEmail,
      subject: `¡Bienvenido a ${nombreEmpresa}!`,
      html: `<h1>Hola ${datosUsuario.nombre}</h1><p>Bienvenido a ${nombreEmpresa}</p>`,
    };
  }
}

module.exports = mail_service;
