const express = require('express');
// const validatorHandler = require('./../middlewares/validator.handler');
const habitacionesServices = require("./Services/habitacionesServices");
const router = express.Router();
const passport = require("passport");
// const multer = require('multer');
// const path = require('path');
const habitaciones = new habitacionesServices();
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/habitaciones'); // Carpeta donde guardarás las fotos
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + '-' + file.originalname;
//     cb(null, uniqueName);
//   }
// });

// const upload = multer({ storage });


router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const parametros = req.query;
      parametros.return_all = true
      console.log(req.query);
      let value = [];
      value = await habitaciones.getAllHabitaciones(parametros);
      res.json({
        ok: true,
        data: value,
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

// IMAGENES
// router.post(
//   '/',
//   upload.array('fotos', 5), // acepta hasta 5 fotos. El name="fotos" debe coincidir con el input del frontend
//   async (req, res, next) => {
//     try {
//       const body = req.body;
//       const files = req.files;

//       // Obtiene las rutas de las imágenes
//       const imageUrls = files.map(file => `/uploads/habitaciones/${file.filename}`);

//       // Añade las URLs al body para guardarlas en la BD
//       body.imagenes = imageUrls;

//       const crear = await habitaciones.createBedrooms(body);
//       const { ok } = crear;

//       if (ok == false) {
//         res.send(crear);
//       } else {
//         res.json({
//           ok: true,
//           message: 'Registro creado exitosamente!',
//           data: crear,
//         });
//       }

//     } catch (error) {
//       next(error);
//     }
//   }
// );

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
          data: actualizar,
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
      const { ok } = consultar;
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
