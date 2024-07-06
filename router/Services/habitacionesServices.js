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
    const usuario = body.usuario;
    const id_zona = body.zona;
    const zona_text = body.zona_text;
    const codigo = body.cod_factura;
    const valor_venta = body.valor_venta;
    const valor_iva = body.valor_iva;
    const valor_comision = body.valor_comision;
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
    const estado = 'PENDIENTE';

    let consu = await this.validar(idact);
    if (consu == '') {
      return false;
    }
    const rta = await this.pool
      .query(
        `UPDATE public.saldos
    SET  fecha=$1, usuario=$2, zona=$3, zona_text=$4, numero_factura=$5, estado=$6,
    valor_venta=$7, valor_iva=$8, valor_comision=$9 WHERE id=$10 `,
        [
          fecha_hora,
          usuario,
          id_zona,
          zona_text,
          codigo,
          estado,
          valor_venta,
          valor_iva,
          valor_comision,
          idact,
        ],
      )
      .catch((err) => console.log(err));
    return rta;
  }

}
module.exports = habitacionesServices;
