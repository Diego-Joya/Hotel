const pool = require('../../libs/postgres.pool');
const moment = require("moment");

class clientesServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }
  async crear(body) {
    console.log(body);
    const fecha_hora = moment().format('YYYY-MM-DD');
    // const customer_id = body.customer_id;
    const names = body.names;
    const surname = body.surname;
    const document_type = body.document_type;
    const no_document = body.no_document;
    const birthdate = body.birthdate;
    const cell_phone = body.cell_phone;
    const cell_phone_emergency = body.cell_phone_emergency;
    const center_id = body.center_id;
    const created_by = body.created_by;
    const created_at = fecha_hora;

    const query = `INSERT INTO  booking_data.customers(
      names, surname, document_type, no_document, birthdate, cell_phone,
      cell_phone_emergency, center_id, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

    console.log('names:', names);
    console.log('surname:', surname);
    console.log('document_type:', document_type);
    console.log('no_document:', no_document);
    console.log('birthdate:', birthdate);
    console.log('cell_phone:', cell_phone);
    console.log('cell_phone_emergency:', cell_phone_emergency);
    console.log('center_id:', center_id);
    console.log('create:', created_by);
    console.log('created_at:', fecha_hora);

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
        created_at
      ])
      .catch((err) => console.log(err));

    return rta.rows;

  }

  async actualizar(id, body) {
    const fecha_hora = moment().format('YYYY-MM-DD');
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

    const rta = await this.pool.query(
      `UPDATE booking_data.customers
	SET  names=$1, surname=$2, document_type=$3, no_document=$4, birthdate=$5, cell_phone=$6,
   cell_phone_emergency=$7, center_id=$8, updated_by=$9, updated_at=$10
	WHERE customer_id=$11;`, [
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
      id,
    ]).catch((err) => console.log(err));
    return rta;

  }


  async getALl() {
    console.log('jajja llegue');
    const query = 'SELECT *, id as key FROM CLIENTE';
    const rta = await this.pool.query(query);
    return rta.rows;
  }

  async find_one(id) {
    console.log(id);
    const query = 'SELECT *, id as key FROM CLIENTE where id=' + id.id;
    console.log(query);
    const rta = await this.pool.query(query);
    return rta.rows;
  }
}
module.exports = clientesServices;
