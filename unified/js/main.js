// StudynCanada.com - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
  
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
  
  // Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // Navbar Scroll Effect
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(this);
      
      // Show success message
      alert('Thank you for your message! We will get back to you within 24 hours.');
      
      // Reset form
      this.reset();
    });
  }
  
  // Animate on Scroll
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.service-card, .university-card, .testimonial-card, .feature');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight - 100) {
        element.classList.add('visible');
      }
    });
  };
  
  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll();
  
  // Counter Animation
  const animateCounters = function() {
    const counters = document.querySelectorAll('.stat .number');
    
    counters.forEach(counter => {
      const target = parseInt(counter.innerText);
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;
      
      const updateCounter = function() {
        current += increment;
        if (current < target) {
          counter.innerText = Math.floor(current) + '+';
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = target + '+';
        }
      };
      
      updateCounter();
    });
  };
  
  // Trigger counter animation when stats are visible
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  });
  
  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    observer.observe(statsSection);
  }
});
