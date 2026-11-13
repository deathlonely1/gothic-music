import { searchTracks } from './search.js';
import { playTrack, audio } from './player.js';
import { supabase } from './supabase-client.js';

// --- Поиск ---
const searchBtn = document.getElementById('web-search-btn');
const searchInput = document.getElementById('web-search-input');
searchBtn.addEventListener('click', () => searchTracks(searchInput.value));
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchTracks(searchInput.value); });

// --- Слушаем события из других модулей ---
window.addEventListener('play-track', (e) => {
  const { url, title, artist } = e.detail;
  playTrack(url, title, artist);
});

window.addEventListener('add-track-to-db', async (e) => {
  const track = e.detail;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    alert('Войдите, чтобы сохранять музыку в свой плейлист.');
    return;
  }

  const { error } = await supabase.from('user_tracks').insert({
    user_id: user.id,
    track_id: track.id,
    title: track.title,
    artist: track.artist,
    artwork_url: track.artwork,
    duration: track.duration,
    stream_url: track.stream,
  });

  if (error) {
    console.error(error);
    alert('Не удалось сохранить трек.');
  } else {
    // Если плейлист открыт, можно перезагрузить его
    // (в реальном приложении лучше использовать real-time подписку)
  }
});

// --- Инициализация ---
// Можно добавить базовые обработчики для кнопок play/pause, если нужно
console.log('Gothic Music Player готов к работе.');