const pool = require('../../libs/postgres.pool');

class clientesServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }
  // async crear(body) {
  //   console.log(body);
  //   // const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
  //   const no_room = body.no_room;

  //   const query = `INSERT INTO public.saldos_det(fecha, no_room, val_min, val_max, type, center_id, created_by, updated_by, created_at, updated_at)
  //    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING *`;
  //   const rta = await this.pool
  //     .query(query, [fecha_hora, no_room])
  //     .catch((err) => console.log(err));
  //   return rta.rows;
  // }

  async getALl() {
    console.log('jajja llegue');
    const query = 'SELECT *, id as key FROM CLIENTE';
    const rta = await this.pool.query(query);
    return rta.rows;
  }

  async find_one(id) {
    console.log(id);
    const query = 'SELECT *, id as key FROM CLIENTE where id='+id.id;
    console.log(query);
    const rta = await this.pool.query(query);
    return rta.rows;
  }
}
module.exports = clientesServices;
