const pool = require('../../libs/postgres.pool')
const messageHandler = require('./../../middlewares/message.handler')

class menuServices {
    constructor() {
        this.pool = pool
        this.pool.on('error', (err) => console.error(err));
    }


    async getAllMenus(params, transaction = null){
        
    }

}

module.exports = menuServices;