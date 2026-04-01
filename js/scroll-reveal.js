/* Scroll Reveal Observer */
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Auto-add reveal to common sections
  document.querySelectorAll('.card, .section, .grid > *, .stat, .feature, .step, .pricing-card, .testimonial').forEach((el, i) => {
    if (!el.classList.contains('animate-fade-up') && !el.classList.contains('reveal')) {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 6) * 0.1}s`;
      observer.observe(el);
    }
  });
});
