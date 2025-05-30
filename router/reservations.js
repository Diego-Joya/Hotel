
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


module.exports = router;
