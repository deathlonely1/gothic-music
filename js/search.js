const AUDIUS_NODE = 'https://discoveryprovider.audius.co/v1';
const APP_NAME = 'GothicMusicPlayer';

export async function searchTracks(query) {
  const resultsContainer = document.getElementById('web-results');
  if (!query) return;
  resultsContainer.innerHTML = '<div class="status">Поиск...</div>';

  try {
    const res = await fetch(`${AUDIUS_NODE}/tracks/search?query=${encodeURIComponent(query)}&app_name=${APP_NAME}&limit=15`);
    const json = await res.json();
    const tracks = (json.data || []).filter(t => t.is_streamable);
    
    if (tracks.length === 0) {
      resultsContainer.innerHTML = '<div class="status">Ничего не найдено.</div>';
      return;
    }

    resultsContainer.innerHTML = '';
    tracks.forEach(track => {
      const row = document.createElement('div');
      row.className = 'web-track';
      const artwork = track.artwork ? (track.artwork['150x150'] || track.artwork['480x480']) : null;
      const streamUrl = `${AUDIUS_NODE}/tracks/${track.id}/stream?app_name=${APP_NAME}`;
      
      row.innerHTML = `
        <span class="web-thumb">${artwork ? `<img src="${artwork}" alt="">` : '♪'}</span>
        <span class="web-info">
          <span class="web-title">${track.title}</span>
          <span class="web-artist">${track.user?.name || 'Audius'}</span>
        </span>
        <button class="add-btn" data-id="${track.id}" data-title="${track.title}" data-artist="${track.user?.name}" data-artwork="${artwork}" data-duration="${track.duration}" data-stream="${streamUrl}">+</button>
      `;
      resultsContainer.appendChild(row);
    });

    // Обработчик добавления в плейлист
    resultsContainer.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const trackData = e.target.dataset;
        window.dispatchEvent(new CustomEvent('add-track-to-db', { detail: trackData }));
        e.target.textContent = '✓';
        e.target.disabled = true;
      });
    });

  } catch (err) {
    console.error('Audius search failed:', err);
    resultsContainer.innerHTML = '<div class="status">Ошибка поиска. Проверьте соединение.</div>';
  }
}