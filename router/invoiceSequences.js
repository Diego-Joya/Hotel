const express = require('express');
const router = express.Router();
const invoicesSequencesServices = require('./Services/invoiceSequencesServices');
const sequences = new invoicesSequencesServices();
const passport = require("passport");

router.get('',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const params = req.query;
      const result = await sequences.getAll(params);
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
      const result = await sequences.createInvoiceSequence(body);
      if (typeof result.ok !== 'undefined' && result.ok === false) {
        res.send(result);
      } else {
        console.log("result", result);
        res.json({
          ok: true,
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
      const result = await sequences.updateInvoiceSequence(id, body);
      console.log("result", result);
      if (typeof result.ok !== 'undefined' && result.ok === false) {
        res.send(result);
      } else {
        console.log("result", result);
        res.json({
          ok: true,
          message: 'Secuencia actualizada correctamente',
          data: result,
          id,
        });
      }

    } catch (error) {
      next(error);
    }
  });

module.exports = router;
