const express = require("express");
const router = express.Router();
const pool = require("../database");
const { PythonShell } = require("python-shell");
const path = require("path");
const fs = require("fs");
const exec = require('child_process').exec;
var vector = [];
const math = require("math");

async function obtainPath() {
  try {
    const { stdout, stderr } = await exec('heroku run python -c "import sys; print(sys.executable)"');
    console.log(stdout);
    if (stderr) {
      throw new Error(`Error en la ejecución del comando: ${stderr}`);
    }
    // Obtener la ruta del ejecutable de Python de la salida del comando
    const pythonPath = stdout.trim();
    console.log(pythonPath);
    return pythonPath;
  } catch (error) {
    console.error(`Error al obtener la ruta de Python: ${error.message}`);
    return undefined;
  }
}

function options(file) {
  var pathExce ;
  console.log('============================================================================')
  obtainPath().then(result =>{
    console.log(result)
    pathExce = result 
  });
  return {
    mode: "text",
    pythonPath: pathExce || 
      "C:\\Users\\kenay19\\AppData\\Local\\Programs\\Python\\Python311\\python.exe", // Ruta al ejecutable de Python
    scriptPath: path.join(__dirname, "/python"),
    args: file,
  };
}

function generateCaracterisitcas(file) {
  return new Promise((resolve, reject) => {
    const pyshell = new PythonShell("reconocimiento.py", options(file));
    let messages = []; // Aquí almacenaremos los mensaje
    pyshell.on("message", (message) => {
      const numbers = message
        .replace(/[[\]]/g, "") // Elimina corchetes [ y ]
        .split(/\s+/) // Divide los números en el mensaje en base a espacios en blanco
        .map(Number); // Convierte los números en el arreglo a tipo numérico
      messages.push(numbers); // Agrega los números al arreglo
    });
    pyshell.on("close", () => {
      let numeros = [];
      for (let i = 0; i < messages.length; i++) {
        numeros.push(messages[i][1], messages[i][2]);
        if (numeros.length == 2) {
          vector.push(numeros);
          numeros = [];
        }
      }
      messages = [];
      resolve(vector); //
      vector = [];
    });
    pyshell.end((err, code, signal) => {
      if (err) {
        console.error("Error al cargar el modelo:", err);
      } else {
      }
    });
  });
}

function reconstruirVectro(vector){
  let vec = []
  for(let i = 2; i < vector.length; i+=2){
    x = parseInt(vector[i]);
    y = parseInt(vector[i+1]);
    vec.push([x,y]);

  }
  return vec
}

// Función para calcular la similitud del coseno entre dos vectores de características
function calcularSimilitudCoseno(vector1, vector2) {
  // Aplanar los vectores
  const vec1 = vector1.flatMap(([x, y]) => [x, y]);
  const vec2 = vector2.flatMap(([x, y]) => [x, y]);

  // Calcular el producto escalar entre los vectores
  const productoEscalar = vec1.reduce((acc, val, index) => acc + val * vec2[index], 0);

  // Calcular la norma (longitud) de los vectores
  const normaVec1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
  const normaVec2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));

  // Calcular la similitud del coseno
  const similitudCoseno = productoEscalar / (normaVec1 * normaVec2);

  // Establecer un umbral para determinar la similitud
  const umbral = 0.95; // Ajusta este valor según tus necesidades
  // Retornar true si la similitud supera el umbral, de lo contrario, false
  return similitudCoseno >= umbral;
}

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
    lat,
    alt,
    vector1,
    vector2,
    vector3
  } = req.body;
  try {
    const idDp = await pool.query(
      "INSERT INTO DatosPersonales(nombre,app,apm) VALUES(?,?,?)",
      [nombre, app, apm]
    );
    const idDireccion = await pool.query(
      "INSERT INTO Direccion(calle,inte,exte,colonia,municipio,estado,cp,alt,lat)VALUES(?,?,?,?,?,?,?,?,?)",
      [calle, inte, exte, colonia, municipio, estado, cp,alt,lat]
    );
    await pool.query("INSERT INTO Direcciones VALUES(?,?)", [
      idDp.insertId,
      idDireccion.insertId,
    ]);
    const idContacto = await pool.query(
      "INSERT INTO Contacto(telefonoFijo,celular,email)VALUES(?,?,?)",
      [telefonoFijo, celular, email]
    );
    const idVector = await pool.query('INSERT INTO VectorCaracteristicas(vector1,vector2,vector3) VALUES(?,?,?)',[vector1,vector2,vector3] )
    const usuario = await pool.query(
      "INSERT INTO Usuario(contrasena,idDp,idContacto,idRol,idVector)VALUES(?,?,?,?,?)",
      [contrasena, idDp.insertId, idContacto.insertId, idRol,idVector.insertId]
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
  generateCaracterisitcas(req.body.tipo).then((result) => {
    res.json(result);
  });
});

router.post('/LoginFacial',(req, res) => {
  generateCaracterisitcas(req.body.tipo).then(async(result) => {
    let vectores = await pool.query('SELECT * FROM VectorCaracteristicas');
    for(let i = 0 ; i < vectores.length; i++) {
      vectores[i].vector1 = reconstruirVectro(vectores[i].vector1.split(','))
      vectores[i].vector2 = reconstruirVectro(vectores[i].vector2.split(','))
      vectores[i].vector3 = reconstruirVectro(vectores[i].vector3.split(','))
      vector1 = calcularSimilitudCoseno(vectores[i].vector1,result.slice(-66))
      vector2 = calcularSimilitudCoseno(vectores[i].vector2,result.slice(-66))
      vector3 = calcularSimilitudCoseno(vectores[i].vector3,result.slice(-66))
      if((vector1 && vector2) || (vector2 && vector3) || (vector1 && vector3)){
        const resultado = await pool.query('SELECT idUsuario,idRol,nombre FROM Usuario,DatosPersonales WHERE Usuario.idVector=? AND Usuario.idDp=DatosPersonales.idDp',[vectores[i].idVector]);
        console.log(vectores[i].idVector)
        console.log(resultado)
        res.json(resultado)
        return
      }
    }
    res.json({error: 'no se coincide'})
    return
  });
  
})

router.post("/CargarImagenesLogin", (req, res) => {
  let { img } = req.body;

  res.json(cargarImagenes(path.join(__dirname, "/python/login.json"),img));
});

router.post("/CargarImagenesRegistro", (req, res) => {
  let { img } = req.body;
  res.json(cargarImagenes(path.join(__dirname, "/python/registro.json"),img));
});

function cargarImagenes(dir, img) {
  img = Object.values(img);
  img = [...img, 1];
  try {
    fs.writeFileSync(dir, JSON.stringify(img));
  } catch (error) {
    return { message: "No se pudo cargar la imagen correctamente" };
  }
  return { message: "Imagen cargada correctamente" };
}
module.exports = router;
