
const expres = require("express");
const router = expres.Router();


router.get('/', async (req, res, next) => {
    try {
        console.log(req);
        const usuarios=usuarios;

    } catch (error) {
        next(error);
    }

})