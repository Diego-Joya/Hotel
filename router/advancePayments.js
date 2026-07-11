const express = require('express');
const router = express.Router();
const advancePaymentsServices = require('./Services/advancePaymentsService');
const advancePayments = new advancePaymentsServices();

router.get('', async (req, res, next) => {

  try {
    const params = req.query;
    const result = await advancePayments.getAll(params);
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

router.post('', async (req, res, next) => {
  try {

    const body = req.body;
    const result = await advancePayments.createAdvancePayment(body);
    if (typeof result.ok !== 'undefined' && result.ok === false) {
      res.send(result);
    } else {
      res.json({
        ok: true,
        message: 'Pago anticipado creado correctamente',
        data: result,
      });
    }

  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const result = await advancePayments.updateAdvancePayment(id, body);
    if (typeof result.ok !== 'undefined' && result.ok === false) {
      res.send(result);
    } else {
      res.json({
        ok: true,
        message: 'Pago anticipado actualizado correctamente',
        data: result,
        id,
      });
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;
