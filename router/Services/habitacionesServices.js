const pool = require('../../libs/postgres.pool');

class habitacionesServices {
  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  // CREAR BEDROOMS
  async createBedrooms(body) {
    console.log(body);
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
    const no_room = body.no_room;
    const val_min = body.val_min;
    const val_max = body.val_max;
    const type = body.type;
    const center_id = body.center_id;
    const created_by = body.created_by;
    const updated_by = body.updated_by;
    const created_at = body.created_at;
    const updated_at = body.updated_at;

    const query = `INSERT INTO public.saldos_det(fecha, no_room, val_min, val_max, type, center_id, created_by, updated_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING *`;
    const rta = await this.pool
      .query(query, [
        fecha_hora,
        no_room,
        val_min,
        val_max,
        type,
        center_id,
        created_by,
        updated_by,
        created_at,
        updated_at,
      ])
      .catch((err) => console.log(err));
    return rta.rows;
  }
  // ACTUALIZAR
  async actualizar(idact, body) {
    const usuario = body.usuario;
    const id_zona = body.zona;
    const zona_text = body.zona_text;
    const codigo = body.cod_factura;
    const valor_venta = body.valor_venta;
    const valor_iva = body.valor_iva;
    const valor_comision = body.valor_comision;
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');
    const estado = 'PENDIENTE';

    let consu = await this.validar(idact);
    if (consu == '') {
      return false;
    }
    const rta = await this.pool
      .query(
        `UPDATE public.saldos
    SET  fecha=$1, usuario=$2, zona=$3, zona_text=$4, numero_factura=$5, estado=$6,
    valor_venta=$7, valor_iva=$8, valor_comision=$9 WHERE id=$10 `,
        [
          fecha_hora,
          usuario,
          id_zona,
          zona_text,
          codigo,
          estado,
          valor_venta,
          valor_iva,
          valor_comision,
          idact,
        ],
      )
      .catch((err) => console.log(err));
    return rta;
  }
  // ACTUALIZAR SALDOS DETALLES
  async actualizar_saldos_det(idact, body) {
    const usuario = body.usuario;
    const producto = body.id_producto;
    const producto_text = body.producto_text;
    const cantidad = body.cantidad;
    const id_saldo = body.id_encabezado;
    const codigo_producto = body.codigo_producto;
    const precio_unidad = body.precio_unidad;
    const precio_total = body.precio_total;
    const iva = body.iva;
    const porcen_comision = body.porcen_comision;
    const valor_iva = body.valor_iva;
    const valor_comision = body.valor_comision;
    const valor_venta = body.valor_venta;
    const fecha_hora = moment().format('YYYY-MM-DD HH:mm:ss');

    const rta = await this.pool
      .query(
        `UPDATE public.saldos_det
    SET  fecha=$1, usuario=$2, id_producto=$3, producto_text=$4, cantidad=$5, id_saldo=$6,
    codigo_producto=$7, precio_unidad=$8, precio_total=$9, iva=$10, porcen_comision=$11,
     valor_iva=$12, valor_comision=$13, valor_venta=$14 WHERE id=$15 `,
        [
          fecha_hora,
          usuario,
          producto,
          producto_text,
          cantidad,
          id_saldo,
          codigo_producto,
          precio_unidad,
          precio_total,
          iva,
          porcen_comision,
          valor_iva,
          valor_comision,
          valor_venta,
          idact,
        ],
      )
      .catch((err) => console.log(err));
    return rta;
  }
  //BORRA SALDOS DET UNO

  async delete_saldos_det_uno(id_delete) {
    let consu = await this.validar_saldo_det(id_delete);
    if (consu == '') {
      return false;
    }
    const rta = await this.pool
      .query(
        `DELETE FROM public.saldos_det
    WHERE id=$1`,
        [id_delete],
      )
      .catch((err) => console.log(err));
    return rta;
  }
  //BORRA SALDOS DET MASIVOS

