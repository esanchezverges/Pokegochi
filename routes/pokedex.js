
const express = require("express");
const router = express.Router();
const Pokemon = require('../models/pokemon');
const https = require("https");


router.get('/', (req,res) => {
    res.render("pokedex/index");
})

router.get('/new',(req,res) => {
    res.render('pokedex/new', {pokemon: new Pokemon()});
})

router.post('/',(req,res) => {
    https.get('https://pokeapi.co/api/v2/pokemon/'+req.body.pokemonName, (resp) => {
        let pokemonData = '';

        resp.on('data', (chunk) => {
            pokemonData += chunk;
        });

        resp.on('end',() => {
            console.log(pokemonData);
            res.status(200).send(pokemonData);

        })
    }).on("error",(err) => {
        console.log("Error: " + err);
        res.status(500).send(err);
    });
    

})

module.exports = router;