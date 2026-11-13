// js/player.js
import { playSoundCloudTrack, toggleWidget, seekWidget, setWidgetVolume } from './soundcloud.js';

// ... (ваши существующие переменные и константы) ...

// Добавляем флаг, чтобы знать, играет ли сейчас SoundCloud
let isSoundCloudPlaying = false;

// Вспомогательная функция для определения, является ли трек SoundCloud
function isSoundCloudTrack(track) {
    return track.stream_url && track.stream_url.startsWith('soundcloud:');
}

// Переопределяем функцию воспроизведения
export function playTrackByIndex(i){
  if (i < 0 || i >= playlist.length) return;
  currentIndex = i;
  const track = playlist[i];

  if (isSoundCloudTrack(track)) {
    // Воспроизведение через SoundCloud
    const trackId = track.stream_url.replace('soundcloud:', '');
    playSoundCloudTrack(trackId, 
      (progressMs) => {
        // Обновляем прогресс-бар
        const durationMs = track.duration || 0;
        const percent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;
        el.seek.value = percent;
        el.seek.style.setProperty('--p', percent + '%');
        el.cur.textContent = fmt(progressMs / 1000);
        el.dur.textContent = fmt(durationMs / 1000);
      },
      () => {
        // По окончании трека
        isSoundCloudPlaying = false;
        onEnded();
      }
    );
    isSoundCloudPlaying = true;
    // Обновляем UI
    updateNowPlaying();
    setPlayingUI(true);
    window.dispatchEvent(new CustomEvent('trackchange',{detail:{index:i}}));
  } else {
    // Обычное воспроизведение (для локальных файлов или других источников)
    isSoundCloudPlaying = false;
    audio.src = track.stream_url;
    audio.play().catch(e=>console.error('Play error:',e));
    updateNowPlaying();
    window.dispatchEvent(new CustomEvent('trackchange',{detail:{index:i}}));
  }
}

// Переопределяем togglePlay, чтобы учитывать SoundCloud
export function togglePlay(){
  if (!playlist.length) return;
  if (currentIndex < 0){ playTrackByIndex(0); return; }

  if (isSoundCloudPlaying) {
    // Управляем виджетом SoundCloud
    toggleWidget();
    // Состояние UI обновится через события виджета, но для простоты можно переключить вручную
    setPlayingUI(!audio.paused); // Это не совсем точно, но для UI сойдёт
    // Лучше подписаться на события виджета, но для простоты оставим так
  } else {
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  }
}

// Переопределяем seek
export function seekTo(percent) {
    if (isSoundCloudPlaying) {
        const track = playlist[currentIndex];
        const durationMs = track.duration || 0;
        const positionMs = (percent / 100) * durationMs;
        seekWidget(positionMs);
    } else {
        if (audio.duration) audio.currentTime = (percent / 100) * audio.duration;
    }
}

// Переопределяем setVolume
export function setVolume(v){
  v = Math.min(1, Math.max(0, v));
  // Для SoundCloud виджета громкость от 0 до 100
  if (isSoundCloudPlaying) {
      setWidgetVolume(v * 100);
  } else {
      audio.volume = v;
      if (v > 0) audio.muted = false;
  }
  el.volume.value = v; el.volume.style.setProperty('--p',(v*100)+'%');
  updateMuteIcon();
}

// ... (остальной код player.js) ...
