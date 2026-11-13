import { supabase } from './supabase-client.js';

// Элементы интерфейса
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userEmail = document.getElementById('user-email');
const authModal = document.getElementById('auth-modal');
const closeModal = document.getElementById('close-modal');
const signInBtn = document.getElementById('sign-in-btn');
const signUpBtn = document.getElementById('sign-up-btn');

// Показать/скрыть модальное окно
loginBtn.addEventListener('click', () => authModal.style.display = 'flex');
closeModal.addEventListener('click', () => authModal.style.display = 'none');

// Вход
signInBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message); else window.location.reload();
});

// Регистрация
signUpBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message); else alert('Проверьте почту для подтверждения!');
});

// Выход
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.reload();
});

// Отслеживание состояния пользователя
supabase.auth.onAuthStateChange((event, session) => {
  const user = session?.user;
  if (user) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    userEmail.textContent = user.email;
    // Загружаем плейлист пользователя
    loadUserPlaylist(user.id);
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    userEmail.textContent = '';
    // Очищаем плейлист
    document.getElementById('user-playlist').innerHTML = '';
  }
});

async function loadUserPlaylist(userId) {
  const { data, error } = await supabase
    .from('user_tracks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }

  const playlistEl = document.getElementById('user-playlist');
  playlistEl.innerHTML = '';
  data.forEach(track => {
    const li = document.createElement('li');
    li.className = 'track';
    li.innerHTML = `
      <span class="thumb"><img src="${track.artwork_url || ''}" alt=""></span>
      <span class="info">
        <span class="t-name">${track.title}</span>
        <span class="t-artist">${track.artist || 'Audius'}</span>
      </span>
      <button class="play-user-track" data-stream="${track.stream_url}" data-title="${track.title}" data-artist="${track.artist}">▶</button>
    `;
    playlistEl.appendChild(li);
  });

  // Добавляем обработчики на кнопки воспроизведения
  document.querySelectorAll('.play-user-track').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const streamUrl = e.target.dataset.stream;
      const title = e.target.dataset.title;
      const artist = e.target.dataset.artist;
      window.dispatchEvent(new CustomEvent('play-track', {
        detail: { url: streamUrl, title, artist }
      }));
    });
  });
}