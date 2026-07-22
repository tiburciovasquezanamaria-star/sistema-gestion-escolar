const { initDb, getPool } = require("./db");
const bcrypt = require("bcrypt");

async function seed() {
  console.log("🚀 Iniciando el proceso de sembrado (seeding) de datos...");
  
  // Inicializar base de datos y verificar tablas
  await initDb();
  const pool = getPool();

  // 1. Crear usuarios por cada Rol (si no existen)
  console.log("\n👥 Sembrando usuarios de prueba...");
  const rolesDePrueba = [
    {
      usuario: "admin",
      pass: "Admin2026!",
      nombre: "Ana María Tiburcio Vásquez",
      cargo: "Directora Académica (UNEV)",
      rol: "admin"
    },
    {
      usuario: "docente",
      pass: "Docente2026!",
      nombre: "Prof. Carlos Artemio Mendoza",
      cargo: "Profesor Titular",
      rol: "docente"
    },
    {
      usuario: "secretaria",
      pass: "Secretaria2026!",
      nombre: "Sra. Laura Santos",
      cargo: "Secretaria de Control Escolar",
      rol: "secretaria"
    }
  ];

  for (const r of rolesDePrueba) {
    const [exists] = await pool.execute("SELECT id FROM usuarios WHERE usuario = ?", [r.usuario]);
    if (exists.length === 0) {
      const hash = await bcrypt.hash(r.pass, 12);
      await pool.execute(
        `INSERT INTO usuarios (usuario, password_hash, nombre_completo, cargo, rol, activo)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [r.usuario, hash, r.nombre, r.cargo, r.rol]
      );
      console.log(`   ✅ Usuario registrado: ${r.usuario} (${r.rol}) | Clave: ${r.pass}`);
    } else {
      console.log(`   ℹ️ El usuario '${r.usuario}' ya existe.`);
    }
  }

  // 2. Crear cursos (si no existen)
  console.log("\n📚 Sembrando catálogo de cursos...");
  const cursosMock = [
    { nombre: "Matemáticas I", profesor: "Prof. Carlos Artemio Mendoza", horario: "Lunes y Miércoles 8:00 AM - 10:00 AM", aula: "Aula 101", descripcion: "Introducción al álgebra y cálculo diferencial." },
    { nombre: "Lengua Española", profesor: "Profa. Patricia Gómez", horario: "Martes y Jueves 9:00 AM - 11:00 AM", aula: "Aula 102", descripcion: "Comprensión lectora, redacción y literatura contemporánea." },
    { nombre: "Física Básica", profesor: "Prof. Juan Rodríguez", horario: "Lunes y Miércoles 10:30 AM - 12:30 PM", aula: "Laboratorio B", descripcion: "Leyes del movimiento de Newton y cinemática." },
    { nombre: "Ciencias Sociales", profesor: "Profa. Patricia Gómez", horario: "Martes y Jueves 11:30 AM - 1:30 PM", aula: "Aula 103", descripcion: "Historia de la República Dominicana y geopolítica del Caribe." },
    { nombre: "Introducción a la Programación", profesor: "Dra. Ana María Vásquez", horario: "Viernes 8:00 AM - 12:00 PM", aula: "Laboratorio de Cómputos I", descripcion: "Algoritmos básicos, diagramas de flujo y desarrollo en Javascript." }
  ];

  for (const c of cursosMock) {
    const [exists] = await pool.execute("SELECT id FROM cursos WHERE nombre = ?", [c.nombre]);
    if (exists.length === 0) {
      await pool.execute(
        `INSERT INTO cursos (nombre, profesor, horario, aula, capacidad, descripcion, activo)
         VALUES (?, ?, ?, ?, 30, ?, 1)`,
        [c.nombre, c.profesor, c.horario, c.aula, c.descripcion]
      );
      console.log(`   ✅ Curso registrado: ${c.nombre}`);
    } else {
      console.log(`   ℹ️ El curso '${c.nombre}' ya existe.`);
    }
  }

  // 3. Crear estudiantes (si no existen)
  console.log("\n👩‍🎓 Sembrando listado de estudiantes (Control Escolar)...");
  const nombresMasculinos = ["Juan", "Sebastián", "Diego", "Gabriel", "Benjamín", "Mateo", "Ángel", "Thiago", "Alejandro", "Daniel"];
  const nombresFemeninos = ["Ana", "María", "Sofía", "Camila", "Natalia", "Sara", "Emily", "Lucía", "Carla", "Isabella"];
  const apellidos = ["Pérez", "López", "García", "Martínez", "Rodríguez", "Peña", "Vásquez", "Fernández", "Díaz", "Rosario", "Ureña", "Almonte", "Jiménez", "Valdéz", "Núñez"];
  
  const cursosGrados = ["1er Grado", "2do Grado", "3er Grado", "4to Grado", "5to Grado", "6to Grado"];
  const secciones = ["A", "B", "C"];

  const [estudiantesCount] = await pool.execute("SELECT COUNT(*) AS count FROM estudiantes WHERE tipo = 'Estudiante'");
  const currentCount = estudiantesCount[0].count;

  let estudiantesCreados = [];

  if (currentCount < 25) {
    const cantidadACrear = 25 - currentCount;
    for (let i = 0; i < cantidadACrear; i++) {
      const esFemenino = Math.random() > 0.5;
      const nombrePila = esFemenino 
        ? nombresFemeninos[Math.floor(Math.random() * nombresFemeninos.length)]
        : nombresMasculinos[Math.floor(Math.random() * nombresMasculinos.length)];
      
      const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
      const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
      const nombreCompleto = `${nombrePila} ${apellido1} ${apellido2}`;
      
      const edad = 12 + Math.floor(Math.random() * 6); // 12 a 17 años
      const sexo = esFemenino ? "Femenino" : "Masculino";
      const curso = cursosGrados[Math.floor(Math.random() * cursosGrados.length)];
      const seccion = secciones[Math.floor(Math.random() * secciones.length)];
      const telefono = `809-555-${String(1000 + Math.floor(Math.random() * 9000))}`;
      const matricula = `EST-2026-${String(1000 + i + currentCount)}`;
      const correo = `${nombrePila.toLowerCase()}.${apellido1.toLowerCase()}@unev.edu.do`;

      await pool.execute(
        `INSERT INTO estudiantes (nombre, edad, sexo, curso, seccion, telefono, tipo, matricula, correo, archivado)
         VALUES (?, ?, ?, ?, ?, ?, 'Estudiante', ?, ?, 0)`,
        [nombreCompleto, edad, sexo, curso, seccion, telefono, matricula, correo]
      );
      
      console.log(`   ✅ Estudiante registrado: ${nombreCompleto} | Matrícula: ${matricula}`);
    }
  } else {
    console.log(`   ℹ️ Ya hay ${currentCount} estudiantes en la base de datos.`);
  }

  // Obtener IDs de estudiantes actuales para asignarles notas
  const [estudiantes] = await pool.execute("SELECT id, nombre, curso, seccion FROM estudiantes WHERE tipo = 'Estudiante'");
  estudiantesCreados = estudiantes;

  // 4. Crear Calificaciones (al menos 100 notas)
  console.log("\n📊 Sembrando calificaciones simuladas (100+ notas)...");
  
  // Limpiar notas previas si se desea regenerar o simplemente sembrar si hay pocas
  const [notasCount] = await pool.execute("SELECT COUNT(*) AS count FROM notas");
  const actualNotas = notasCount[0].count;

  if (actualNotas < 100) {
    const periodos = ["1er Parcial", "2do Parcial", "Examen Final"];
    const [cursosDisponibles] = await pool.execute("SELECT nombre FROM cursos");
    
    let notasAgregadas = 0;

    for (const est of estudiantesCreados) {
      // Para cada estudiante, le asignamos notas en 3 o 4 materias y por diferentes períodos
      const cantidadMaterias = 3 + Math.floor(Math.random() * 2); // 3 o 4 materias por estudiante
      
      // Mezclar materias
      const materiasEstudiante = [...cursosDisponibles]
        .sort(() => 0.5 - Math.random())
        .slice(0, cantidadMaterias);

      for (const m of materiasEstudiante) {
        for (const p of periodos) {
          // Generar nota con promedio alto pero con algunos reprobados para buscar fallas
          // El 85% pasa con notas entre 70 y 100. El 15% tiene notas entre 50 y 69.
          const esAprobado = Math.random() > 0.15;
          const nota = esAprobado
            ? (70 + Math.random() * 30).toFixed(2)
            : (50 + Math.random() * 19.5).toFixed(2);

          const observaciones = nota >= 70 
            ? "Buen rendimiento académico." 
            : "Requiere reforzamiento y tutorías.";

          await pool.execute(
            `INSERT INTO notas (estudiante_id, curso, nota, periodo, observaciones)
             VALUES (?, ?, ?, ?, ?)`,
            [est.id, m.nombre, parseFloat(nota), p, observaciones]
          );
          
          notesAgregadas = (typeof notesAgregadas === 'undefined' ? 0 : notesAgregadas) + 1;
          notasAgregadas = notesAgregadas || 1;
        }
      }
    }
    console.log(`   ✅ Sembrado exitoso de calificaciones.`);
  } else {
    console.log(`   ℹ️ La base de datos ya cuenta con ${actualNotas} calificaciones.`);
  }

  // 5. Crear Asistencias (al menos una semana para simular)
  console.log("\n📅 Sembrando registros de asistencia...");
  const [asistenciasCount] = await pool.execute("SELECT COUNT(*) AS count FROM asistencias");
  if (asistenciasCount[0].count < 50) {
    const estadosAsistencia = ["Presente", "Presente", "Presente", "Presente", "Ausente", "Tardanza", "Excusa"];
    const fechas = ["2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17"];
    
    let asistenciasAgregadas = 0;

    for (const est of estudiantesCreados.slice(0, 15)) { // Sembrar asistencia para 15 estudiantes
      for (const f of fechas) {
        const estado = estadosAsistencia[Math.floor(Math.random() * estadosAsistencia.length)];
        
        await pool.execute(
          `INSERT IGNORE INTO asistencias (estudiante_id, fecha, estado, curso_grado, seccion, maestro_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [est.id, f, estado, est.curso, est.seccion, 2] // maestro_id = 2 es el de docente
        );
        asistenciasAgregadas++;
      }
    }
    console.log(`   ✅ Se sembraron ${asistenciasAgregadas} registros de asistencia diaria.`);
  } else {
    console.log(`   ℹ️ Ya hay suficientes registros de asistencia.`);
  }

  console.log("\n🎉 ¡Sembrado de datos finalizado con éxito!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Error durante el sembrado de datos:", err);
  process.exit(1);
});
