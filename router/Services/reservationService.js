const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
const clientesServices = require('./clientesServices');

const clientes = new clientesServices();

class reservationServices {
    constructor() {

    }
    async createReservation(body) {
        try {
            console.log(body);
            if (typeof body.customer_id != "undefined" && body.customer_id != '0' && body.customer_id != '') {
                const crear = await this.crear(body);
            } else {
                const crear_cliente= await clientes.crear();
            }

        } catch (error) {
            return messageHandler(error)
        }

    }
}

module.exports = reservationServices;