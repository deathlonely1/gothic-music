import { supabase } from './supabase-client.js';
import { setPlaylist, getCurrentIndex, playTrackByIndex } from './player.js';

const el = {
  loginBtn: document.getElementById('login-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  userEmail: document.getElementById('user-email'),
  authModal: document.getElementById('auth-modal'),
  closeModal: document.getElementById('close-modal'),
  signInBtn: document.getElementById('sign-in-btn'),
  signUpBtn: document.getElementById('sign-up-btn'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  userPlaylist: document.getElementById('user-playlist'),
  emptyHint: document.getElementById('dropHint'),
};

let currentUser = null;
export function getUser(){ return currentUser; }

export function initAuth(){
  el.loginBtn.addEventListener('click', ()=> el.authModal.classList.add('open'));
  el.closeModal.addEventListener('click', ()=> el.authModal.classList.remove('open'));
  el.authModal.addEventListener('click', (e)=>{ if(e.target===el.authModal) el.authModal.classList.remove('open'); });

  el.signInBtn.addEventListener('click', async ()=>{
    const email = el.email.value.trim();
    const password = el.password.value;
    if(!email||!password){ alert('Введите email и пароль'); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else { el.authModal.classList.remove('open'); el.email.value=''; el.password.value=''; }
  });

  el.signUpBtn.addEventListener('click', async ()=>{
    const email = el.email.value.trim();
    const password = el.password.value;
    if(!email||!password){ alert('Введите email и пароль'); return; }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Проверьте почту для подтверждения, затем войдите.');
  });

  el.logoutBtn.addEventListener('click', async ()=>{ await supabase.auth.signOut(); });

  supabase.auth.onAuthStateChange(async (event, session)=>{
    currentUser = session?.user || null;
    updateAuthUI();
    if (currentUser) await loadAndRenderPlaylist();
    else { setPlaylist([]); renderUserPlaylist([]); }
  });

  window.addEventListener('trackchange', (e)=> highlightTrack(e.detail.index));

  (async ()=>{
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;
    updateAuthUI();
    if (currentUser) await loadAndRenderPlaylist();
    else renderUserPlaylist([]);
  })();
}

function updateAuthUI(){
  if (currentUser){
    el.loginBtn.style.display='none';
    el.logoutBtn.style.display='inline-block';
    el.userEmail.textContent = currentUser.email;
  } else {
    el.loginBtn.style.display='inline-block';
    el.logoutBtn.style.display='none';
    el.userEmail.textContent='';
  }
}

export async function loadAndRenderPlaylist(){
  if (!currentUser) return;
  const { data, error } = await supabase.from('user_tracks').select('*').order('created_at', { ascending: false });
  if (error){ console.error(error); return; }
  setPlaylist(data || []);
  renderUserPlaylist(data || []);
}

export function renderUserPlaylist(tracks){
  el.userPlaylist.innerHTML = '';
  if (!tracks.length){ el.emptyHint.style.display = ''; return; }
  el.emptyHint.style.display = 'none';
  tracks.forEach((t, i)=>{
    const li = document.createElement('li');
    li.className = 'track';
    li.innerHTML = `
      <span class="thumb">${t.artwork_url ? `<img src="${t.artwork_url}" alt="">` : '♪'}</span>
      <span class="info">
        <span class="t-name">${escapeHtml(t.title)}</span>
        <span class="t-artist">${escapeHtml(t.artist || 'Audius')}</span>
      </span>
      <button class="play-btn" title="Играть">▶</button>
    `;
    li.addEventListener('click', (e)=>{
      if (!e.target.closest('button') || e.target.closest('.play-btn')) playTrackByIndex(i);
    });
    el.userPlaylist.appendChild(li);
  });
  highlightTrack(getCurrentIndex());
}

function highlightTrack(index){
  [...el.userPlaylist.children].forEach((li,i)=>{
    li.classList.toggle('active', i===index);
    const btn = li.querySelector('.play-btn');
    if (btn) btn.textContent = i===index ? '❚❚' : '▶';
  });
}

export async function addTrackToDB(t){
  if (!currentUser) return { error: { message: 'Не авторизован' } };
  const { error } = await supabase.from('user_tracks').insert({
    user_id: currentUser.id,
    track_id: String(t.id),
    title: t.title,
    artist: t.artist,
    artwork_url: t.artwork,
    duration: t.duration,
    stream_url: t.stream,
  });
  return { error };
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
