const { array } = require('joi');
const pool = require('../../libs/postgres.pool')
const messageHandler = require('./../../middlewares/message.handler')

class menuServices {
    constructor() {
        this.pool = pool
        this.pool.on('error', (err) => console.error(err));
    }


    async getAllMenus() {
        try {
            let query = `SELECT menu_id, menu, icon, path, user_id, created_at
	                    FROM booking_config.menus;`;
            const rta = await this.pool.query(query);
            console.log('valores rta', rta.rows);
            if (rta.rows.length > 0) {
                let arraymenus = rta.rows
                let menus = [];
                for (let i = 0; i < rta.rows.length; i++) {
                    const element = rta.rows[i];
                    menus.push({
                        menu_id: element.menu_id
                    })
                }
                let query2 = `SELECT submenu_id, submenu, icon, path, user_id, created_at,menu_id, "group"
	FROM booking_config.submenus  where menu_id in (${menus.map(m => m.menu_id).join(',')}) order by menu_id;`;
                const submenus = await this.pool.query(query2);
                console.log('submenus', submenus.rows);
arraymenus.map(item => {
                    item.submenus = submenus.rows.filter(sub => sub.menu_id === item.menu_id);
                })

console.log('arraymenus', arraymenus);
                return arraymenus;
            } else {
                return [];
            }

        } catch (error) {
            return messageHandler(error);

        }

    }

}

module.exports = menuServices;