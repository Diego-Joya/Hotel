
const express = require("express");
const usuariosServices = require('./Services/usuariosServices');

const router = express.Router();
const usuarios = new usuariosServices();

router.get('/', async (req, res, next) => {
    try {
        console.log(req);
        const usuarios = usuarios;

    } catch (error) {
        next(error);
    }

})

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
})

module.exports = router;
