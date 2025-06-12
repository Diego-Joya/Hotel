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
            // return rta.rows;
            if (rta.rows[0] != 'undefined') {

                let params = {};
                params.centers_id = rta.rows[0].centers_id;
                console.log("params", params);
                let consulta = await this.getAll(params);
                console.log("consulta", consulta);
                delete consulta.key;
                return consulta;
            } else {
                console.log("rta.rows", rta.rows);

                return rta;
            }

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
            console.log("rta.rows", result.rows[0]);

            if (typeof result.rows[0] != 'undefined') {

                let params = {};
                params.centers_id = result.rows[0].centers_id;
                console.log("params", params);
                let consulta = await this.getAll(params);
                console.log("consulta", consulta);
                return consulta;
            } else {
                console.log("rta.rows", result.rows);

                return result.rows;
            }


        } catch (error) {
            return messageHandler(error);
        }

    }

    async getAll(param) {
        try {
            let where = `where  1=1 `;
            let fields = `a.centers_id as key, a.centers_id, a.center_name, a.address, a.phone, a.city, a.company_id,b.city as city_name`;
            if (typeof param.centers_id != "undefined" && param.centers_id != "") {
                where += ` and a.centers_id='${param.centers_id}'`;
            }
            if (typeof param.center_name != "undefined" && param.center_name != "") {
                where += ` and a.center_name ilike ('%${param.center_name}%')`;
            }
            if (typeof param.company_id != "undefined" && param.company_id != "") {
                where += ` and a.company_id='${param.company_id}'`;
            }
            if (typeof param.select != "undefined" && param.select == "true") {
                fields = `a.centers_id as code, a.centers_id as key, a.center_name as name`
            }
            let query = `select ${fields} from booking_config.centers a left join  booking_config.cities b on (a.city=b.id)   ${where}`;
            let rta = await this.pool.query(query);
            if (typeof param.return_all && param.return_all == true) {
                return rta.rows;
            } else {
                return rta.rows[0];
            }

        } catch (error) {
            return messageHandler(error)
        }

    }
    async delete(id) {
        try {
            let paramns = [];
            paramns.centers_id = id;
            let consu = await this.getAll(paramns);
            if (consu == "") {
                return false;
            }
            const rta = await this.pool
                .query(
                    `DELETE FROM   booking_config.centers
      WHERE centers_id=$1`,
                    [id]
                )
            return rta;
        } catch (error) {
            return messageHandler(error);
        }
    }

}
module.exports = centerServices;
