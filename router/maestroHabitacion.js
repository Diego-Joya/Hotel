
const express = require("express");
const router = express.Router();

const maestroHabitacionServices = require("./Services/maestroHabitacionServices");

const maestro = new maestroHabitacionServices();

router.post('/', async (req, res, next) => {
    try {
        const body = req.body;
        const crear = await maestro.crear(body);
        const { ok } = crear
        if (ok == false) {
            res.send(crear);
        }
        else {
            res.json({
                ok: true,
                message: '¡Ingreso registro exitosamente!',
                data: crear,
            });
        }

    } catch (error) {
        next(error)
    }
})

router.patch('/:id', async (req, res, next) => {
    try {
        console.log(req.params)
        const { id } = req.params;
        const body = req.body;
        const actualizar = await maestro.actaulizar(id, body);
        const { ok } = actualizar
        if (ok == false) {
            res.send(actualizar);
        }
        else {
            res.json({
                ok: true,
                message: 'Registro actualizado correctamente!',
                data: body,
                id,
            });
        }
    } catch (error) {
        next(error)
    }
})
router.get('/', async (req, res, next) => {
    try {
        const valores = req.query
        console.log('ajajja')
        const consulta = await maestro.getAll(valores);
        res.json({
            ok: true,
            data: consulta
        })
    } catch (error) {
        next(error)
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const eliminar = await maestro.delete(id);
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
