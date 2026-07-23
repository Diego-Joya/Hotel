const express = require('express');
const router = express.Router();
const otherServiceService = require('./Services/otherServicesService');
const passport = require("passport");


const otherService = new otherServiceService();


router.get('',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const params = req.query;
      console.log('params', params);
      const getOtherServices = await otherService.getOtherServices(params);
      if (typeof getOtherServices.ok != "undefined" && getOtherServices.ok == false) {
        res.send(getOtherServices);
      } else {
        res.json({
          ok: true,
          message: "¡Datos obtenidos correctamente!",
          data: getOtherServices
        })
      }

    } catch (error) {
      next(error)
    }

  });

router.post('',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const body = req.body;
      console.log('bodyy', body);
      const result = await otherService.createOtherServices(body);
      if (typeof result.ok !== "undefined" && result.ok == false) {
        res.send(result);
      } else {
        res.json({
          ok: true,
          message: 'Adicional creado correctamente',
          data: result,
        });
      }
    } catch (error) {
      next(error)
    }
  });


router.patch("/:id",
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const result = await otherService.updateOtherServices(id, body);
      if (typeof result.ok !== "undefined" && result.ok == false) {
        res.send(result);
      } else {
        res.json({
          ok: true,
          message: 'Adicional actualizado correctamente',
          data: result,
        });
      }
    } catch (error) {
      next(error);
    }

  })

router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await otherService.deleteOtherServices(id);
      if (typeof result.ok !== "undefined" && result.ok == false) {
        res.send(result);
      } else {
        res.json({
          ok: true,
          message: 'Adicional eliminado correctamente',
          data: result,
        });
      }

    } catch (error) {
      next(error);
    }
  })

module.exports = router;

