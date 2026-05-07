const pool = require('../../libs/postgres.pool');
const moment = require("moment");
const messageHandler = require('./../../middlewares/message.handler');
// const reservationService = require('./Services/reservationService');

// const reserva = new reservationService();
class dashboardServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }


  async getDashboard(params) {
    try {
      let data = {};
      const reservasPenduientes = await this.getReservasState({ state: 'pendiente_confirmar' });
      console.log("reservasPenduientes", reservasPenduientes.pendiente_confirmar);
      data.reservasPenduientes = reservasPenduientes.pendiente_confirmar;
      const reservasReservadas = await this.getReservasState({ state: 'reservada' });
      data.reservasReservadas = reservasReservadas.reservada;
      const ingresosClientes = await this.getReservasState({ state: 'ingreso' });
      data.ingresosClientes = ingresosClientes.ingreso;
return data;
      // const habitacionesDisponibles = await this.getHabitacionesDisponibles(params);
      // const habitacionesOcupadas = await this.getHabitacionesOcupadas(params);

    } catch (error) {
      return messageHandler(error);
    }
  }


  async getReservasState(params) {

    try {
      let where = ``;
      if (typeof params.state != "undefined" && params.state == 'pendiente_confirmar') {
        where += `WHERE STATE = 'PENDIENTE CONFIRMAR'`;
      }
      if (typeof params.state != "undefined" && params.state == 'reservada') {
        where += `WHERE STATE = 'RESERVADA'`;
      }
      if (typeof params.state != "undefined" && params.state == 'ingreso') {
        where += `WHERE STATE = 'INGRESO'`;
      }

      let query = `
          SELECT
            COUNT(*) AS ${params.state}
          FROM
            BOOKING_DATA.BOOKINGS

          ${where}
        `;

      let rta = await this.pool.query(query);
      return rta.rows[0];

    } catch (error) {
      return messageHandler(error);
    }

  }

}


module.exports = dashboardServices;
