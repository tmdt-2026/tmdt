function normalizePath(pathname) {
  return pathname.replace(/\/$/, "").toLowerCase();
}

function isHomePath(pathname) {
  const normalized = normalizePath(pathname);
  return normalized === "" || normalized === "/index.html";
}

function canReturnWithHistory() {
  if (window.history.length <= 1 || !document.referrer) {
    return false;
  }

  try {
    const referrerUrl = new URL(document.referrer);
    if (referrerUrl.origin !== window.location.origin) {
      return false;
    }
    return isHomePath(referrerUrl.pathname);
  } catch {
    return false;
  }
}

function handleHomeReturnClick(event) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  if (!canReturnWithHistory()) {
    return;
  }

  event.preventDefault();
  window.history.back();
}

function initHomeReturnLinks() {
  const links = document.querySelectorAll("a[data-home-return]");
  if (!links.length) {
    return;
  }

  links.forEach((link) => {
    link.addEventListener("click", handleHomeReturnClick);
  });
}

initHomeReturnLinks();