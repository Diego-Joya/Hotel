const expres = require("express");
const router = expres.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const usuariosServices = require("./Services/usuariosServices");

const usuario = new usuariosServices();

const { config } = require('../config/config')

router.post(
  "/login",
  passport.authenticate('local', { session: false }),
  async (req, res, next) => {
    try {

      const user = req.user;
      const payload = {
        sub: user[0].user_id,
        profile_id: user[0].profile_id,
        company_id: user[0].company_id,
        center_id: user[0].center_id,

      }
      console.log(payload);


      const token = jwt.sign(payload, config.secret, { expiresIn: '1h' });
      const saveToke = await usuario.saveToke(user[0].user_id, token);
      const refreshToken = jwt.sign(payload, config.secret, { expiresIn: '7d' });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1 * 24 * 60 * 60 * 1000
      });



      res.json({
        user,
        token,
        refreshToken
      }
      );
    } catch (error) {
      next(error);
    }
  }
);
router.post('/refresh-token', async (req, res, next) => {
  try {
    // Obtener el refresh token de la cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verificar el refresh token
    jwt.verify(refreshToken, config.secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }

      // Crear un nuevo access token
      const newAccessToken = jwt.sign(
        {
          sub: decoded.sub,
          profile_id: decoded.profile_id,
          company_id: decoded.company_id,
          center_id: decoded.center_id
        },
        config.secret,
        { expiresIn: '1h' }
      );

      res.json({ accessToken: newAccessToken });
    });

  } catch (error) {
    next(error);
  }
});


module.exports = router;
