const express = require('express');
const router = express.Router();
const dashboarServices = require('./Services/dashboardServices');
const dashboard = new dashboarServices();
const passport = require("passport");

router.get('',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const valores = req.query
      const consulta = await dashboard.getDashboard(valores);
      console.log(consulta);
      res.json({
        ok: true,
        data: consulta
      })

    }
    catch (error) {
      next(error);
    }
  });

module.exports = router;
