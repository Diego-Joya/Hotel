const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
const moment = require("moment");


class otherServicesService {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }
  async createOtherServices(body) {
    console.log('llega para saber a cual va', body);

    try {
      let ids = [];
      for (let i = 0; i < body.other_services.length; i++) {
        const element = body.other_services[i];
        let save = ""
        if (typeof element.id != "undefined" && element.id != "" && element.id != null) {

          save = await this.updateOtherServices(element.id, element);
        } else {

          save = await this.saveOtherServices(element);
        }
        ids.push(save);
      }
      return ids;
    } catch (error) {
      return messageHandler(error);
    }

  }
  async saveOtherServices(body) {
    try {
      console.log("body", body);
      const query = `INSERT INTO booking_data.other_services(
	 booking_id, service_date, service_name, unit_value, total_value, observations, quantity)
	VALUES ($1, $2, $3, $4, $5 ,$6, $7) RETURNING *`;

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
    console.log('actualizando', body);
    try {
      const query = `UPDATE booking_data.other_services
	SET  booking_id=$1, service_date=$2, service_name=$3, unit_value=$4, total_value=$5, observations=$6, quantity=$7
	WHERE id =$8 RETURNING *`;
      const rta = await this.pool.query(query, [
        body.booking_id,
        body.service_date,
        body.service_name,
        body.unit_value,
        body.total_value,
        body.observations,
        body.quantity,
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
        where += ` and booking_id = ${params.booking_id} `;
      }
      const query = `SELECT *, id as key	FROM booking_data.other_services ${where}`;
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
