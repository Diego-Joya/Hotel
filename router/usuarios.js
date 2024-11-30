
const express = require("express");
const usuariosServices = require('./Services/usuariosServices');
const passport = require("passport");

const router = express.Router();
const usuarios = new usuariosServices();

router.get('/',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const parametros = req.query
            const consulta = await usuarios.consulta(parametros);
            res.json({
                ok: true,
                data: consulta
            })

        } catch (error) {
            next(error);
        }

    });

router.post('/', async (req, res, next) => {
    try {
        const body = req.body;
        const crear = await usuarios.crear(body);
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
            const actualizar = await usuarios.actualizar(id, body);
            console.log("return", actualizar);
            const { ok } = actualizar
            if (ok == false) {
                res.send(actualizar);
            } else {
                res.json({
                    ok: true,
                    message: 'Registro actualizado correctamente!',
                    data: body,
                    id,
                });
            }
        } catch (error) {
            next(error);
        }
    },
);

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const eliminar = await usuarios.delete(id);
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
});


module.exports = router;
