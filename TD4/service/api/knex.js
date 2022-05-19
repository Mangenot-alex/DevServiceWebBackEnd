const knex = require ('knex')({
    client : 'mysql',
    version : '8.0.23',
    connection: {
        host: "127.0.0.1",
        port: 3308,
        user: "root",
        password: "",
        database: "LeBonSandwich",
    }
});

module.exports = knex;