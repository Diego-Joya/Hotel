const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
const clientesServices = require('./clientesServices');
const habitacionesServices = require('./habitacionesServices');
const maestroHabitacionServices = require('./maestroHabitacionServices');

const moment = require('moment');

const clientes = new clientesServices();
const habitaciones = new habitacionesServices();
const maestroHabitacion = new maestroHabitacionServices();
class reservationServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.log(err));
  }

  // =========================================================
  // CREATE RESERVATION
  // =========================================================
  async createReservation(body) {



    const transaction = await this.pool.connect();

    try {
      await transaction.query('BEGIN');

      let arrayData = [];

      // Si no existe customer_id, crear cliente
      if (
        typeof body.customer_id == "undefined" ||
        body.customer_id == '0' ||
        body.customer_id == ''
      ) {
        let cliente = {};
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
        cliente.validar = false;

        const crearCliente = await clientes.crear(cliente, transaction);

        if (crearCliente.ok === false) {
          await transaction.query('ROLLBACK');
          return crearCliente;
        } else {
          arrayData.push(crearCliente[0] || crearCliente);
          body.customer_id = crearCliente.customer_id;
        }
      }

      // IMPORTANTE: ahora sí pasa transaction
      const crearReserva = await this.crear(body, transaction);
      console.log("crearReserva", crearReserva);
      if (crearReserva.ok === false) {
        await transaction.query('ROLLBACK');
        return crearReserva;
      }
      arrayData.push(crearReserva);

      let booking_id = crearReserva.booking_id;
      let arrayRegisterBedrooms = [];
      let roomsReservationsResponse = [];
      for (let i = 0; i < body.rooms_reservations.length; i++) {
        body.rooms_reservations[i].booking_id = booking_id;
        let rooms_reservations = body.rooms_reservations[i];

        let registerBedrooms = await this.registerBedrooms(rooms_reservations, transaction);
        console.log("registerBedrooms", registerBedrooms);

        if (registerBedrooms.ok === false) {
          await transaction.query('ROLLBACK');
          return registerBedrooms;
        }

        let room = {};
        room.no_room = rooms_reservations.room_text;
        room.type_room = rooms_reservations.room_type_text;

        arrayRegisterBedrooms.push(room);

        roomsReservationsResponse.push({
          rooms_reservations_id: registerBedrooms[0]?.rooms_reservations_id || null,
          room: rooms_reservations.room,
          room_text: rooms_reservations.room_text,
          room_type: rooms_reservations.room_type,
          room_type_text: rooms_reservations.room_type_text,
          price: rooms_reservations.price
        });

        if (typeof rooms_reservations.room != 'undefined' && rooms_reservations.room != '') {
          let data = {};
          data.room_id = rooms_reservations.room;
          data.state = 'RESERVADA';

          let stateBedroom = await habitaciones.actualizarEstado(transaction, data);
          if (stateBedroom.ok === false) {
            await transaction.query('ROLLBACK');
            return stateBedroom;
          }
          arrayData.push(arrayRegisterBedrooms);
        }
      }

      await transaction.query('COMMIT');
      let cliente = await clientes.getAllClientes({ customer_id: body.customer_id });
      console.log("cliente", cliente);
      crearReserva.customer_id = cliente[0]?.customer_id;
      crearReserva.names = cliente[0]?.names;
      crearReserva.surnames = cliente[0]?.surnames;
      crearReserva.document_type = cliente[0]?.document_type;
      crearReserva.no_document = cliente[0]?.no_document;
      crearReserva.cell_phone = cliente[0]?.cell_phone;

      const responseData = {
        ...crearReserva,
        rooms_reservations: roomsReservationsResponse
      };
      return responseData;

    } catch (error) {
      await transaction.query('ROLLBACK');
      return messageHandler(error);
    } finally {
      transaction.release();
    }
  }

  // =========================================================
  // UPDATE RESERVATION
  // =========================================================
  async updateReservation(body, id) {
    const transaction = await this.pool.connect();

    try {
      await transaction.query('BEGIN');

      if (!id || id == 0) {
        await transaction.query('ROLLBACK');
        return {
          ok: false,
          message: 'El booking_id es obligatorio para actualizar la reserva'
        };
      }

      // 1. Validar que exista la reserva
      const bookingActual = await this.getReservationById(id, transaction);
      if (!bookingActual || bookingActual.ok === false) {
        await transaction.query('ROLLBACK');
        return {
          ok: false,
          message: 'La reserva no existe'
        };
      }

      // 2. Obtener habitaciones actuales
      const habitacionesActuales = await this.getReservationRooms(id, transaction);
      if (habitacionesActuales.ok === false) {
        await transaction.query('ROLLBACK');
        return habitacionesActuales;
      }

      // 3. Liberar habitaciones actuales
      for (let i = 0; i < habitacionesActuales.length; i++) {
        if (habitacionesActuales[i].room_id) {
          let data = {
            room_id: habitacionesActuales[i].room_id,
            state: 'DISPONIBLE'
          };

          let liberarHabitacion = await habitaciones.actualizarEstado(transaction, data);
          if (liberarHabitacion.ok === false) {
            await transaction.query('ROLLBACK');
            return liberarHabitacion;
          }
        }
      }

      // 4. Actualizar cliente (opcional)
      if (body.customer_id && body.customer_id != '0') {
        const actualizarCliente = await this.updateCustomerIfNeeded(body, transaction);
        if (actualizarCliente.ok === false) {
          await transaction.query('ROLLBACK');
          return actualizarCliente;
        }
      }

      // 5. Actualizar cabecera
      body.booking_id = id;
      const actualizarReserva = await this.updateBooking(body, transaction);
      if (actualizarReserva.ok === false) {
        await transaction.query('ROLLBACK');
        return actualizarReserva;
      }

      // 6. Eliminar detalles viejos
      const eliminarDetalles = await this.deleteReservationRooms(body.booking_id, transaction);
      if (eliminarDetalles.ok === false) {
        await transaction.query('ROLLBACK');
        return eliminarDetalles;
      }

      // 7. Insertar nuevos detalles y reservar nuevas habitaciones
      let arrayRegisterBedrooms = [];

      for (let i = 0; i < body.rooms_reservations.length; i++) {
        body.rooms_reservations[i].booking_id = body.booking_id;
        let rooms_reservations = body.rooms_reservations[i];

        let registerBedrooms = await this.registerBedrooms(rooms_reservations, transaction);
        if (registerBedrooms.ok === false) {
          await transaction.query('ROLLBACK');
          return registerBedrooms;
        }

        let room = {};
        room.no_room = rooms_reservations.room_text;
        room.type_room = rooms_reservations.room_type_text;
        arrayRegisterBedrooms.push(room);

        if (typeof rooms_reservations.room != 'undefined' && rooms_reservations.room != '') {
          let data = {
            room_id: rooms_reservations.room,
            state: 'RESERVADA'
          };

          let stateBedroom = await habitaciones.actualizarEstado(transaction, data);
          if (stateBedroom.ok === false) {
            await transaction.query('ROLLBACK');
            return stateBedroom;
          }
        }
      }

      await transaction.query('COMMIT');

      return {
        ok: true,
        message: 'Reserva actualizada correctamente',
        booking_id: body.booking_id,
        no_room: arrayRegisterBedrooms
      };

    } catch (error) {
      await transaction.query('ROLLBACK');
      return messageHandler(error);
    } finally {
      transaction.release();
    }
  }

  // =========================================================
  // CANCEL RESERVATION
  // =========================================================
  async cancelReservation(body) {
    const transaction = await this.pool.connect();

    try {
      await transaction.query('BEGIN');

      if (!body.booking_id || body.booking_id == 0) {
        await transaction.query('ROLLBACK');
        return {
          ok: false,
          message: 'El booking_id es obligatorio para cancelar la reserva'
        };
      }

      // 1. Buscar habitaciones de la reserva
      const habitacionesActuales = await this.getReservationRooms(body.booking_id, transaction);
      if (habitacionesActuales.ok === false) {
        await transaction.query('ROLLBACK');
        return habitacionesActuales;
      }

      // 2. Liberar habitaciones
      for (let i = 0; i < habitacionesActuales.length; i++) {
        if (habitacionesActuales[i].room_id) {
          let data = {
            room_id: habitacionesActuales[i].room_id,
            state: 'DISPONIBLE'
          };

          let liberarHabitacion = await habitaciones.actualizarEstado(transaction, data);
          if (liberarHabitacion.ok === false) {
            await transaction.query('ROLLBACK');
            return liberarHabitacion;
          }
        }
      }

      // 3. Cambiar estado de la reserva a CANCELADA
      const query = `
        UPDATE booking_data.bookings
        SET state = 'CANCELADA'
        WHERE booking_id = $1
        RETURNING *;
      `;

      const rta = await transaction.query(query, [body.booking_id]);

      if (rta.rows.length === 0) {
        await transaction.query('ROLLBACK');
        return {
          ok: false,
          message: 'No se pudo cancelar la reserva'
        };
      }

      await transaction.query('COMMIT');

      return {
        ok: true,
        message: 'Reserva cancelada correctamente',
        data: rta.rows[0]
      };

    } catch (error) {
      await transaction.query('ROLLBACK');
      return messageHandler(error);
    } finally {
      transaction.release();
    }
  }

  // =========================================================
  // CREATE BOOKING HEADER
  // =========================================================
  async crear(body, transaction = null) {
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');

    const no_document = body.no_document;
    const entry_date = body.entry_date;
    if (typeof body.state == "undefined" || body.state == "") {
      body.state = 'PENDIENTE CONFIRMAR';
    }

    const state = body.state;
    const center_id = body.center_id;
    const created_by = body.created_by;
    const created_at = fecha_hora;
    const company_id = body.company_id;
    const customer_id = body.customer_id;
    const exit_date = body.exit_date;
    const total_days = body.total_days;
    const number_persons = body.number_persons;
    const total_rooms = body.total_rooms;

    try {
      let client = transaction != null ? transaction : this.pool;

      const query = `
        INSERT INTO booking_data.bookings(
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
          total_rooms
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
      `;

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
        total_rooms
      ]);

      if (typeof rta.rows[0] != 'undefined') {
        return rta.rows[0];
      } else {
        return {
          ok: false,
          message: 'No se pudo crear la reserva'
        };
      }

    } catch (error) {
      return messageHandler(error);
    }
  }

  // =========================================================
  // UPDATE BOOKING HEADER
  // =========================================================
  async updateBooking(body, transaction = null) {
    try {
      let client = transaction != null ? transaction : this.pool;

      const query = `
        UPDATE booking_data.bookings
        SET
          no_document = $1,
          entry_date = $2,
          center_id = $3,
          company_id = $4,
          customer_id = $5,
          exit_date = $6,
          total_days = $7,
          number_persons = $8,
          total_rooms = $9
        WHERE booking_id = $10
        RETURNING *;
      `;

      const rta = await client.query(query, [
        body.no_document,
        body.entry_date,
        body.center_id,
        body.company_id,
        body.customer_id,
        body.exit_date,
        body.total_days,
        body.number_persons,
        body.total_rooms,
        body.booking_id
      ]);

      if (rta.rows.length > 0) {
        return rta.rows[0];
      }

      return {
        ok: false,
        message: 'No se pudo actualizar la reserva'
      };

    } catch (error) {
      return messageHandler(error);
    }
  }

  // =========================================================
  // INSERT ROOMS RESERVATIONS
  // =========================================================
  async registerBedrooms(body, transaction = null) {
    const booking_id = body.booking_id;
    const room = body.room;
    const price = body.price;
    const room_type = body.room_type;

    let result = {};

    try {
      let client = transaction != null ? transaction : this.pool;

      const query = `
      INSERT INTO booking_data.rooms_reservations(
        room_type,
        room_id,
        price,
        booking_id
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

      const rta = await client.query(query, [
        room_type,
        room,
        price,
        booking_id
      ]);

      const roomsReservations = rta.rows[0];

      result.roomsReservations = roomsReservations;
      result.guestsRooms = [];

      // insertar los huéspedes de cada habitación reservada
      if (Array.isArray(body.guests_rooms) && body.guests_rooms.length > 0) {
        for (let i = 0; i < body.guests_rooms.length; i++) {
          let huesped = body.guests_rooms[i];

          if (
            typeof huesped.customer_id === 'undefined' ||
            huesped.customer_id === '' ||
            huesped.customer_id === '0' ||
            huesped.customer_id === null
          ) {
            // crear cliente
            const crearCliente = await clientes.crear(huesped, transaction);
            console.log("crearCliente", crearCliente);

            if (crearCliente.ok === false) {
              return crearCliente;
            }

            huesped.customer_id = crearCliente.customer_id;
          }

          const queryGuest = `
          INSERT INTO booking_data.guests_rooms(
            customer_id,
            rooms_reservation
          )
          VALUES ($1, $2)
          RETURNING *;
        `;

          const rtaQuest = await client.query(queryGuest, [
            huesped.customer_id,
            roomsReservations.rooms_reservations_id
          ]);

          const guestsRoomsres = rtaQuest.rows[0];

          result.guestsRooms.push(guestsRoomsres);
        }
      }

      return result;

    } catch (error) {
      return messageHandler(error);
    }
  }
  // =========================================================
  // GET BOOKING BY ID
  // =========================================================
  async getReservationById(booking_id, transaction = null) {
    try {
      let client = transaction != null ? transaction : this.pool;

      const query = `
        SELECT *
        FROM booking_data.bookings
        WHERE booking_id = $1
        LIMIT 1;
      `;

      const rta = await client.query(query, [booking_id]);

      if (rta.rows.length > 0) {
        return rta.rows[0];
      }

      return null;

    } catch (error) {
      return messageHandler(error);
    }
  }

  // =========================================================
  // GET RESERVATION ROOMS
  // =========================================================
  async getReservationRooms(booking_id, transaction = null) {
    try {
      let client = transaction != null ? transaction : this.pool;

      const query = `
        SELECT rooms_reservations_id, booking_id, room_id, room_type, price
        FROM booking_data.rooms_reservations
        WHERE booking_id = $1;
      `;

      const rta = await client.query(query, [booking_id]);
      return rta.rows;

    } catch (error) {
      return messageHandler(error);
    }
  }

  // =========================================================
  // DELETE RESERVATION ROOMS
  // =========================================================
  async deleteReservationRooms(booking_id, transaction = null) {
    try {
      let client = transaction != null ? transaction : this.pool;

      const query = `
        DELETE FROM booking_data.rooms_reservations
        WHERE booking_id = $1;
      `;

      await client.query(query, [booking_id]);

      return {
        ok: true,
        message: 'Detalles anteriores eliminados'
      };

    } catch (error) {
      return messageHandler(error);
    }
  }

  // =========================================================
  // UPDATE CUSTOMER IF NEEDED
  // =========================================================
  async updateCustomerIfNeeded(body, transaction = null) {
    try {
      let client = transaction != null ? transaction : this.pool;

      // CAMBIAR booking_data.customers por tu tabla real
      const query = `
        UPDATE booking_data.customers
        SET
          names = $1,
          surnames = $2,
          document_type = $3,
          no_document = $4,
          cell_phone = $5
        WHERE customer_id = $6
        RETURNING *;
      `;

      const rta = await client.query(query, [
        body.names,
        body.surnames,
        body.document_type,
        body.no_document,
        body.cell_phone,
        body.customer_id
      ]);

      if (rta.rows.length > 0) {
        return rta.rows[0];
      }

      return {
        ok: false,
        message: 'No se pudo actualizar el cliente'
      };

    } catch (error) {
      return messageHandler(error);
    }
  }

  // =========================================================
  // LIST / GET ALL RESERVATIONS
  // =========================================================
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
      if (typeof params.state != "undefined" && params.state != "") {
        where += ` and a.state='${params.state}'`;
      }

      let query = '';

      if (typeof params.fields != 'undefined' && params.fields != null) {
        query = `select a.user_id as key, ${params.fields} from booking_config.users a ${where}`;
      } else {
        query = `
          SELECT
            A.*,
            A.CREATED_AT::TEXT AS CREATED_AT,
            A.EXIT_DATE::TEXT AS EXIT_DATE,
            A.ENTRY_DATE::TEXT AS ENTRY_DATE,
            B.CENTER_NAME,
            A.BOOKING_ID as KEY,
            C.NAMES || ' ' || C.SURNAMES AS CUSTOMER_NAME,
            C.DOCUMENT_TYPE,
            C.NO_DOCUMENT,
            C.NAMES,
            C.SURNAMES,
            C.CELL_PHONE
          FROM
            BOOKING_DATA.BOOKINGS A
            LEFT JOIN BOOKING_CONFIG.CENTERS B ON (A.CENTER_ID = B.CENTERS_ID)
            LEFT JOIN booking_data.customers C ON (A.CUSTOMER_ID = C.CUSTOMER_ID)
          ${where}
        `;
      }
      console.log('query', query);
      let rta = await this.pool.query(query);

      if (typeof params.return_all != 'undefined' && params.return_all == true) {
        for (let i = 0; i < rta.rows.length; i++) {
          let details = await this.getAllDetailsReservations(rta.rows[i]);
          rta.rows[i].no_room = details;
        }
        return rta.rows;
      } else {
        return rta.rows[0];
      }

    } catch (error) {
      return messageHandler(error);
    }
  }

  // =========================================================
  // GET DETAILS RESERVATION
  // =========================================================
  async getAllDetailsReservations(params) {
    try {
      let where = ` where 1=1`;

      if (typeof params.booking_id != "undefined" && params.booking_id != "") {
        where += ` and A.BOOKING_ID=${params.booking_id}`;
      }

      let query = `
        SELECT
          A.ROOMS_RESERVATIONS_ID,
          A.BOOKING_ID,
          A.ROOM_ID,
          A.ROOM_TYPE,
          A.PRICE,
          C.NO_ROOM,
          B.NAME AS TYPE_ROOM
        FROM
          BOOKING_DATA.ROOMS_RESERVATIONS A
          LEFT JOIN BOOKING_DATA.ROOM_TYPE B ON (A.ROOM_TYPE = B.ID_ROOM_TYPE)
          LEFT JOIN BOOKING_DATA.BEDROOMS C ON (A.ROOM_ID = C.ROOM_ID)
        ${where}
      `;

      let rta = await this.pool.query(query);
      return rta.rows;

    } catch (error) {
      return messageHandler(error);
    }
  }
  async getReservationsCalendar(params) {
    try {
      let where = ` where 1=1`;

      if (typeof params.booking_id != "undefined" && params.booking_id != "") {
        where += ` and A.BOOKING_ID=${params.booking_id}`;
      }
      if (typeof params.start != "undefined" && params.start != "" && typeof params.end != "undefined" && params.end != "") {
        where += ` and A.entry_date::date between '${params.start}' and '${params.end}'`;
      }

      let query = `
        SELECT
          A.BOOKING_ID AS ID,
          D.NO_ROOM,
CONCAT('🏨 ', D.NO_ROOM, ' ', E.NAMES, ' ', E.SURNAMES) AS TITLE,
CONCAT (E.NAMES, ' ', E.SURNAMES) AS CUSTOMER,
A.TOTAL_DAYS, A.TOTAL_ROOMS,
          A.ENTRY_DATE::DATE::TEXT AS START,
          A.EXIT_DATE::DATE::TEXT AS END
        FROM
        BOOKING_DATA.BOOKINGS A
          LEFT JOIN BOOKING_DATA.ROOMS_RESERVATIONS B ON (A.BOOKING_ID = B.BOOKING_ID)
          LEFT JOIN BOOKING_DATA.ROOM_TYPE C ON (B.ROOM_TYPE = C.ID_ROOM_TYPE)
          LEFT JOIN BOOKING_DATA.BEDROOMS D ON (B.ROOM_ID = D.ROOM_ID)
          LEFT JOIN BOOKING_DATA.CUSTOMERS E ON (A.CUSTOMER_ID = E.CUSTOMER_ID)
        ${where}
      `;

      let rta = await this.pool.query(query);
      return rta.rows;

    } catch (error) {
      return messageHandler(error);
    }
  }
  async confirm_cancel_Booking(body, id) {
    try {
      console.log("id", id);
      const query = `
        UPDATE booking_data.bookings
        SET
          state = $1
        WHERE booking_id = $2
        RETURNING *`;

      const rta = await this.pool.query(query, [
        body.state,
        id
      ]);
      console.log("rta", rta.rows);
      return rta.rows[0];

    } catch (error) {
      return messageHandler(error);
    }
  }
  async rooms_Booking(params) {
    try {

      let where = 'where  1=1 ';
      if (typeof params.exit_date != "undefined" && typeof params.exit_date != "undefined" && params.exit_date != "" && params.exit_date != "") {
        where += ` and B.ENTRY_DATE >='${params.entry_date}'  AND B.EXIT_DATE <= '${params.exit_date}'`;
      }
      if (typeof params.customer_id != "undefined" && params.customer_id != "") {
        where += ` and B.CUSTOMER_ID = '${params.customer_id}'`
      }
      if (typeof params.customer_id != "undefined" && params.customer_id != "") {
        where += ` and B.CUSTOMER_ID = '${params.customer_id}'`
      }
      if (typeof params.room_id != "undefined" && params.room_id != "") {
        where += ` and A.ROOM_ID = '${params.room_id}'`
      }
      if (typeof params.room_type != "undefined" && params.room_type != "") {
        where += ` and A.ROOM_TYPE = '${params.room_type}'`
      }
      if (typeof params.entry_date != "undefined" && params.entry_date != "" && params.exit_date == "") {
        where += ` and A.ENTRY_DATE  BETWEEN '${params.entry_date}' AND  '${params.entry_date}'`
      }
      if (typeof params.exit_date != "undefined" && params.exit_date != "" && params.entry_date == "") {
        where += ` and A.EXIT_DATE  BETWEEN '${params.exit_date}' AND  '${params.entry_date}'`
      }
      if (typeof params.center_id != "undefined" && params.center_id != "") {
        where += ` and B.CENTER_ID = '${params.center_id}'`
      }
      if (typeof params.company_id != "undefined" && params.company_id != "") {
        where += ` and B.COMPANY_ID = '${params.company_id}'`
      }


      let fields = ` A.ROOMS_RESERVATIONS_ID,
        A.ROOM_TYPE,
        A.ROOM_ID,
        A.PRICE,
        B.NO_DOCUMENT,
        B.EXIT_DATE,
        B.ENTRY_DATE,
        B.STATE,
        B.TOTAL_DAYS,
        B.NUMBER_PERSONS,
        B.TOTAL_ROOMS,
        B.CUSTOMER_ID,
        C.NAMES,
        C.SURNAMES,
        C.DOCUMENT_TYPE,
        C.CELL_PHONE,
        D.NAME AS NAME_TYPE_ROOM`;
      console.log("params", params);



      if (typeof params.distict_room != "undefined" && params.distict_room == true) {
        fields = `DISTINCT
                  ON (A.ROOM_ID) ROOM_ID,
                  A.PRICE,
                  B.NO_DOCUMENT,
                  B.EXIT_DATE,
                  B.ENTRY_DATE,
                  B.STATE,
                  B.TOTAL_DAYS,
                  B.NUMBER_PERSONS,
                  B.TOTAL_ROOMS,
                  B.CUSTOMER_ID,
                  C.NAMES,
                  C.SURNAMES,
                  C.DOCUMENT_TYPE,
                  C.CELL_PHONE,
                  D.NAME AS NAME_TYPE_ROOM`
      }
      const query = `
       SELECT
       ${fields}
      FROM
        BOOKING_DATA.ROOMS_RESERVATIONS A
        LEFT JOIN BOOKING_DATA.BOOKINGS B ON (A.BOOKING_ID = B.BOOKING_ID)
        LEFT JOIN BOOKING_DATA.CUSTOMERS C ON B.CUSTOMER_ID = C.CUSTOMER_ID
        LEFT JOIN BOOKING_DATA.ROOM_TYPE D ON A.ROOM_TYPE = D.ID_ROOM_TYPE ${where} `;

      let consulta = await this.pool.query(query);
      return consulta.rows;

    } catch (error) {
      return messageHandler(error);
    }
  }
  async rooms_available(params) {
    try {
      const data = {
        distinct_room: true,
        entry_date: params.entry_date,
        exit_date: params.exit_date,
        company_id: params.company_id,
        center_id: params.center_id
      };

      const rooms = await this.rooms_Booking(data);
      console.log("rooms", rooms);
      const allRooms = await habitaciones.getAllHabitaciones({ return_all: true, select: 'true', center_id: params.center_id, company_id: params.company_id });
      console.log("allRooms", allRooms);
      let rooms_available = [];
      for (let i = 0; i < allRooms.length; i++) {
        let room = allRooms[i];
        let isBooked = false;

        for (let j = 0; j < rooms.length; j++) {
          let reservation = rooms[j];

          if (reservation.room_id === room.room_id) {
            isBooked = true;
            break;
          }
        }

        if (!isBooked) {
          rooms_available.push(room);
        }
      }
      let maestroHabitacionData = await maestroHabitacion.getAll({ select: 'true', center_id: params.center_id });
      console.log("maestroHabitacionData", maestroHabitacionData);

      const data_return = {
        type_room: maestroHabitacionData,
        rooms: rooms_available
      }

      return data_return;

    } catch (error) {
      messageHandler(error);
      throw error;
    }
  }

}

module.exports = reservationServices;
