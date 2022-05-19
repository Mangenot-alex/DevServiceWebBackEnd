var express = require('express');
var router = express.Router();


let listCommandes = {
  "type": "collection",
  "count": 3,
  "commandes": [
    {
    "id": "AuTR4-65ZTY",
    "mail_client": "jan.neymar@yaboo.fr",
    "date_commande": "2022-01-05 12:00:23",
    "montant": 25.95
    },
    {
    "id": "657GT-I8G443",
    "mail_client": "jan.neplin@gmal.fr",
    "date_commande": "2022-01-06 16:05:47",
    "montant": 42.95
    },
    {
    "id": "K9J67-4D6F5",
    "mail_client": "claude.francois@grorange.fr",
    "date_commande": "2022-01-07 17:36:45",
    "montant": 14.95
    },
  ]};




router.get('/', function(req, res, next) {
  res.send('homepage commandes');
});

router.get('/all', function(req, res, next) {
  res.json(listCommandes)
});

router.get('/:id', function(req, res, next) {

  let commande = listCommandes.commandes.find( commande => commande.id === req.params.id);
  console.log(commande);
  if(commande===undefined){
    res.status(404).json({
        "type": "error",
        "error": 404,
        "message": `commande ${req.params.id} non trouvé`});
}
  res.json(commande);
});


module.exports = router;
