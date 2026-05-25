const pool = require('../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');
const moment = require("moment");

class invoiceServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  async createinvoice(body) {
    try {
      const transaction = await this.pool.connect();
      await transaction.query('BEGIN');
      const reserva = await this.saveInvoice(body, transaction);
      console.log("reserva", reserva);
      if (reserva.ok === false) {
        await transaction.query('ROLLBACK');
        return reserva;
      }
      body.invoice_id = reserva.id; // Asegúrate de que el ID de la factura esté disponible para los detalles
      const detalle = await this.saveDetailsInvoice(body, transaction);
      console.log("detalle", detalle);
      if (detalle.ok === false) {
        await transaction.query('ROLLBACK');
        return detalle;
      }

      await transaction.query('COMMIT');
      reserva.detalle = detalle; // Agrega los detalles a la respuesta de la reserva
      return reserva;
    } catch (error) {
      return messageHandler(error);
    }
  };

  async saveInvoice(body, transaction) {
    try {
      const query = `INSERT INTO booking_data.invoices(
	 booking_id, customer_id, invoice_number, invoice_date, subtotal, taxes, total, status)
	VALUES ( $1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`;

      const values = [
        body.booking_id,
        body.customer_id,
        body.invoice_number,
        body.invoice_date,
        body.subtotal,
        body.taxes,
        body.total,
        body.status
      ];

      const rta = await transaction.query(query, values);
      return rta.rows[0];

    } catch (error) {
      return messageHandler(error);
    }
  }
  async saveDetailsInvoice(body, transaction) {
    try {
      const query = `INSERT INTO booking_data.invoice_details(
	 invoice_id, room_reservation_id, description, quantity, unit_price, total)
	VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
      const values = [
        body.invoice_id,
        body.room_reservation_id,
        body.description,
        body.quantity,
        body.unit_price,
        body.total
      ];
      const rta = await transaction.query(query, values);
      return rta.rows[0];
    } catch (error) {
      return messageHandler(error);
    }
  }

  async getInvoices(params) {
    try {
      let where = ` where 1=1`;
      if (typeof params.booking_id != "undefined" && params.booking_id != "") {
        where += ` and booking_id=${params.booking_id}`;
      }
      if (typeof params.customer_id != "undefined" && params.customer_id != "") {
        where += ` and customer_id=${params.customer_id}`;
      }
      if (typeof params.invoice_number != "undefined" && params.invoice_number != "") {
        where += ` and invoice_number='${params.invoice_number}'`;
      }
      if (typeof params.fecha_inicial != "undefined" && typeof params.fecha_final != "undefined") {
        where += ` and invoice_date between '${params.fecha_inicial}' and '${params.fecha_final}'`
      }
      if (typeof params.status != "undefined" && params.status != "") {
        where += ` and status='${params.status}'`;
      }
      const query = `SELECT * FROM booking_data.invoices ${where}`;
      const rta = await this.pool.query(query);
      return rta.rows;

    } catch (error) {
      return messageHandler(error);
    }
  }

  async getInvoicesDetails(params) {
    try {
      const facturaEnc = await this.getInvoices(params);
      console.log("facturaEnc", facturaEnc);
      let id_fact = [];
      facturaEnc.forEach(item => {
        id_fact.push(item.id);

      });
      console.log('idFac', id_fact);

      const query = `select * from booking_data.invoice_details where invoice_id = any($1)`;
      const rta = await this.pool.query(query, [id_fact]);
      console.log("rta", rta);

      for (let i = 0; i < facturaEnc.length; i++) {
        facturaEnc[i].details = rta.rows.filter(detail => detail.invoice_id === facturaEnc[i].id);

      }
      return facturaEnc;

    } catch (error) {
      return messageHandler(error);
    }

  }
}
module.exports = invoiceServices;
