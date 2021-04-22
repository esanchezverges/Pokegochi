
const express = require("express");
const router = express.Router();
const https = require("https");
const db = require("../public/dbConnect");
const { send } = require("process");
const pokemonRequestRoute = 'https://pokeapi.co/api/v2/pokemon/';
const pokemonSpeciesRequestRoute = "https://pokeapi.co/api/v2/pokemon-species/";


router.get('/', (req,res) => {
    try
    {
        db.collection("pokemons").find({user: req.cookies['userData'].name}).toArray((err,results) =>{
            if(err) throw err;
            res.render('pokedex/index', {pokemons: results});
        });
    }catch
    {
        res.send("No pokemons or user logged in");
    }
})

router.get('/new',(req,res) => {
    res.render('pokedex/new');
})

router.post('/',(req,res) => {
    https.get(pokemonSpeciesRequestRoute + req.body.pokemonName.toLowerCase(), (resp) => {
        let pokemonData = '';
        
        resp.on('data', (chunk) => {
            pokemonData += chunk;
        });

        resp.on('end',() => {
            if(pokemonData == "Not Found")
            {
                res.status(500).send("Pokemon not found");
                return;
            }
            
            pokemonData = JSON.parse(pokemonData);
            
            if(pokemonData.is_legendary)
            {
                res.send("You cannot add a legendary pokemon");
                return;
            }
            else
            {
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
            
                        res.status(200).send("Pokemon added: " + JSON.stringify(pokemonObj));
                    })
            
                }).on("error",(err) => {
                    console.log("Error: " + err);
                    res.status(500).send(err);
                });
            }
        })
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
    pokemonObj.user = user;
    pokemonObj.types = new Array();
    
    for(let i = 0; i < pokemonData.types.length; i++)
    {
        pokemonObj.types[i] = pokemonData.types[i].type.name;
    }
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