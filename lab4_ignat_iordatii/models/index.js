const sequelize = require('../config/database');
const Teacher = require('./Teacher');
const Course = require('./Course');

Teacher.hasMany(Course, {
    foreignKey: 'teacherId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Course.belongsTo(Teacher, {
    foreignKey: 'teacherId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = { sequelize, Teacher, Course };