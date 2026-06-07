import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout";

function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost/api-escolar/estudiantes.php")
      .then((res) => {
        setStudents(res.data);
      })
      .catch(() => {
        setStudents([]);
      });
  }, []);

  return (
    <Layout>
      <h1>👩‍🎓 Estudiantes</h1>

      <div className="grid">
        {students.length === 0 ? (
          <p style={{ color: "#d63384" }}>
            No hay datos cargados. Verifica la API o la conexión.
          </p>
        ) : (
          students.map((student) => (
            <div className="card" key={student.id}>
              <h3>{student.nombre}</h3>
              <p>Edad: {student.edad}</p>
              <p>Curso: {student.curso}</p>
              <p>Teléfono: {student.telefono}</p>
              <p>Correo: {student.email ?? "No disponible"}</p>
              <p>Grado: {student.grado ?? "No disponible"}</p>
            </div>
          ))) }
      </div>
    </Layout>
  );
}

export default Students;
