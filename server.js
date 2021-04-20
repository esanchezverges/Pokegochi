if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}


const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const pokedexRouter = require('./routes/pokedex');
const userRouter = require('./routes/users');

app.set('view engine', 'ejs');
app.set('views',__dirname+'/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/pokedex', pokedexRouter);
app.use('/user', userRouter);

app.listen(process.env.PORT || 3000);
