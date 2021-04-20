
const express = require("express");
const router = express.Router();
const Pokemon = require('../models/pokemon');
const https = require("https");
const db = require("../public/dbConnect")
const pokemonRequestRoute = 'https://pokeapi.co/api/v2/pokemon/';
const cookieParser = require("cookie-parser");

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
        let user = req.cookies['userData'];
        
        resp.on('data', (chunk) => {
            pokemonData += chunk;
        });

        resp.on('end',() => {
            if(!user)
            {
                res.status(500).send("User not logged in");
                return;    
            }

            pokemonData = JSON.parse(pokemonData);
                        
            pokemonObj = CreatePokemonWithUser(pokemonData, user.name);
            InsertPokemonDatabase(pokemonObj);

            console.log(pokemonObj);
            res.status(200).send("Pokemon added: " + JSON.stringify(pokemonObj));
        })

    }).on("error",(err) => {
        console.log("Error: " + err);
        res.status(500).send(err);
    });
})

function CreatePokemonWithUser(pokemonData, user)
{
    let pokemonObj = new Object;
    let stats = new Object;
    pokemonObj.stats = stats;
    pokemonObj.stats.hp = pokemonData.stats[0].base_stat;
    pokemonObj.stats.attack = pokemonData.stats[1].base_stat;
    pokemonObj.stats.defence = pokemonData.stats[2].base_stat;
    pokemonObj.stats.speed = pokemonData.stats[5].base_stat;
    pokemonObj.name = pokemonData.name;
    pokemonObj.sprite = pokemonData.sprites.front_default;
    pokemonObj.types = pokemonData.types;
    pokemonObj.user = user;
    
    return pokemonObj;
}

function InsertPokemonDatabase(pokemonObj)
{
    let pokeCollection = db.collection("pokemons");
    
    pokeCollection.insertOne(pokemonObj, (err,res) => { 
        if(err) throw err;
        console.log("1 Pokemon inserted");
        db.close;
     })
}

module.exports = router;