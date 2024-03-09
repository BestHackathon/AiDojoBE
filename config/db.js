const Sequelize = require('sequelize');
const path = require('path');

const sequelize = new Sequelize('freedb_best_hackathon','freedb_codebusters','E!GqwBYGukDyZz7', {
    host: 'sql.freedb.tech',
    dialect: 'mysql',
    logging: console.log
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.students = require(path.join(__dirname,'../models/student.js'))(sequelize); 
db.professors = require(path.join(__dirname,'../models/professor.js'))(sequelize); 
db.chapters = require(path.join(__dirname,'../models/chapter.js'))(sequelize); 
db.flashcards = require(path.join(__dirname,'../models/flashcard.js'))(sequelize); 
db.studentsflashcards =  require(path.join(__dirname,'../models/studentsflashcards.js'))(sequelize);

//1 na n veze
db.chapters.hasMany(db.flashcards, {foreignKey: 'chapterId'});
db.flashcards.belongsTo(db.chapters, {foreignKey: 'chapterId', as: 'chapter'});

// n na n veze
db.students.belongsToMany(db.flashcards, { through: db.studentsflashcards});
db.flashcards.belongsToMany(db.students, { through: db.studentsflashcards});

module.exports = db;