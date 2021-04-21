
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const db = require('../public/dbConnect');

router.get('/new', (req,res) => {
    res.render("users/new");
})

router.get('/', (req,res) => {
    res.send(req.cookies['userData']);
})

router.post('/', (req,res) => {
    let user = new Object;
    
    user.name = req.body.username;
    user.password = req.body.password;
    
    if(req.body.formType == "new")
    {
        TryInsertUserToDB(res, user);
    }
    else
    {
        TryDeleteUserFromDb(res,user);
    }
})

function TryInsertUserToDB(res, user)
{
   
    db.collection("users").countDocuments({name: user.name}, (err,result) => {
        if(err) throw err;
        if(result)
        {
            res.status(500).send("User already exists!");
            return;
        }

        db.collection("users").insertOne(user);
        res.cookie("userData", user,{maxAge: 700000});
        res.send("User added");
    })
}

function TryDeleteUserFromDb(res, user)
{
    db.collection("users").findOne({name: user.name, password: user.password}, (err, result) => {
        if(err) throw err;
        if(result)
        {
            console.log(result);
            db.collection("users").deleteOne(result);
            db.collection("pokemons").deleteMany({user: result.name});
            res.cookie("userData","",{maxAge:0});
            
            res.send("User deleted");
        }
        else
        {
            res.send("Incorrect credentials!");
        }
    })
}

module.exports = router;