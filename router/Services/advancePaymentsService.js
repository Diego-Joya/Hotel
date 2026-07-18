const pool = require('../../libs/postgres.pool');
const messageHandler = require('../../middlewares/message.handler');
const moment = require("moment");

class advancePaymentsService {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }


  async getAll(params) {
    try {
      let where = '';
      if (typeof params.company_id != 'undefined' && params.company_id != '') {
        where += ` WHERE company_id = ${params.company_id}`;
      }
      if (typeof params.center_id != 'undefined' && params.center_id != '') {
        where += ` AND center_id = ${params.center_id}`;
      }
      if (typeof params.booking_id != 'undefined' && params.booking_id != '') {
        where += ` AND booking_id = ${params.booking_id}`;
      }

      const query = `SELECT * FROM booking_data.booking_advance_payments ${where}`;
      let rta = await this.pool.query(query);
      return rta.rows;

    } catch (error) {
      return messageHandler(error);
    }
  }
  async createAdvancePayment(body) {
    try {
      if (body.bank_account_id == '') {
        body.bank_account_id = null;
      }
      const query = `INSERT INTO booking_data.booking_advance_payments(
	 booking_id, amount, payment_date, payment_method, reference, observations, status, created_by, created_at,bank_account_id)
	VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9,$10) RETURNING *`;

      const result = await this.pool.query(query, [
        body.booking_id,
        body.amount,
        moment(body.payment_date).format('YYYY-MM-DD HH:mm:ss'),
        body.payment_method,
        body.reference,
        body.observations,
        body.status,
        body.created_by,
        moment().format('YYYY-MM-DD HH:mm:ss'),
        body.bank_account_id

      ]);
      return result.rows[0];
    } catch (error) {
      return messageHandler(error);
    }
  }

  async updateAdvancePayment(id, body) {
    try {

      const query = `UPDATE booking_data.booking_advance_payments
	SET  booking_id=$1, amount=$2, payment_date=$3, payment_method=$4, reference=$5, observations=$6, status=$7,  updated_at=$8,bank_account_id =$9
	WHERE id = $10 RETURNING *`;
      const result = await this.pool.query(query, [
        body.booking_id,
        body.amount,
        moment(body.payment_date).format('YYYY-MM-DD HH:mm:ss'),
        body.payment_method,
        body.reference,
        body.observations,
        body.status,
        moment().format('YYYY-MM-DD HH:mm:ss'),
        body.bank_account_id,
        id
      ]);
      return result.rows[0];
    } catch (error) {
      return messageHandler(error);

    }
  }


}

module.exports = advancePaymentsService;


