const pool = require('../../libs/postgres.pool');
const moment = require('moment');
const messageHandler = require('./../../middlewares/message.handler');

class ingresoClientesServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.error(err));
    }

    async saveIngresoClientes(body) {
        const room_id = body.room_id;
        const customer_id = body.customer_id;
        const entry_date = moment().format('YYYY-MM-DD HH:mm:ss');
        const exit_date = moment().format('YYYY-MM-DD HH:mm:ss');
        const total_days = body.total_days;
        const total_amount_pay = body.total_amount_pay;
        const created_by = body.created_by;
        const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        const status = body.status;

        const query = `INSERT INTO booking_data.entries(
            room_id, customer_id, status, entry_date, exit_date, total_days, total_amount_pay, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)  RETURNING *`;

        try {
            const result = await this.pool.query(query, [
                room_id,
                customer_id,
                status,
                entry_date,
                exit_date,
                total_days,
                total_amount_pay,
                created_by,
                created_at
            ]);
            return result.rows[0];
        } catch (error) {
            return messageHandler(error);
        }
    }
    async UpdateIngresoClientes(id, body) {
        console.log("update save", body);
        const room_id = body.room_id;
        const customer_id = body.customer_id;
        const entry_date = moment().format('YYYY-MM-DD HH:mm:ss');
        const exit_date = moment().format('YYYY-MM-DD HH:mm:ss');
        const total_days = body.total_days;
        const total_amount_pay = body.total_amount_pay;
        const updated_by = body.updated_by;
        const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
        const status = body.status;


        const consulExistencia = await this.getIngresosClientes({ id });
        console.log("valor consulta", consulExistencia);
        if (consulExistencia == "") {
            let resp = {
                ok: false,
                message: '¡El dato que intentas actualizar no existe en la base de datos!',

            }
            return resp
        }



        const query = `UPDATE booking_data.entries
	SET  room_id=$1, customer_id=$2, entry_date=$3, exit_date=$4, total_days=$5, total_amount_pay=$6,  updated_by=$7,  updated_at=$8, status=$9
	WHERE  entry_id=$10   RETURNING *`
        try {
            const rta = await this.pool.query(query, [room_id,
                customer_id,
                entry_date,
                exit_date,
                total_days,
                total_amount_pay,
                updated_by,
                updated_at,
                status,
                id])
            return rta.rows;
        } catch (error) {
            return messageHandler(error);
        }

    }


    async getIngresosClientes({ id = null, room_id = null }) {
        if (typeof id != "undefined") {
            try {
                let consulta = await this.pool.query(`SELECT entry_id as key, * FROM booking_data.entries where entry_id =${id}`);
                return consulta.rows;

            } catch (error) {
                return messageHandler(error);
            }
        }
    }
    async getAll(params) {
        try {
            let where = "where  1=1 ";
            if (typeof params.id != "undefined") {
                where += ` and entry_id =${params.id}`
            }
            // if (typeof params.fecha_inicial != "undefined") {
            //      where += ` and created_at ='${params.fecha_inicial}'`

            // }
            if (typeof params.fecha_inicial != "undefined" && typeof params.fecha_final != "undefined") {
                where += ` and created_at between '${params.fecha_inicial}' and '${params.fecha_final}'`
            }
            if (typeof params.exit_date_inicial != "undefined" && typeof params.exit_date_final != "undefined") {
                where += ` and exit_date between '${params.exit_date_inicial}' and '${params.exit_date_final}'`
            }
            if (typeof params.room_id != "undefined") {
                where += ` and room_id = '${params.room_id}'`

            }
            if (typeof params.customer_id != "undefined") {
                where += ` and customer_id = '${params.customer_id}'`

            }


            // let consulta = await this.pool.query(`SELECT entry_id as key, * FROM booking_data.entries ${where}`);
            let consulta = await this.pool.query(`SELECT  *,updated_at::text as updated_at,created_at::text as created_at, entry_date::text as entry_date,exit_date::text as exit_date FROM booking_data.view_entries ${where}`);

            return consulta.rows;

        } catch (error) {
            return messageHandler(error);
        }
    }

}
module.exports = ingresoClientesServices;