const audio = new Audio();
audio.preload = 'metadata';

let playlist = [];
let currentIndex = -1;
let shuffle = false;
let repeat = 0;

const el = {
  title: document.getElementById('title'),
  artist: document.getElementById('artist'),
  cover: document.getElementById('cover'),
  coverEmpty: document.getElementById('coverEmpty'),
  bgCover: document.getElementById('bgCover'),
  playBtn: document.getElementById('playBtn'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  shuffleBtn: document.getElementById('shuffleBtn'),
  repeatBtn: document.getElementById('repeatBtn'),
  muteBtn: document.getElementById('muteBtn'),
  volume: document.getElementById('volume'),
  seek: document.getElementById('seek'),
  cur: document.getElementById('cur'),
  dur: document.getElementById('dur'),
};

const ICON_PLAY  = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" stroke="none"/></svg>';
const ICON_REPEAT = '<svg viewBox="0 0 24 24"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>';
const ICON_REPEAT_ONE = '<svg viewBox="0 0 24 24"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/></svg>';
const ICON_VOL = '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const ICON_MUTE = '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m16 9 5 6"/><path d="m21 9-5 6"/></svg>';

function fmt(s){ if(!isFinite(s)||s<0)s=0; const m=Math.floor(s/60),sec=Math.floor(s%60); return m+':'+String(sec).padStart(2,'0') }

function updateNowPlaying(){
  const t = playlist[currentIndex];
  if (!t){
    el.title.textContent = 'Ничего не играет';
    el.artist.textContent = 'Найди трек и нажми +';
    el.cover.hidden = true; el.cover.removeAttribute('src'); el.coverEmpty.style.display='';
    el.bgCover.style.backgroundImage='none';
    document.title='Gothic Music';
    return;
  }
  el.title.textContent = t.title || 'Без названия';
  el.artist.textContent = t.artist || 'Audius';
  if (t.artwork_url){
    el.cover.src = t.artwork_url; el.cover.hidden=false; el.coverEmpty.style.display='none';
    el.bgCover.style.backgroundImage = 'url("'+t.artwork_url+'")';
  } else {
    el.cover.hidden=true; el.cover.removeAttribute('src'); el.coverEmpty.style.display='';
    el.bgCover.style.backgroundImage='none';
  }
  document.title = (t.title||'Gothic Music')+' — Gothic Music';
}

function setPlayingUI(playing){
  el.playBtn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
  document.body.classList.toggle('is-playing', playing);
}

function updateProgress(){
  const d = audio.duration||0, c = audio.currentTime||0, p = d?(c/d)*100:0;
  el.seek.value = p; el.seek.style.setProperty('--p', p+'%');
  el.cur.textContent = fmt(c);
  el.dur.textContent = (d&&isFinite(d))?fmt(d):'0:00';
}

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', updateProgress);
audio.addEventListener('durationchange', updateProgress);
audio.addEventListener('play', ()=>setPlayingUI(true));
audio.addEventListener('pause', ()=>setPlayingUI(false));
audio.addEventListener('ended', onEnded);

function onEnded(){
  if (repeat === 2){ audio.currentTime=0; audio.play().catch(()=>{}); return; }
  nextTrack(true);
}

export function setPlaylist(tracks){
  const currentTrackId = playlist[currentIndex]?.track_id;
  playlist = Array.isArray(tracks)?tracks:[];
  if (currentTrackId){
    const idx = playlist.findIndex(t => String(t.track_id) === String(currentTrackId));
    currentIndex = idx >= 0 ? idx : -1;
  } else {
    currentIndex = -1;
  }
}
export function getPlaylist(){ return playlist; }
export function getCurrentIndex(){ return currentIndex; }
export function getAudio(){ return audio; }

export function playTrackByIndex(i){
  if (i < 0 || i >= playlist.length) return;
  currentIndex = i;
  audio.src = playlist[i].stream_url;
  audio.play().catch(e=>console.error('Play error:',e));
  updateNowPlaying();
  window.dispatchEvent(new CustomEvent('trackchange',{detail:{index:i}}));
}
export function togglePlay(){
  if (!playlist.length) return;
  if (currentIndex < 0){ playTrackByIndex(0); return; }
  if (audio.paused) audio.play().catch(()=>{}); else audio.pause();
}
export function nextTrack(auto){
  if (!playlist.length) return;
  let i;
  if (shuffle && playlist.length>1){ do{ i=Math.floor(Math.random()*playlist.length);}while(i===currentIndex); }
  else { i = currentIndex+1; if (i>=playlist.length){ if (auto && repeat===0){ audio.pause(); audio.currentTime=0; return; } i=0; } }
  playTrackByIndex(i);
}
export function prevTrack(){
  if (!playlist.length) return;
  if (audio.currentTime>3){ audio.currentTime=0; return; }
  let i = currentIndex-1; if (i<0) i = playlist.length-1;
  playTrackByIndex(i);
}
export function setVolume(v){
  v = Math.min(1,Math.max(0,v));
  audio.volume = v; if (v>0) audio.muted=false;
  el.volume.value = v; el.volume.style.setProperty('--p',(v*100)+'%');
  updateMuteIcon();
}
function updateMuteIcon(){ el.muteBtn.innerHTML = (audio.muted||audio.volume===0)?ICON_MUTE:ICON_VOL; }
export function toggleShuffle(){ shuffle = !shuffle; el.shuffleBtn.classList.toggle('active', shuffle); }
export function cycleRepeat(){
  repeat = (repeat+1)%3;
  el.repeatBtn.innerHTML = repeat===2?ICON_REPEAT_ONE:ICON_REPEAT;
  el.repeatBtn.classList.toggle('active', repeat!==0);
}

export function initPlayerUI(){
  el.playBtn.innerHTML = ICON_PLAY;
  el.repeatBtn.innerHTML = ICON_REPEAT;
  setVolume(0.8);

  el.playBtn.addEventListener('click', togglePlay);
  el.nextBtn.addEventListener('click', ()=>nextTrack(false));
  el.prevBtn.addEventListener('click', prevTrack);
  el.shuffleBtn.addEventListener('click', toggleShuffle);
  el.repeatBtn.addEventListener('click', cycleRepeat);
  el.muteBtn.addEventListener('click', ()=>{ audio.muted=!audio.muted; updateMuteIcon(); });
  el.seek.addEventListener('input', ()=>{ if(audio.duration) audio.currentTime=(el.seek.value/100)*audio.duration; });
  el.volume.addEventListener('input', ()=>setVolume(parseFloat(el.volume.value)));

  document.addEventListener('keydown',(e)=>{
    const tag=(e.target.tagName||'').toLowerCase();
    if(tag==='input'||tag==='textarea') return;
    switch(e.code){
      case 'Space': e.preventDefault(); togglePlay(); break;
      case 'ArrowLeft': e.preventDefault(); audio.currentTime=Math.max(0,audio.currentTime-5); break;
      case 'ArrowRight': e.preventDefault(); audio.currentTime=Math.min(audio.duration||0,audio.currentTime+5); break;
      case 'ArrowUp': e.preventDefault(); setVolume(audio.volume+0.05); break;
      case 'ArrowDown': e.preventDefault(); setVolume(audio.volume-0.05); break;
      case 'KeyM': audio.muted=!audio.muted; updateMuteIcon(); break;
      case 'KeyS': toggleShuffle(); break;
      case 'KeyR': cycleRepeat(); break;
    }
  });

  updateNowPlaying();
  updateProgress();
}
