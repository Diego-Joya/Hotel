const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
const clientesServices = require('./clientesServices');
const moment = require('moment');

const clientes = new clientesServices();

class reservationServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.log(err));

    }
    async createReservation(body) {
        try {
            console.log(body);
            // let id_cliente = body.customer_id;
            if (typeof body.customer_id == "undefined" || body.customer_id == '0' || body.customer_id == '') {
                console.log('jajaj');
                let cliente = [];
                cliente.names = body.names;
                cliente.surnames = body.surnames;
                cliente.document_type = body.document_type;
                cliente.no_document = body.no_document;
                cliente.birthdate = null;
                cliente.cell_phone = body.cell_phone;
                cliente.company_id = body.company_id;
                cliente.cell_phone_emergency = body.cell_phone;
                cliente.center_id = body.center_id;
                cliente.created_by = body.created_by;
                cliente.email = null;
                cliente.validar = false

                const crearCliente = await clientes.crear(cliente);
                console.log("resul crear cliente", crearCliente);
                let { ok } = crearCliente;
                if (ok == false) {
                    return crearCliente;
                } else {
                    body.customer_id = crearCliente.customer_id;
                }
            }

            const crearReserva = await this.crear(body);
            return crearReserva;



        } catch (error) {
            return messageHandler(error)
        }

    }
    async crear(body) {
        const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
        const names = body.names;
        const surnames = body.surnames;
        const no_document = body.no_document;
        const reservation_date = fecha_hora;
        const state = 'SIN CONFIRMAR';
        const center_id = body.center_id;
        const room_type = body.room_type;
        const room_id = body.room_id;
        const created_by = body.created_by;
        const created_at = fecha_hora;
        const company_id = body.company_id;
        const customer_id = body.customer_id;

        try {
            const query = `INSERT INTO booking_data.bookings(
	 names, surnames, no_document, reservation_date, state, center_id, room_type, room_id, created_by,  created_at,  company_id, customer_id)
	VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12) RETURNING *`;
            const rta = await this.pool.query(query, [
                names,
                surnames,
                no_document,
                reservation_date,
                state,
                center_id,
                room_type,
                room_id,
                created_by,
                created_at,
                company_id,
                customer_id
            ]);
            return rta.rows[0];
        } catch (error) {
            return messageHandler(error)
        }

    }


    async gellAllReservations(params) {
        try {
            let where = ` where 1=1`;
            if (typeof params.usernames != "undefined" && params.usernames != "") {
                where += ` and a.usernames='${params.usernames}'`;
            }
            if (typeof params.state != "undefined" && params.state != "") {
                where += ` and a.state='${params.state}'`;
            }
            if (typeof params.company_id != "undefined" && params.company_id != "") {
                where += ` and A.company_id=${params.company_id}`;
            }
            if (typeof params.center_id != "undefined" && params.center_id != "") {
                where += ` and a.center_id=${params.center_id}`;
            }
            if (typeof params.room_type != "undefined" && params.room_type != "") {
                where += ` and a.room_type=${params.room_type}`;
            }
            if (typeof params.room_id != "undefined" && params.room_id != "") {
                where += ` and a.room_id=${params.room_id}`;
            }
            let query = ''
            if (typeof params.fields != 'undefined' && params.fields != null) {
                query = `select a.user_id as key, ${params.fields} from  booking_config.users a ${where}`;
            } else {
                // query = `select user_id as key,*,updated_by::text as updated_by,created_at::text as created_at from  booking_config.users ${where}`;
                query = `SELECT
                        A.*,
                        B.CENTER_NAME,
                        C.NAME AS ROO_TYPE_NAME,
                        D.NO_ROOM,
                        D.TYPE AS TYPE_ROOM
                    FROM
                        BOOKING_DATA.BOOKINGS A
                        LEFT JOIN BOOKING_CONFIG.CENTERS B ON (A.CENTER_ID = B.CENTERS_ID)
                        LEFT JOIN BOOKING_DATA.ROOM_TYPE C ON (A.BED_TYPE = C.ID_ROOM_TYPE)
                        LEFT JOIN BOOKING_DATA.BEDROOMS D ON (A.ROOM_ID = D.ROOM_ID) ${where}`;
            }

            let rta = await this.pool.query(query);
            if (typeof params.return_all && params.return_all == true) {
                return rta.rows;
            } else {
                return rta.rows[0];
            }

        } catch (error) {
            return messageHandler(error);
        }
    }



}

module.exports = reservationServices;