require('dotenv').config();

const express = require("express");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const commandesRouter = require('./routes/commandes');
const departementRouter = require('./routes/departement');
const annonceRouter = require('./routes/annonce');
const photoRouter = require('./routes/photo');
const regionRouter = require('./routes/region');
const categorieRouter = require('./routes/categorie');

const app = express();
const PORT = 8321;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes available
 */
 app.use('/', indexRouter);
 app.use('/commandes', commandesRouter);

 app.use('/departement', departementRouter);
 app.use('/annonce', annonceRouter);
 app.use('/photo', photoRouter);
 app.use('/region', regionRouter);
 app.use('/categorie', categorieRouter);

app.get('*', function(req, res){
    res.status(400).json({
        "type": "error",
        "error": 400,
        "message": `route inconnu`
    });
})

//Launch the app
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
