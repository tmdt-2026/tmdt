function togglePw(id, icon) {
  const inp = document.getElementById(id);
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.style.color = '#FCA311';
  } else {
    inp.type = 'password';
    icon.style.color = 'rgba(255,255,255,0.35)';
  }
}

function changeQty(btn, delta) {
  const wrap = btn.closest('.qty-ctrl');
  if (!wrap) return;
  const val = wrap.querySelector('.qty-val');
  if (!val) return;
  let n = parseInt(val.textContent) || 0;
  n += delta;
  if (n < 1) n = 1;
  val.textContent = n;
}
