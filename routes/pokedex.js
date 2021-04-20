
const express = require("express");
const router = express.Router();
const Pokemon = require('../models/pokemon');
const https = require("https");
const db = require("../public/dbConnect")
const pokemonRequestRoute = 'https://pokeapi.co/api/v2/pokemon/';

router.get('/', (req,res) => {
    res.render("pokedex/index");
})

router.get('/new',(req,res) => {
    res.render('pokedex/new', {pokemon: new Pokemon()});
})

router.post('/',(req,res) => {
    https.get(pokemonRequestRoute + req.body.pokemonName.toLowerCase(), (resp) => {
        let pokemonData = '';
        let pokemonObj = new Object;

        resp.on('data', (chunk) => {
            pokemonData += chunk;
        });

        resp.on('end',() => {
            pokemonData = JSON.parse(pokemonData);
            res.status(200).send(pokemonData);
            
            pokemonObj = createPokemon(pokemonData);
            insertPokemonDatabase(pokemonObj);

            console.log(pokemonObj);
        })

    }).on("error",(err) => {
        console.log("Error: " + err);
        res.status(500).send(err);
    });
    

})

function createPokemon(pokemonData)
{
    let pokemonObj = new Object;
    pokemonObj.stats = pokemonData.stats;
    pokemonObj.name = pokemonData.name;
    pokemonObj.sprite = pokemonData.sprites.front_default;
    pokemonObj.types = pokemonData.types;
    return pokemonObj;
}

function insertPokemonDatabase(pokemonObj)
{
    let pokeCollection = db.collection("pokemons");
    console.log("inserting" + pokemonObj);
    pokeCollection.insertOne(pokemonObj, (err,res) => {
        if(err) throw err;
        //else if(pokemonObj.name)
        console.log("1 Pokemon inserted");
        db.close;
     })
}

module.exports = router;