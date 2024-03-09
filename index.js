const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');
const dbPreparation = require(__dirname + '/config/db_preparation.js')();
const db = require(__dirname + '/config/db.js');
const app = express();

const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

const flashcardRoutes = require('./scripts/flashcardsApi');
const loginRoutes = require('./scripts/login');

app.use('/flashcards', flashcardRoutes);
app.use('/login',loginRoutes);

app.listen(port);

