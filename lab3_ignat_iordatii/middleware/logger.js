const pad = (number) => String(number).padStart(2, '0');

const logger = (req, res, next) => {
    const now = new Date();

    const date =
        `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ` +
        `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    console.log(`${req.method} | ${req.originalUrl} | ${date}`);

    next();
};

module.exports = logger;