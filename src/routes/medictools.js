const express = require("express");
const router = express.Router();
const pool = require("../database");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const multer = require('multer')()
const {SpeechClient} = require('@google-cloud/speech')
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
var urls = []
cloudinary.config({
  cloud_name: 'dmh8kyegv',
  api_key: '694143579324241',
  api_secret: 's7QL8ZvHmcoCjYbpX8rdKVW-ihk'
});

async function uploadImageFromMatrix(matrixData, width, height,idEquipoMedico) {
  try {
    const imageBuffer = await sharp(Buffer.from(Object.values(matrixData)), {
      raw: {
        width,
        height,
        channels: 4 // Dependiendo de tu matriz de píxeles
      }
    }).png().toBuffer(); // Convertir a PNG (puedes cambiar a otros formatos)

    // Crear un stream de carga para Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream({
      width, // Ancho de la imagen
      height, // Alto de la imagen
      format: 'png', // Formato de imagen
      // Otros parámetros opcionales
    }, async (error, result) => {
      if (error) {
        console.error('Error al cargar la imagen:', error);
      } else {
        let resultado = await pool.query(
          "INSERT INTO Imagenes(ruta)VALUES(?)",
          result.url
        );
        await pool.query(
          "INSERT INTO EM_Imagenes(idEquipoMedico,idImagen)VALUES(?,?)",
          [idEquipoMedico, resultado.insertId]
        );
        
      }
    });

    // Enviar el buffer de la imagen al stream de carga de Cloudinary
    uploadStream.end(imageBuffer);
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
  }
}

router.post("/register", async (req, res) => {
  const { nombre, costo, idVendedor, descripcion, imagenes } = req.body;
  

  try {
    const result = await pool.query(
      "INSERT INTO EquipoMedico(nombre,estado,costo,idVendedor,descripcion)VALUES(?,?,?,?,?)",
      [nombre, "En venta", costo, idVendedor, descripcion]
    );
    for (let i = 0; i < imagenes.length; i++) {
     uploadImageFromMatrix(imagenes[i].matriz,imagenes[i].width,imagenes[i].height,result.insertId)
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
      "SELECT idEquipoMedico,nombre,estado,costo,descripcion FROM EquipoMedico WHERE idVendedor=?  AND estado != 'En carrito' AND estado != 'Comprado'",
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
          idVendedor: result[i].idVendedor,
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

router.post('/getProduct',async (req,res) =>{
  const { idProduct } = req.body;
  try {
    datos = [];
    const result = await pool.query(
      "SELECT idEquipoMedico,nombre,estado,costo,descripcion,idVendedor FROM EquipoMedico WHERE idEquipoMedico=? ",
      [idProduct]
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
          idVendedor: result[i].idVendedor,
          imagenes,
        },
      ]);
    }
    res.json(datos);
  } catch (err) {
    console.log(err);
    res.json({ error: err.sqlMessage, query: err.sql });
  }
})

router.post("/getImageProducts", async (req, res) => {
  
  const response = await axios.get(req.body.ruta, { responseType: 'arraybuffer' });

  // Configurar la respuesta
  res.set('Content-Type', 'image/jpeg'); // Cambia el tipo MIME según tu imagen (p. ej., 'image/png')

    // Enviar la imagen como respuesta
    res.end(Buffer.from(response.data, 'binary'));
});

router.put('/updateProduct',async(req,res) =>{
  console.log(req.body)
  const {nombre,descripcion,costo,estado,idEquipoMedico} = req.body;
  
  console.log(nombre,descripcion,costo,estado,idEquipoMedico)
  try{
    const result = await pool.query('UPDATE EquipoMedico SET nombre = ?,descripcion = ?, costo = ?,estado = ? WHERE idEquipoMedico = ?',[nombre,descripcion,costo,estado,idEquipoMedico])
    console.log(result)
    res.json(result);
  }catch(err){
    res.json(err)
  }
})

router.post('/deleteProduct',async(req,res) => {
  const { idEquipoMedico} = req.body;
  console.log(req.body)
  try {
    // primero obtenemos todas las rutas de las imagenes
    const pathImage = await pool.query('SELECT * FROM Imagenes, EM_Imagenes WHERE EM_Imagenes.idEquipoMedico = ? AND EM_Imagenes.idImagen = Imagenes.idImagen',[idEquipoMedico])
    await pool.query('DELETE FROM EM_Imagenes WHERE idEquipoMedico = ?',[idEquipoMedico])
    // eliminamos las imagenes del servidor y la ruta se elmina de la base de datos
    for(let i = 0 ; i < pathImage.length; i++) {
      const serverPath = path.join(__dirname, "..", pathImage[i].ruta);
      if(fs.existsSync(serverPath)) {
        fs.unlink(serverPath, (err) => {
          if(err) {
            console.error('Error al eliminar el archivo:', err);
          }else{
            console.log('Archivo eliminado con éxito.');
          }
        })
      }
      await pool.query('DELETE FROM Imagenes WHERE ruta = ?',[pathImage[i].ruta])

    }
    const result = await pool.query('DELETE FROM EquipoMedico WHERE idEquipoMedico = ?',[idEquipoMedico])
    res.json(result);
  } catch (error) {
    res.json({error: error.message, sql: error.sql});
  }
})

router.get('/getProductsDonador',async(req,res) => {
  try {
    datos = [];
    const result = await pool.query(
      "SELECT idEquipoMedico,nombre,estado,costo,descripcion,idVendedor FROM EquipoMedico WHERE  estado=? ",
      ['En venta']
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
  } catch (error) {
    res.json({error})
  }
})

router.post('/findProduct',async(req,res) =>{
  const  producto  = req.body[0];
  console.log(producto);
  try {  
    datos = [];
    const result = await pool.query(
      "SELECT idEquipoMedico,nombre,estado,costo,descripcion,idVendedor FROM EquipoMedico WHERE  (nombre LIKE '%"+producto+"%'  OR descripcion LIKE '%"+producto+"%') AND estado = 'En venta'"
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
    console.log(datos)
    res.json(datos)
  } catch (error) {
    console.error(error);
    res.json({error})
  }
})

router.post('/getCoordenates', async(req,res)=>{
  const { idVendedor} = req.body;
  console.log(idVendedor)
  try {
    const result = await pool.query('SELECT alt,lat FROM Direccion,Direcciones,DatosPersonales,Usuario WHERE  Usuario.idUsuario = ? AND DatosPersonales.idDp = Usuario.idDp AND Direcciones.idDp = DatosPersonales.idDp AND Direccion.idDireccion=Direcciones.idDireccion',[idVendedor])
    console.log(result)
    res.json(result)
  } catch (error) {
    console.log(error)
    res.json(error)
  }
})

router.post('/compraVenta',async(req,res)=>{
  const {idEquipoMedico,idUsuario} = req.body;
  console.log(idEquipoMedico,idUsuario)
  try {
    const result = await pool.query('INSERT INTO CompraVenta(idEquipoMedico,idComprador)VALUES (?, ?)',[idEquipoMedico,idUsuario]);
    const result2 = await pool.query('INSERT INTO ListaDonaciones(idEquipoMedico,idCompra)VALUES(?,?)',[idEquipoMedico,result.insertId])
    res.json(result2)
  } catch (error) {
    console.error(error)
    res.json(error)
  }
})


router.get('/getProductsSolicitante',async(req,res) => {
  try {
    datos = [];
    const result = await pool.query(
      "SELECT idEquipoMedico,nombre,estado,costo,descripcion,idVendedor FROM EquipoMedico WHERE  estado='Comprado' "
     
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
          idVendedor: result[i].idVendedor,
          imagenes,
        },
      ]);
    }
    res.json(datos);
  } catch (error) {
    res.json({error})
  }
})

