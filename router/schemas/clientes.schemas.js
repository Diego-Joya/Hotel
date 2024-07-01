const joi= require('joi');

const name= joi.string().alphanum().min(3);

const crearCliente= joi.object({
  name: name.required(),
})


module.exports={crearCliente}
