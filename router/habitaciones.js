const express = require('express');
// const validatorHandler = require('./../middlewares/validator.handler');
const habitacionesServices = require("./Services/habitacionesServices");
const router = express.Router();

const habitaciones = new habitacionesServices();



router.get(
  '/',
  async (req, res, next) => {
    try {
      console.log(req.query);
      let value = [];
      if (Object.keys(req.query).length > 0) {
        const { params } = req.query

        value = await habitaciones.getHabitaciones(params);
        console.log(params)
      } else {
        value = await habitaciones.getAllHabitaciones();
      }
      res.json({
        ok: true,
        value: value,
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
      const crear = await habitaciones.createBedrooms(body);
      const { ok } = crear
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
  },
);

router.patch(
  '/:id',
  // validatorHandler(update_schema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const actualizar = await habitaciones.actualizar(id, body);
      const { ok } = actualizar
      if (ok == false) {
        res.send(actualizar);
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

router.get('/fechas/:fecha_inicial/:fecha_final', async (req, res, next) => {
  try {
    const { fecha_inicial, fecha_final } = req.params;
    const consultar = await habitaciones.getHabitaciones({ fecha_inicial, fecha_final });
    res.json({
      ok: true,
      data: consultar,
    })

  } catch (error) {
    next(error)

  }
})


router.get('/habitaciones/:numhabitacion?',
  async (req, res, next) => {
    try {
      const numHabitacion = req.params.numhabitacion; 

      const params = { numHabitacion };

      const consultar = await habitaciones.getHabitaciones(params);
      const {ok} = consultar;
      if (ok == false) {
        res.send(consultar);
      }
      res.json({
        ok: true,
        data: consultar,
      })
    } catch (error) {
      next(error)
    }

  })

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const delete_cate = await habitaciones.deleteHabitacion(id);
    const { ok } = delete_cate;

    if (ok == false) {
      res.send(delete_cate);
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
