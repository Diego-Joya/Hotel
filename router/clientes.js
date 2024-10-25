const express = require('express');
// const validatorHandler = require('./../middlewares/validator.handler');
// const { crearCliente } = require('./schemas/clientes.schemas');
const clientesServices = require('./Services/clientesServices');

const router = express.Router();

const cliente = new clientesServices();

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params;
    const getData = await cliente.getClientes(id);
    res.json({
      ok: true,
      data: getData,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/nombres/:nombre', async (req, res, next) => {
  try {
    const nombre = req.params;
    const getData = await cliente.getClientes(nombre);
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
    const parametros= req.query
    const getAll = await cliente.getAllClientes(parametros);
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

router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    const crear = await cliente.crear(body);
    const { ok } = crear;
    if (ok == false) {
      res.send(crear);
    } else {
      res.json({
        ok: true,
        message: 'Registro creado exitosamente!',
        data: crear,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id", async (req, res, next) => {
    try {
      const body = req.body;
      const { id } = req.params;
      const actualizar = await cliente.actualizar(id, body);
      const { ok } = actualizar;
      if (ok == false) {
        res.send(actualizar);
      } else {
        res.json({
          ok: true,
          message: "Datos actualizados correctamente",
          data: body,
        })
      }

    } catch (error) {
      next(error);
    }
  }
)
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const delete_cate = await cliente.delete(id);
    if (delete_cate == false) {
      res.json({
        ok: false,
        message: "No se encontro el registro en la bd",
      });
    } else {
      res.json({
        ok: true,
        message: "Registro eliminado correctamente!",
        id,
      });
    }
  } catch (error) {
    next(error);
  }
});


module.exports = router;
