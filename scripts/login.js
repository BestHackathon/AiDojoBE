const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const db = require('../config/db.js')

const app = express();

app.use(bodyParser.json());

app.post('/login', (req, res) => {
    const { email, password, isProfessor } = req.body;
    var table = db.students;
    if (isProfessor) table = db.professors;

    table.findOne({ where: { email: email } }).then(function (user) {
        if (user) {
            bcrypt.compare(password, user.passwordHash, function(err, result) {
                if (err) {
                    res.status(401).json({ error: 'Password does not match' });
                } else if (result) {
                    res.status(200).json({ mess: 'Success' });
                } else {
                    res.status(401).json({ error: 'Cannot log in' });
                }
            });
        } else {
            res.status(401).json({ error: 'Cannot log in' });
        }
    });
});
