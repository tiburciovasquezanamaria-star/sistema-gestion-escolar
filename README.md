# Sistema de Gestión Escolar

Sistema de Gestión Escolar es una aplicación web de administración educativa con una interfaz femenina, moderna y funcional. Permite:

- registrar y listar estudiantes
- gestionar cursos y horarios
- revisar calificaciones
- generar reportes visuales básicos

## Cómo ejecutar el proyecto

### 1. Instalar dependencias

En la carpeta principal:

```bash
npm install
```

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 3. Abrir en el navegador

Visita `http://localhost:5173`

## Backend en memoria

El proyecto incluye una API simple en `server/` que maneja:

- `GET /api/students`
- `POST /api/students`
- `DELETE /api/students/:id`

Para ejecutar el servidor backend, abre otra terminal y usa:

```bash
cd server
npm install
npm start
```

> Nota: la API de estudiantes está en memoria, por lo que los datos se pierden al reiniciar el servidor.

## Build de producción

Para generar archivos listos para producción:

```bash
npm run build
```

## Estado actual

- interfaz lista y funcional
- navegación completa entre páginas
- reporte con gráfico de notas
- estudiantes con registro y eliminación
- build de producción verificado exitosamente

## Archivos clave

- `src/App.jsx` — rutas de la aplicación
- `src/pages/Students.jsx` — gestión de estudiantes
- `src/pages/Courses.jsx` — información de cursos
- `src/pages/Grades.jsx` — visualización de notas
- `src/pages/Reports.jsx` — reportes con gráfico
- `src/styles.css` — estilo femenino y responsive
- `server/server.js` — backend Express

## Cómo presentar el demo

1. Muestra la página de inicio y el diseño femenino.
2. Entra a Estudiantes y crea un alumno nuevo.
3. Abre Reportes para enseñar el gráfico de notas y las métricas.
4. Resalta que el backend funciona con API REST y que se puede convertir en base de datos real.
5. Termina diciendo que ya está en build listo para producción con `npm run build`.
