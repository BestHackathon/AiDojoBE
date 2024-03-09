const Sequelize = require('sequelize');

module.exports = function(sequelize){
    const StudentFlashCard = sequelize.define('StudentsFlashCard', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        studentKnewAnswer: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        }
    }
    );
    return StudentFlashCard;
}