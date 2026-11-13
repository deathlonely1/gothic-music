// js/app.js
import { initPlayerUI, setPlaylist, getPlaylist, playTrackByIndex } from './player.js';
import { initSearch } from './search.js';
import { initAuth, getUser, addTrackToDB, loadAndRenderPlaylist } from './auth.js';

/* Интро */
const INTRO_KEY = 'spm.introShown';
const intro = document.getElementById('intro');
const brand = document.getElementById('brand');
let introTimer = null;
function closeIntro(){
  clearTimeout(introTimer);
  if (intro) intro.classList.add('hidden');
  try { sessionStorage.setItem(INTRO_KEY,'1'); } catch(e){}
}
function scheduleIntroClose(){ clearTimeout(introTimer); introTimer = setTimeout(closeIntro, 3200); }
function replayIntro(){
  if (!intro) return;
  intro.classList.add('replay'); intro.classList.remove('hidden');
  void intro.offsetWidth; intro.classList.remove('replay');
  scheduleIntroClose();
}
if (intro){
  try { if (sessionStorage.getItem(INTRO_KEY)) intro.classList.add('hidden'); else scheduleIntroClose(); }
  catch(e){ scheduleIntroClose(); }
  intro.addEventListener('click', closeIntro);
}
if (brand){
  brand.addEventListener('click', replayIntro);
  brand.addEventListener('keydown', (e)=>{ if(e.code==='Enter'||e.code==='Space'){ e.preventDefault(); replayIntro(); } });
}

initPlayerUI();
initSearch();
initAuth();

window.addEventListener('add-track', async (e)=>{
  const user = getUser();
  if (!user){
    alert('Войдите, чтобы сохранять музыку в свой плейлист.');
    return;
  }
  const { error } = await addTrackToDB(e.detail);
  if (error){ console.error(error); alert('Не удалось сохранить трек: ' + error.message); }
  else { await loadAndRenderPlaylist(); }
});
