(function () {
  // ---------- Scroll-reveal (IntersectionObserver) ----------
  // Progressive enhancement: sections are visible by default (see CSS),
  // JS only adds the reveal animation for browsers that support it.
  const revealEls = document.querySelectorAll('.reveal, .reveal-item');

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger timeline items slightly so they cascade in rather
            // than all popping at once.
            const delay = entry.target.classList.contains('reveal-item') ? i * 60 : 0;
            setTimeout(() => entry.target.classList.add('is-visible'), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Parallax on hero gears (mouse-based) ----------
  const heroFigure = document.querySelector('.hero__figure');
  if (heroFigure) {
    const gears = heroFigure.querySelectorAll('.gear');
    heroFigure.addEventListener('mousemove', (e) => {
      const rect = heroFigure.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gears.forEach((gear, i) => {
        const depth = (i + 1) * 4;
        gear.style.transform = `translate(${px * depth}px, ${py * depth}px)`;
      });
    });
    heroFigure.addEventListener('mouseleave', () => {
      gears.forEach((gear) => { gear.style.transform = ''; });
    });
  }

  // ---------- Subtle scroll parallax on the hero background ----------
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY;
      if (offset < window.innerHeight) {
        hero.style.backgroundPositionY = `${offset * 0.3}px`;
      }
    }, { passive: true });
  }

  // ---------- Did You Know flip cards ----------
  document.querySelectorAll('.fact-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  });
})();
