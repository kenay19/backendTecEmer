const express = require('express');
const router = express.Router();
const pool = require('../database');

router.post('/register', async(req,res) => {
    const { nombre,costo,idVendedor,descripcion} = req.body;
    try {
        const result = await pool.query('INSERT INTO EQUIPOMEDICO(nombre,estado,costo,idVendedor,descripcion)VALUES(?,?,?,?,?)',[nombre,'En venta',costo,idVendedor,descripcion]);
        res.json({message: 'Equipo Medico Registrado Correctamente'});
        return;
    }catch(err){
        res.json({ error: err.sqlMessage,query: err.sql});
    }
});


router.post('/getProducts',  async(req,res) => {
    const { idVendedor} = req.body;
    try{
        const result = await pool.query('SELECT * FROM EquipoMedico WHERE idVendedor=?',[idVendedor]);
        res.json(result)
    }catch(err){
        res.json({ error: err.sqlMessage,query: err.sql});
    }
})

module.exports = router;