module.exports = {

    database: {
        host: process.env.HOST || 'localhost',
        user: process.env.USER || 'root',
        password: process.env.PASSWORD ||'',
        database: process.env.DB ||'Medico'
    }
}