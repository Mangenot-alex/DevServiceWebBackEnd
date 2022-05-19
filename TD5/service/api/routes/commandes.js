var express = require('express');
var router = express.Router();

const joi = require('joi');
const { v4: uuid_v4 } = require('uuid');
const bcrypt = require('bcrypt');

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
    commandeObj.commande = (await db.select('id', 'mail', 'nom', 'created_at', 'livraison', 'montant', 'token').from('commande').where('id', req.params.id))[0];
  } catch (error) {
    res.status(500).json({
      "type": "error",
      "error": 500,
      "message": `impossible d'accèder à la base de données`
    });
  }

  if (req.query.token) {
    if (req.query.token != commandeObj.commande.token && req.headers.x_lbs_token != commandeObj.commande.token) {
      return res.status(401).json({
        "type": "error",
        "error": 401,
        "message": `accès refusé, vous n'avez pas les droits`
      });
    }
  } else {
    return res.status(401).json({
      "type": "error",
      "error": 401,
      "message": `accès refusé, vous n'avez pas les droits`
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

router.post('/', async function (req, res, next) {
  const schema = joi.object().keys({
    livraison: joi.object().keys({
      date: joi.date().required(),
      heure: joi.string().required(),
    }),
    nom: joi.string().required(),
    mail: joi.string().email().required(),
    items: joi.array().items(joi.object().keys({
      libelle: joi.string().required(),
      uri: joi.string().required(),
      q: joi.number().required(),
      tarif: joi.number().required(),
    }))
  })
  try {
    joi.assert(req.body, schema)
  } catch (error) {
    return res.status(422).send("entré érroné" + error);
  }

  let newCommand;
  let command_id = uuid_v4();
  let montant = 0;
  let itemsToAdd = [];  
  let resDb;

  if (!req.body.items || req.body.items.length < 1) {
    return res.status(400).json({
      "type": "error",
      "error": 4001,
      "message": `impossible d'enregistrer un commande vide`
    });
  }
  req.body.items.forEach(item => {
    itemsToAdd.push({
      uri: item.uri,
      quantite: item.q,
      libelle: item.libelle,
      tarif: item.tarif,
      command_id: command_id
    })
    montant += item.tarif * item.q;
  });
  try {
    resDb = await db.insert(itemsToAdd).into("item");
  } catch (error) {
    console.log(error);
  }

  try {
    newCommand = {
      id: command_id,
      created_at: new Date(),
      updated_at: new Date(),
      livraison: req.body.livraison.date + ' ' + req.body.livraison.heure,
      nom: req.body.nom,
      mail: req.body.mail,
      token: uuid_v4(), 
      montant: montant

    }
    resDb = await db.insert(newCommand).into("commande");
  } catch (error) {
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      res.status(400).json({
        "type": "error",
        "error": 400,
        "message": `impossible d'executer la requête, synthaxe inattendue ${error}`
      });
    } else {
      res.status(500).json({
        "type": "error",
        "error": 500,
        "message": `impossible d'accèder à la base de données ${error}`
      });
    }
  }
  res.status(201).json({ commande: newCommand });

});


module.exports = router;
