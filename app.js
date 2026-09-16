const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#nav-principal');
const menuLabel = menuButton.querySelector('.menu-label');

function setMenu(open) {
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? 'Cerrar menú' : 'Abrir menú';
}

menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) {
    setMenu(false);
    menuButton.focus();
  }
});

document.addEventListener('click', event => {
  if (!menu.classList.contains('open')) return;
  if (menu.contains(event.target) || menuButton.contains(event.target)) return;
  setMenu(false);
});

const sections = document.querySelectorAll('main section[id], #inicio');
const links = document.querySelectorAll('.site-header nav a');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    links.forEach(link => {
      const activo = link.hash === `#${entry.target.id}`;
      link.classList.toggle('active', activo);
      // El estado activo era solo visual: sin aria-current no llegaba
      // a quien navega con lector de pantalla.
      if (activo) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  });
}, {rootMargin: '-25% 0px -65% 0px'});
sections.forEach(section => observer.observe(section));
