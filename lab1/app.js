// Лабораторная работа №1 — простой HTTP-сервер на Node.js
// Запуск: node app.js  →  http://localhost:3000

const http = require('http');

const PORT = 3000;

const student = {
    name: 'Iordatii',
    surname: 'Ignatie',
    group: 'IA2403',
    speciality: 'Applied Informatics'
};

const courses = [
    { title: 'Inteligența Artificială', teacher: 'Преподаватель 1', credits: 5 },
    { title: 'Cloud Computing', teacher: 'Преподаватель 2', credits: 4 },
    { title: 'Spring Framework', teacher: 'Преподаватель 3', credits: 5 }
];

function pad(n) {
    return String(n).padStart(2, '0');
}

function formatDate(date) {
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function sendText(res, statusCode, text) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(text);
}

function sendJson(res, statusCode, data) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {

    console.log(`${req.method} ${req.url} | ${formatDate(new Date())}`);

    const path = req.url.split('?')[0];

    if (req.method === 'GET' && path === '/') {
        sendText(res, 200, 'Привет! Это мой первый HTTP-сервер на Node.js.');
    }
    else if (req.method === 'GET' && path === '/about') {
        sendText(res, 200, 'Лабораторная работа №1: простой HTTP-сервер на Node.js (модуль http).');
    }
    else if (req.method === 'GET' && path === '/student') {
        sendText(res, 200, `${student.name} ${student.surname}, группа ${student.group}`);
    }
    else if (req.method === 'GET' && path === '/api/student') {
        sendJson(res, 200, student);
    }
    else if (req.method === 'GET' && path === '/time') {
        sendText(res, 200, `Текущая дата и время: ${formatDate(new Date())}`);
    }
    else if (req.method === 'GET' && path === '/api/courses') {
        sendJson(res, 200, courses);
    }
    else if (req.method === 'GET' && path === '/random') {
        const number = Math.floor(Math.random() * 100) + 1;
        sendText(res, 200, `Ваше случайное число: ${number}`);
    }
    else {
        sendText(res, 404, '404 - Page not found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
