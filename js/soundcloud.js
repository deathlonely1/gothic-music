// js/soundcloud.js
import SoundCloudAPI from 'https://cdn.jsdelivr.net/npm/@manhgdev/soundcloud-web/+esm';

// 1. Инициализация клиента с авто-получением client_id
const sc = new SoundCloudAPI({ autoFetchClientId: true });

// 2. Создаём скрытый iframe для виджета
let widgetFrame = document.getElementById('sc-widget');
let widget = null;

function ensureWidget() {
    if (widget) return;
    if (!widgetFrame) {
        widgetFrame = document.createElement('iframe');
        widgetFrame.id = 'sc-widget';
        widgetFrame.style.display = 'none'; // Скрываем, чтобы не ломал дизайн
        widgetFrame.allow = 'autoplay';
        document.body.appendChild(widgetFrame);
    }
    widget = SC.Widget(widgetFrame);
}

// 3. Функция поиска треков
export async function searchTracks(query) {
    try {
        const results = await sc.search.tracks(query, { limit: 20 });
        return results; // Возвращаем массив треков
    } catch (error) {
        console.error('SoundCloud search error:', error);
        throw new Error('Не удалось выполнить поиск в SoundCloud.');
    }
}

// 4. Функция для воспроизведения трека по ID
export function playSoundCloudTrack(trackId, onProgress, onEnded) {
    ensureWidget();
    
    // Загружаем трек в виджет
    const trackUrl = `https://api.soundcloud.com/tracks/${trackId}`;
    widget.load(trackUrl, {
        auto_play: true,
        show_artwork: false,
        show_comments: false,
        show_user: false,
        show_playcount: false,
        buying: false,
        sharing: false,
        download: false,
    });

    // Подписываемся на события виджета
    widget.bind(SC.Widget.Events.PLAY_PROGRESS, (data) => {
        // data.currentPosition - текущая позиция в миллисекундах
        if (onProgress) onProgress(data.currentPosition);
    });

    widget.bind(SC.Widget.Events.FINISH, () => {
        if (onEnded) onEnded();
    });

    // Обработка ошибок
    widget.bind(SC.Widget.Events.ERROR, (error) => {
        console.error('Widget error:', error);
    });
}

// 5. Функции управления виджетом (для кнопок play/pause)
export function playWidget() {
    if (widget) widget.play();
}

export function pauseWidget() {
    if (widget) widget.pause();
}

export function toggleWidget() {
    if (widget) widget.toggle();
}

export function seekWidget(milliseconds) {
    if (widget) widget.seekTo(milliseconds);
}

export function setWidgetVolume(volume) {
    // volume от 0 до 100
    if (widget) widget.setVolume(volume);
}