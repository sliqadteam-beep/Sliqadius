/* Keep legacy entry points usable while displaying the canonical homepage URL. */
(() => {
  const current = new URL(window.location.href);
  const legacy = /^\/server(?:\/index\.html|\/)?$/.test(current.pathname);
  const homepage = current.pathname === '/' || current.pathname === '/index.html';
  if (!legacy && !homepage) return;

  const target = new URL(current.href);
  target.pathname = '/';
  if (legacy) {
    target.search = '';
    target.hash = '';
  } else {
    target.searchParams.delete('clan');
  }
  const destination = target.pathname + target.search + target.hash;
  if (destination !== current.pathname + current.search + current.hash) {
    // No navigation: a cached old root document cannot start another redirect.
    window.history.replaceState(window.history.state, '', destination);
  }
})();
