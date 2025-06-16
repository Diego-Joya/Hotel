// const boom = require("@hapi/boom");
const pool = require("../../libs/postgres.pool");
const moment = require("moment");
const messageHandler = require('../../middlewares/message.handler')

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
      .query(query, [nombre, company, type, fecha_hora])
      .catch((err) => console.log(err));
    return rta.rows[0];
  }

  async buscar_todos(params) {
    try {
      let where = `where  1=1 `;
      let fields = `*, profile_id as key,fecha_modificacion::text as fecha_modificacion, fecha_creacion::text as fecha_creacion`;
      if (typeof params.profile_id != "undefined" && params.profile_id != "") {
        where += ` and profile_id='${params.profile_id}'`;
      }
      if (typeof params.company_id != "undefined" && params.company_id != "") {
        where += ` and company_id='${params.company_id}'`;
      }
      if (typeof params.type != "undefined" && params.type != "") {
        where += ` and type='${params.type}'`;
      }
      if (typeof params.profile != "undefined" && params.profile != "") {
        where += ` and profile ilike('%${params.profile}%')`;
      }
      if (typeof params.select != "undefined" && params.select == "true") {
        fields = `profile_id as code, profile_id as key, profile as name`
      }

      const query = `SELECT ${fields} FROM booking_config.profiles ${where}`;
      const rta = await this.pool.query(query);
      return rta.rows;
    } catch (error) {
      return messageHandler(error)
    }

  }

  async buscar_uno(data) {
    try {

      const rta = await this.pool
        .query(
          `SELECT *, profile_id as key,fecha_modificacion::text as fecha_modificacion, fecha_creacion::text as fecha_creacion FROM booking_config.profiles where profile ILIKE ('%${data}%') OR profile_id::text ILIKE ('%${data}%') `
        )
      return rta.rows;
    } catch (error) {
      return messageHandler(error);


    }
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
        [nombre, company, type, fecha_hora, idact]
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
