const Sequelize = require('sequelize');

module.exports = function(sequelize){
    const Student = sequelize.define('Student', {
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
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        passwordHash: {
            type: Sequelize.STRING,
            allowNull: false
        },
    }
    );
    return Student;
}