  async delete_saldos_det(id_delete) {
    const rta = await this.pool
      .query(
        `DELETE FROM public.saldos_det
    WHERE id_saldo=$1`,
        [id_delete],
      )
      .catch((err) => console.log(err));
    return rta;
  }
  //ELIMINAR SALDOS
  async delete_saldos(id_delete) {
    let consu = await this.validar(id_delete);
    if (consu == '') {
      return false;
    }
    const rta = await this.pool
      .query(
        `DELETE FROM public.saldos
    WHERE id=$1`,
        [id_delete],
      )
      .catch((err) => console.log(err));
    return rta;
  }
  //CONSULTA SALDOS DETALLE POR ID SALDO
  async consult_saldos_det(data) {
    const rta = await this.pool
      .query(`select *, id as key from saldos_det where id_saldo = $1`, [data])
      .catch((err) => console.log(err));
    return rta.rows;
  }
  async buscar_todos() {
    const rta = await this.pool
      .query(
        `SELECT *,fecha::text as fecha, numero_factura as cod_factura, id as key FROM saldos`,
      )
      .catch((err) => console.log(err));
    return rta.rows;
  }
  // CONSULTA SALDOS ID
  async validar(data) {
    const rta = await this.pool
      .query(`SELECT *, id as key FROM saldos where id=${data} `)
      .catch((err) => console.log(err));
    return rta.rows;
  }
  // CONSULTA SALDOS NUMERO FACTURA
  async validar_factura(data) {
    console.log(data);
    const rta = await this.pool
      .query(
        `select *,(select sum(valor_iva) from saldos_det b where a.id=b.id_saldo )as sum_valor_iva,
      (select sum(valor_venta) from saldos_det b where a.id=b.id_saldo )as sum_valor_venta,
      (select sum(valor_comision) from saldos_det b where a.id=b.id_saldo )as sum_valor_comision from saldos a where a.numero_factura='${data}'`,
      )
      .catch((err) => console.log(err));
    return rta.rows;
  }
  async consultas_saldos_det(data) {
    const rta = await this.pool
      .query(
        `select b.*, b.id as key, a.id as id_saldo from saldos a left join saldos_det b on (a.id=b.id_saldo) where a.numero_factura='${data}'`,
      )
      .catch((err) => console.log(err));
    return rta.rows;
  }
  // CONSULTA SECUENCIA ID SALDOS
  async secuencia_id_saldos() {
    const rta = await this.pool
      .query(
        `
      select id from saldos order by id desc limit 1`,
      )
      .catch((err) => console.log(err));
    return rta.rows;
  }
  // async secuencia_id_saldos() {
  //   const rta = await this.pool
  //     .query(`select nextval('saldos_id_seq')`)
  //     .catch((err) => console.log(err));
  //   return rta.rows;
  // }
  //CONSULTA INVENTARIO POR CODIGO FACTURA
  async consult_invetario_cod(data) {
    const rta = await this.pool
      .query(
        `
      select *,b.id as key from inventario_zonas a LEFT JOIN inventario_zonas_det b on
      (a.id=b.id_inventario) where a.codigo='${data}' `,
      )
      .catch((err) => console.log(err));
    return rta.rows;
  }
  async validar_saldo_det(data) {
    const rta = await this.pool
      .query(`SELECT *, id as key FROM saldos_det where id=${data} `)
      .catch((err) => console.log(err));
    return rta.rows;
  }

  async buscar_uno(body) {
    const id = body.id;
    const zona = body.zona;
    const estado = body.estado;
    const fecha_ini = body.fecha_inicio;
    const fecha_fin = body.fecha_fin;
    let where = ` where 1=1`;
    // if (typeof data !== "undefined" && data !== "") {
    //   where += `  and a.zona_text::text ILIKE ('%${data}%') or a.producto_text::text ILIKE ('%${data}%') `;
    // }
    if (typeof zona !== 'undefined' && zona !== '') {
      where += `  and a.zona=${zona}`;
    }
    if (typeof estado !== 'undefined' && estado !== '') {
      where += `  and a.estado='${estado}'`;
    }
    if (typeof fecha_ini !== 'undefined' && fecha_ini != '') {
      where += ` and a.fecha between '${fecha_ini}' and '${fecha_fin}'`;
    }
    if (typeof id !== 'undefined' && id != '') {
      where += ` and a.id ='${id}'`;
    }

    const query = `select b.*, b.producto_text as nomb_producto,  a.zona,a.zona_text, b.producto_text,c.precio,c.iva,c.porcen_comision,c.codigo, b.id as key from saldos a LEFT join saldos_det b on (a.id=b.id_saldo)
    left join productos c on (b.id_producto = c.id) ${where} order by a.id desc`;
    console.log(query);
    const rta = await this.pool.query(query).catch((err) => console.log(err));
    return rta.rows;
  }

  async apply_saldo_fac(body) {
    console.log('aplicando saldos ... ');
    console.log(body);
    const newComision = body.newComision;
    const newTotalVenta = body.newTotalVenta;
    const newSubIva = body.newSubIva;
    const id_factura = body.cod_factura;
    const id_saldo = body.id_saldo;
    const rta = await this.pool
      .query(
        `UPDATE public.inventario_zonas
    SET  total_comision=$1, total_iva=$2, total_venta=$3, id_saldo=$4
    WHERE codigo=$5 `,
        [newComision, newSubIva, newTotalVenta, id_saldo, id_factura],
      )
      .catch((err) => console.log(err));
    return rta.rows;
  }

  async actDevFactura(body) {
    const id_factura = body.id_factura;
    const id = body.id;
    const estado = 'APLICADA';
    const rta = await this.pool
      .query(
        `UPDATE public.devolucion
    SET  id_factura=$1,estado=$2
    WHERE id=$3 `,
        [id_factura, estado, id],
      )
      .catch((err) => console.log(err));
    return rta.rows;
  }
}
module.exports = habitacionesServices;
