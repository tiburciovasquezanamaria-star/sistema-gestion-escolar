# Backend de Sistema de Gestión Escolar

Este servidor Express gestiona la API de estudiantes para la aplicación.

## Rutas disponibles

- `GET /api/students` — obtener la lista de estudiantes
- `POST /api/students` — registrar un nuevo estudiante
- `DELETE /api/students/:id` — eliminar un estudiante por ID

## Cómo ejecutar

1. Entra al directorio del servidor:

```bash
cd server
```

2. Instala dependencias si no están instaladas:

```bash
npm install
```

3. Inicia el servidor:

```bash
npm start
```

4. Verifica que esté corriendo en:

```bash
http://localhost:3001
```

## Notas

- El servidor usa almacenamiento en memoria para los estudiantes, por lo que los datos se reinician cada vez que se detiene.
- Para conectar con una base de datos real, se puede reemplazar `server/services/studentService.js` con lógica de persistencia.
