
const express = require('express');

const router = express.Router();
const companyServices = require("./Services/companyServices");

const company = new companyServices();

router.get('/',
    // passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const paramentros = req.query;
            let value = [];
            value = await company.getCompany(paramentros);

            res.json({
                ok: true,
                data: value,
            })

        } catch (error) {
            next(error);
        }
    });

router.post(
    '/',
    // validatorHandler(create_schema, 'body'),
    // passport.authenticate('jwt', { session: false }),

    async (req, res, next) => {
        try {
            const body = req.body;
            const crear = await company.registerCompany(body);
            console.log('datos retorna');
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
            const actualizar = await company.updateCompany(id, body);
            const { ok } = actualizar
            console.log('actualizar', actualizar);
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
module.exports = router;