const { getPool, initDb } = require("./db");

async function fix() {
  await initDb();
  const pool = getPool();
  
  const updates = [
    { id: 24, name: 'Dra. Ana María Vásquez' },
    { id: 25, name: 'Prof. Carlos Mendoza' },
    { id: 26, name: 'Profa. Laura Santos' },
    { id: 27, name: 'Prof. Juan Rodríguez' },
    { id: 28, name: 'Profa. Patricia Gómez' },
    { id: 1, name: 'Ana Pérez' },
    { id: 3, name: 'Ana Pérez' },
    { id: 2, name: 'María López' },
    { id: 4, name: 'María López' },
    { id: 5, name: 'Carla Rodríguez' },
    { id: 6, name: 'Lucía Martínez' },
    { id: 7, name: 'Sofía García' },
    { id: 10, name: 'Isabella Díaz' },
    { id: 11, name: 'Camila Fernández' },
    { id: 12, name: 'Andrea Ramírez' },
    { id: 13, name: 'Natalia Mejía' },
    { id: 15, name: 'Paola Jiménez' },
    { id: 19, name: 'Abril Núñez' },
    { id: 21, name: 'Emily Peña' },
    { id: 29, name: 'Sofía Almonte' },
    { id: 34, name: 'Sebastián Díaz' },
    { id: 38, name: 'Alejandro Guzmán' },
    { id: 42, name: 'Thiago Martínez' },
    { id: 43, name: 'Lucía Núñez' },
    { id: 44, name: 'Benjamín Ortiz' },
    { id: 49, name: 'Natalia Ureña' },
    { id: 50, name: 'Gabriel Valdéz' },
    { id: 51, name: 'Sara Vásquez' },
    { id: 52, name: 'Ángel Pichardo' },
    { id: 54, name: 'Matías Rosario' },
    { id: 56, name: 'Diego Méndez' }
  ];

  console.log("Iniciando corrección de nombres...");
  for (const u of updates) {
    await pool.execute("UPDATE estudiantes SET nombre = ? WHERE id = ?", [u.name, u.id]);
    console.log(`Corregido ID ${u.id}: ${u.name}`);
  }
  console.log("¡Corrección terminada con éxito!");
  process.exit(0);
}

fix().catch(err => {
  console.error("Error al corregir:", err);
  process.exit(1);
});
