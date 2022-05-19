var express = require('express');
var router = express.Router();

const db = require('../knex');


router.get('/', async function (req, res, next) {
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

router.get('/:id', async function (req, res, next) {
  let commandeObj = { type: "ressource" };
  try {
    commandeObj.commande = (await db.select('id', 'mail', 'nom', 'created_at', 'livraison', 'montant').from('commande').where('id', req.params.id))[0];
  } catch (error) {
    res.status(500).json({
      "type": "error",
      "error": 500,
      "message": `impossible d'accèder à la base de données`
    });
  }
  if (commandeObj && commandeObj.length === 0) {
    res.status(404).json({
      "type": "error",
      "error": 404,
      "message": `commande ${req.params.id} non trouvé`
    });
  } else {

    if (req.query.embed && req.query.embed === "items") {
      try {
        items = await db.select('id', 'uri', 'libelle', 'tarif', 'quantite').from('item').where('command_id', req.params.id)
      } catch (error) {
        res.status(500).json({
          "type": "error",
          "error": 500,
          "message": `impossible d'accèder à la base de données`
        });
      }
      commandeObj.items = items;
    }

    commandeObj.links = {
      "items": {
        "href": `/commandes/${req.params.id}/items`
      },
      "self": {
        "href": `/commandes/${req.params.id}`
      },
    }

    res.status(200).json(commandeObj);

  }
});

router.get('/:id/items', async function (req, res, next) {
  let items;
  let commande;
  try {
    commande = await db.select().from('commande').where('commande.id', req.params.id);
    items = await db.select('id', 'uri', 'libelle', 'tarif', 'quantite').from('item').where('command_id', req.params.id)
  } catch (error) {
    res.status(500).json({
      "type": "error",
      "error": 500,
      "message": `impossible d'accèder à la base de données`
    });
  }
  if (commande && commande.length === 0) {
    res.status(404).json({
      "type": "error",
      "error": 404,
      "message": `commande ${req.params.id} non trouvée`
    });
  } else {
    commande = {
      "type": "collection",
      "count": items.length,
      items
    }

    res.json(commande);
  }
});

router.post('/:id', async function (req, res, next) {
  let commande;
  try {
    commande = await db.from('commande').where('id', req.params.id).update({
      updated_at: new Date(),
      livraison: req.body.livraison,
      nom: req.body.nom,
      mail: req.body.mail,
    });
  } catch (error) {
    res.status(500).json({
      "type": "error",
      "error": 500,
      "message": `impossible d'accèder à la base de données ${error}`
    });
  }
  if (commande === 0) {
    res.status(404).json({
      "type": "error",
      "error": 404,
      "message": `commande ${req.params.id} non trouvé`
    });
  } else {
    res.status(204).json(commande);
  }
});


module.exports = router;
