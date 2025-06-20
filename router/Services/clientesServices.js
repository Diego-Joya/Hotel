// const { object } = require('joi');
const pool = require('../../libs/postgres.pool');
const moment = require("moment");
const messageHandler = require('./../../middlewares/message.handler');

class clientesServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }
  async crear(body) {
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
    const names = body.names;
    const surnames = body.surnames;
    const document_type = body.document_type;
    const no_document = body.no_document;
    const birthdate = body.birthdate;
    const cell_phone = body.cell_phone;
    const company_id = body.company_id;
    if (body.cell_phone_emergency == "" || body.cell_phone_emergency == undefined) {
      body.cell_phone_emergency = 0;
    }
    const cell_phone_emergency = body.cell_phone_emergency;
    const center_id = body.center_id;
    const created_by = body.created_by;
    const email = body.email;
    const created_at = fecha_hora;
    let data = {};
    data.no_document = no_document
    // data.center_id = center_id
    if (body.validar == "undefined" || body.validar!= false) {
      const validarExistencia = await this.getAllClientes(data);
      console.log("validar existen", validarExistencia);
      if (validarExistencia.length > 0) {
        return {
          ok: false,
          message: "El registro ya existe. ¡Verifica e intenta de nuevo por favor!",
        }
      }
    }

    try {
      const query = `INSERT INTO  booking_data.customers(
    names, surnames, document_type, no_document, birthdate, cell_phone,
    cell_phone_emergency, center_id, created_by, created_at,email,company_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12) RETURNING *`;
      const rta = await this.pool
        .query(query, [
          names,
          surnames,
          document_type,
          no_document,
          birthdate,
          cell_phone,
          cell_phone_emergency,
          center_id,
          created_by,
          created_at,
          email,
          company_id
        ]);
      return rta.rows[0];
    } catch (error) {
      return messageHandler(error)
    }

  }

  async actualizar(id, body) {
    if (Object.keys(body).length == 0) {
      return {
        ok: false,
        message: "No se encotraron parametros a actualizar!"
      }
    }
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
    const names = body.names;
    const surnames = body.surnames;
    const document_type = body.document_type;
    const no_document = body.no_document;
    const birthdate = body.birthdate;
    const cell_phone = body.cell_phone;
    const cell_phone_emergency = body.cell_phone_emergency;
    const center_id = body.center_id;
    const updated_by = body.created_by;
    const updated_at = fecha_hora;
    const email = body.email;

    const consulExistencia = await this.getClientes({ id });
    if (consulExistencia == "") {
      return {
        ok: false,
        message: "El registro no existe. ¡Actualiza e intenta de nuevo por favor!",
      }
    }
    const rta = await this.pool.query(
      `UPDATE booking_data.customers
	SET  names=$1, surnames=$2, document_type=$3, no_document=$4, birthdate=$5, cell_phone=$6,
   cell_phone_emergency=$7, center_id=$8, updated_by=$9, updated_at=$10,email=$11
	WHERE customer_id=$12  RETURNING *`, [
      names,
      surnames,
      document_type,
      no_document,
      birthdate,
      cell_phone,
      cell_phone_emergency,
      center_id,
      updated_by,
      updated_at,
      email,
      id,
    ]).catch((err) => {
      return messageHandler(err)
    });
    return rta;

  }
  async getClientes({ id, nombre }) {
    if (typeof id != 'undefined') {
      let rta = await this.pool
        .query(`SELECT *,birthdate::text as birthdate,updated_by::text as updated_by,created_at::text as created_at, customer_id as key FROM  booking_data.customers where customer_id=${id} `)
        .catch((err) => {
          return messageHandler(err)
        });
      return rta.rows;

    }
    else if (typeof nombre != 'undefined') {
      let rta = await this.pool
        .query(`SELECT customer_id as key, * FROM booking_data.customers where names ILIKE  ('%${nombre}%')  or surnames ilike ('%${nombre}%')  or  no_document ilike ('%${nombre}%') `)
        .catch((err) => {
          return messageHandler(err)
        });
      return rta.rows;
    }
    else {
      throw new Error("Debes proporcionar al menos un prametro de búsqueda: id, nombre, documento");
    }

  }

  async getAllClientes(params) {
    try {
      let where = 'where  1=1 ';
      let fields = `a.customer_id as key,a.*,a.birthdate::text as birthdate,a.updated_by::text as updated_by,
      a.created_at::text as created_at,b.center_name, c.company_name`;
      if (typeof params.select != "undefined" && params.select == "true") {
        fields = `a.customer_id as code, a.customer_id as key, a.no_document as name , concat(names ||' '||surnames) as fullname`
      }
      if (typeof params.fecha_inicial != "undefined" && typeof params.fecha_final != "undefined" && params.fecha_inicial != "" && params.fecha_final != "") {
        where += ` and a.created_at between '${params.fecha_inicial}' and '${params.fecha_final}'`
      }
      if (typeof params.exit_date_inicial != "undefined" && typeof params.exit_date_final != "undefined" && params.exit_date_inicial != "" && params.exit_date_final != "") {
        where += ` and a.exit_date between '${params.exit_date_inicial}' and '${params.exit_date_final}'`
      }
      if (typeof params.room_id != "undefined" && params.room_id != "") {
        where += ` and a.room_id = '${params.room_id}'`

      }
      if (typeof params.customer_id != "undefined" && params.customer_id != "") {
        where += ` and a.customer_id = '${params.customer_id}'`
      }
      if (typeof params.no_document != "undefined" && params.no_document != "") {
        where += ` and a.no_document = '${params.no_document}'`
      }
      if (typeof params.name != "undefined" && params.name != "") {
        where += ` and (a.names ilike('%${params.name}%') or a.surnames ilike('%${params.name}%'))`
      }

      if (typeof params.company_id != "undefined" && params.company_id != "") {
        where += ` and a.company_id=${params.company_id}`;
      }
      if (typeof params.center_id != "undefined" && params.center_id != "") {
        where += ` and a.center_id=${params.center_id}`;
      }
      let query = `SELECT  ${fields} FROM  booking_data.customers a left join booking_config.centers b
       on (a.center_id= b.centers_id) left join booking_config.companys c on (b.company_id = c.company_id) ${where}`;
      let consulta = await this.pool.query(query);
      return consulta.rows;

    } catch (error) {
      return messageHandler(error);

    }

  }

  async delete(id) {

    let consu = await this.getClientes({ id });
    if (consu == "") {
      return false;
    }
    const rta = await this.pool
      .query(
        `DELETE FROM booking_data.customers
    WHERE customer_id=$1`,
        [id]
      )
      .catch((err) => console.log(err));
    return rta;
  }



}
module.exports = clientesServices;
