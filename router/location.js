const express = require('express');
// const validatorHandler = require('./../middlewares/validator.handler');
const locationServices = require("./Services/locationServices");
const router = express.Router();

const location = new locationServices();



router.get(
    '/paises/',
    async (req, res, next) => {
        try {
            const parametros = req.query;
            console.log(req.query);
            let value = [];
            value = await location.getAllPaises(parametros);
            res.json({
                ok: true,
                data: value,
            });
        } catch (error) {
            next(error);
        }
    },
);
router.get(
    '/cities/',
    async (req, res, next) => {
        try {
            const parametros = req.query;
            console.log(req.query);
            let value = [];
            value = await location.getAllCities(parametros);
            res.json({
                ok: true,
                data: value,
            });
        } catch (error) {
            next(error);
        }
    },
);
router.get(
    '/departament/',
    async (req, res, next) => {
        try {
            const parametros = req.query;
            console.log(req.query);
            let value = [];
            value = await location.getAllDepartament(parametros);
            res.json({
                ok: true,
                data: value,
            });
        } catch (error) {
            next(error);
        }
    },
);


module.exports = router;
