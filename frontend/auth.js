// Supabase 공개(publishable) 키: 브라우저에 노출되어도 되는 키입니다.
const SUPABASE_URL = 'https://lkodieijgaegfnayrapq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tOIs2v-DpK2s85ASnrM9iA_kwLhOHZ4';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginForm = document.querySelector('#login-form');
const passwordForm = document.querySelector('#password-form');
const memberBox = document.querySelector('#member-box');
const message = document.querySelector('#auth-message');
// 메일 링크로 들어온 경우: 비밀번호를 저장할 때까지 설정 화면을 유지합니다.
let settingPassword = false;

function show(view) {
  loginForm.hidden = view !== 'login';
  passwordForm.hidden = view !== 'password';
  memberBox.hidden = view !== 'member';
}

async function showMember(user) {
  if (settingPassword) return;
  const { data } = await db.from('members').select('name').eq('email', user.email).maybeSingle();
  if (settingPassword) return;
  document.querySelector('#member-greeting').textContent = `${data?.name ?? user.email}님, 환영합니다!`;
  show('member');
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '로그인 중...';
  const { error } = await db.auth.signInWithPassword({
    email: document.querySelector('#login-email').value.trim(),
    password: document.querySelector('#login-password').value,
  });
  message.textContent = error ? '이메일 또는 비밀번호가 맞지 않습니다. 처음이라면 비밀번호 설정 메일을 받아주세요.' : '';
});

// 처음 접속: 명부에 등록된 이메일로 비밀번호 설정 링크를 보냅니다.
document.querySelector('#first-visit-button').addEventListener('click', async () => {
  const email = document.querySelector('#login-email').value.trim();
  if (!email) {
    message.textContent = '이메일을 먼저 입력해주세요.';
    return;
  }
  message.textContent = '메일 보내는 중...';
  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: location.origin + location.pathname,
  });
  message.textContent = error
    ? `메일을 보내지 못했습니다: ${error.message}`
    : '회원 명부에 있는 이메일이라면 비밀번호 설정 메일이 발송됩니다. 메일의 링크를 눌러주세요.';
});

passwordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const { data, error } = await db.auth.updateUser({ password: document.querySelector('#new-password').value });
  if (error) {
    message.textContent = `비밀번호를 저장하지 못했습니다: ${error.message}`;
    return;
  }
  settingPassword = false;
  message.textContent = '비밀번호가 설정되었습니다. 다음부터는 이메일과 비밀번호로 로그인하세요.';
  showMember(data.user);
});

document.querySelector('#logout-button').addEventListener('click', () => db.auth.signOut());

db.auth.onAuthStateChange((event, session) => {
  // 메일 링크로 들어오면 비밀번호 설정 화면을 먼저 보여줍니다.
  if (event === 'PASSWORD_RECOVERY') {
    settingPassword = true;
    message.textContent = '사용할 비밀번호를 정해주세요.';
    show('password');
  } else if (event === 'SIGNED_OUT' || !session) {
    show('login');
  } else {
    // 콜백 안에서 다른 Supabase 호출을 바로 기다리면 멈출 수 있어 다음 틱으로 미룹니다.
    setTimeout(() => showMember(session.user), 0);
  }
});
