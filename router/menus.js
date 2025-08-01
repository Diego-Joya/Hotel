const express = require('express');
const menuServices = require('./Services/menuServices');
const router = express.Router();
const services = new menuServices();
router.get('/', async (req, res, next) => {
    try {
        const menus = await services.getAllMenus();
        console.log('retorno de menus', menus);
        res.json({
            ok: true,
            menus: menus
        })
    } catch (error) {
        next(error);
    }
});
router.get('/profilesMenus/', async (req, res, next) => {
    try {
        const parametros = req.query
        const menus = await services.menusProfile(parametros);
        console.log('retorno de menus', menus);
        res.json({
            ok: true,
            menus: menus
        })
    } catch (error) {
        next(error);
    }
});

module.exports = router;
