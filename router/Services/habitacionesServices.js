const pool = require('../../libs/postgres.pool');
const moment = require("moment");

class habitacionesServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  // CREAR BEDROOMS
  async createBedrooms(body) {
    console.log(body);
    // return; 
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
    const no_room = body.no_room;
    const val_min = body.val_min;
    const val_max = body.val_max;
    const type = body.type;
    const center_id = body.center_id;
    const created_by = body.created_by;
    const created_at = fecha_hora;
    const state = body.state;

    if (val_min > val_max) {
      let resp = {
        ok: false,
        message: 'El valor minimo no puede ser superior al valor maximo. ¡Verifica e intenta de nuevo por favor!',

      }
      return resp
    }

    const query = `INSERT INTO booking_data.bedrooms(fecha, no_room, val_min, val_max, type, center_id, created_by, created_at, state)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9 ) RETURNING *`;
    const rta = await this.pool
      .query(query, [
        fecha_hora,
        no_room,
        val_min,
        val_max,
        type,
        center_id,
        created_by,
        created_at,
        state,
      ])
      .catch((err) => console.log(err));
    return rta.rows;
  }
  // ACTUALIZAR
  async actualizar(id, body) {
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
    const no_room = body.no_room;
    const val_min = body.val_min;
    const val_max = body.val_max;
    const type = body.type;
    const center_id = body.center_id;
    const updated_by = body.created_by;
    const updated_at = fecha_hora;
    const state = body.state;

    const consulExistencia = await this.getHabitaciones({ id });
    if (consulExistencia == "") {
      let resp = {
        ok: false,
        message: '¡El dato que intentas actualizar no existe en la base de datos!',

      }
      return resp
    }

    if (val_min > val_max) {
      let resp = {
        ok: false,
        message: 'El valor minimo no puede ser superior al valor maximo. ¡Verifica e intenta de nuevo por favor!',

      }
      return resp
    }

    const query = `UPDATE booking_data.bedrooms
	SET  no_room=$1, val_min=$2, val_max=$3, type=$4, center_id=$5, updated_by=$6, updated_at=$7,state=$8
	WHERE room_id=$9  RETURNING *`;
    const rta = await this.pool
      .query(query, [
        no_room,
        val_min,
        val_max,
        type,
        center_id,
        updated_by,
        updated_at,
        state,
        id,
      ])
      .catch((err) => console.log(err));
    return rta.rows;
  }

  async getHabitaciones({ id, numHabitacion, fecha_inicial, fecha_final }) {
    console.log('fecha_inicial', fecha_inicial);
    console.log('fecha_final', fecha_final);
    console.log('numHabitacion', numHabitacion);
    console.log('id', id);
    if (typeof id != 'undefined') {
      let query = `select * from booking_data.bedrooms where room_id=${id}`;
      let rta = await this.pool.query(query).catch((err) => console.log(err));
      return rta.rows
    } else if (typeof fecha_inicial != 'undefined' && typeof fecha_final != 'undefined') {
      let query = `select * from   booking_data.bedrooms where fecha between '${fecha_inicial}' and '${fecha_final}'`;
      console.log(query);
      let rta = await this.pool.query(query).catch((err) => console.log(err));
      return rta.rows;
    }
    else {
      console.log("Debes proporcionar al menos un parametro para la busqueda: id, numero habitacion o rago de fechas");

      throw new Error("Debes proporcionar al menos un parametro para la busqueda: id, numero habitacion o rago de fechas");
    }
  }

  async getAllHabitaciones() {
    let query = `select * from booking_data.bedrooms`;
    let rta = await this.pool.query(query).catch((err) => console.log(err));
    return rta.rows
  }

  async deleteHabitacion(id) {
    const validate = await this.getHabitaciones({ id });
    if (validate == "") {
      return {
        ok: false,
        message: 'No se encontro el registro en la bd',
      }
    }
    const query = `delete from booking_data.bedrooms where id=${id}`;
    const rta = await this.pool.query(query).catch((err) => {
      console.log(err)
      if (err.code == '42703') {
        return {
          ok: false,
          message: `Error al realizar el proceso ${err.message}`,
        }
      }
    });
    return rta;

  }

}
module.exports = habitacionesServices;
