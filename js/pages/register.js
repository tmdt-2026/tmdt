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

function saveRegisteredUser(payload) {
  const profile = {
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    birthday: ''
  };

  const auth = {
    isAuthenticated: true,
    email: payload.email,
    registeredAt: new Date().toISOString(),
    loggedInAt: new Date().toISOString()
  };

  localStorage.setItem('iluxury_profile', JSON.stringify(profile));
  localStorage.setItem('iluxury_auth', JSON.stringify(auth));
}

function handleRegisterSubmit(event, options = {}) {
  event.preventDefault();

  const fullName = document.getElementById('register-fullname')?.value?.trim() || '';
  const phone = document.getElementById('register-phone')?.value?.trim() || '';
  const email = document.getElementById('register-email')?.value?.trim().toLowerCase() || '';
  const password = document.getElementById('register-password')?.value || '';
  const confirmPassword = document.getElementById('register-confirm-password')?.value || '';
  const accepted = Boolean(document.getElementById('register-accept')?.checked);

  if (!fullName || !phone || !email || !password || !confirmPassword) {
    notify(options, 'Vui lòng nhập đầy đủ thông tin đăng ký.', 'error');
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    notify(options, 'Email chưa đúng định dạng.', 'error');
    return;
  }

  if (!/^0\d{9,10}$/.test(phone)) {
    notify(options, 'Số điện thoại chưa hợp lệ.', 'error');
    return;
  }

  if (password.length < 6) {
    notify(options, 'Mật khẩu phải có ít nhất 6 ký tự.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    notify(options, 'Mật khẩu xác nhận không khớp.', 'error');
    return;
  }

  if (!accepted) {
    notify(options, 'Vui lòng đồng ý điều khoản để tiếp tục.', 'error');
    return;
  }

  saveRegisteredUser({ fullName, phone, email });
  notify(options, 'Tạo tài khoản thành công.', 'success');
  const pendingTarget = consumePendingAuthRoute();
  navigate(options, pendingTarget || { page: '' });
}

export function initRegisterPage(options = {}) {
  const form = document.getElementById('register-form');
  if (!form) {
    return;
  }

  form.addEventListener('submit', (event) => handleRegisterSubmit(event, options));

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.getElementById('register-form')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initRegisterPage();
    });
  } else {
    initRegisterPage();
  }
}
