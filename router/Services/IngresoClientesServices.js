const pool = require('../../libs/postgres.pool');
const moment = require('moment');
const messageHandler = require('./../../middlewares/message.handler');
const habitacionesServices = require('./habitacionesServices');
const habitacion = new habitacionesServices();
class ingresoClientesServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.error(err));
    }

    async saveIngresoClientes(body) {
        const room_id = body.room_id;
        const customer_id = body.customer_id;
        const entry_date = body.entry_date;
        const exit_date = body.exit_date;
        // const exit_date = moment().format('YYYY-MM-DD HH:mm:ss');
        const total_days = body.total_days;
        const total_amount_pay = body.total_amount_pay;
        const created_by = body.created_by;
        const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        // const status = body.status;
        const status = 'INGRESADO';
        const val_room = body.val_room;
        const company_id = body.company_id;

        let array = [];
        array.room_id = body.room_id;
        array.state = 'OCUPADA';
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const actHabitacion = await habitacion.actualizarEstado(client, array);
            const { ok } = actHabitacion
            if (ok == false) {
                return actHabitacion;
            }
            const query = `INSERT INTO booking_data.entries(
            room_id, customer_id, status, entry_date, exit_date, total_days, total_amount_pay, created_by, created_at,val_room,company_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11)  RETURNING *`;

            const result = await this.pool.query(query, [
                room_id,
                customer_id,
                status,
                entry_date,
                exit_date,
                total_days,
                total_amount_pay,
                created_by,
                created_at,
                val_room,
                company_id
            ]);
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            return messageHandler(error);
        }
    }
    async UpdateIngresoClientes(id, body) {
        const room_id = body.room_id;
        const customer_id = body.customer_id;
        // const entry_date = moment().format('YYYY-MM-DD HH:mm:ss');
        // const exit_date = moment().format('YYYY-MM-DD HH:mm:ss');
        const entry_date = body.entry_date;
        const exit_date = body.exit_date;
        const total_days = body.total_days;
        const total_amount_pay = body.total_amount_pay;
        const updated_by = body.updated_by;
        const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
        const val_room = body.val_room;


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
	SET  room_id=$1, customer_id=$2, entry_date=$3, exit_date=$4, total_days=$5, total_amount_pay=$6,  updated_by=$7,  updated_at=$8,val_room=$9
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
                val_room,
                id])
            return rta.rows;
        } catch (error) {
            return messageHandler(error);
        }

    }


    async getIngresosClientes({ id = null }) {
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
            if (typeof params.limit != "undefined") {
                where += `order by key desc limit ${params.limit}`
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
            if (typeof params.company_id != "undefined" && params.company_id != "") {
                where += ` and company_id=${params.company_id}`;
            }
            if (typeof params.center_id != "undefined" && params.center_id != "") {
                where += ` and center_id=${params.center_id}`;
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