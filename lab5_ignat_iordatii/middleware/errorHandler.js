const { ConnectionError, UniqueConstraintError, ValidationError, ForeignKeyConstraintError } = require('sequelize');

// Безопасные сообщения: без паролей, параметров БД, stack trace и текста SQL
const MESSAGES = {
    400: 'Переданы некорректные данные.',
    401: 'Для этого действия необходимо войти в систему.',
    403: 'Недостаточно прав для этого действия.',
    404: 'Страница или запись не найдена.',
    409: 'Конфликт данных: такая запись уже существует.',
    413: 'Слишком большой запрос.',
    500: 'Произошла внутренняя ошибка. Попробуйте позже.',
    503: 'База данных временно недоступна. Попробуйте позже.'
};

// Определяет код ответа и сообщение для пользователя по ошибке
const resolveError = (err) => {
    if (err instanceof ConnectionError) {
        return { code: 503, message: MESSAGES[503] };
    }

    // UniqueConstraintError наследуется от ValidationError, поэтому проверяем его первым
    if (err instanceof UniqueConstraintError) {
        const isUsersTable = err.parent && err.parent.table === 'users';
        return {
            code: 409,
            message: isUsersTable
                ? 'Пользователь с таким email уже зарегистрирован.'
                : MESSAGES[409]
        };
    }

    if (err instanceof ValidationError) {
        return { code: 400, message: MESSAGES[400] };
    }

    if (err instanceof ForeignKeyConstraintError) {
        return { code: 409, message: 'Операция нарушает связи между данными.' };
    }

    // Ошибки с кодом 4xx (например, слишком большое тело запроса)
    const status = err.status || err.statusCode;
    if (Number.isInteger(status) && status >= 400 && status < 500) {
        return { code: status, message: MESSAGES[status] || MESSAGES[400] };
    }

    return { code: 500, message: MESSAGES[500] };
};

// Обработчик ошибок: 4 параметра, подключается ПОСЛЕДНИМ
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Подробности только в консоль сервера, пользователю они не показываются
    console.error(`[${err.name}] ${err.message}`);

    // Если ответ уже начал отправляться, Express сам завершит соединение
    if (res.headersSent) {
        return next(err);
    }

    const { code, message } = resolveError(err);

    res.status(code).render('error', { title: 'Ошибка', code, message }, (renderErr, html) => {
        if (renderErr) {
            // Даже если не получилось отрисовать шаблон, подробности не раскрываем
            return res.type('text/plain').send(`${code}: ${message}`);
        }
        res.send(html);
    });
};

module.exports = errorHandler;
