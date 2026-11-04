(() => {
  'use strict';
  const button = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#main-nav');
  function closeMenu(restoreFocus = false) {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Menü öffnen');
    navigation.classList.remove('is-open');
    if (restoreFocus) button.focus();
  }
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    navigation.classList.toggle('is-open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target) && !button.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  window.matchMedia('(min-width: 701px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
})();
