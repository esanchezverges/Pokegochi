
const express = require("express");
const router = express.Router();
const db = require("../public/dbConnect");
const https = require("https");
const { Console } = require("console");
const pokemonRequestRoute = 'https://pokeapi.co/api/v2/pokemon/';
const legendaryPokemonArray = [
    "articuno","zapdos","moltres","raikou","entei","suicune","regirock","regice","registeel","latias",
    "latios","uxie","mesprit","azelf"
];

router.get('/', (req,res) => {
    try
    {
        let userCookies = req.cookies['userData'];
        let gameCookies = req.cookies["Game"];
        db.collection("pokemons").find({user: userCookies.name}).toArray((err,results) =>{
            if(err) throw err;
    
            if(results[0] == undefined)
                res.send("User have no pokemons");
            else
            { 
                let searchCriteria = Math.floor(Math.random()*600);
                searchCriteria += 1;
                if(!gameCookies || userCookies.name != gameCookies.user)
                {
                    gameCookies = InitGame(res,userCookies);
                }
                else if(gameCookies.rounds >= 5)
                {
                    searchCriteria = legendaryPokemonArray[Math.floor(Math.random()*legendaryPokemonArray.length)];
                }
                
                https.get(pokemonRequestRoute + searchCriteria, (resp) => {
                    let pokemonData = '';
                    resp.on('data', (chunk) => {
                        pokemonData += chunk;
                    });

                    resp.on('end',() => {      
                        pokemonData = JSON.parse(pokemonData);
                        pokemonData = CreateSimplePokemon(pokemonData);  
                        console.log("Pokemon data    "+JSON.stringify(pokemonData));  
                        console.log(gameCookies);       
                        res.render('play/index', {pokemons: results, game: gameCookies, enemy: pokemonData});
                    })
                
                }).on("error",(err) => {
                    console.log("Error: " + err);
                    res.status(500).send(err);
                });

             }
        });
    }catch
    {
        res.send("No user logged in");
    }
})

router.post('/', (req,res) => {
    let myPokemon = JSON.parse(req.body.pokemonSelected);
    let enemy = JSON.parse(req.body.enemy);
    let gameCookies = req.cookies["Game"];

    console.log(myPokemon.types[0],enemy);
    db.collection("types").findOne({name: UpperFirstCharacter(myPokemon.types[0])},(err,result) => {
        let enemyType = enemy.types[0];
        if(err)throw err;
        
        if(SearchInArray(result.immunes,enemyType))
        {
            db.collection("pokemons").deleteOne({name: myPokemon.name, user: myPokemon.user});
            gameCookies.rounds = 0;
            res.cookie("Game",gameCookies);
            res.send("You are absolutely destroyed! Nothing was left from "+myPokemon.name+"...");
        }
        else if (SearchInArray(result.weaknesses,enemyType))
        {
            db.collection("pokemons").deleteOne({name: myPokemon.name, user: myPokemon.user});
            gameCookies.rounds = 0;
            res.cookie("Game",gameCookies);
            res.send("You loose the combat! "+myPokemon.name+" died :(");
        }
        else
        { 
            if(gameCookies.rounds >= 5)
            {
                SetVariablesForLegendary(enemy,myPokemon.user);
                db.collection("pokemons").insertOne(enemy);
                gameCookies.rounds = 0;
                res.cookie("Game", gameCookies);
                res.send(enemy.name+" was captured!!! <br> Yow won the game!! <br> But there's more legendary pokemons out there... <br> Try again and let's see if you can catch'em all!");
            }
            else
            {
                gameCookies.rounds += 1;
                res.cookie("Game", gameCookies);
                res.send("You win the combat!");
            }   
        }
    })
})

function InitGame(res,user)
{
    let game = new Object;
    game.rounds = 0;
    game.user = user.name;
    res.cookie("Game",game);
    return game;
}

function CreateSimplePokemon(pokemonData)
{
    let pokemonObj = new Object;
    pokemonObj.name = pokemonData.name;
    pokemonObj.types = new Array();
    for(let i = 0; i < pokemonData.types.length; i++)
    {
        pokemonObj.types[i] = pokemonData.types[i].type.name;
    }
    return pokemonObj;
}

function SearchInArray(array,keyword)
{
    let result = false;
    keyword = keyword.toUpperCase();
    array.forEach(type => {
        type = type.toUpperCase();
       
        if(type == keyword)
        {
            result = true;
        }
    });
    return result;
}

function UpperFirstCharacter(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function SetVariablesForLegendary(pokemon, user)
{
    let stats = new Object;
    pokemon.stats = stats;
    pokemon.stats.hp = "Over 9000";
    pokemon.stats.attack = "Over 9000";
    pokemon.stats.defence = "Over 9000";
    pokemon.stats.speed = "Over 9000";
    pokemon.sprite = "Not found";
    pokemon.user = user;
}
module.exports = router;