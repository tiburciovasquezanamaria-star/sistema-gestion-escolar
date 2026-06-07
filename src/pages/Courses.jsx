import Layout from "../Layout";

const courses = [
  {
    id: 1,
    name: "Matemáticas",
    teacher: "Profa. Sánchez",
    schedule: "Lunes y Miércoles 10:00 - 11:30",
    room: "Aula 12",
  },
  {
    id: 2,
    name: "Historia",
    teacher: "Prof. Ramírez",
    schedule: "Martes y Jueves 09:00 - 10:30",
    room: "Aula 8",
  },
  {
    id: 3,
    name: "Lengua",
    teacher: "Profa. Torres",
    schedule: "Lunes y Miércoles 13:00 - 14:30",
    room: "Aula 4",
  },
  {
    id: 4,
    name: "Ciencias",
    teacher: "Prof. Castillo",
    schedule: "Viernes 08:30 - 10:00",
    room: "Laboratorio 2",
  },
];

function Courses() {
  return (
    <Layout>
      <h1>📚 Cursos</h1>

      <div className="grid">
        {courses.map((course) => (
          <div className="card" key={course.id}>
            <h3>{course.name}</h3>
            <p>Profesor: {course.teacher}</p>
            <p>Horario: {course.schedule}</p>
            <p>Aula: {course.room}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Courses;
