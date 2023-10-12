const express = require("express");
const router = express.Router();
const pool = require("../database");
const { PythonShell } = require("python-shell");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
router.post("/UsersRegisters", async (req, res) => {
  const {
    nombre,
    app,
    apm,
    telefonoFijo,
    celular,
    email,
    calle,
    inte,
    exte,
    colonia,
    municipio,
    estado,
    cp,
    idRol,
    contrasena,
  } = req.body;
  try {
    const idDp = await pool.query(
      "INSERT INTO DatosPersonales(nombre,app,apm) VALUES(?,?,?)",
      [nombre, app, apm]
    );
    const idDireccion = await pool.query(
      "INSERT INTO Direccion(calle,inte,exte,colonia,municipio,estado,cp)VALUES(?,?,?,?,?,?,?)",
      [calle, inte, exte, colonia, municipio, estado, cp]
    );
    await pool.query("INSERT INTO Direcciones VALUES(?,?)", [
      idDp.insertId,
      idDireccion.insertId,
    ]);
    const idContacto = await pool.query(
      "INSERT INTO Contacto(telefonoFijo,celular,email)VALUES(?,?,?)",
      [telefonoFijo, celular, email]
    );
    const usuario = await pool.query(
      "INSERT INTO Usuario(contrasena,idDp,idContacto,idRol)VALUES(?,?,?,?)",
      [contrasena, idDp.insertId, idContacto.insertId, idRol]
    );
  } catch (err) {
    res.json({ error: err.sqlMessage, query: err.sql });
    return;
  }
  res.json({ message: "Usuario Registrado Correctamente" });
});

router.post("/UsersLogin", async (req, res) => {
  const { email, contrasena } = req.body;
  try {
    const result = await pool.query(
      "SELECT idContacto FROM Contacto WHERE email=?",
      [email]
    );
    if (result.length > 0) {
      const datos = await pool.query(
        "SELECT idUsuario,idRol,nombre FROM Usuario,DatosPersonales WHERE idContacto=? AND contrasena=? AND DatosPersonales.idDp=Usuario.idDp",
        [result[0].idContacto, contrasena]
      );
      if (datos.length > 0) {
        res.json(datos);
        return;
      }
      res.json({ error: "No coinciden los datos" });
      return;
    }
    res.json({ error: "No existe el usuario" });
    return;
  } catch (err) {
    res.json({ error: err.sqlMessage, query: err.sql });
  }
});

router.post("/LoginWithFace", (req, res) => {
  let { img } = req.body;
  img = Object.values(img);
  img = [...img,1]
  const options = {
    mode: "text",
    pythonPath:
      "C:\\Users\\kenay19\\AppData\\Local\\Programs\\Python\\Python311\\python.exe", // Ruta al ejecutable de Python
    scriptPath: path.join(__dirname, "/python"),

  };

  fs.writeFileSync(path.join(__dirname,'/python/datos.json'),JSON.stringify(img))
  const pyshell = new PythonShell("reconocimiento.py", options);

  // Captura la salida generada por el script Python
  pyshell.on("message", (message) => {
    console.log("Mensaje del script Python:", message);
  });

  pyshell.end((err, code, signal) => {
    if (err) {
      console.error("Error al cargar el modelo:", err);
    } else {
      console.log("El script Python ha finalizado.");
      res.send(signal);
    }
  });
});

module.exports = router;
