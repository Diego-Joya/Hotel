function validatorHandler(schema, property) {
  return (req, res, next) => {
    const data = req[property];
    const { error } = schema.validate(data);
    if (error) {
      next(res.send('pailas fallo'));
    } else {
      next();
    }
  };
}

module.exports = validatorHandler;
