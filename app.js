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
    links.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, {rootMargin: '-25% 0px -65% 0px'});
sections.forEach(section => observer.observe(section));
