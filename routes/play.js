
const express = require("express");
const router = express.Router();
const db = require("../public/dbConnect");

router.get('/', (req,res) => {
    try
    {
        db.collection("pokemons").find({user: req.cookies['userData'].name}).toArray((err,results) =>{
            if(err) throw err;
            //console.log(results);
            res.render('play/index', {pokemons: results});
        });
    }catch
    {
        res.send("No pokemons or user logged in");
    }
})

module.exports = router;