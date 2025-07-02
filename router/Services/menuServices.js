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
            if (rta.rows.length > 0) {
                let arraymenus = rta.rows
                let menu = [];


                for (let i = 0; i < rta.rows.length; i++) {
                    const element = rta.rows[i];
                    menu.push({
                        menu_id: element.menu_id
                    })
                }
                let query2 = `SELECT submenu_id, submenu, icon, path, user_id, created_at,menu_id, "group"
	FROM booking_config.submenus  where menu_id in (${menu.map(m => m.menu_id).join(',')}) order by menu_id;`;
                const submenus = await this.pool.query(query2);
                arraymenus.map(item => {
                    item.submenus = submenus.rows.filter(sub => sub.menu_id === item.menu_id);
                })
                const query3 = `SELECT action
                            	FROM booking_config.actions`;
                const consul_actions = await this.pool.query(query3);

                const actions = consul_actions.rows;
                let actionsArray = actions.map(act => (act.action));
                arraymenus.push({ actions: actionsArray });

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