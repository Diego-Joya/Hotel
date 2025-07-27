const { array } = require('joi');
const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
const clientesServices = require('./clientesServices');
const habitacionesServices = require('./habitacionesServices');
const moment = require('moment');

const clientes = new clientesServices();
const habitaciones = new habitacionesServices();

class reservationServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.log(err));

  }
  async createReservation(body) {
    try {
      const transaction = await pool.connect();

      await transaction.query('BEGIN');
      // let id_cliente = body.customer_id;
      let arrayData = [];

      if (typeof body.customer_id == "undefined" || body.customer_id == '0' || body.customer_id == '') {
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
        const crearCliente = await clientes.crear(cliente, transaction);
        let { ok } = crearCliente;
        if (ok == false) {
          await transaction.query('ROLLBACK');
          return crearCliente;
        } else {
          arrayData.push(crearCliente[0]);
          body.customer_id = crearCliente.customer_id;
        }
      }

      const crearReserva = await this.crear(body);
      if (crearReserva.ok == false) {
        await transaction.query('ROLLBACK');
        return crearReserva;
      }
      else {
        arrayData.push(crearReserva);
        let booking_id = crearReserva.booking_id;
        let arrayRegisterBedrooms = [];
        for (let i = 0; i < body.rooms_reservations.length; i++) {
          body.rooms_reservations[i].booking_id = booking_id;
          let rooms_reservations = body.rooms_reservations[i];
          let registerBedrooms = await this.registerBedrooms(rooms_reservations, transaction);
          if (registerBedrooms.ok == false) {
            await transaction.query('ROLLBACK');
            return registerBedrooms;
          }
          let room = {};
          room.no_room = rooms_reservations.room_text;
          room.type_room = rooms_reservations.room_type_text;


          arrayRegisterBedrooms.push(room);


          if (typeof rooms_reservations.room != 'undefined' && rooms_reservations.room != '') {
            let data = {};
            data.room_id = rooms_reservations.room;
            data.state = 'RESERVADA';
            let stateBedroom = await habitaciones.actualizarEstado(transaction, data);
            if (stateBedroom.ok == false) {
              await transaction.query('ROLLBACK');
              return stateBedroom;
            }
          }
        }

        // arrayData.no_room = arrayRegisterBedrooms;
        const resultado = arrayData.map((item, index) => {
          return {
            ...item,
            no_room: arrayRegisterBedrooms[index]  // asigna según la posición
          };
        });

        console.log('arrayData', arrayData);
        console.log('resultado', resultado);
        await transaction.query('COMMIT');
        return resultado;
      }


    } catch (error) {
      return messageHandler(error)
    }
  }
  async crear(body, transaction = null) {
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
    const no_document = body.no_document;
    const entry_date = body.entry_date;
    const state = 'SIN CONFIRMAR';
    const center_id = body.center_id;
    const created_by = body.created_by;
    const created_at = fecha_hora;
    const company_id = body.company_id;
    const customer_id = body.customer_id;
    const exit_date = body.exit_date;
    const total_days = body.total_days;
    const number_persons = body.number_persons;

    try {
      let client = '';
      if (transaction != null) {
        client = transaction
      } else {
        client = this.pool;
      }
      //     const query = `INSERT INTO booking_data.bookings(
      //   no_document, reservation_date, state, center_id, created_by,  created_at,  company_id, customer_id)
      // VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
      const query = `INSERT INTO booking_data.bookings(
	   no_document, entry_date, state, center_id, created_by, created_at, company_id, customer_id, exit_date, total_days, number_persons)
	VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ) RETURNING *`;
      const rta = await client.query(query, [
        no_document,
        entry_date,
        state,
        center_id,
        created_by,
        created_at,
        company_id,
        customer_id,
        exit_date,
        total_days,
        number_persons,
      ]);
      // return rta.rows[0];
      if (typeof rta.rows[0] != 'undefined') {
        let dat = {};
        dat.booking_id = rta.rows[0].booking_id;
        // values[0].key = values[0].room_id;
        const consult = await this.gellAllReservations(dat);

        return consult;
      } else {
        console.log("rta.rows", rta.rows);
        return rta.rows;
      }



    } catch (error) {
      return messageHandler(error)
    }

  }

  async registerBedrooms(body, transaction = null) {
    console.log('body', body);
    const booking_id = body.booking_id;
    const room = body.room;
    const price = body.price;
    const room_type = body.room_type;
    console.log('booking_id', booking_id);
    console.log('room', room);
    console.log('price', price);
    console.log('room_type', room_type);

    try {
      let client = '';
      if (transaction != null) {
        client = transaction
      } else {
        client = this.pool;
      }
      const query = `INSERT INTO booking_data.rooms_reservations(
	 room_type, room_id, price, booking_id)
	VALUES ( $1, $2, $3, $4) RETURNING *`;
      console.log('query', query);
      const rta = await client.query(query, [
        room_type,
        room,
        price,
        booking_id

      ]);
      // return rta.rows[0];
      return rta.rows;
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
        where += ` and e.room_type=${params.room_type}`;
      }
      if (typeof params.room_id != "undefined" && params.room_id != "") {
        where += ` and e.room_id=${params.room_id}`;
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
                  D.ROOM_TYPE AS TYPE_ROOM
                FROM
                  BOOKING_DATA.BOOKINGS A
                  LEFT JOIN BOOKING_CONFIG.CENTERS B ON (A.CENTER_ID = B.CENTERS_ID)
                  LEFT JOIN BOOKING_DATA.ROOMS_RESERVATIONS E ON (A.BOOKING_ID = E.BOOKING_ID)
                  LEFT JOIN BOOKING_DATA.ROOM_TYPE C ON (E.ROOM_TYPE = C.ID_ROOM_TYPE)
                  LEFT JOIN BOOKING_DATA.BEDROOMS D ON (E.ROOM_ID = D.ROOM_ID) ${where}`;
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
