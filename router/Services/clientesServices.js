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
    // const customer_id = body.customer_id;
    const names = body.names;
    const surname = body.surname;
    const document_type = body.document_type;
    const no_document = body.no_document;
    const birthdate = body.birthdate;
    const cell_phone = body.cell_phone;
    if (body.cell_phone_emergency == "" || body.cell_phone_emergency == undefined) {
      body.cell_phone_emergency = 0;
    }
    const cell_phone_emergency = body.cell_phone_emergency;
    const center_id = body.center_id;
    const created_by = body.created_by;
    const email = body.email;
    const created_at = fecha_hora;

    const query = `INSERT INTO  booking_data.customers(
      names, surname, document_type, no_document, birthdate, cell_phone,
      cell_phone_emergency, center_id, created_by, created_at,email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11) RETURNING *`;

    // Construir la consulta SQL completa para depuración
    // const querybd = `
    //   INSERT INTO customers(
    //     names, surname, document_type, no_document, birthdate, cell_phone,
    //     cell_phone_emergency, center_id, created_by, created_at
    //   ) VALUES (
    //     '${names}', '${surname}', '${document_type}', '${no_document}', '${birthdate}', 
    //     '${cell_phone}', '${cell_phone_emergency}', '${center_id}', '${created_by}', '${created_at}'
    //   ) RETURNING *`;

    // console.log('query:', querybd);

    const rta = await this.pool
      .query(query, [
        names,
        surname,
        document_type,
        no_document,
        birthdate,
        cell_phone,
        cell_phone_emergency,
        center_id,
        created_by,
        created_at,
        email,
      ])
      .catch((err) => {
        return messageHandler(err)
      });
    return rta.rows;

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
    const surname = body.surname;
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
	SET  names=$1, surname=$2, document_type=$3, no_document=$4, birthdate=$5, cell_phone=$6,
   cell_phone_emergency=$7, center_id=$8, updated_by=$9, updated_at=$10,email=$11
	WHERE customer_id=$12;`, [
      names,
      surname,
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
        .query(`SELECT *, customer_id as key FROM  booking_data.customers where customer_id=${id} `)
        .catch((err) => {
          return messageHandler(err)
        });
      return rta.rows;

    }
    else if (typeof nombre != 'undefined') {
      let rta = await this.pool
        .query(`SELECT customer_id as key, * FROM booking_data.customers where names ILIKE  ('%${nombre}%')  or surname ilike ('%${nombre}%')  or  no_document ilike ('%${nombre}%') `)
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
      let fields = `customer_id as key,*, customer_id as key`;
      if (typeof params.fecha_inicial != "undefined" && typeof params.fecha_final != "undefined" && params.fecha_inicial != "" && params.fecha_final != "") {
        where += ` and created_at between '${params.fecha_inicial}' and '${params.fecha_final}'`
      }
      if (typeof params.exit_date_inicial != "undefined" && typeof params.exit_date_final != "undefined" && params.exit_date_inicial != "" && params.exit_date_final != "") {
        where += ` and exit_date between '${params.exit_date_inicial}' and '${params.exit_date_final}'`
      }
      if (typeof params.room_id != "undefined" && params.room_id != "") {
        where += ` and room_id = '${params.room_id}'`

      }
      if (typeof params.customer_id != "undefined" && params.customer_id != "") {
        where += ` and customer_id = '${params.customer_id}'`

      }
      if (typeof params.select != "undefined" && params.select == "true") {
        fields = `customer_id as code, customer_id as key, no_document as name , concat(names ||' '||surname) as fullname`
      }
      // else {
      //   fields = `customer_id as key,*, customer_id as key`
      // }


      // let consulta = await this.pool.query(`SELECT entry_id as key, * FROM booking_data.entries ${where}`);
      let query = `SELECT  ${fields} FROM booking_data.customers ${where}`;
      console.log("consulta", query);
      let consulta = await this.pool.query(query);
      return consulta.rows;

    } catch (error) {
      return messageHandler(error);

    }

  }
  // async getAllClientes() {
  //   const query = 'SELECT customer_id as key,*, customer_id as key FROM booking_data.customers';
  //   const rta = await this.pool.query(query).catch((err) => {
  //     return messageHandler(err)
  //   });
  //   return rta.rows;
  // }

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
