const Sequelize = require('sequelize');

module.exports = function(sequelize){
    const Chapter = sequelize.define('Chapter', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        courseName: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }
    );
    return Chapter;
}