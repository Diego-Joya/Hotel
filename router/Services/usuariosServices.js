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
	    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)  RETURNING *`
        const rta = this.pool.query(query, [names, surname, email, username, cell_phone, address, password_enc, state, profile_id,
            created_by, created_at, company_id, center_id]).catch((error) => {
                return messageHandler(error);
            })
        return rta.rows;

    }
    async actualizar(body, id) {
        console.log(body);
        const names = body.names;
        const surname = body.surname;
        const email = body.email;
        const username = body.username;
        const cell_phone = body.cell_phone;
        const address = body.address;
        // const password = body.password;
        const state = body.state;
        const profile_id = body.profile_id;
        const company_id = body.company_id;
        const updated_by = body.updated_by;
        const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
        const center_id = body.center_id;

        // const password_enc = await bcrypt.hash(password, 10);
        // console.log(password_enc);

        const query = `UPDATE booking_config.users
	SET names=$1, surnames=$2, email=$3, username=$4, cell_phone=$5, address=$6, state=$7, profile_id=$8,  updated_by=$9, updated_at=$10, company_id=$11, center_id=$12
	WHERE  user_id=$13  RETURNING *`
        try {
            const rta = await this.pool.query(query, [names, surname, email, username, cell_phone, address, state, profile_id,
                updated_by, updated_at, company_id, center_id, id]).catch((error) => {
                    return messageHandler(error);
                })
            return rta.rows;
        } catch (error) {
            return messageHandler(error);
        }

    }
    async saveRefreshToke(user, refreshToken) {
        console.log("user", user);
        console.log("refreshToken", refreshToken);
        const fecha_creacion_token = moment().format('YYYY-MM-DD HH:mm:ss');

        // const password_enc = await bcrypt.hash(password, 10);
        // console.log(password_enc);

        const query = `UPDATE booking_config.users
	SET refreshtoken=$1, fecha_creacion_refreshtoken=$2
	WHERE  user_id=$3  RETURNING *`
        try {
            const rta = await this.pool.query(query, [refreshToken, fecha_creacion_token, user]).catch((error) => {
                return messageHandler(error);
            })
            return rta.rows;
        } catch (error) {
            return messageHandler(error);
        }

    }
    async saveToken(user, token) {
        console.log("user", user);
        console.log("token", token);
        const fecha_creacion_token = moment().format('YYYY-MM-DD HH:mm:ss');

        // const password_enc = await bcrypt.hash(password, 10);
        // console.log(password_enc);

        const query = `UPDATE booking_config.users
	SET token=$1, fecha_creacion_token=$2
	WHERE  user_id=$3  RETURNING *`
        try {
            const rta = await this.pool.query(query, [token, fecha_creacion_token, user]).catch((error) => {
                return messageHandler(error);
            })
            return rta.rows;
        } catch (error) {
            return messageHandler(error);
        }

    }
    async queryToken(token) {

        try {
            let where = ` where token='${token}'`
            const query = `select user_id as key,user_id, names, surnames,  username, cell_phone, address,  profile_id, password, company_id, center_id from  booking_config.users  ${where}`;
            console.log(query);
            const rta = await this.pool.query(query);
            return rta.rows;
        } catch (error) {
            return messageHandler(error);
        }

    }

    async consulta(params) {
        try {
            let where = ` where 1=1`;
            if (typeof params.id != "undefined") {
                where += ` and user_id= ${params.id}`;
            }
            if (typeof params.profile_id != "undefined" && params.profile_id != "") {
                where += ` and profile_id=${params.profile_id}`;
            }
            if (typeof params.username != "undefined" && params.username != "") {
                where += ` and username='${params.username}'`;
            }
            if (typeof params.state != "undefined" && params.state != "") {
                where += ` and state='${params.state}'`;
            }
            if (typeof params.company_id != "undefined" && params.company_id != "") {
                where += ` and company_id=${params.company_id}`;
            }
            if (typeof params.center_id != "undefined" && params.center_id != "") {
                where += ` and center_id=${params.center_id}`;
            }
            let query = ''
            if (typeof params.fields != 'undefined' && params.fields != null) {
                query = `select user_id as key, ${params.fields} from  booking_config.users ${where}`;
            } else {
                query = `select user_id as key,*,updated_by::text as updated_by,created_at::text as created_at from  booking_config.users ${where}`;
            }

            const rta = await this.pool.query(query);
            return rta.rows;

        } catch (error) {
            return messageHandler(error);
        }
    }
    async delete(id) {
        try {
            let consu = await this.consulta(id);
            if (consu == "") {
                return false;
            }
            const rta = await this.pool
                .query(
                    `DELETE FROM   booking_config.users
      WHERE user_id=$1`,
                    [id]
                )
            return rta;
        } catch (error) {
            return messageHandler(error);
        }

    }


}
module.exports = usuariosServices;