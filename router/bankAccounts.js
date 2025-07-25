const express = require('express');
const banksServices = require('./Services/banksServices');
const router = express.Router();

const bank = new banksServices();
router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    const crear = await bank.crearCuenta(body);
    const { ok } = crear;
    if (ok == false) {
      res.send(crear);
    } else {
      res.json({
        ok: true,
        message: '¡Registro creado exitasamente!',
        data: crear
      })
    }

  } catch (error) {
    next(error);
  }
})
router.get('/', async (req, res, next) => {
  try {
    const parametros = req.query
    parametros.return_all = true;
    const getAll = await bank.getAllAccounts(parametros);
    const ok = getAll;
    if (ok == false) {
      res.send(getAll);
    } else {
      res.json({
        ok: true,
        data: getAll,
      });
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;