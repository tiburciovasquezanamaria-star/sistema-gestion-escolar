import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } from "docx";
import fs from "fs";
import path from "path";

// Helper to create empty lines
function createSpacing(count = 1) {
  return Array.from({ length: count }).map(() => new Paragraph({ text: "" }));
}

// Helper to create heading paragraphs
function createHeading(text, level, spacingAfter = 200) {
  return new Paragraph({
    text: text,
    heading: level,
    spacing: { after: spacingAfter, before: spacingAfter * 1.5 },
    keepWithNext: true,
  });
}

// Helper for body text
function createBodyParagraph(text, isItalic = false, isBold = false) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text: text,
        italics: isItalic,
        bold: isBold,
        size: 24, // 12pt
        font: "Calibri",
      }),
    ],
  });
}

// Helper for table cells
function createCell(text, isHeader = false, widthPercent = null) {
  return new TableCell({
    width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({
            text: text,
            bold: isHeader,
            size: 22, // 11pt
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

async function generate() {
  console.log("Generating Word Document...");

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // ─── PORTADA ───
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "UNIVERSIDAD NACIONAL EVANGÉLICA (UNEV)",
                bold: true,
                size: 32, // 16pt
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "Facultad de Tecnología\nEscuela de Ciencias de la Computación",
                bold: true,
                size: 24, // 12pt
                font: "Arial",
              }),
            ],
          }),
          ...createSpacing(4),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "SEGUNDO EXAMEN PARCIAL — PRUEBAS DE SISTEMA",
                bold: true,
                size: 36, // 18pt
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "Validación y Control de Calidad (QA) - Proyecto de Gestión Escolar",
                italics: true,
                size: 24,
                font: "Arial",
              }),
            ],
          }),
          ...createSpacing(5),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Asignatura: ", bold: true, size: 24, font: "Arial" }),
              new TextRun({ text: "Ingeniería de Software II", size: 24, font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Docente: ", bold: true, size: 24, font: "Arial" }),
              new TextRun({ text: "Carlos Artemio Mendoza", size: 24, font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Estudiante: ", bold: true, size: 24, font: "Arial" }),
              new TextRun({ text: "Ana María Tiburcio Vásquez", size: 24, font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Matrícula: ", bold: true, size: 24, font: "Arial" }),
              new TextRun({ text: "2023-3100007", size: 24, font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Carrera: ", bold: true, size: 24, font: "Arial" }),
              new TextRun({ text: "Ciencias de la Computación", size: 24, font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Fecha: ", bold: true, size: 24, font: "Arial" }),
              new TextRun({ text: "19 de Julio de 2026", size: 24, font: "Arial" }),
            ],
          }),

          // Page Break for Section 1
          new Paragraph({ text: "", pageBreakBefore: true }),

          // ─── SECCIÓN 1: FICHA DE ACCESO ───
          createHeading("1. Ficha de Acceso al Sistema", HeadingLevel.HEADING_1),
          createBodyParagraph("A continuación, se detalla la información necesaria para el acceso y evaluación del sistema desplegado en línea por el docente:"),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Concepto", true, 30),
                  createCell("Detalle", false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createCell("URL del Despliegue Frontend", true, 30),
                  createCell("https://sistema-gestion-escolar.vercel.app", false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createCell("URL de la API Backend", true, 30),
                  createCell("https://sistema-gestion-escolar.onrender.com", false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Volumen de Datos Precargados", true, 30),
                  createCell("66 Cursos organizados por sección (Inicial A/B, 1ro–6to A/B) con maestros asignados, 53 Estudiantes registrados por grado y sexo, 159 Calificaciones reales promediadas, 75 Registros de asistencia diaria.", false, 70),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Notas / Limitaciones del Hosting", true, 30),
                  createCell("El backend está alojado en el plan gratuito de Render. Si el sistema no se ha usado recientemente, la primera solicitud puede tardar de 30 a 50 segundos en responder debido a la suspensión automática del contenedor.", false, 70),
                ],
              }),
            ],
          }),

          createSpacing(1)[0],
          createBodyParagraph("Credenciales de acceso habilitadas por rol:", false, true),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Rol", true, 25),
                  createCell("Usuario de Prueba", true, 25),
                  createCell("Clave de Prueba", true, 25),
                  createCell("Nombre Asignado", true, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Administrador", false, 25),
                  createCell("admin", false, 25),
                  createCell("Admin2026!", false, 25),
                  createCell("Ana María Tiburcio Vásquez", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Docente", false, 25),
                  createCell("docente", false, 25),
                  createCell("Docente2026!", false, 25),
                  createCell("Prof. Carlos Artemio Mendoza", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Secretaria", false, 25),
                  createCell("secretaria", false, 25),
                  createCell("Secretaria2026!", false, 25),
                  createCell("Sra. Laura Santos", false, 25),
                ],
              }),
            ],
          }),

          // ─── SECCIÓN 2: ENTORNO DE PRUEBA ───
          createHeading("2. Entorno de Prueba", HeadingLevel.HEADING_1),
          createBodyParagraph("La ejecución de las pruebas de sistema se llevó a cabo bajo las siguientes especificaciones técnicas y de entorno:"),
          createBodyParagraph("• Plataforma de Despliegue Frontend: Vercel (distribución de archivos estáticos optimizados en React)."),
          createBodyParagraph("• Plataforma de Despliegue Backend: Render (servicio de Node.js Express en la nube)."),
          createBodyParagraph("• Base de Datos: MySQL v8.0 remota (Clever Cloud / Aiven) con pool de conexiones activas."),
          createBodyParagraph("• Navegador Cliente: Google Chrome v126 en modo incógnito (para evitar persistencia indebida de cookies o caché)."),
          createBodyParagraph("• Dispositivo de Prueba: Computadora de escritorio (Windows 11, Intel Core i7, 16GB RAM) y dispositivo móvil emulado (iPhone 13 en Chrome DevTools)."),

          // ─── SECCIÓN 3: MATRIZ DE CASOS DE PRUEBA ───
          createHeading("3. Matriz de Casos de Prueba", HeadingLevel.HEADING_1),
          createBodyParagraph("Se detallan los 10 casos de prueba ejecutados sobre el sistema desplegado en línea:"),

          // CP-01
          createBodyParagraph("Caso de Prueba [CP-01]: Autenticación con Roles e Inicio de Sesión", false, true),
          createBodyParagraph("• Categoría: Funcional de flujo completo"),
          createBodyParagraph("• Entrada: Usuario: 'admin', Clave: 'Admin2026!' / Usuario: 'docente', Clave: 'Docente2026!'"),
          createBodyParagraph("• Resultado Esperado: SweetAlert2 de bienvenida y redirección correcta a /dashboard."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. Sesión iniciada y redirigido en 1.2 segundos."),
          createBodyParagraph("• Estado: PASA", false, true),
          createSpacing(1)[0],

          // CP-02
          createBodyParagraph("Caso de Prueba [CP-02]: Registro de Estudiante en Control Escolar", false, true),
          createBodyParagraph("• Categoría: Funcional de flujo completo"),
          createBodyParagraph("• Entrada: Nombre: 'Carlos Valenzuela', Tipo: 'Estudiante', Correo: 'carlos.valenzuela@unev.edu.do', Matrícula: 'EST-2026-999', Curso: '4to Grado', Sección: 'B'"),
          createBodyParagraph("• Resultado Esperado: Alerta de registro y estudiante listado inmediatamente en la tabla general."),
          createBodyParagraph("• Resultado Obtenido: Falló inicialmente por error de vista faltante. Tras la corrección de base de datos el caso se ejecuta y pasa exitosamente."),
          createBodyParagraph("• Estado: PASA (Tras Corrección)", false, true),
          createSpacing(1)[0],

          // CP-03
          createBodyParagraph("Caso de Prueba [CP-03]: Gestión de Cursos por Sección con Cupos y Maestro Asignado", false, true),
          createBodyParagraph("• Categoría: Funcional de flujo completo"),
          createBodyParagraph("• Entrada: Módulo 'Cursos y Secciones'. Tabla de 14 secciones (Inicial A/B, 1er Grado A/B … 6to Grado A/B). Clic en ✏️ de Sección '2do Grado A' para cambiar maestro a 'Profa. Elena Cruz'. Crear nueva materia con sección '3er Grado B', cupo máx 38."),
          createBodyParagraph("• Resultado Esperado: Tabla refleja cupos reales desde BD (♀ Femenino + ♂ Masculino). Maestro actualizado al instante en todas las materias de esa sección. Validación bloquea inscritos > cupo máximo."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. Tabla con columnas ♀/♂ reales, barra de ocupación dinámica y edición inline del maestro guardada correctamente en MySQL."),
          createBodyParagraph("• Estado: PASA", false, true),
          createSpacing(1)[0],

          // CP-04
          createBodyParagraph("Caso de Prueba [CP-04]: Registro de Calificaciones", false, true),
          createBodyParagraph("• Categoría: Funcional de flujo completo"),
          createBodyParagraph("• Entrada: Estudiante ID: Carlos Valenzuela, Curso: 'Matemáticas I', Nota: 88.50, Periodo: '2do Parcial', Obs: 'Buen desempeño'"),
          createBodyParagraph("• Resultado Esperado: Nota guardada con éxito y promediada de inmediato en la tabla de calificaciones."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. Nota reflejada y promediada al instante."),
          createBodyParagraph("• Estado: PASA", false, true),
          createSpacing(1)[0],

          // CP-05
          createBodyParagraph("Caso de Prueba [CP-05]: Generación y Descarga de Reporte en PDF", false, true),
          createBodyParagraph("• Categoría: Funcional de flujo completo"),
          createBodyParagraph("• Entrada: Clic en el botón 'Descargar Reporte PDF' en el módulo de Reportes."),
          createBodyParagraph("• Resultado Esperado: Descarga automática de un archivo .pdf con el lema institucional, director y notas."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. Archivo PDF descargado y visualizado correctamente."),
          createBodyParagraph("• Estado: PASA", false, true),
          createSpacing(1)[0],

          // CP-06
          createBodyParagraph("Caso de Prueba [CP-06]: Tiempo de Carga con Gráficos y Datos Masivos", false, true),
          createBodyParagraph("• Categoría: Rendimiento / Volumen de datos"),
          createBodyParagraph("• Entrada: Navegación al módulo 'Reportes' con 159 calificaciones sembradas en base de datos."),
          createBodyParagraph("• Resultado Esperado: Renderizado del gráfico de Chart.js y tarjetas en menos de 1.5 segundos."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. Carga de la API and renderizado gráfico completados en 680ms."),
          createBodyParagraph("• Estado: PASA", false, true),
          createSpacing(1)[0],

          // CP-07
          createBodyParagraph("Caso de Prueba [CP-07]: Búsqueda y Filtrado en Tiempo Real", false, true),
          createBodyParagraph("• Categoría: Rendimiento / Volumen de datos"),
          createBodyParagraph("• Entrada: Escribir la palabra 'Pérez' en el buscador rápido de Estudiantes."),
          createBodyParagraph("• Resultado Esperado: Listado reducido dinámicamente en pantalla en menos de 300ms."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. Filtrado instantáneo (0ms al ser local)."),
          createBodyParagraph("• Estado: PASA", false, true),
          createSpacing(1)[0],

          // CP-08
          createBodyParagraph("Caso de Prueba [CP-08]: Usabilidad Responsiva de la Interfaz", false, true),
          createBodyParagraph("• Categoría: Usabilidad (Mejoras UI/UX)"),
          createBodyParagraph("• Entrada: Redimensionar pantalla a resolución móvil (390px de ancho)."),
          createBodyParagraph("• Resultado Esperado: El menú sidebar se colapsa, y el formulario de ingreso se apila verticalmente de forma estética."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. El layout se adapta de manera responsiva y fluida. (Inicialmente bloqueado por CORS, resuelto tras corregir el servidor)."),
          createBodyParagraph("• Estado: PASA (Tras Corrección)", false, true),
          createSpacing(1)[0],

          // CP-09
          createBodyParagraph("Caso de Prueba [CP-09]: Acceso Restringido a Rutas Privadas", false, true),
          createBodyParagraph("• Categoría: Seguridad / Control de acceso"),
          createBodyParagraph("• Entrada: Escribir directamente en modo incógnito la dirección del dashboard sin haber iniciado sesión."),
          createBodyParagraph("• Resultado Esperado: Redirección inmediata a la raíz '/' (login) con borrado de tokens previos."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. Redirigido de forma automática."),
          createBodyParagraph("• Estado: PASA", false, true),
          createSpacing(1)[0],

          // CP-10
          createBodyParagraph("Caso de Prueba [CP-10]: Validación de Datos Inválidos en Formularios", false, true),
          createBodyParagraph("• Categoría: Manejo de errores y datos inválidos"),
          createBodyParagraph("• Entrada: Intentar registrar estudiante con Nombre: 'Juan', Correo: 'juan.com', Matrícula: '' (vacía)."),
          createBodyParagraph("• Resultado Esperado: Mensaje de error visual en SweetAlert2 y rechazo del envío HTTP."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. Alerta visual activada en el cliente."),
          createBodyParagraph("• Estado: PASA", false, true),

          createSpacing(1)[0],

          // CP-11
          createBodyParagraph("Caso de Prueba [CP-11]: Tabla de Cupos Reales con Desglose por Sexo y Estado Reservado", false, true),
          createBodyParagraph("• Categoría: Funcional — Integridad de datos en tiempo real"),
          createBodyParagraph("• Entrada: Acceder al módulo 'Cursos y Secciones'. Verificar que las columnas ♀ Femenino y ♂ Masculino reflejen el conteo exacto de la tabla 'estudiantes' en MySQL, y que el grado se muestre completo (1er Grado, 2do Grado, etc.)."),
          createBodyParagraph("• Resultado Esperado: Tabla de 14 filas (una por sección: Inicial A/B, 1er a 6to Grado A/B) con los campos: Cupo Total, ♀ Fem., ♂ Masc., Cupos Reservados (mostrando 'X reservados'), Cupos Disponibles (mostrando 'Y disponibles'), % de Ocupación y Maestro Encargado."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. Los datos provienen en tiempo real del endpoint GET /api/courses/seccion-cupos. La fila de TOTALES GENERALES suma correctamente. Las barras de progreso cambian de verde a amarillo al superar el 80% de ocupación."),
          createBodyParagraph("• Estado: PASA", false, true),
          createSpacing(1)[0],

          // CP-12
          createBodyParagraph("Caso de Prueba [CP-12]: Asistencia Consolidada por Sexo sin Nombres y con Maestro Encargado", false, true),
          createBodyParagraph("• Categoría: Funcional — Usabilidad y simplificación del pase de lista"),
          createBodyParagraph("• Entrada: Módulo 'Asistencia'. Seleccionar '3er Grado' - Sección 'A'. Verificar que no se muestre el listado individual de nombres de los alumnos. El sistema muestra tarjetas separadas para la asistencia ♀ Femenina y ♂ Masculina con inputs numéricos para Presentes, Ausentes, Tardanzas y Excusas. Modificar Femenino a 3 Presentes y 1 Ausente, y Masculino a 4 Presentes. Cambiar docente a 'Prof. Rafael Almonte'."),
          createBodyParagraph("• Resultado Esperado: (1) El docente a cargo se actualiza en el catálogo de cursos de forma permanente al presionar Enter. (2) Se valida en el frontend que la suma de inputs de cada tarjeta sea exactamente igual al total de alumnos registrados por sexo. (3) Al guardar, se distribuyen los estados equitativamente en la base de datos de manera automatizada."),
          createBodyParagraph("• Resultado Obtenido: Exitoso. Cumple la restricción de no exponer nombres en la lista. Se previene la carga cognitiva al docente permitiendo ingresar solo los totales correspondientes por sexo de manera rápida. La base de datos guarda correctamente los estados correspondientes."),
          createBodyParagraph("• Estado: PASA", false, true),

          // Page Break for Section 4
          new Paragraph({ text: "", pageBreakBefore: true }),

          // ─── SECCIÓN 4: REPORTE DE DEFECTOS ───
          createHeading("4. Reporte de Defectos (Bugs) Encontrados y Corregidos", HeadingLevel.HEADING_1),
          createBodyParagraph("Durante las pruebas en el entorno en la nube, se reportaron y corrigieron 3 defectos severos:"),
          
          createBodyParagraph("[Defecto-01]: Endpoint de autenticación hardcodeado a localhost", false, true),
          createBodyParagraph("• Severidad: Crítica (Impide inicio de sesión de cualquier usuario en producción)."),
          createBodyParagraph("• Pasos para Reproducir: Acceder al frontend desplegado en producción e intentar iniciar sesión."),
          createBodyParagraph("• Evidencia: Consola del navegador muestra: net::ERR_CONNECTION_REFUSED en http://localhost:3001/api/auth/login."),
          createBodyParagraph("• Corrección Aplicada: Se modificó el archivo authApi.js para leer dinámicamente import.meta.env.VITE_API_URL || 'http://localhost:3001'."),
          createSpacing(1)[0],

          createBodyParagraph("[Defecto-02]: Vista 'personas' inexistente en base de datos de producción", false, true),
          createBodyParagraph("• Severidad: Alta (Rompe la carga del panel de estudiantes en el módulo de Control Escolar)."),
          createBodyParagraph("• Pasos para Reproducir: Iniciar sesión, ir al panel de Estudiantes (Control Escolar)."),
          createBodyParagraph("• Evidencia: API devuelve HTTP 500. El log del servidor indica: Error: Table 'sistema_escolar.personas' doesn't exist."),
          createBodyParagraph("• Corrección Aplicada: Se actualizó db.js agregando CREATE OR REPLACE VIEW personas en createTables() y rutinas ALTER TABLE para retrocompatibilidad."),
          createSpacing(1)[0],

          createBodyParagraph("[Defecto-03]: Bloqueo CORS de solicitudes externas en el Servidor API", false, true),
          createBodyParagraph("• Severidad: Crítica (Impide conexión frontend-backend en entornos desplegados)."),
          createBodyParagraph("• Pasos para Reproducir: Realizar cualquier petición fetch desde la URL del frontend remoto."),
          createBodyParagraph("• Evidencia: Error de CORS en el navegador: Access to fetch has been blocked by CORS policy."),
          createBodyParagraph("• Corrección Aplicada: Se modificó server.js para permitir dinámicamente los orígenes definidos en process.env.FRONTEND_URL."),
          createSpacing(1)[0],

          createBodyParagraph("[Defecto-04]: El campo 'inscritos' del frontend no se mapeaba al campo 'capacidad' de la BD", false, true),
          createBodyParagraph("• Severidad: Media (Los cupos mostrados en la tabla siempre eran 0 aunque hubiera estudiantes)."),
          createBodyParagraph("• Pasos para Reproducir: Acceder al módulo 'Cursos y Secciones' y verificar la columna 'Inscritos'."),
          createBodyParagraph("• Evidencia: La columna en MySQL se llama 'capacidad' pero el frontend esperaba el campo 'inscritos'. El controlador devolvía el nombre original de la BD sin renombrar."),
          createBodyParagraph("• Corrección Aplicada: Se actualizó courseController.js para mapear capacidad → inscritos en todas las respuestas JSON del endpoint GET /api/courses. Adicionalmente, se creó el endpoint GET /api/courses/seccion-cupos que lee directamente desde la tabla estudiantes para mayor precisión."),
          createSpacing(1)[0],

          createBodyParagraph("[Defecto-05]: Entradas de texto manuales en lugar de menús desplegables select y desincronización de repositorio/despliegue", false, true),
          createBodyParagraph("• Severidad: Alta (Divergencia entre repositorio local y entorno de producción en Vercel/Render, e inconsistencia de datos al ingresar materias y docentes manualmente)."),
          createBodyParagraph("• Pasos para Reproducir: (1) Ingresar a Calificaciones o Cursos e intentar seleccionar materia o docente encargado. (2) Verificar repositorio GitHub origin/main."),
          createBodyParagraph("• Evidencia: Los formularios usaban entradas de texto libre que permitían errores de sintaxis y el despliegue no reflejaba los últimos commits locales."),
          createBodyParagraph("• Corrección Aplicada: (1) Se transformaron los campos de Materia y Docente Encargado en elementos <select> poblados dinámicamente desde la base de datos en Grades.jsx, Courses.jsx y Attendance.jsx. (2) Se realizó git merge, git commit y git push origin main, reactivando los despliegues automáticos en Vercel y Render."),
          createSpacing(1)[0],

          // ─── SECCIÓN 5: CONCLUSIÓN ───
          createHeading("5. Conclusión", HeadingLevel.HEADING_1),
          createBodyParagraph(
            "El proceso de pruebas de sistema ha arrojado luz sobre una de las lecciones fundamentales del ciclo de desarrollo: la disparidad de entornos. " +
            "Mientras el sistema funcionaba de forma impecable en el entorno local del desarrollador (localhost), el traslado al entorno desplegado reveló defectos de seguridad (bloqueos por CORS), " +
            "referencias erróneas de endpoints que aún apuntaban a la máquina del desarrollador, y brechas estructurales en la base de datos (ausencia de la vista de base de datos personas y columnas obsoletas en las tablas heredadas). " +
            "Las pruebas de caja negra permitieron validar el sistema completo desde la perspectiva del usuario final, garantizando que el flujo de datos fuera consistente a través de todas las capas de red y bases de datos reales en producción. " +
            "Adicionalmente, las iteraciones del ciclo de mejora continua produjeron 2 nuevas funcionalidades: (1) una tabla de cupos por sección con desglose ♀/♂ calculado en tiempo real desde MySQL, maestro encargado editable inline sin recargar la página; (2) un módulo de asistencia que presenta un resumen estadístico por sexo (Presentes, Ausentes, Tardanzas, Excusas y % de asistencia) con el docente a cargo editable manualmente, cumpliendo los 12 casos de prueba definidos."
          ),
          createBodyParagraph(
            "En cuanto al análisis económico de las fallas, el defecto más costoso de corregir habría sido la falta de encriptación y migración segura de las contraseñas heredadas. " +
            "Durante el rediseño estructural de la tabla usuarios, se identificó que las contraseñas de las bases de datos anteriores se almacenaban en texto plano. " +
            "Si este sistema se hubiese puesto en producción sin detectar este fallo de seguridad, la posterior corrección en caliente con datos en producción hubiese implicado un riesgo masivo de pérdida de integridad de datos, " +
            "además de las devastadoras repercusiones legales por violaciones a la privacidad de datos de la institución (Ley No. 172-13 sobre protección de datos personales en República Dominicana) y costos de reputación irreparables para el centro educativo."
          ),
        ],
      },
    ],
  });

  // Write file
  const outPath = path.join(process.cwd(), "Reporte_Pruebas_Sistema_Ana_Tiburcio.docx");
  const fallbackPath = path.join(process.cwd(), "Reporte_Pruebas_Sistema_Ana_Tiburcio_Actualizado.docx");
  Packer.toBuffer(doc).then((buffer) => {
    try {
      fs.writeFileSync(outPath, buffer);
      console.log(`\nWORD DOCUMENT CREATED SUCCESSFULLY AT:\n${outPath}\n`);
    } catch (err) {
      if (err.code === 'EBUSY') {
        console.warn(`⚠️ The main document is open/locked. Saving to fallback path instead...`);
        fs.writeFileSync(fallbackPath, buffer);
        console.log(`\nWORD DOCUMENT CREATED SUCCESSFULLY AT:\n${fallbackPath}\n`);
      } else {
        throw err;
      }
    }
  });
}

generate().catch(err => {
  console.error("Error generating DOCX:", err);
});
