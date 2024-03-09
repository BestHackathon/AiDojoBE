const db = require('./db.js');
const path = require('path');

async function dbPreparation(){
    await db.sequelize.sync();
    console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
}

module.exports = dbPreparation;