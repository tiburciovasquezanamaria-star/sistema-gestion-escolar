const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", studentRoutes);

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});