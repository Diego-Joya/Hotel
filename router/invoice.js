const express = require('express');
const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const body = req.body;

  } catch (error) {
    next(error);
  }
});


module.exports = router;

