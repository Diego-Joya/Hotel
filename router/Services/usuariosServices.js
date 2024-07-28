const pool = require('../../libs/postgres.pool')

class usuariosServices{
    constructor(){
this.pool=pool;
this.pool.on('error',(err)=>console.log(err));
    }
}
module.exports = usuariosServices;