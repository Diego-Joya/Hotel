const express = require('express');
const router = express.Router();
const invoiceServices = require('./Services/invoiceServices');
const invoice = new invoiceServices();

router.get('/', async (req, res, next) => {
  try {
    const params = req.query;
    console.log('params', params);
    let result = await invoice.getInvoices(params);
    if (result.ok === false) {
      return res.send(result);
    }
    return res.json({
      ok: true,
      message: 'Facturas obtenidas exitosamente!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
router.get('/details', async (req, res, next) => {
  try {
    const params = req.query;
    console.log('params', params);
    let result = await invoice.getInvoicesDetails(params);
    if (result.ok === false) {
      return res.send(result);
    }
    return res.json({
      ok: true,
      message: 'Facturas obtenidas exitosamente!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});


router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    console.log('body:', body);
    let result = await invoice.createinvoice(body); body
    if (result.ok === false) {
      return res.send(result);
    }
    return res.json({
      ok: true,
      message: 'Factura creada exitosamente!',
      data: result,
    });

  } catch (error) {
    next(error);
  }
});




module.exports = router;

