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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

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
            return result.rows;
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
	WHERE  entry_id=$10`
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

}
module.exports = ingresoClientesServices;