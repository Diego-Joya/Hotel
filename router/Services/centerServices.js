const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
// const moment = require("moment");


class centerServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.error(err));
    }

    // CREAR CENTER
    async createCenter(body, transaction = null) {
        console.log('crear center', body);
        // const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
        const center_name = body.center_name;
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
    async actualizar(id, body) {
        try {
            const center_name = body.center_name;
            const address = body.address;
            const phone = body.phone;
            const city = body.city;
            const company_id = body.company_id;

            const query = `UPDATE booking_config.centers
	SET  center_name=$1, address=$2, phone=$3, city=$4, company_id=$5
WHERE centers_id=$6 RETURNING *`;
            const result = await this.pool.query(query, [
                center_name,
                address,
                phone,
                city,
                company_id,
                id
            ]);

            return result.rows[0];


        } catch (error) {
            return messageHandler(error);
        }

    }

    async getAll(param) {
        try {
            let where = `where  1=1 `;
            let fields = `a.centers_id as key, a.centers_id, a.center_name, a.address, a.phone, a.city, a.company_id,b.city as city_name`;
            if (typeof param.center_id != "undefined" && param.centers_id != "") {
                where += ` and a.centers_id='${param.centers_id}'`;
            }
            if (typeof param.center_name != "undefined" && param.center_name != "") {
                where += ` and a.center_name ilike ('%${param.center_name}%')`;
            }
            if (typeof param.company_id != "undefined" && param.company_id != "") {
                where += ` and a.company_id='${param.company_id}'`;
            }

            let query = `select ${fields} from booking_config.centers a left join  booking_config.cities b on (a.city=b.id)   ${where}`;
            let rta = await this.pool.query(query);
            return rta.rows

        } catch (error) {
            return messageHandler(error)
        }

    }

}
module.exports = centerServices;
