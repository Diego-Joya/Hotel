const express = require('express');
const ingresoClientesServices = require("./Services/IngresoClientesServices");
const router = express.Router();

const ingresos = new ingresoClientesServices();
router.get('/', async (req, res, next) => {
    try {
        const valores = req.query
        const consulta = await ingresos.getAll(valores);
        res.json({
            ok: true,
            data: consulta
        })
    } catch (error) {
        next(error)
    }
})
router.post(
    '/',
    async (req, res, next) => {
        try {
            const body = req.body;
            const crear = await ingresos.saveIngresoClientes(body);
            if (typeof crear != "undefined") {
                const { ok } = crear
                if (ok == false) {
                    res.send(crear);
                } else {
                    if (typeof body.limit != "undefined" && body.limit != "") {
                        const consul = await ingresos.getAll({ limit: body.limit });
                        res.json({
                            ok: true,
                            message: '¡Ingreso registro exitosamente!',
                            data: consul,
                        });
                    } else {
                        res.json({
                            ok: true,
                            message: '¡Ingreso registro exitosamente!',
                            data: crear,
                        });
                    }
                }
            }
        } catch (error) {
            next(error);
        }
    },
);

router.patch(
    '/:id',
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const body = req.body;
            const actualizar = await ingresos.UpdateIngresoClientes(id, body);
            const { ok } = actualizar
            if (ok == false) {
                res.send(actualizar);
            } else {
                if (typeof body.limit != "undefined" && body.limit != "") {
                    const consul = await ingresos.getAll({ limit: body.limit });
                    res.json({
                        ok: true,
                        message: 'Registro actualizado correctamente!',
                        data: consul,
                        id,
                    });
                } else {
                    res.json({
                        ok: true,
                        message: 'Registro actualizado correctamente!',
                        data: body,
                        id,
                    });
                }

            }
        } catch (error) {
            next(error);
        }
    },
);

module.exports = router;