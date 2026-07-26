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

const galleryRoot = document.querySelector('#gallery-collections');
const albumDialog = document.querySelector('.album-dialog');
const albumDialogGroup = albumDialog?.querySelector('#album-dialog-group');
const albumDialogTitle = albumDialog?.querySelector('#album-dialog-title');
const albumDialogMeta = albumDialog?.querySelector('.album-dialog-meta');
const albumPhotoGrid = albumDialog?.querySelector('.album-photo-grid');
const albumDialogClose = albumDialog?.querySelector('.album-dialog-close');

const photoCountLabel = (count) => `${count} ${count === 1 ? 'photo' : 'photos'}`;

const openAlbum = (collection, album) => {
  if (!albumDialog || !albumPhotoGrid) return;

  albumDialogGroup.textContent = collection.title;
  albumDialogTitle.textContent = album.title;
  albumDialogMeta.textContent = `${album.meta} · ${photoCountLabel(album.images.length)}`;
  albumPhotoGrid.replaceChildren();

  album.images.forEach((src, index) => {
    const photo = document.createElement('figure');
    const image = document.createElement('img');
    const caption = document.createElement('figcaption');

    photo.className = 'album-photo';
    image.src = src;
    image.alt = `${album.title}, photo ${index + 1} of ${album.images.length}`;
    image.loading = index < 3 ? 'eager' : 'lazy';
    image.decoding = 'async';
    caption.textContent = `${String(index + 1).padStart(2, '0')} / ${String(album.images.length).padStart(2, '0')}`;
    photo.append(image, caption);
    albumPhotoGrid.append(photo);
  });

  albumDialog.showModal();
  document.body.classList.add('album-open');
};

const renderGallery = () => {
  const collections = Array.isArray(window.galleryCollections) ? window.galleryCollections : [];
  if (!galleryRoot) return;

  collections.forEach((collection) => {
    const group = document.createElement('section');
    const heading = document.createElement('div');
    const headingCopy = document.createElement('div');
    const eyebrow = document.createElement('p');
    const title = document.createElement('h3');
    const count = document.createElement('p');
    const albumGrid = document.createElement('div');
    const photoCount = collection.albums.reduce((total, album) => total + album.images.length, 0);

    group.className = 'gallery-group';
    group.setAttribute('aria-labelledby', `${collection.id}-title`);
    heading.className = 'gallery-group-heading';
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = collection.eyebrow;
    title.id = `${collection.id}-title`;
    title.textContent = collection.title;
    count.className = 'gallery-group-count';
    count.textContent = `${collection.albums.length} albums · ${photoCountLabel(photoCount)}`;
    albumGrid.className = 'album-grid';

    collection.albums.forEach((album) => {
      const card = document.createElement('button');
      const cover = document.createElement('span');
      const coverImage = document.createElement('img');
      const info = document.createElement('span');
      const albumTitle = document.createElement('strong');
      const albumMeta = document.createElement('small');

      card.className = 'album-card';
      card.type = 'button';
      card.setAttribute('aria-haspopup', 'dialog');
      card.setAttribute('aria-label', `Open ${album.title} album, ${photoCountLabel(album.images.length)}`);
      cover.className = 'album-cover';
      coverImage.src = album.cover || album.images[0];
      coverImage.alt = '';
      coverImage.loading = 'lazy';
      coverImage.decoding = 'async';
      info.className = 'album-info';
      albumTitle.textContent = album.title;
      albumMeta.textContent = `${album.meta} · ${photoCountLabel(album.images.length)}`;

      cover.append(coverImage);
      info.append(albumTitle, albumMeta);
      card.append(cover, info);
      card.addEventListener('click', () => openAlbum(collection, album));
      albumGrid.append(card);
    });

    headingCopy.append(eyebrow, title);
    heading.append(headingCopy, count);
    group.append(heading, albumGrid);
    galleryRoot.append(group);
  });
};

renderGallery();

albumDialogClose?.addEventListener('click', () => albumDialog.close());
albumDialog?.addEventListener('click', (event) => {
  if (event.target === albumDialog) albumDialog.close();
});
albumDialog?.addEventListener('close', () => {
  document.body.classList.remove('album-open');
  albumPhotoGrid?.replaceChildren();
});

document.querySelector('#year').textContent = new Date().getFullYear();
