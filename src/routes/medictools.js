const express = require("express");
const router = express.Router();
const pool = require("../database");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
router.post("/register", async (req, res) => {
  const { nombre, costo, idVendedor, descripcion, imagenes } = req.body;
  let urls = [];

  try {
    const result = await pool.query(
      "INSERT INTO EQUIPOMEDICO(nombre,estado,costo,idVendedor,descripcion)VALUES(?,?,?,?,?)",
      [nombre, "En venta", costo, idVendedor, descripcion]
    );
    for (let i = 0; i < imagenes.length; i++) {
      let imageName = `Vendedor_${idVendedor}_Nombre_${nombre}_Producto_${
        result.insertId
      }_imagen_${i + 1}.png`;
      let dir = `../public/img/${imageName}`;
      let width = imagenes[i].width;
      let height = imagenes[i].height;

      if (
        !fs.existsSync(path.join(__dirname, "..", "public", "img", imageName))
      ) {
        fs.writeFileSync(
          path.join(__dirname, "..", "public", "img", imageName),
          ""
        );
      }
      urls[i] = path.join("public", "img", imageName);
      sharp(Buffer.from(Object.values(imagenes[i].matriz)), {
        raw: { width, height, channels: 4 },
      }).toFile(
        path.join(__dirname, "..", "public", "img", imageName),
        (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log(info);
          }
        }
      );
    }
    console.log(urls.length);
    for (let i = 0; i < urls.length; i++) {
      let resultado = await pool.query(
        "INSERT INTO imagenes(ruta)VALUES(?)",
        urls[i]
      );
      await pool.query(
        "INSERT INTO EM_Imagenes(idEquipoMedico,idImagen)VALUES(?,?)",
        [result.insertId, resultado.insertId]
      );
    }
    res.json({
      message: "Equipo Medico Registrado Correctamente",
      idEquipoMedico: result.insertId,
    });
    return;
  } catch (err) {
    console.log(err);
    res.json({ error: err.sqlMessage, query: err.sql });
  }
});

router.post("/getProducts", async (req, res) => {
  const { idVendedor } = req.body;
  try {
    datos = [];
    const result = await pool.query(
      "SELECT idEquipoMedico,nombre,estado,costo,descripcion FROM EquipoMedico WHERE idVendedor=? ",
      [idVendedor]
    );
    for (let i = 0; i < result.length; i++) {
      const numImagenes = await pool.query(
        "SELECT idImagen FROM EM_Imagenes WHERE idEquipoMedico=? ",
        result[i].idEquipoMedico
      );
      imagenes = [];
      for (let j = 0; j < numImagenes.length; j++) {
        let ruta = await pool.query(
          "SELECT ruta FROM Imagenes WHERE idImagen=?",
          [numImagenes[j].idImagen]
        );
        imagenes.push(ruta);
      }

      datos.push([
        {
          idEquipoMedico: result[i].idEquipoMedico,
          nombre: result[i].nombre,
          estado: result[i].estado,
          costo: result[i].costo,
          descripcion: result[i].descripcion,
          imagenes,
        },
      ]);
    }
    res.json(datos);
  } catch (err) {
    console.log(err);
    res.json({ error: err.sqlMessage, query: err.sql });
  }
});

router.post("/getImageProducts", (req, res) => {
  console.log(path.join(__dirname, "..", req.body.ruta));
  res.sendFile(path.join(__dirname, "..", req.body.ruta), (err) => {
    if (err) {
      console.error(`Error al enviar la imagen: ${err.message}`);
      res.status(404).send("Imagen no encontrada");
    }
  });
});

module.exports = router;
