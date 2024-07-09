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

    if (val_min > val_max) {
      let resp = {
        ok: false,
        message: 'El valor minimo no puede ser superior al valor maximo. ¡Verifica e intenta de nuevo por favor!',
      
      }
      return resp
    }

    const query = `INSERT INTO booking_data.bedrooms(fecha, no_room, val_min, val_max, type, center_id, created_by, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8 ) RETURNING *`;
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
      ])
      .catch((err) => console.log(err));
    return rta.rows;
  }
  // ACTUALIZAR
  async actualizar(idact, body) {
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
    const no_room = body.no_room;
    const val_min = body.val_min;
    const val_max = body.val_max;
    const type = body.type;
    const center_id = body.center_id;
    const updated_by = body.created_by;
    const updated_at = fecha_hora;

    if (val_min > val_max) {
      let resp = {
        ok: false,
        message: 'El valor minimo no puede ser superior al valor maximo. ¡Verifica e intenta de nuevo por favor!',
      
      }
      return resp
    }

    const query = `UPDATE booking_data.bedrooms
	SET  no_room=$1, val_min=$2, val_max=$3, type=$4, center_id=$5, updated_by=$6, updated_at=$7
	WHERE room_id=$8  RETURNING *`;
    const rta = await this.pool
      .query(query, [
        no_room,
        val_min,
        val_max,
        type,
        center_id,
        updated_by,
        updated_at,
        idact,
      ])
      .catch((err) => console.log(err));
    return rta.rows;
  }

}
module.exports = habitacionesServices;
