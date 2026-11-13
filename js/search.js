// js/search.js
import { searchTracks } from './soundcloud.js';

const el = {
  input: document.getElementById('web-search-input'),
  btn: document.getElementById('web-search-btn'),
  results: document.getElementById('web-results'),
};

export function initSearch(){
  el.btn.addEventListener('click', ()=> doSearch(el.input.value));
  el.input.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearch(el.input.value); });
}

async function doSearch(q){
  q = q.trim();
  if (!q) return;
  el.results.innerHTML = '<div class="web-status">Поиск…</div>';
  el.btn.disabled = true;

  try {
    const tracks = await searchTracks(q);
    if (!tracks || tracks.length === 0){
      el.results.innerHTML = '<div class="web-status">Ничего не найдено.</div>';
      return;
    }

    el.results.innerHTML = '';
    tracks.forEach(t => {
      const artwork = t.artwork_url ? t.artwork_url.replace('large', 't500x500') : null;
      const trackId = t.id;

      const row = document.createElement('div');
      row.className = 'web-track';
      row.innerHTML = `
        <span class="web-thumb">${artwork ? `<img src="${artwork}" alt="" loading="lazy">` : '♪'}</span>
        <span class="web-info">
          <span class="web-title">${escapeHtml(t.title)}</span>
          <span class="web-artist">${escapeHtml(t.user?.username || 'SoundCloud')}</span>
        </span>
        <button class="web-add" type="button">+</button>
      `;
      row.querySelector('.web-add').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        window.dispatchEvent(new CustomEvent('add-track', {
          detail: {
            id: trackId,
            title: t.title,
            artist: t.user?.username || 'SoundCloud',
            artwork: artwork,
            duration: t.duration,
            stream: `soundcloud:${trackId}`
          }
        }));
        btn.textContent = '✓';
        btn.disabled = true;
      });
      el.results.appendChild(row);
    });

  } catch (err) {
    console.error('Search failed:', err);
    el.results.innerHTML = `<div class="web-status">Ошибка поиска: ${escapeHtml(err.message)}</div>`;
  } finally {
    el.btn.disabled = false;
  }
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
