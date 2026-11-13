// js/soundcloud.js
const CLIENT_ID = 'ВСТАВЬТЕ_ВАШ_CLIENT_ID_СЮДА'; // 32-символьная строка из Network tab
const API_BASE = 'QhVEWrrJKvW4uSU5u5EoI0FTXYUGzy5k';
const CORS_PROXY = 'https://api.allorigins.win/raw?url='; // публичный прокси для обхода CORS

let widget = null;

function getWidget() {
    if (widget) return widget;
    const iframe = document.getElementById('sc-widget');
    if (!iframe) throw new Error('SoundCloud iframe не найден');
    if (typeof SC === 'undefined') throw new Error('SoundCloud Widget API не загружен');
    widget = SC.Widget(iframe);
    return widget;
}

export async function searchTracks(query) {
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `${API_BASE}/search/tracks?q=${encodedQuery}&client_id=${CLIENT_ID}&limit=20`;
    const proxyUrl = CORS_PROXY + encodeURIComponent(apiUrl);

    const res = await fetch(proxyUrl);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} — возможно, client_id устарел или прокси недоступен`);
    }
    const json = await res.json();
    return json.collection || [];
}

export function playSoundCloudTrack(trackId, onProgress, onEnded) {
    const w = getWidget();
    const trackUrl = `https://api.soundcloud.com/tracks/${trackId}`;

    w.load(trackUrl, {
        auto_play: true,
        show_artwork: false,
        show_comments: false,
        show_user: false,
        show_playcount: false,
        buying: false,
        sharing: false,
        download: false,
    });

    // Убираем старые обработчики, чтобы не дублировались
    w.unbind(SC.Widget.Events.PLAY_PROGRESS);
    w.unbind(SC.Widget.Events.FINISH);

    w.bind(SC.Widget.Events.PLAY_PROGRESS, (data) => {
        if (typeof onProgress === 'function') {
            onProgress(data.currentPosition);
        }
    });

    w.bind(SC.Widget.Events.FINISH, () => {
        if (typeof onEnded === 'function') onEnded();
    });
}

export function playWidget() { getWidget().play(); }
export function pauseWidget() { getWidget().pause(); }
export function toggleWidget() { getWidget().toggle(); }
export function seekWidget(ms) { getWidget().seekTo(ms); }
export function setWidgetVolume(vol) { getWidget().setVolume(vol); } // 0–100
