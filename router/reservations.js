
const express = require("express");
const reservationService = require('./Services/reservationService');
// const passport = require("passport");

const router = express.Router();
const reservation = new reservationService();


router.post('/', async (req, res, next) => {
    try {
        const body = req.body;
        console.log(body);
        const crear = await reservation.createReservation(body);
        const { ok } = crear;
        if (ok == false) {
            res.send(crear);
        }
        res.json({
            ok: true,
            message: "Datos guardados correctamente!",
            data: crear,
        })

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
            res.send({
                ok: false,
                message: 'En desarrollo... Aguanta puto'
            });
            return;
            const actualizar = await reservation.actualizar(id, body);
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


router.get('/',
    // passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const parametros = req.query
            parametros.return_all = true;
            const consulta = await reservation.gellAllReservations(parametros);
            res.json({
                ok: true,
                data: consulta
            })

        } catch (error) {
            next(error);
        }

    });

module.exports = router;
