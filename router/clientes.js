const express = require('express');
const validatorHandler = require('./../middlewares/validator.handler');
const { crearCliente } = require('./schemas/clientes.schemas');
const clientesServices = require('./Services/clientesServices');

const router = express.Router();

const cliente = new clientesServices();

router.get('/:id', async (req, res, next) => {
  try {
    const dato = req.params;
    const getData = await cliente.find_one(dato);
    res.json({
      ok: true,
      data: getData,
    });
  } catch (error) {
    next(error);
  }
});
router.get('/', async (req, res, next) => {
  try {
    const getAll = await cliente.getALl();
    res.json({
      ok: true,
      data: getAll,
    });
  } catch (error) {
    next(error);
  }
  // res.send('hola mundooooooo');
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    const crear = await clientes.crear(body);

    res.json({
      ok: true,
      message: 'Registro creado exitosamente!',
      data: crear,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
