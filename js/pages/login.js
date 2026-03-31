function notify(options, message, type = 'info') {
  if (typeof options?.notify === 'function') {
    options.notify(message, type);
    return;
  }
  alert(message);
}

function navigate(options, target) {
  if (typeof options?.onNavigate === 'function') {
    options.onNavigate(target);
    return;
  }

  const url = new URL('./index.html', window.location.href);
  if (target?.page) {
    url.searchParams.set('page', target.page);
  }
  if (target?.id) {
    url.searchParams.set('id', target.id);
  }
  window.location.href = `${url.pathname}${url.search}`;
}

function consumePendingAuthRoute() {
  try {
    const raw = localStorage.getItem('iluxury_auth_pending_route');
    if (!raw) {
      return null;
    }
    localStorage.removeItem('iluxury_auth_pending_route');
    const parsed = JSON.parse(raw);
    const page = String(parsed?.page || '').trim();
    if (!page) {
      return null;
    }
    return {
      page,
      id: parsed?.id ? String(parsed.id) : ''
    };
  } catch {
    return null;
  }
}

function readProfile() {
  try {
    const raw = localStorage.getItem('iluxury_profile');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAuth(email) {
  const profile = readProfile();
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const auth = {
    isAuthenticated: true,
    email: normalizedEmail,
    loggedInAt: new Date().toISOString()
  };

  if (!profile.fullName) {
    const fallbackName = normalizedEmail.split('@')[0] || 'Khách hàng iLuxury';
    profile.fullName = fallbackName;
  }
  if (!profile.email) {
    profile.email = normalizedEmail;
  }

  localStorage.setItem('iluxury_auth', JSON.stringify(auth));
  localStorage.setItem('iluxury_profile', JSON.stringify(profile));
}

function handleLoginSubmit(event, options = {}) {
  event.preventDefault();

  const email = document.getElementById('login-email')?.value?.trim() || '';
  const password = document.getElementById('login-password')?.value || '';

  if (!email || !password) {
    notify(options, 'Vui lòng nhập email và mật khẩu.', 'error');
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    notify(options, 'Email chưa đúng định dạng.', 'error');
    return;
  }

  if (password.length < 6) {
    notify(options, 'Mật khẩu phải có ít nhất 6 ký tự.', 'error');
    return;
  }

  saveAuth(email);
  notify(options, 'Đăng nhập thành công.', 'success');
  const pendingTarget = consumePendingAuthRoute();
  navigate(options, pendingTarget || { page: '' });
}

export function initLoginPage(options = {}) {
  const form = document.getElementById('login-form');
  if (!form) {
    return;
  }

  form.addEventListener('submit', (event) => handleLoginSubmit(event, options));

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.getElementById('login-form')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLoginPage();
    });
  } else {
    initLoginPage();
  }
}
