self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'Нет данных',
        icon: 'icon.png', // Путь к иконке уведомления
        badge: 'badge.png' // Путь к значку уведомления
    };

    event.waitUntil(
        self.registration.showNotification('Заголовок уведомления', options)
    );
});