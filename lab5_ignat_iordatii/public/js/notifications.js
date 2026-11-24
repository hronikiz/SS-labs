// Клиентская часть Socket.IO: получает события сервера и показывает уведомления
(function () {
    // Если скрипт socket.io не загрузился, страница продолжает работать без уведомлений
    if (typeof io === 'undefined') {
        return;
    }

    const list = document.getElementById('notifications-list');
    const empty = document.getElementById('notifications-empty');
    if (!list || !empty) {
        return;
    }

    const HIDE_AFTER_MS = 10000;   // уведомление исчезает через 10 секунд

    const socket = io();

    const refreshEmptyMessage = () => {
        empty.hidden = list.children.length > 0;
    };

    const removeNotification = (item) => {
        item.remove();
        refreshEmptyMessage();
    };

    // Создаём элемент через textContent: данные пользователя не интерпретируются как HTML
    const createLine = (tag, text, className) => {
        const element = document.createElement(tag);
        element.textContent = text;
        if (className) {
            element.className = className;
        }
        return element;
    };

    socket.on('courseCreated', (data) => {
        const item = document.createElement('div');
        item.className = 'notification';

        const time = new Date(data.createdAt).toLocaleTimeString('ru-RU');

        const closeButton = createLine('button', '×', 'notification-close');
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Закрыть уведомление');
        closeButton.addEventListener('click', () => removeNotification(item));

        item.appendChild(closeButton);
        item.appendChild(createLine('strong', `Добавлен новый курс: ${data.title}`));
        item.appendChild(createLine('div', `Преподаватель: ${data.teacherName}`));
        item.appendChild(createLine('small', `Время: ${time}`, 'notification-time'));

        list.prepend(item);
        refreshEmptyMessage();

        setTimeout(() => removeNotification(item), HIDE_AFTER_MS);
    });
})();
