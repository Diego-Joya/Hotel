
const express = require("express");
const reservationService = require('./Services/reservationService');
// const passport = require("passport");
const ingresosClientesServices = require('./Services/IngresoClientesServices');

const router = express.Router();
const reservation = new reservationService();
const ingresos = new ingresosClientesServices();

router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    console.log('body:', body);

    let result;

    // if (body.type === 'INGRESO') {
    //   result = await ingresos.saveIngresoClientes(body);
    // } else {
    result = await reservation.createReservation(body);
    // }

    if (result.ok === false) {
      return res.send(result);
    }

    return res.json({
      ok: true,
      message: 'Datos guardados correctamente!',
      data: result,
    });

  } catch (error) {
    next(error);
  }
});

router.patch(
  '/:id',
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      console.log(body);
      // res.send({
      //     ok: false,
      //     message: 'En desarrollo... Aguanta puto'
      // });
      // return;
      const actualizar = await reservation.updateReservation(body, id);
      console.log("return", actualizar);
      const { ok } = actualizar
      if (ok == false) {
        res.send(actualizar);
      } else {
        res.json({
          ok: true,
          message: 'Registro actualizado correctamente!',
          data: actualizar,
          id,
        });
      }
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/confirm/:id',
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      console.log(body);
      // res.send({
      //     ok: false,
      //     message: 'En desarrollo... Aguanta puto'
      // });
      // return;
      const actualizar = await reservation.confirm_cancel_Booking(body, id);
      console.log("return", actualizar);
      const { ok } = actualizar
      if (ok == false) {
        res.send(actualizar);
      } else {
        res.json({
          ok: true,
          message: 'Cancelación de reserva exitosa!',
          data: actualizar,
          id,
        });
      }
    } catch (error) {
      next(error);
    }
  },
);
router.patch(
  '/cancel/:id',
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      console.log(body);
      // res.send({
      //     ok: false,
      //     message: 'En desarrollo... Aguanta puto'
      // });
      // return;
      const actualizar = await reservation.confirm_cancel_Booking(body, id);
      console.log("return", actualizar);
      const { ok } = actualizar
      if (ok == false) {
        res.send(actualizar);
      } else {
        res.json({
          ok: true,
          message: 'Confirmación de reserva exitosa!',
          data: actualizar,
          id,
        });
      }
    } catch (error) {
      next(error);
    }
  },
);


router.get('/',
  // passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const parametros = req.query
      parametros.return_all = true;
      const consulta = await reservation.gellAllReservations(parametros);
      console.log('consulta', consulta);
      res.json({
        ok: true,
        data: consulta
      })

    } catch (error) {
      next(error);
    }

  });
router.get('/calendar',
  // passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const parametros = req.query
      parametros.return_all = true;
      const consulta = await reservation.getReservationsCalendar(parametros);
      console.log('consulta', consulta);
      res.json({
        ok: true,
        data: consulta
      })

    } catch (error) {
      next(error);
    }

  });
router.get('/rooms_details/', async (req, res, next) => {
  try {
    const parametros = req.query;
    console.log(parametros);
    const consulta = await reservation.rooms_Booking(parametros);
    res.json({
      ok: true,
      data: consulta,
    })

  } catch (error) {
    next(error);
  }
});
router.get('/rooms_available/', async (req, res, next) => {
  try {
    const parametros = req.query;
    parametros.distinct_room = true;
    console.log(parametros);
    const consulta = await reservation.rooms_available(parametros);
    res.json({
      ok: true,
      data: consulta,
    })

  } catch (error) {
    next(error);
  }
});
router.get('/edit_booking/', async (req, res, next) => {
  try {
    const parametros = req.query;
    console.log(parametros);
    parametros.return_all = true;
    const consulta = await reservation.edit_bookings(parametros);
    res.json({
      ok: true,
      data: consulta,
    })

  } catch (error) {
    next(error);
  }
});

module.exports = router;
