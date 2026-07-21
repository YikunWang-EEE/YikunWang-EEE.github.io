const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');

navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  navToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  siteNav.classList.toggle('is-open', !open);
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation');
    siteNav.classList.remove('is-open');
  });
});

window.addEventListener('scroll', () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 8);
}, { passive: true });

const navLinks = [...document.querySelectorAll('.site-nav a')];
const sections = navLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle('is-current', link.hash === `#${visible.target.id}`));
}, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.2, 0.5] });
sections.forEach((section) => sectionObserver.observe(section));

const filterButtons = document.querySelectorAll('.filter-button');
const publications = document.querySelectorAll('.publication');
const showMoreButton = document.querySelector('.show-more-button');
const showMoreLabel = showMoreButton?.querySelector('.show-more-label');
let activePublicationFilter = 'all';
let publicationsExpanded = false;

const renderPublications = () => {
  const matchingPublications = [...publications].filter((publication) => {
    const categories = publication.dataset.categories.split(' ');
    return activePublicationFilter === 'all' || categories.includes(activePublicationFilter);
  });

  publications.forEach((publication) => {
    const matchIndex = matchingPublications.indexOf(publication);
    publication.hidden = matchIndex === -1 || (!publicationsExpanded && matchIndex >= 4);
  });

  if (showMoreButton) {
    showMoreButton.hidden = matchingPublications.length <= 4;
    showMoreButton.setAttribute('aria-expanded', String(publicationsExpanded));
    if (showMoreLabel) showMoreLabel.textContent = publicationsExpanded ? 'Show less' : 'Show more';
  }
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('is-active');
    button.setAttribute('aria-pressed', 'true');
    activePublicationFilter = button.dataset.filter;
    publicationsExpanded = false;
    renderPublications();
  });
});

showMoreButton?.addEventListener('click', () => {
  publicationsExpanded = !publicationsExpanded;
  renderPublications();
});

renderPublications();

document.querySelector('#year').textContent = new Date().getFullYear();
