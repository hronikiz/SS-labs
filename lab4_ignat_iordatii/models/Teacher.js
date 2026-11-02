const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    academicDegree: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    }
});

module.exports = Teacher;