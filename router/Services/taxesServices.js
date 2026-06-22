const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
const moment = require("moment");

class taxesServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  async createTax(body) {
    const tax_name = body.tax_name;
    const tax_type = body.tax_type;
    const tax_value = body.tax_value;
    const company_id = body.company_id;
    const is_automatic = body.is_automatic;
    const description = body.description;
    const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    try {
      const query = `INSERT INTO booking_data.taxes(
	 tax_name, tax_type, tax_value, is_automatic, is_active, description, created_at,company_id)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
      const rta = await this.pool.query(query, [
        tax_name,
        tax_type,
        tax_value,
        is_automatic,
        true,
        description,
        created_at,
        company_id
      ]);
      return rta.rows;

    } catch (error) {
      return messageHandler(error);

    }

  }

  async updateTax(id, body) {
    const tax_name = body.tax_name;
    const tax_type = body.tax_type;
    const tax_value = body.tax_value;
    const is_automatic = body.is_automatic;
    const description = body.description;

    const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    try {
      const query = `UPDATE booking_data.taxes
  SET tax_name=$1, tax_type=$2, tax_value=$3, is_automatic=$4, description=$5, updated_at=$6
  WHERE tax_id = $7 RETURNING *`;
      const rta = await this.pool.query(query, [
        tax_name,
        tax_type,
        tax_value,
        is_automatic,
        description,
        updated_at,
        id
      ]);
      return rta.rows;

    } catch (error) {
      return messageHandler(error);
    }

  }

  async getAll(params) {
    let where = `where 1=1`;
    if (typeof params.company_id != 'undefined') {
      where += ` and company_id = ${params.company_id}`;
    }
    if (typeof params.is_active != 'undefined') {
      where += ` and is_active = ${params.is_active}`;
    }
    if (typeof params.tax_type != 'undefined') {
      where += ` and tax_type = '${params.tax_type}'`;
    }
    if (typeof params.tax_name != 'undefined') {
      where += ` and tax_name = '${params.tax_name}'`;
    }
    if (typeof params.description != 'undefined') {
      where += ` and description = '${params.description}'`;
    }

    try {
      const query = `SELECT * FROM booking_data.taxes ${where}`;
      const rta = await this.pool.query(query);
      return rta.rows;
    } catch (error) {
      return messageHandler(error);
    }
  }


  async innactiveTax(id) {
    try {
      const query = `UPDATE booking_data.taxes SET is_active=false WHERE tax_id=$1 RETURNING *`;
      const rta = await this.pool.query(query, [id]);
      return rta.rows;
    } catch (error) {
      return messageHandler(error);
    }
  }

}

module.exports = taxesServices;
