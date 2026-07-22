const settingsService = require("../services/settingsService");

const settingsController = {
  async getSettings(req, res) {
    try {
      const settings = await settingsService.getSettings();
      res.json({ success: true, settings });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error al obtener configuración." });
    }
  },

  async updateSettings(req, res) {
    try {
      // Basic validation
      const { nombre_centro, anio_escolar } = req.body;
      if (!nombre_centro || !anio_escolar) {
        return res.status(400).json({ success: false, message: "Nombre del centro y año escolar son obligatorios." });
      }
      await settingsService.updateSettings(req.body);
      res.json({ success: true, message: "Configuración actualizada correctamente." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error al guardar configuración." });
    }
  },
};

module.exports = settingsController;
