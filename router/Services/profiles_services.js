// const boom = require("@hapi/boom");
const pool = require("../../libs/postgres.pool");
const moment = require("moment");

class profiles_service {
  constructor() {
    this.pool = pool;
    this.pool.on("error", (err) => console.error(err));
  }

  async crear(body) {
    const nombre = body.profile;
    const company = body.company_id;
    const type = body.type;
    const fecha_hora = moment().format("YYYY-MM-DD HH:mm:ss");
    const query = `INSERT INTO booking_config.profiles (profile, company_id, type,fecha_creacion)
     VALUES ($1, $2, $3, $4) RETURNING *`;
    const rta = await this.pool
      .query(query, [nombre, company, type,  fecha_hora])
      .catch((err) => console.log(err));
    return rta.rows;
  }

  async buscar_todos() {
    const query = "SELECT *, profile_id as key FROM booking_config.profiles";
    const rta = await this.pool.query(query);
    return rta.rows;
  }

  async buscar_uno(data) {
    const rta = await this.pool
      .query(
        `SELECT *, profile_id as key FROM booking_config.profiles where profile ILIKE ('%${data}%') OR profile_id::text ILIKE ('%${data}%') `
      )
      .catch((err) => console.log(err));
    return rta.rows;
  }
  async actualizar(idact, body) {
    const nombre = body.profile;
    const company = body.company_id;
    const type = body.type;
    const fecha_hora = moment().format("YYYY-MM-DD HH:mm:ss");


    let consu = await this.buscar_uno(idact);
    if (consu == "") {
      return false;
    }
    const rta = await this.pool
      .query(
        `UPDATE booking_config.profiles
    SET  profile=$1, company_id=$2, type=$3, fecha_modificacion=$4
    WHERE profile_id=$5  RETURNING *`,
        [nombre, company, type,  fecha_hora, idact]
      )
      .catch((err) => console.log(err));
    return rta;
  }

  async delete(id_delete) {
    let consu = await this.buscar_uno(id_delete);
    if (consu == "") {
      return false;
    }
    const rta = await this.pool
      .query(
        `DELETE FROM  booking_config.profiles
    WHERE profile_id=$1`,
        [id_delete]
      )
      .catch((err) => console.log(err));
    return rta;
  }
}
module.exports = profiles_service;
