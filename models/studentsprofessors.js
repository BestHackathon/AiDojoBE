const Sequelize = require('sequelize');

module.exports = function(sequelize){
    const StudentProfessor = sequelize.define('StudentsProfessor', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        }
    }
    );
    return StudentProfessor;
}