
const express = require("express");
const router = express.Router();
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
   
    db.collection("users").findOne({name: user.name}, (err,result) => {
        if(err) throw err;
        if(result)
        {
            if(result.password != user.password)
                res.status(500).send("Incorrect credentials for user!");
            else
            {
                res.cookie("userData", user);
                res.status(200).send("User logged in");
            }
                return;
        }

        db.collection("users").insertOne(user);
        res.cookie("userData", user);
        res.status(200).send("User added");
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