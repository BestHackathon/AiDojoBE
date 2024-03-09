const Sequelize = require('sequelize');

module.exports = function(sequelize){
    const Professor = sequelize.define('Professor', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        surname: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email:{
            type: Sequelize.STRING,
            allowNull: false
        },
        passwordHash: {
            type: Sequelize.STRING,
            allowNull: false
        },
        courseName: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }
    );
    return Professor;
}