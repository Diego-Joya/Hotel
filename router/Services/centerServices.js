const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');


class centerServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.error(err));
    }

    // CREAR CENTER
    async createCenter(body, transaction = null) {
        console.log('crear center', body);
        // const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
        const center_name = body.company_name;
        const address = body.address;
        const phone = body.phone;
        const city = body.city;
        const company_id = body.company_id;
        let client = '';

        if (transaction != null) {
            client = transaction
        } else {
            client = this.pool;
        }
        try {
            const query = `INSERT INTO booking_config.centers(
        center_name, address, phone, city, company_id) VALUES ($1, $2, $3, $4, $5 ) RETURNING *`;

            const rta = await client
                .query(query, [
                    center_name,
                    address,
                    phone,
                    city,
                    company_id
                ])
            return rta.rows;

        } catch (error) {
            return messageHandler(error)

        }
    }

}
module.exports = centerServices;
