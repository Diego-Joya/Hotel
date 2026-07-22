const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
const moment = require("moment");


class otherServicesService {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  async createOtherServices(body) {
    try {
      const query = `INSERT INTO booking_data.other_services(
	 booking_id, service_date, service_name, unit_value, total_value, observations)
	VALUES ($1, $2, $3, $4, $5 ,$6) RETURNING *`;

      const rta = await this.pool.query(query, [
        body.booking_id,
        body.service_date,
        body.service_name,
        body.unit_value,
        body.total_value,
        body.observations
      ])
      return rta.rows[0];

    } catch (error) {
      return messageHandler(error);

    }
  }

  async updateOtherServices(id, body) {
    try {
      const query = `UPDATE booking_data.other_services
	SET  booking_id=$1, service_date=$2, service_name=$3, unit_value=$4, total_value=$5, observations=$6
	WHERE id =$7 RETURNING *`;
      const rta = await this.pool.query(query, [
        body.booking_id,
        body.service_date,
        body.service_name,
        body.unit_value,
        body.total_value,
        body.observations,
        id
      ])
      return rta.rows[0];
    } catch (error) {
      return messageHandler(error);
    }
  }

  async getOtherServices(params) {
    try {
      let where = ` where 1=1 `;
      if (typeof params.booking_id != "undefined" && params.booking_id != "") {
        where += ` booking_id = ${params.body.booking_id} `;
      }
      const query = `SELECT *	FROM booking_data.other_services ${where}`;
      const rta = await this.pool.query(query);
      return rta.rows;

    } catch (error) {
      return messageHandler(error)
    }

  }

  async deleteOtherServices(id) {
    try {
      const query = `DELETE FROM booking_data.other_services
	WHERE id=$1`;
      const rta = this.pool.query(query, [id]);
      return true;
    } catch (error) {
      return messageHandler(error);
    }
  }

}

module.exports = otherServicesService
