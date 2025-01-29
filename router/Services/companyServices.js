const pool = require('../../libs/postgres.pool');
const moment = require("moment");
const messageHandler = require('./../../middlewares/message.handler');
const usuariosServices = require('./usuariosServices');
const centerServices = require('./centerServices');

const user = new usuariosServices();
const center = new centerServices();
class companyServices {
    constructor() {
        this.pool = pool;
        this.pool.on('error', (err) => console.error(err));
    }


    async registerCompany(body) {
        const datauser = body.user;
        const dataCompany = body.company;
        const transaction = await pool.connect();
        
        await transaction.query('BEGIN');
        
        let array = [];
        
        // Verificar retorno de createCompany
        const crear = await this.createCompany(dataCompany, transaction);
        console.log("Retorno de createCompany:", crear);
        
        if (!crear || (Array.isArray(crear) && crear.length === 0)) {
            await transaction.query('ROLLBACK');
            return { ok: false, message: "Error al crear la empresa" };
        }
        
        let ok = crear?.ok ?? (Array.isArray(crear) ? crear[0]?.ok : undefined);
        if (ok === false) {
            await transaction.query('ROLLBACK');
            return crear;
        }
        
        array.push(crear);
        dataCompany.company_id = crear[0]?.company_id;
        
        if (!dataCompany.company_id) {
            await transaction.query('ROLLBACK');
            return { ok: false, message: "Error: No se obtuvo company_id" };
        }
        
        const createCenter = await center.createCenter(dataCompany);
        console.log("Retorno de createCenter:", createCenter);
        
        if (createCenter?.ok === false) {
            await transaction.query('ROLLBACK');
            return createCenter;
        }
        
        array.push(createCenter);
        datauser.center_id = createCenter[0]?.centers_id;
        datauser.company_id = crear[0]?.company_id;
        
        const crearUser = await user.crear(datauser, transaction);
        console.log("Retorno de crearUser:", crearUser);
        
        if (crearUser?.ok === false) {
            await transaction.query('ROLLBACK');
            return crearUser;
        }
        
        array.push(crearUser);
        
        const arrayUser = {
            company_id: datauser.company_id,
            user_id: crearUser[0].user_id
        };
        
        const userCompany = await user.userCompany(arrayUser, transaction);
        console.log("Retorno de userCompany:", userCompany);
        
        if (userCompany?.ok === false) {
            await transaction.query('ROLLBACK');
            return userCompany;
        }
        
        array.push(userCompany);
        await transaction.query('COMMIT');
        
        return array;
    }


    // CREAR COMPANY
    async createCompany(body, transaction = null) {
        console.log("body company", body);

        // const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
        const company_name = body.company_name;
        let no_identification = "";
        if (typeof body.no_identification != "undefined") {
            no_identification = body.no_identification;
        } else if (typeof body.nit != "undefined") {
            no_identification = body.nit;
        }
        const address = body.address;
        const phone = body.phone;
        const country = body.country;
        const city = body.city;
        let client = '';

        if (transaction != null) {
            client = transaction
        } else {
            client = this.pool;
        }
        try {
            const query = `INSERT INTO booking_config.companys(
        company_name, no_identification, address, phone, country, city) VALUES ($1, $2, $3, $4, $5, $6 ) RETURNING *`;

            const rta = await client
                .query(query, [
                    company_name,
                    no_identification,
                    address,
                    phone,
                    country,
                    city

                ])
            return rta.rows;

        } catch (error) {
            return messageHandler(error)

        }
    }

    async updateCompany(id, body) {

        try {
            const company_name = body.company_name;
            const no_identification = body.no_identification;
            const address = body.address;
            const phone = body.phone;
            const country = body.country;
            const city = body.city;
            // const country = Number.isInteger(body.country) ? body.country : parseInt(body.country, 10);
            // const city = Number.isInteger(body.city) ? body.city : parseInt(body.city, 10);
            // id = Number.isInteger(id) ? id : parseInt(id, 10);

            const debugQuery = `
            UPDATE booking_config.companys
            SET company_name='${company_name}', no_identification='${no_identification}', address='${address}', 
                phone='${phone}', country='${country}', city='${city}'
            WHERE company_id=${id}
            RETURNING *;
        `;
            console.log("Query ejecutado:", debugQuery);


            const query = `UPDATE booking_config.companys
        SET  company_name=$1, no_identification=$2, address=$3, phone=$4, country=$5, city=$6
        WHERE company_id=$7 RETURNING *`;
            const rta = await this.pool
                .query(query, [
                    company_name,
                    no_identification,
                    address,
                    phone,
                    country,
                    city,
                    id

                ]);
            return rta.rows;

        } catch (error) {
            return messageHandler(error)
        }
        // const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');

    }

    async getCompany(param) {
        try {
            let query = `select company_id as key,* from booking_config.companys `;
            let rta = await this.pool.query(query);
            return rta.rows

        } catch (error) {
            return messageHandler(error)
        }

    }

}
module.exports = companyServices;
