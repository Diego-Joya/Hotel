const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
const clientesServices = require('./clientesServices');

const clientes = new clientesServices();

class reservationServices {
    constructor() {

    }
    async createReservation(body) {
        try {
            console.log(body);
            let id_cliente = body.customer_id;
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

                const crearCliente = await clientes.crear(cliente);
                console.log("resul crear cliente", crearCliente);
                const { ok } = crearCliente;
                if (ok == false) {
                    return crearCliente;
                } else {
                    id_cliente = crearCliente[0].customer_id;
                }
            }

            const crearReserva = await this.crear(body);



        } catch (error) {
            return messageHandler(error)
        }

    }
    async crear(body) {
        const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
        const names = body.names;
        const surnames = body.surnames;
        const no_document = body.no_document;
        const reservation_date = body.reservation_date;
        const state = body.state;
        const center_id = body.center_id;
        const bed_type = body.bed_type;
        const room_id = body.room_id;
        const created_by = body.created_by;
        const created_at = fecha_hora;
        const company_id = body.company_id;

        try {
            const query = `INSERT INTO booking_data.bookings(
	 names, surnames, no_document, reservation_date, state, center_id, bed_type, room_id, created_by,  created_at,  company_id)
	VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); RETURNING *`;
            const rta = await this.pool
                .query(query, [
                    names,
                    surnames,
                    no_document,
                    reservation_date,
                    state,
                    center_id,
                    bed_type,
                    room_id,
                    created_by,
                    created_at,
                    company_id
                ]);
            return rta.rows[0];
        } catch (error) {
            return messageHandler(error)
        }

    }



}

module.exports = reservationServices;