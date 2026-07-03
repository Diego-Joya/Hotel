const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
const moment = require("moment");

class invoiceSequencesServices {
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
      const query = `SELECT * FROM booking_data.invoice_sequences
      ${where}
      `;
      console.log('query', query);
      let rta = await this.pool.query(query);
      return rta.rows;
    } catch (error) {
      return messageHandler(error);
    }
  }

  async createInvoiceSequence(body) {
    try {
      const company = body.company_id;
      const center = body.center_id;
      const document_type = body.document_type;
      const sequence_name = body.sequence_name;
      const prefix = body.prefix;
      const start_number = body.start_number;
      const end_number = body.end_number;
      const resolution_number = body.resolution_number;
      const valid_from = body.valid_from;
      const valid_to = body.valid_to;
      const is_active = body.is_active;
      const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
      const query = `INSERT INTO booking_data.invoice_sequences(
	 company_id, center_id, document_type, sequence_name, prefix, start_number, end_number,
   resolution_number, valid_from, valid_to, is_active, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`;
      const rta = await this.pool.query(query,
        [company,
          center,
          document_type,
          sequence_name,
          prefix,
          start_number,
          end_number,
          resolution_number,
          valid_from,
          valid_to,
          is_active, created_at]);
      return rta.rows[0];
    } catch (error) {
      return messageHandler(error);
    }

  }

  async updateInvoiceSequence(id, body) {
    try {
      const company = body.company_id;
      const center = body.center_id;
      const document_type = body.document_type;
      const sequence_name = body.sequence_name;
      const prefix = body.prefix;
      const start_number = body.start_number;
      const end_number = body.end_number;
      const resolution_number = body.resolution_number;
      const valid_from = body.valid_from;
      const valid_to = body.valid_to;
      const is_active = body.is_active;
      const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
      const query = `UPDATE booking_data.invoice_sequences
        SET  company_id=$1, center_id=$2, document_type=$3, sequence_name=$4, prefix=$5, start_number=$6,
        end_number=$7, resolution_number=$8, valid_from=$9, valid_to=$10, is_active=$11, updated_at=$12 where sequence_id=$13
        RETURNING * `;
      console.log('query', query);
      const rta = await this.pool.query(query,
        [
          company,
          center,
          document_type,
          sequence_name,
          prefix,
          start_number,
          end_number,
          resolution_number,
          valid_from,
          valid_to,
          is_active,
          updated_at,
          id]);
      return rta.rows;
    } catch (error) {
      return messageHandler(error);
    }
  }
}
module.exports = invoiceSequencesServices;
