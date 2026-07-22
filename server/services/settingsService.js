const { getPool } = require("../db");

const settingsService = {
  async getSettings() {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT * FROM configuracion_sistema WHERE id = 1");
    return rows[0] || null;
  },

  async updateSettings(data) {
    const pool = getPool();
    const {
      nombre_centro,
      direccion,
      telefono,
      codigo_minerd,
      anio_escolar,
      nombre_director,
      cargo_director,
      lema,
    } = data;

    await pool.execute(
      `UPDATE configuracion_sistema SET
        nombre_centro = ?,
        direccion = ?,
        telefono = ?,
        codigo_minerd = ?,
        anio_escolar = ?,
        nombre_director = ?,
        cargo_director = ?,
        lema = ?,
        actualizado_en = NOW()
      WHERE id = 1`,
      [nombre_centro, direccion, telefono, codigo_minerd, anio_escolar, nombre_director, cargo_director, lema]
    );
    return { success: true };
  },
};

module.exports = settingsService;
