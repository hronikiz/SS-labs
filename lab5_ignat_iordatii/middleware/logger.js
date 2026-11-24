const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// ===== Файл логов =====
const LOG_DIR = path.join(__dirname, '..', 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });   // папка создаётся сама, если её нет

const accessLogStream = fs.createWriteStream(path.join(LOG_DIR, 'requests.log'), { flags: 'a' });

const pad = (number) => String(number).padStart(2, '0');

// 18.11.2026 14:35  (при withSeconds = true: 18.11.2026 14:35:07)
const formatDate = (date, withSeconds = false) => {
    const day = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return `${day} ${time}${withSeconds ? ':' + pad(date.getSeconds()) : ''}`;
};

// Формат строки для файла: POST /login | 200 | 15 ms | 18.11.2026 14:35
const fileFormat = (tokens, req, res) => {
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const status = tokens.status(req, res) || '-';
    const time = Math.round(Number(tokens['response-time'](req, res)) || 0);

    return `${method} ${url} | ${status} | ${time} ms | ${formatDate(new Date())}`;
};

// Два логгера Morgan: в терминал (формат dev) и в файл logs/requests.log
const requestLogger = [
    morgan('dev'),
    morgan(fileFormat, { stream: accessLogStream })
];

// ===== Журнал действий администратора =====
// ADMIN ACTION | admin@example.com | DELETE COURSE | Course ID: 5 | 18.11.2026 14:35:07
const logAdminAction = (req, action, objectType, objectId) => {
    const email = req.session && req.session.user ? req.session.user.email : 'unknown';

    console.log(
        `ADMIN ACTION | ${email} | ${action} ${objectType.toUpperCase()} | ` +
        `${objectType} ID: ${objectId} | ${formatDate(new Date(), true)}`
    );
};

module.exports = { requestLogger, logAdminAction };
