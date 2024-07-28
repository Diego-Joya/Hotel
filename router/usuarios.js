
const expres = require("express");
const router = expres.Router();


router.get('/', async (req, res, next) => {
    try {
        console.log(req);

    } catch (error) {
        next(error);
    }

})