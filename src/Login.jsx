import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const login = () => {
    if (user === "admin" && pass === "1234") {
      navigate("/dashboard");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  const goRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-page">
      <div className="login-box">

        <h1 className="login-title">🌸 Sistema Escolar</h1>

        <input
          placeholder="Usuario"
          onChange={(e) => setUser(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPass(e.target.value)}
        />

        <div className="button-group">
          <button onClick={login}>Entrar</button>
          <button className="secondary" onClick={goRegister}>Registrar</button>
        </div>

      </div>
    </div>
  );
}

export default Login;