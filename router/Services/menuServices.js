const { array } = require('joi');
const pool = require('../../libs/postgres.pool')
const messageHandler = require('./../../middlewares/message.handler')

class menuServices {
  constructor() {
    this.pool = pool
    this.pool.on('error', (err) => console.error(err));
  }

  async menusProfile(params) {
    try {
      let where = '';
      if (typeof params.profile_id !== 'undefined' && params.profile_id !== null) {
        where = `WHERE profile_id = ${params.profile_id}`;
      }
      console.log('profile_id', params);
      let query = `SELECT id, profile_id, menu_id, submenu_id, actions
	                FROM booking_config.profile_permissions ${where} order by menu_id, submenu_id`;
      const rta = await this.pool.query(query);
      console.log('retorno de menus', rta.rows);
      let menus_ids = [];
      let Submenus_ids = [];
      for (let i = 0; i < rta.rows.length; i++) {
        let element = rta.rows[i];
        menus_ids.push(element.menu_id);
        if (element.submenu_id != null && element.submenu_id != '') {
          Submenus_ids.push(element.submenu_id);
        }
      }
      console.log('menus_ids', menus_ids);
      console.log('Submenus_ids', Submenus_ids);


      let whereMenus = menus_ids.join(',');
      let whereSubmenus = Submenus_ids.join(',');
      let menus = await this.getMenus({ where: whereMenus });
      let submenus = await this.getSubmenus({ where_submenu: whereSubmenus });

      console.log('menus', menus.rows);
      console.log('submenus', submenus.rows);

 menus.rows.map(item => {
  submenus.rows.map(sub => {
    if (sub.menu_id === item.menu_id) {
      if (typeof item.submenus === 'undefined') {
        item.submenus = [];
      }
      item.submenus.push(sub);
    }
  })

 })

console.log('menus final', menus);

return menus.rows;


    } catch (error) {
      messageHandler(error);
    }


  }


  async getAllMenus(params = null) {
    try {

      let rta = await this.getMenus(params);
      if (rta.rows.length > 0) {
        let arraymenus = rta.rows
        let menu = [];


        for (let i = 0; i < rta.rows.length; i++) {
          const element = rta.rows[i];
          menu.push({
            menu_id: element.menu_id
          })
        }

        let where = menu.map(m => m.menu_id).join(',')
        let data = [];
        data.where_menus = where;

        const submenus = await this.getSubmenus(data);
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
  async getMenus(params = null) {
    try {
      console.log('params get menus', params);

      let where = ' where 1=1';
      if (params != null) {
        if (typeof params.where != 'undefined' && params.where != null) {
          where += ` and menu_id in (${params.where})`;
        }
      }
      let query = `SELECT menu_id, menu, icon, path, user_id, created_at
	                    FROM booking_config.menus ${where} order by menu_id`;
      console.log('query_menus', query);
      const rta = await this.pool.query(query);
      return rta;

    } catch (error) {
      return messageHandler(error);

    }

  }
  async getSubmenus(params = null) {
    try {
      console.log('params', params);
      let where = 'where 1=1 ';
      if (params != null) {

        if (typeof params.where_menus !== 'undefined' && params.where_menus !== null) {
          where += ` and  menu_id in (${params.where_menus})`;
        }
        if (typeof params.where_submenu !== 'undefined' && params.where_submenu !== null) {
          where += ` and submenu_id in (${params.where_submenu})`;
        }
      }
      let query = `SELECT submenu_id, submenu, icon, path, user_id, created_at,menu_id, "group"
	FROM booking_config.submenus ${where} order by menu_id;`;
      console.log('query_Submenus', query);

      const rta = await this.pool.query(query);
      return rta;
    } catch (error) {
      return messageHandler(error);

    }

  }



  // async getAllMenus(params = null) {
  //   try {
  //     let query = `SELECT menu_id, menu, icon, path, user_id, created_at
  //                     FROM booking_config.menus `;
  //     const rta = await this.pool.query(query);
  //     if (rta.rows.length > 0) {
  //       let arraymenus = rta.rows
  //       let menu = [];


  //       for (let i = 0; i < rta.rows.length; i++) {
  //         const element = rta.rows[i];
  //         menu.push({
  //           menu_id: element.menu_id
  //         })
  //       }
  //       let query2 = `SELECT submenu_id, submenu, icon, path, user_id, created_at,menu_id, "group"
  // FROM booking_config.submenus  where menu_id in (${menu.map(m => m.menu_id).join(',')}) order by menu_id;`;
  //       const submenus = await this.pool.query(query2);
  //       arraymenus.map(item => {
  //         item.submenus = submenus.rows.filter(sub => sub.menu_id === item.menu_id);
  //       })
  //       const query3 = `SELECT action
  //                           	FROM booking_config.actions`;
  //       const consul_actions = await this.pool.query(query3);

  //       const actions = consul_actions.rows;
  //       let actionsArray = actions.map(act => (act.action));
  //       arraymenus.push({ actions: actionsArray });

  //       return arraymenus;
  //     } else {
  //       return [];
  //     }

  //   } catch (error) {
  //     return messageHandler(error);

  //   }

  // }

}

module.exports = menuServices;
