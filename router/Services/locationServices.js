const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');


class locationServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.error(err));
    }


    async getAllPaises(param) {
        try {
            let where = `where  1=1 `;
            let fields = `id as key,*,updated_at::text as updated_at,created_at::text as created_at`;
            if (typeof param.select != "undefined" && param.select == "true") {
                fields = `id as code, id as key, countrie as name`
            }
            let query = `select ${fields} from booking_config.countries  ${where}`;
            let rta = await this.pool.query(query);
            return rta.rows

        } catch (error) {
            return messageHandler(error)
        }

    }
    async getAllCities(param) {
        try {
            let where = `where  1=1 `;
            let fields = `id as key,*,updated_at::text as updated_at,created_at::text as created_at`;
            if (typeof param.select != "undefined" && param.select == "true") {
                fields = `id as code, id as key, city as name`
            }
            let query = `select ${fields} from booking_config.cities  ${where}`;
            let rta = await this.pool.query(query);
            return rta.rows

        } catch (error) {
            return messageHandler(error)
        }

    }
    async getAllDepartament(param) {
        try {
            let where = `where  1=1 `;
            let fields = `id as key,*,updated_at::text as updated_at,created_at::text as created_at`;
            if (typeof param.select != "undefined" && param.select == "true") {
                fields = `id as code, id as key, city as name`
            }
            let query = `select ${fields} from booking_config.departaments  ${where}`;
            let rta = await this.pool.query(query);
            return rta.rows

        } catch (error) {
            return messageHandler(error)
        }

    }
}
module.exports = locationServices;
