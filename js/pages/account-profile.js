function loadProfile() {
  let profile = null;
  try {
    const raw = localStorage.getItem('iluxury_profile');
    profile = raw ? JSON.parse(raw) : null;
  } catch (error) {
    profile = null;
  }

  if (!profile) {
    return;
  }

  const fullName = document.getElementById('profile-fullname');
  const phone = document.getElementById('profile-phone');
  const email = document.getElementById('profile-email');
  const birthday = document.getElementById('profile-birthday');

  if (fullName) fullName.value = profile.fullName || '';
  if (phone) phone.value = profile.phone || '';
  if (email) email.value = profile.email || '';
  if (birthday) birthday.value = profile.birthday || '';
}

function saveProfile(event, options = {}) {
  event.preventDefault();

  const profile = {
    fullName: document.getElementById('profile-fullname')?.value?.trim() || '',
    phone: document.getElementById('profile-phone')?.value?.trim() || '',
    email: document.getElementById('profile-email')?.value?.trim() || '',
    birthday: document.getElementById('profile-birthday')?.value || ''
  };

  localStorage.setItem('iluxury_profile', JSON.stringify(profile));
  if (typeof options.notify === 'function') {
    options.notify('Đã lưu thông tin tài khoản.', 'success');
  } else {
    alert('Đã lưu thông tin tài khoản.');
  }
}

export function initAccountProfilePage(options = {}) {
  loadProfile();
  document.getElementById('account-profile-form')?.addEventListener('submit', (event) => saveProfile(event, options));
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAccountProfilePage();
  });
}
