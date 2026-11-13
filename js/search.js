const AUDIUS_NODE = 'https://discoveryprovider.audius.co/v1';
const APP_NAME = 'GothicMusicPlayer';

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
    const res = await fetch(`${AUDIUS_NODE}/tracks/search?query=${encodeURIComponent(q)}&app_name=${APP_NAME}&limit=20`);
    if (!res.ok) throw new Error('HTTP '+res.status);
    const json = await res.json();
    const tracks = (json.data||[]).filter(t=>t.is_streamable !== false);
    if (!tracks.length){ el.results.innerHTML='<div class="web-status">Ничего не найдено.</div>'; return; }
    el.results.innerHTML='';
    tracks.forEach(t=>{
      const artwork = t.artwork ? (t.artwork['150x150']||t.artwork['480x480']) : null;
      const stream = `${AUDIUS_NODE}/tracks/${t.id}/stream?app_name=${APP_NAME}`;
      const row = document.createElement('div');
      row.className='web-track';
      row.innerHTML = `
        <span class="web-thumb">${artwork?`<img src="${artwork}" alt="" loading="lazy">`:'♪'}</span>
        <span class="web-info">
          <span class="web-title">${escapeHtml(t.title)}</span>
          <span class="web-artist">${escapeHtml(t.user?.name||'Audius')}</span>
        </span>
        <button class="web-add" type="button">+</button>
      `;
      row.querySelector('.web-add').addEventListener('click', (e)=>{
        const btn = e.currentTarget;
        window.dispatchEvent(new CustomEvent('add-track', { detail: {
          id: t.id, title: t.title, artist: t.user?.name||'Audius',
          artwork: artwork, duration: t.duration, stream
        }}));
        btn.textContent='✓'; btn.disabled=true;
      });
      el.results.appendChild(row);
    });
  } catch(err){
    console.error(err);
    el.results.innerHTML='<div class="web-status">Ошибка поиска. Проверьте соединение.</div>';
  } finally {
    el.btn.disabled = false;
  }
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
