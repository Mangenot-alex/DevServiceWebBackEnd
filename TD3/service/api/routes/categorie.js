var express = require('express');
var router = express.Router();

const db = require('../knex');

router.get('/', async function (req, res, next) {
  let data;
  try {
    data = await db.select().from('categorie');
  } catch (error) {
    res.status(500).json({
        "type": "error",
        "error": 500,
        "message": `impossible d'accèder à la base de données`
      });
  }
  res.json(data)
});

module.exports = router;