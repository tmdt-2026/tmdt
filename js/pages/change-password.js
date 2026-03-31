function handleChangePassword(event, options = {}) {
  event.preventDefault();

  const current = document.getElementById('current-password')?.value || '';
  const next = document.getElementById('new-password')?.value || '';
  const confirm = document.getElementById('confirm-password')?.value || '';

  if (!current || !next || !confirm) {
    if (typeof options.notify === 'function') {
      options.notify('Vui lòng nhập đầy đủ thông tin mật khẩu.', 'error');
    } else {
      alert('Vui lòng nhập đầy đủ thông tin mật khẩu.');
    }
    return;
  }

  if (next !== confirm) {
    if (typeof options.notify === 'function') {
      options.notify('Mật khẩu mới và xác nhận mật khẩu chưa khớp.', 'error');
    } else {
      alert('Mật khẩu mới và xác nhận mật khẩu chưa khớp.');
    }
    return;
  }

  if (next.length < 6) {
    if (typeof options.notify === 'function') {
      options.notify('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
    } else {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }
    return;
  }

  if (typeof options.notify === 'function') {
    options.notify('Đã cập nhật mật khẩu thành công.', 'success');
  } else {
    alert('Đã cập nhật mật khẩu thành công.');
  }
  event.target.reset();
}

export function initChangePasswordPage(options = {}) {
  document.getElementById('change-password-form')?.addEventListener('submit', (event) => handleChangePassword(event, options));
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initChangePasswordPage();
  });
}
