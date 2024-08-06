const pool = require('../../libs/postgres.pool')
const moment = require('moment');
const messageHandler = require('./../../middlewares/message.handler');
const bcrypt = require('bcrypt');

class usuariosServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.log(err));
    }

    async crear(body) {
        console.log(body);
        const names = body.names;
        const surname = body.surname;
        const email = body.email;
        const username = body.username;
        const cell_phone = body.cell_phone;
        const address = body.address;
        const password = body.password;
        const state = body.state;
        const profile_id = body.profile_id;
        const company_id = body.company_id;
        const created_by = body.created_by;
        const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        const center_id = body.center_id;

        const password_enc = await bcrypt.hash(password, 10);
        console.log(password_enc);

        const query = `INSERT INTO booking_config.users( names, surnames, email, username, cell_phone, address, password, state,
         profile_id, created_by,  created_at,  company_id, center_id)
	    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);`
        const rta = this.pool.query(query, [names, surname, email, username, cell_phone, address, password_enc, state, profile_id,
            created_by, created_at, company_id, center_id]).catch((error) => {
                return messageHandler(error);
            })
        return rta.rows;

    }

}
module.exports = usuariosServices;