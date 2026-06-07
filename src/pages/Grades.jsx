import Layout from "../Layout";

const grades = [
  {
    id: 1,
    student: "Ana Pérez",
    course: "Matemáticas",
    grade: "9.5",
    status: "Aprobado",
    comment: "Excelente trabajo en el último examen.",
  },
  {
    id: 2,
    student: "Luis García",
    course: "Historia",
    grade: "8.0",
    status: "Aprobado",
    comment: "Buen desempeño, sigue repasando fechas.",
  },
  {
    id: 3,
    student: "María López",
    course: "Lengua",
    grade: "7.2",
    status: "Aprobado",
    comment: "Debe mejorar la ortografía.",
  },
  {
    id: 4,
    student: "Carlos Ramírez",
    course: "Ciencias",
    grade: "6.8",
    status: "Aprobado",
    comment: "Necesita reforzar algunos conceptos.",
  },
];

function Grades() {
  return (
    <Layout>
      <h1>📝 Notas</h1>

      <div className="grid">
        {grades.map((item) => (
          <div className="card" key={item.id}>
            <h3>{item.student}</h3>
            <p>Curso: {item.course}</p>
            <p>Nota: {item.grade}</p>
            <p>Estado: {item.status}</p>
            <p>{item.comment}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Grades;
