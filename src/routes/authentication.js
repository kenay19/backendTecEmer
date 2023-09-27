const express = require('express');
const router = express.Router();
const pool = require('../database');

router.post('/UsersRegisters',async(req,res) => {
    const{ 
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
        contrasena
     } = req.body;
    try{
        const idDp = await pool.query('INSERT INTO DatosPersonales(nombre,app,apm) VALUES(?,?,?)',[nombre,app,apm]);
        const idDireccion = await pool.query('INSERT INTO Direccion(calle,inte,exte,colonia,municipio,estado,cp)VALUES(?,?,?,?,?,?,?)',[calle,inte,exte,colonia,municipio,estado,cp]);
        await pool.query('INSERT INTO Direcciones VALUES(?,?)',[idDp.insertId,idDireccion.insertId]);
        const idContacto = await pool.query('INSERT INTO Contacto(telefonoFijo,celular,email)VALUES(?,?,?)',[telefonoFijo,celular,email]);
        const usuario = await pool.query('INSERT INTO Usuario(contrasena,idDp,idContacto,idRol)VALUES(?,?,?,?)',[contrasena,idDp.insertId,idContacto.insertId,idRol])
    }catch(err){
        res.json({ error: err.sqlMessage,query: err.sql});
        return
    }
    res.json({message: 'Usuario Registrado Correctamente'})

});

router.post('/UsersLogin',async(req,res)=> {
    const {email,contrasena} = req.body;
    const result = await pool.query('SELECT idContacto FROM Contacto WHERE email=?',[email]);
    console.log(result[0].idContacto)
    if(result.length >0){
        const datos = await pool.query('SELECT idUsuario,idRol FROM Usuario WHERE idContacto=? AND contrasena=?',[result[0].idContacto,contrasena]);
        res.send(datos);
    }
})


module.exports = router;