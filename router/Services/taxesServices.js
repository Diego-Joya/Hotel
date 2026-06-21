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

}

module.exports = taxesServices;
