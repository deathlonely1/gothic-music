// Простой аудио-плеер БЕЗ Web Audio API, чтобы избежать проблем с CORS и звуком
let audio = new Audio();

export function playTrack(url, title, artist) {
  audio.src = url;
  audio.play().catch(e => console.error('Playback failed:', e));
  
  // Обновляем UI (элементы из вашего index.html)
  document.getElementById('title').textContent = title;
  document.getElementById('artist').textContent = artist || 'Audius';
}

// Экспортируем аудио-элемент для управления (play/pause, seek, volume)
export { audio };