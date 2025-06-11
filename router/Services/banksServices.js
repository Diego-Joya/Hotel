const pool = require('./../../libs/postgres.pool');
const messageHandler = require('./../../middlewares/message.handler');

class banksServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (error) => console.log(error));

    }
    async crear(body) {
        const bank_name = body.bank_name;
        const centers_id = body.centers_id;
        const company_id = body.company_id;
        const validarExistencia = await this.getAllBanks(body);
        console.log("validar existen", validarExistencia);
        if (validarExistencia.length > 0) {
            return {
                ok: false,
                message: "El nombre del banco ingresado ya existe. ¡Actualiza e intenta de nuevo por favor!",
            }
        }

        try {
            const query = `INSERT INTO booking_config.banks(
	 bank_name, centers_id, company_id)
	VALUES ($1, $2, $3) RETURNING *`;
            const rta = await this.pool
                .query(query, [
                    bank_name,
                    centers_id,
                    company_id,
                ]);
            return rta.rows[0];
        } catch (error) {
            return messageHandler(error)
        }
    }

    async getAllBanks(param) {
        try {
            let fields=`bank_id, bank_name, centers_id, company_id`;
            let where = `where  1=1 `;
             if (typeof param.select != "undefined" && param.select == "true") {
                fields = `bank_id as code, bank_id as key, bank_name as name`
            }
            if (typeof param.centers_id != "undefined" && param.centers_id != "") {
                where += ` and centers_id='${param.centers_id}'`;
            }
            if (typeof param.company_id != "undefined" && param.company_id != "") {
                where += ` and company_id='${param.company_id}'`;
            }
            if (typeof param.bank_name != "undefined" && param.bank_name != "") {
                where += ` and bank_name ilike('%${param.bank_name}%')`;
            }

            let query = `SELECT ${fields}
	FROM booking_config.banks  ${where}`;
            console.log('query que hace', query);
            let rta = await this.pool.query(query);
            return rta.rows

        } catch (error) {
            return messageHandler(error)
        }

    }
    async crearCuenta(body) {
        const number_accounts = body.number_accounts;
        const type = body.type;
        const centers_id = body.centers_id;
        const company_id = body.company_id;
        const bank_id = body.bank_id;
        const validarExistencia = await this.getAllAccounts(body);
        console.log("validar existen", validarExistencia);
        if (validarExistencia.length > 0) {
            return {
                ok: false,
                message: "El numero de cuenta bancaria ya esta creado para este banco y tipo de cuenta. ¡Actualiza e intenta de nuevo por favor!",
            }
        }

        try {
            const query = `INSERT INTO  booking_config.bank_accounts(
	 number_accounts, type, centers_id, company_id, bank_id)
	VALUES ($1, $2, $3, $4, $5) RETURNING *`;
            const rta = await this.pool
                .query(query, [
                    number_accounts,
                    type,
                    centers_id,
                    company_id,
                    bank_id
                ]);
            return rta.rows[0];
        } catch (error) {
            return messageHandler(error)
        }
    }
    async getAllAccounts(param) {
        try {
            let where = `where  1=1 `;
            if (typeof param.number_accounts != "undefined" && param.number_accounts != "") {
                where += ` and a.number_accounts='${param.number_accounts}'`;
            }
            if (typeof param.type != "undefined" && param.type != "") {
                where += ` and a.type='${param.type}'`;
            }
            if (typeof param.company_id != "undefined" && param.company_id != "") {
                where += ` and a.company_id='${param.company_id}'`;
            }
            if (typeof param.centers_id != "undefined" && param.centers_id != "") {
                where += ` and a.centers_id='${param.centers_id}'`;
            }
            if (typeof param.bank_id != "undefined" && param.bank_id != "") {
                where += ` and a.bank_id='${param.bank_id}'`;
            }
            if (typeof param.bank_name != "undefined" && param.bank_name != "") {
                where += ` and a.bank_name ilike('%${param.bank_name}%')`;
            }

            let query = `SELECT
                        A.BANK_ACCOUNT_ID,
                        A.NUMBER_ACCOUNTS,
                        A.TYPE,
                        A.CENTERS_ID,
                        A.COMPANY_ID,
                        A.BANK_ID,
                        B.CENTER_NAME
                    FROM
                        BOOKING_CONFIG.BANK_ACCOUNTS A
                        LEFT JOIN BOOKING_CONFIG.CENTERS B ON (A.CENTERS_ID = B.CENTERS_ID)  ${where}`;
            console.log('query que hace', query);
            let rta = await this.pool.query(query);
            return rta.rows

        } catch (error) {
            return messageHandler(error)
        }

    }
}

module.exports = banksServices;