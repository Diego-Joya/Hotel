const pool = require('../../libs/postgres.pool')
const moment = require('moment');
const messageHandler = require('./../../middlewares/message.handler');
const bcrypt = require('bcrypt');

class usuariosServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.log(err));
    }

    async crear(body, transaction = null) {
        console.log('crear usuario', body);
        try {
            const names = body.names;
            let surname = "";
            if (typeof body.surnames != "undefined") {

                surname = body.surnames;
            } else if (typeof body.surname != "undefined") {
                surname = body.surname;
            }
            const email = body.email;

            let username = body.username;
            if (typeof body.username == "undefined") {

                username = body.email;
            }
            let array = [];
            array.username = username;
            array.return_all = true;
            const validate = await this.consulta(array);
            console.log('validate', validate);
            if (validate.length > 0) {
                return {
                    ok: false,
                    message: "¡El usuario ya existe en la base de datos!"
                };
            }

            const cell_phone = body.cell_phone;
            const address = body.address;
            const password = body.password;
            let state = "";
            if (typeof body.state != "undefined") {
                state = body.state;
            } else {
                state = 'Activo';
            }
            let profile_id = '';
            if (typeof body.profile_id != "undefined") {

                profile_id = body.profile_id;
            } else {

                profile_id = '1';
            }
            const company_id = body.company_id;
            let created_by = "";
            if (typeof body.created_by != "undefined") {
                created_by = body.created_by;
            } else {
                created_by = 'Registro pagina';
            }
            created_by = body.created_by;
            const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
            const center_id = body.center_id;

            const password_enc = await bcrypt.hash(password, 10);
            console.log(password_enc);
            let client = '';

            if (transaction != null) {
                client = transaction
            } else {
                client = this.pool;
            }
            const query = `INSERT INTO booking_config.users( names, surnames, email, username, cell_phone, address, password, state,
            profile_id, created_by,  created_at,  company_id, center_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)  RETURNING *`
            const rta = await client.query(query, [names, surname, email, username, cell_phone, address, password_enc, state, profile_id,
                created_by, created_at, company_id, center_id]);

            // return rta.rows;
            if (typeof rta.rows[0] != 'undefined') {
                let params = {};
                params.user_id = rta.rows[0].user_id;
                console.log("params", params);
                let consulta = await this.consulta(params);
                console.log("consulta", consulta);
                return consulta;
            } else {
                console.log("rta.rows", rta.rows);

                return rta.rows;
            }

        } catch (error) {
            return messageHandler(error);
        }
    }
    async actualizar(id, body) {
        console.log(body);
        const names = body.names;
        // const surname = body.surname;
        const email = body.email;
        const username = body.username;
        let surname = "";
        if (typeof body.surnames != "undefined") {

            surname = body.surnames;
        } else if (typeof body.surname != "undefined") {
            surname = body.surname;
        }


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

        try {
            const query = `UPDATE booking_config.users
	SET names=$1, surnames=$2, email=$3, username=$4, cell_phone=$5, address=$6, state=$7, profile_id=$8,
     updated_by=$9, updated_at=$10, company_id=$11, center_id=$12
	WHERE  user_id=$13  RETURNING *`
            const rta = await this.pool.query(query,
                [names, surname, email, username, cell_phone, address, state, profile_id,
                    updated_by, updated_at, company_id, center_id, id])
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
            // return rta.rows;
            if (typeof rta.rows[0] != 'undefined') {
                return rta.rows[0];
            } else {
                return rta.rows;

            }




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
    async deleteToken(user, token) {
        console.log("user", user);
        console.log("token", token);
        const fecha_delete_token = moment().format('YYYY-MM-DD HH:mm:ss');

        // const password_enc = await bcrypt.hash(password, 10);
        // console.log(password_enc);
        token = null;
        const query = `UPDATE booking_config.users
	SET token=$1, fecha_delete_token=$2,refreshtoken=null
	WHERE  user_id=$3  RETURNING *`
        try {
            const rta = await this.pool.query(query, [token, fecha_delete_token, user.user_id]).catch((error) => {
                return messageHandler(error);
            })
            return rta.rows;
        } catch (error) {
            return messageHandler(error);
        }

    }
    async queryToken(token, user = null) {

        try {
            let where = ` where token='${token}'`
            if (user != null) {
                where += ` and user_id=${user.user_id}`;
            }
            let fields = ' user_id as key, user_id, names, surnames,  username, cell_phone, address,  profile_id, company_id, center_id';
            if (typeof user.verify != 'undefined' && user.verify == true) {
                fields += ', refreshtoken, fecha_creacion_refreshtoken';
            }

            const query = `select ${fields} from  booking_config.users  ${where}`;
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
                where += ` and a.user_id= ${params.id}`;
            }
            if (typeof params.profile_id != "undefined" && params.profile_id != "") {
                where += ` and a.profile_id=${params.profile_id}`;
            }
            if (typeof params.username != "undefined" && params.username != "") {
                where += ` and a.username='${params.username}'`;
            }
            if (typeof params.state != "undefined" && params.state != "") {
                where += ` and a.state='${params.state}'`;
            }
            if (typeof params.company_id != "undefined" && params.company_id != "") {
                where += ` and A.company_id=${params.company_id}`;
            }
            if (typeof params.center_id != "undefined" && params.center_id != "") {
                where += ` and a.center_id=${params.center_id}`;
            }
            let query = ''
            if (typeof params.fields != 'undefined' && params.fields != null) {
                query = `select a.user_id as key, ${params.fields}   FROM
                        BOOKING_CONFIG.USERS A
                        LEFT JOIN BOOKING_CONFIG.PROFILES B ON (A.PROFILE_ID = B.PROFILE_ID)
                        LEFT JOIN BOOKING_CONFIG.CENTERS C ON (A.CENTER_ID = C.CENTERS_ID)
                        LEFT JOIN BOOKING_CONFIG.COMPANYS D ON (C.COMPANY_ID = D.COMPANY_ID) ${where}`;
            } else {
                // query = `select user_id as key,*,updated_by::text as updated_by,created_at::text as created_at from  booking_config.users ${where}`;
                query = `SELECT
                        A.USER_ID AS KEY,
                        A.USER_ID,
                        A.NAMES,
                        A.EMAIL,
                        A.SURNAMES,
                        A.USERNAME,
                        A.CELL_PHONE,
                        A.ADDRESS,
                        A.STATE,
                        A.PROFILE_ID,
                        A.COMPANY_ID,
                        A.CENTER_ID,
                        A.PASSWORD,
                        A.UPDATED_BY::TEXT AS UPDATED_BY,
                        A.CREATED_AT::TEXT AS CREATED_AT,
                        B.PROFILE,
                        C.CENTER_NAME,
                        D.COMPANY_NAME
                    FROM
                        BOOKING_CONFIG.USERS A
                        LEFT JOIN BOOKING_CONFIG.PROFILES B ON (A.PROFILE_ID = B.PROFILE_ID)
                        LEFT JOIN BOOKING_CONFIG.CENTERS C ON (A.CENTER_ID = C.CENTERS_ID)
                        LEFT JOIN BOOKING_CONFIG.COMPANYS D ON (C.COMPANY_ID = D.COMPANY_ID) ${where}`;
            }

            let rta = await this.pool.query(query);
            if (typeof params.return_all && params.return_all == true) {
                return rta.rows;
            } else {
                return rta.rows[0];
            }

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
    async userCompany(body, transaction = null) {
        // const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
        const company_id = body.company_id;
        const user_id = body.user_id;
        let client = '';

        if (transaction != null) {
            client = transaction
        } else {
            client = this.pool;
        }
        try {
            const query = `INSERT INTO booking_config.companys_users(
	 company_id, user_id) VALUES ($1, $2) RETURNING *`;

            const rta = await client
                .query(query, [
                    company_id,
                    user_id,
                ])
            return rta.rows;

        } catch (error) {
            return messageHandler(error)

        }
    }


}
module.exports = usuariosServices;