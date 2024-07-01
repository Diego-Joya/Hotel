const express = require('express');
const validatorHandler = require('./../middlewares/validator.handler');
const { crearCliente } = require('./schemas/clientes.schemas');
const habitacionesServices = require("./services/habitacionesServices");
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const cat = await profile.buscar_todos();
    res.json({
      ok: true,
      data: cat,
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:nombre',
  async (req, res, next) => {
    try {
      const { nombre } = req.params;
      const cat = await profile.buscar_uno(nombre);
      res.json({
        ok: true,
        data: cat,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/',
  // validatorHandler(create_schema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const crear = await profile.crear(body);

      res.json({
        ok: true,
        message: 'Registro creado exitosamente!',
        data: crear,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:id',
  // validatorHandler(update_schema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const actualizar = await profile.actualizar(id, body);
      if (actualizar == false) {
        res.json({
          ok: false,
          messege: 'No se encontro el registro en la bd',
        });
      } else {
        res.json({
          ok: true,
          message: 'Registro actualizado correctamente',
          data: body,
          id,
        });
      }
    } catch (error) {
      next(error);
    }
  },
);

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const delete_cate = await profile.delete(id);
    if (delete_cate == false) {
      res.json({
        ok: false,
        message: 'No se encontro el registro en la bd',
      });
    } else {
      res.json({
        ok: true,
        message: 'Registro eliminado correctamente!',
        id,
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
