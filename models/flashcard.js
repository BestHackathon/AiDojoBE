const Sequelize = require('sequelize');

module.exports = function(sequelize){
    const FlashCard = sequelize.define('FlashCard', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        question: {
            type: Sequelize.STRING,
            allowNull: false
        },
        answer: {
            type: Sequelize.STRING,
            allowNull: false
        },
        chapterId: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }
    );
    return FlashCard;
}