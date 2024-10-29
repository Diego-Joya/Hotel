const pool = require('../../libs/postgres.pool');
const moment = require("moment");
const messageHandler = require('./../../middlewares/message.handler');


class habitacionesServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  // CREAR BEDROOMS
  async createBedrooms(body) {
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
    const no_room = body.no_room;
    const val_min = body.val_min;
    const val_max = body.val_max;
    const type = body.type;
    const center_id = body.center_id;
    const created_by = body.created_by;
    const created_at = fecha_hora;
    const state = body.state;
    const description = body.description;
    const numHabitacion = body.no_room;

    const params = { numHabitacion };

    const validateNoRoom = await this.getHabitaciones(params);
    if (validateNoRoom.length > 0) {
      let resp = {
        ok: false,
        message: 'El número de habitacion ya existe. ¡Verifica e intenta de nuevo por favor!',

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

    const query = `INSERT INTO booking_data.bedrooms(fecha, no_room, val_min, val_max, type, center_id, created_by, created_at, state,description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10 ) RETURNING *`;
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
        description,
      ])
      .catch((err) => {
        return messageHandler(err)
      });
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
    const description = body.description;


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
	SET  no_room=$1, val_min=$2, val_max=$3, type=$4, center_id=$5, updated_by=$6, updated_at=$7,state=$8,description=$9
	WHERE room_id=$10  RETURNING *`;
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
        description,
        id,
      ])
      .catch((err) => {
        return messageHandler(err)
      });
    return rta.rows;
  }

  async getHabitaciones({ id = null, numHabitacion = null, fecha_inicial = null, fecha_final = null }) {

    if (id != null) {
      let query = `select room_id as key, *,updated_by::text as updated_by,created_at::text as created_at, fecha::text as fecha from booking_data.bedrooms where room_id=${id}`;
      let rta = await this.pool.query(query).catch((err) => {
        return messageHandler(err)
      });
      return rta.rows
    } else if (fecha_inicial != null && fecha_final != null) {
      let query = `select room_id as key,*,updated_by::text as updated_by,created_at::text as created_at, fecha::text as fecha from   booking_data.bedrooms where fecha between '${fecha_inicial}' and '${fecha_final}'`;
      let rta = await this.pool.query(query).catch((err) => {
        return messageHandler(err)
      });
      return rta.rows;
    } if (numHabitacion != null) {
      let query = `select room_id as key,* from  booking_data.bedrooms where no_room='${numHabitacion}'`;
      let rta = await this.pool.query(query).catch((err) => {
        return messageHandler(err);
      })
      return rta.rows;
    }
    else {
      console.log("Debes proporcionar al menos un parametro para la busqueda: id, numero habitacion o rago de fechas");

      throw new Error("Debes proporcionar al menos un parametro para la busqueda: id, numero habitacion o rago de fechas");
    }
  }

  async getAllHabitaciones(param) {
    try {
      let where = `where  1=1 `;
      let fields = `room_id as key,*,updated_by::text as updated_by,created_at::text as created_at, fecha::text as fecha`;
      if (typeof param.room_id != "undefined" && param.room_id != "") {
        where += ` and room_id='${param.room_id}'`;
      }
      if (typeof param.no_room != "undefined" && param.no_room != "") {
        where += ` and no_room='${param.no_room}'`;
      }
      if (typeof param.type != "undefined" && param.type != "") {
        where += ` and type='${param.type}'`;
      }
      if (typeof param.fecha_inicial != "undefined" && typeof param.fecha_final != "undefined" && param.fecha_inicial != "" && param.fecha_final != "") {
        where += ` and created_at between '${param.fecha_inicial}' and '${param.fecha_final}'`
      }
      if (typeof param.state != "undefined" && param.state != "") {
        where += ` and state='${param.state}'`;
      }
      if (typeof param.select != "undefined" && param.select == "true") {
        fields = `room_id as code, room_id as key, no_room as name,val_min, val_max`
      }
      let query = `select ${fields} from booking_data.bedrooms  ${where}`;
      let rta = await this.pool.query(query);
      return rta.rows

    } catch (error) {
      return messageHandler(error)
    }

  }

  async deleteHabitacion(id) {
    const validate = await this.getHabitaciones({ id });
    if (validate == "") {
      return {
        ok: false,
        message: 'No se encontro el registro en la bd',
      }
    }
    const query = `delete from booking_data.bedrooms where room_id=${id}`;
    const rta = await this.pool.query(query).catch((err) => {
      return messageHandler(err)
    });
    return rta;

  }

}
module.exports = habitacionesServices;
