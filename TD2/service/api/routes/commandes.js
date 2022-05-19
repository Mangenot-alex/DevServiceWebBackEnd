var express = require('express');
var router = express.Router();

const db = require ('../knex');


router.get('/', async function(req, res, next) {
  let data;
  try {
  data = await db.select().from('commande');
  } catch (error) {
    res.status(500).json({
      "type": "error",
      "error": 500,
      "message": `impossible d'accèder à la base de données`
    });
  }
  res.json(data)
});

router.get('/:id', async function(req, res, next) {

  let commande;
  try {
    commande = await db.select().from('commande').where('id', req.params.id);
  } catch (error) {
    res.status(500).json({
      "type": "error",
      "error": 500,
      "message": `impossible d'accèder à la base de données`
    });
  }  console.log(commande);
  if (commande && commande.length === 0) {
    res.status(404).json({
      "type": "error",
      "error": 404,
      "message": `commande ${req.params.id} non trouvé`
    });
  } else {
    res.json(commande);
  }
});


module.exports = router;
