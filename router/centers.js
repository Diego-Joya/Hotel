
const express = require('express');
const router = express.Router();

const passport = require('passport');
const centerServices = require('./Services/centerServices');

const center = new centerServices();

router.post('/',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const body = req.body;
            const crear = await center.createCenter(body);
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
    }
)

router.patch('/:id',
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const body = req.body;

            const actualizar = await center.actualizar(id, body);
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

router.get(
    '/',
    async (req, res, next) => {
        try {
            const parametros = req.query;
            console.log(req.query);
            let value = [];
            value = await center.getAll(parametros);
            res.json({
                ok: true,
                data: value,
            });
        } catch (error) {
            next(error);
        }
    },
);

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const eliminar = await center.delete(id);
        if (eliminar == false) {
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


})

module.exports = router;
