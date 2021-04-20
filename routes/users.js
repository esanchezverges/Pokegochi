
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

    TryInsertUserToDB(res, user);
   
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
        res.cookie("userData", user);
        res.send("User added");
    })
}

module.exports = router;