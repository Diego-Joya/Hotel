
const express = require("express");
const usuariosServices = require('./Services/usuariosServices');
const passport = require("passport");

const router = express.Router();
const usuarios = new usuariosServices();


router.post('/', async (req, res, next) => {
    try {
        const body = req.body;
        console.log(body);
        return;
        const crear = await usuarios.crear(body);
        const { ok } = crear;
        if (!ok) {
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