router.post('/DonacionAsignada', async (req,res) => {
  const { idEquipoMedico,idSolicitante} = req.body
  try {
    const result = await pool.query('SELECT idDonacion FROM ListaDonaciones WHERE idEquipoMedico = ?',[idEquipoMedico]);
    res.json(await pool.query('INSERT INTO DonacionAsignada(idDonacion,idSolicitante)VALUES (?, ?)',[result[0].idDonacion,idSolicitante]))
  } catch (error) {
    console.error(error)
    res.json(error)
  }
})

router.post('/getDonacionesAsignadas', async(req,res) => {
  const { idSolicitante}  = req.body;
  try {
    const idDonaciones  = await pool.query('SELECT idDonacion FROM DonacionAsignada WHERE idSolicitante=?',[idSolicitante]);
    let idEquipoMedicos = []
    for(let i = 0 ; i < idDonaciones.length; i++) {
      let idEquipoMedico = await pool.query('SELECT idEquipoMedico FROM ListaDonaciones WHERE idDonacion=?',[idDonaciones[i].idDonacion])
      idEquipoMedicos.push(idEquipoMedico[0].idEquipoMedico)
    }
    console.log(idEquipoMedicos)
    res.json([{idEquipoMedicos}])

  } catch (error) {
    console.error(error);
    res.json(error)
  }
})


router.post('/getProductsIds',async(req,res)=>{
  let { idVendedor } = req.body;
  idVendedor = idVendedor[0].idEquipoMedicos
  try {
    datos = [];
    for(let i = 0 ; i < idVendedor.length; i++){
      let result = await pool.query(
        "SELECT idEquipoMedico,nombre,estado,costo,descripcion,idVendedor FROM EquipoMedico WHERE idEquipoMedico = ?",
        [idVendedor[i]]
      );
      for (let i = 0; i < result.length; i++) {
        let numImagenes = await pool.query(
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
            idVendedor: result[i].idVendedor,
            imagenes,
          },
        ]);
      }
    }
    res.json(datos);
  } catch (err) {
    console.log(err);
    res.json({ error: err.sqlMessage, query: err.sql });
  }
}),


router.post('/transcribe', multer.single('audioBlob'), async (req, res) => {
  const audioBlob = req.file;
console.log(audioBlob)
  try {
    const client = new SpeechClient({
      keyFilename: path.join(__dirname, './coordenadasgeograficas-510f044c6700.json')
    });

    if (audioBlob && audioBlob.buffer) {
      audioContent = audioBlob.buffer;
    } else {
      // Manejar el caso cuando audioBlob.path no está definido
      throw new Error('El archivo de audio no está disponible');
    }

    const config = {
      encoding: 'WAV',
      languageCode: 'es-MX',
      sampleRateHertz: 48000,
    };
    var transcrip = ''
    const CHUNK_SIZE = 10000; // Tamaño del fragmento, puedes ajustarlo según tu necesidad
    const totalChunks = Math.ceil(audioContent.length / CHUNK_SIZE);
  // for(let i = 0 ; i < totalChunks;i++){
      

      const request = {
        audio: {content:   audioContent } ,//divideChunk(audioContent,i,CHUNK_SIZE)},
        config: config,
      };
    
      const [response] = await client.recognize(request);
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join('\n');
    
        transcrip += transcription
   // }

    
    console.log(transcription);
    res.status(200).json({ transcription });
  } catch (error) {
    console.error('Error al transcribir:', error);
    res.status(500).json({ error: 'Error al transcribir el audio' });
  }
});

router.get('/describe',async(req,res)=>{
  try{
    res.json(await pool.query('SHOW TABLES'))
  }catch(errot){
    res.json(error)
  }
})

module.exports = router;
