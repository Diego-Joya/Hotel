const pool = require("../../libs/postgres.pool");
const moment = require("moment");
const messageHandler = require("./../../middlewares/message.handler");
class maestroHabitacionServices {
    constructor() {
        this.pool = pool;
        this.pool.on("error", (err) => console.log(err));
    }

    async crear(body) {
        try {
            const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
            const username = body.created_by;
            const center_id = body.centrer_id;
            const company_id = body.company_id;
            const name = body.name;
            const type = body.type;

            const query = `INSERT INTO booking_data.room_type(
	 created_at, created_by, center_id, company_id, name, type)
	VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            const result = await this.pool.query(query, [
                created_at,
                username,
                center_id,
                company_id,
                name,
                type
            ]);

            return result.rows[0];


        } catch (error) {
            return messageHandler(error);
        }

    }


    async actaulizar(id, body) {
        try {
            const update_at = moment().format('YYYY-MM-DD HH:mm:ss');
            const username = body.updated_by;
            const center_id = body.center_id;
            const company_id = body.company_id;
            const name = body.name;
            const type = body.type;

            const query = `UPDATE booking_data.room_type
SET updated_by=$1, center_id=$2, company_id=$3, name=$4, type=$5, update_at=$6
WHERE id=$7 RETURNING *`;
            const result = await this.pool.query(query, [
                username,
                center_id,
                company_id,
                name,
                type,
                update_at,
                id
            ]);

            return result.rows[0];


        } catch (error) {
            return messageHandler(error);
        }

    }

    async getAll(params) {
        try {
            let where = "where  1=1 ";
            if (typeof params.limit != "undefined") {
                where += `order by key desc limit ${params.limit}`
            }
            if (typeof params.fecha_inicial != "undefined" && typeof params.fecha_final != "undefined") {
                where += ` and created_at between '${params.fecha_inicial}' and '${params.fecha_final}'`
            }
            if (typeof params.id != "undefined") {
                where += ` and id = '${params.id}'`

            }
            if (typeof params.name != "undefined") {
                where += ` and name = '${params.name}'`
            }
            if (typeof params.type != "undefined") {
                where += ` and type = '${params.type}'`
            }

            // let consulta = await this.pool.query(`SELECT entry_id as key, * FROM booking_data.entries ${where}`);
            let consulta = await this.pool.query(`SELECT  *, id as key, update_at::text as update_at, created_at::text as created_at  FROM booking_data.room_type ${where}`);

            return consulta.rows;

        } catch (error) {
            return messageHandler(error);
        }
    }





}

module.exports = maestroHabitacionServices;