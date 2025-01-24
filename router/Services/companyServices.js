const pool = require('../../libs/postgres.pool');
const moment = require("moment");
const messageHandler = require('./../../middlewares/message.handler');


class companyServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.error(err));
    }

    // CREAR COMPANY
    async createCompany(body) {
        // const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
        const company_name = body.company_name;
        const no_identification = body.no_identification;
        const address = body.address;
        const phone = body.phone;
        const country = body.country;
        const city = body.city;

        const query = `INSERT INTO booking_config.companys(
	 company_name, no_identification, address, phone, country, city) VALUES ($1, $2, $3, $4, $5, $6 ) RETURNING *`;
        const rta = await this.pool
            .query(query, [
                company_name,
                no_identification,
                address,
                phone,
                country,
                city

            ])
            .catch((err) => {
                return messageHandler(err)
            });
        return rta.rows;
    }

    async updateCompany(id, body) {

        try {
            const company_name = body.company_name;
            const no_identification = body.no_identification;
            const address = body.address;
            const phone = body.phone;
            const country = body.country;
            const city = body.city;
            // const country = Number.isInteger(body.country) ? body.country : parseInt(body.country, 10);
            // const city = Number.isInteger(body.city) ? body.city : parseInt(body.city, 10);
            // id = Number.isInteger(id) ? id : parseInt(id, 10);

            const debugQuery = `
            UPDATE booking_config.companys
            SET company_name='${company_name}', no_identification='${no_identification}', address='${address}', 
                phone='${phone}', country='${country}', city='${city}'
            WHERE company_id=${id}
            RETURNING *;
        `;
            console.log("Query ejecutado:", debugQuery);


            const query = `UPDATE booking_config.companys
        SET  company_name=$1, no_identification=$2, address=$3, phone=$4, country=$5, city=$6
        WHERE company_id=$7 RETURNING *`;
            const rta = await this.pool
                .query(query, [
                    company_name,
                    no_identification,
                    address,
                    phone,
                    country,
                    city,
                    id

                ]);
            return rta.rows;

        } catch (error) {
            return messageHandler(error)
        }
        // const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');

    }

    async getCompany(param) {
        try {
            let query = `select company_id as key,* from booking_config.companys `;
            let rta = await this.pool.query(query);
            return rta.rows

        } catch (error) {
            return messageHandler(error)
        }

    }

}
module.exports = companyServices;
