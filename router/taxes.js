const express = require('express');
const router = express.Router();
const taxesServices = require('./Services/taxesServices');
const taxes = new taxesServices();
const passport = require("passport");

router.get('', async (req, res, next) => {
  try {
    const params = req.query;
    const result = await taxes.getAll(params);
    if (typeof result.ok !== 'undefined' && result.ok === false) {
      res.send(result);
    } else {
      res.json({
        ok: true,
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post('',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const body = req.body;
      console.log(body);
      const result = await taxes.createTax(body);
      console.log("result", result);
      if (typeof result.ok !== 'undefined' && result.ok === false) {
        res.send(result);
      } else {
        res.json({
          ok: true,
          message: 'Impuesto creado correctamente',
          data: result,
        });
      }
    } catch (error) {
      next(error);
    }
  });


router.patch('/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      console.log(body);
      const result = await taxes.updateTax(id, body);
      console.log("result", result);
      if (typeof result.ok !== 'undefined' && result.ok === false) {
        res.send(result);
      } else {
        res.json({
          ok: true,
          message: 'Impuesto actualizado correctamente',
          data: result,
          id,
        });
      }

    } catch (error) {
      next(error);
    }
  });

router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await taxes.innactiveTax(id);
      console.log("result", result);
      if (typeof result.ok !== 'undefined' && result.ok === false) {
        res.send(result);
      }
      else {
        res.json({
          ok: true,
          message: 'Impuesto inactivado correctamente',
          id,
        });
      }
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
