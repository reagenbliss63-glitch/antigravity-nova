/* ============================================================
   Nova SaaS — Main JavaScript
   GSAP Animations, Custom Cursor, Canvas Particles, etc.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // Detect mobile/touch devices
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || ('ontouchstart' in window);
  const isMobile = window.innerWidth <= 768;

  // Mark body so CSS knows GSAP is available to hide elements for animation
  // On mobile, skip GSAP-hidden states to prevent black screen
  if (!isMobile) {
    document.body.classList.add('gsap-ready');
  }

  /* ---------- Preloader ---------- */
  const preloader = document.querySelector('.preloader');
  let preloaderRemoved = false;
  
  function removePreloader() {
    if (preloaderRemoved) return;
    preloaderRemoved = true;
    if (preloader) {
      preloader.classList.add('hidden');
      // Remove from DOM after transition to free up resources
      setTimeout(() => { if (preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 600);
    }
    if (!isMobile) initHeroAnimations();
  }

  // Dismiss preloader fast — 300ms on mobile, 600ms on desktop
  setTimeout(removePreloader, isMobile ? 100 : 600);
  window.addEventListener('load', removePreloader);

  /* ---------- Custom Cursor (desktop only) ---------- */
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');

  if (!isTouchDevice && !isMobile && cursor && follower) {
    document.body.classList.add('custom-cursor');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let cursorRAF;

    // Follow mouse
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    }, { passive: true });

    // Throttled spring physics for follower ring
    const renderFollower = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
      if (!document.hidden) cursorRAF = requestAnimationFrame(renderFollower);
    };
    renderFollower();

    // Pause cursor loop when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(cursorRAF);
      } else {
        renderFollower();
      }
    });

    // Hover effects — use event delegation instead of per-element listeners
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('[data-cursor="hover"]')) {
        cursor.classList.add('hover-active');
        follower.classList.add('hover-active');
      }
    }, { passive: true });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('[data-cursor="hover"]')) {
        cursor.classList.remove('hover-active');
        follower.classList.remove('hover-active');
      }
    }, { passive: true });
  }

  /* ---------- Scroll Progress Bar + Navbar (combined, throttled) ---------- */
  const scrollProgress = document.getElementById('scroll-progress');
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollProgress) scrollProgress.style.width = (scrollPx / winHeightPx) * 100 + '%';
      if (navbar) {
        if (scrollPx > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
      }
      if (backToTop) {
        if (scrollPx > 500) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
      }
      scrollTicking = false;
    });
  }, { passive: true });



  /* ---------- Mobile Menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ---------- Hero Animations (Triggered after loader) ---------- */
  function initHeroAnimations() {
    const tl = gsap.timeline();
    
    // Split text animation manually
    const h1 = document.querySelector('.split-text');
    if (h1) {
      // Very basic split text fallback if GSAP SplitText isn't available
      const html = h1.innerHTML;
      // We rely on standard fade in for the whole block for simplicity
      tl.fromTo(h1, {y: 50, opacity: 0}, {y: 0, opacity: 1, duration: 1, ease: "power3.out"});
    }

    tl.fromTo(".reveal-item", 
      {y: 30, opacity: 0}, 
      {y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out"},
      "-=0.5"
    );
    
    tl.fromTo(".hero-mockup",
      {y: 100, opacity: 0, rotateX: 20},
      {y: 0, opacity: 1, rotateX: 5, duration: 1.5, ease: "power4.out"},
      "-=1"
    );
  }

  /* ---------- Canvas Particles — REMOVED for performance ---------- */
  // Particle canvas is hidden via CSS. No JS animation loop needed.

  /* ---------- GSAP Scroll Animations (desktop only) ---------- */
  if (!isMobile) {

  // Standard Reveals
  gsap.utils.toArray('.g-reveal').forEach(element => {
    gsap.fromTo(element, 
      { y: 40, opacity: 0 },
      { 
        y: 0, opacity: 1, 
        duration: 0.8, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // Staggered Grids (Features, Stats, Pricing)
  ['.features-grid', '.stats-grid', '.pricing-grid'].forEach(selector => {
    const grid = document.querySelector(selector);
    if (grid) {
      const items = grid.querySelectorAll('.g-stagger');
      gsap.fromTo(items,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }
  });

  // Horizontal Scroll Showcase (desktop only, already hidden on mobile via CSS)
  const hSection = document.querySelector('.h-scroll-section');
  const hContainer = document.querySelector('.h-scroll-container');
  if (hSection && hContainer && window.innerWidth > 768) {
    gsap.to(hContainer, {
      x: () => -(hContainer.scrollWidth - window.innerWidth) + "px",
      ease: "none",
      scrollTrigger: {
        trigger: hSection,
        pin: true,
        scrub: 1,
        start: "top top",
        end: () => "+=" + hContainer.scrollWidth
      }
    });
  }

  } // end !isMobile

  // Stats Counters & Rings
  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    ScrollTrigger.create({
      trigger: statsSection,
      start: "top 75%",
      onEnter: () => {
        // Animate Rings
        document.querySelectorAll('.progress-ring__circle').forEach(ring => {
          ring.style.strokeDashoffset = 0;
        });

        // Animate Numbers
        document.querySelectorAll('.count-up').forEach(el => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          
          gsap.to(el, {
            innerHTML: target,
            duration: 2,
            snap: { innerHTML: 1 },
            onUpdate: function() {
              el.innerHTML = Math.round(this.targets()[0].innerHTML).toLocaleString() + suffix;
            }
          });
        });
      },
      once: true
    });
  }

  // How It Works Timeline Connector
  const timelineSection = document.querySelector('.how-it-works');
  if (timelineSection) {
    const progress = document.querySelector('.timeline-progress');
    const nodes = document.querySelectorAll('.step-card');
    
    gsap.to(progress, {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: ".steps-timeline",
        start: "top center",
        end: "bottom center",
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          nodes.forEach((node, i) => {
            if (p > (i / (nodes.length - 1)) - 0.1) {
              node.classList.add('active');
            } else {
              node.classList.remove('active');
            }
          });
        }
      }
    });
  }

  /* ---------- Feature Cards Glow Follow (desktop only) ---------- */
  if (!isTouchDevice && !isMobile) {
    document.querySelectorAll('.feature-card').forEach(card => {
      const glow = card.querySelector('.glow-blob');
      if (glow) {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          glow.style.left = `${e.clientX - rect.left}px`;
          glow.style.top = `${e.clientY - rect.top}px`;
        }, { passive: true });
      }
    });
  }

  /* ---------- Pricing Toggle ---------- */
  const toggleInput = document.getElementById('pricing-checkbox');
  const labelMonthly = document.getElementById('label-monthly');
  const labelYearly = document.getElementById('label-yearly');
  const priceElements = document.querySelectorAll('.pricing-price');

  if (toggleInput) {
    toggleInput.addEventListener('change', (e) => {
      const isYearly = e.target.checked;
      
      if (isYearly) {
        labelYearly.classList.add('active');
        labelMonthly.classList.remove('active');
      } else {
        labelMonthly.classList.add('active');
        labelYearly.classList.remove('active');
      }

      priceElements.forEach(el => {
        const val = isYearly ? el.getAttribute('data-yearly') : el.getAttribute('data-monthly');
        
        // Animate price change
        gsap.to(el, {
          opacity: 0, y: -10, duration: 0.2, 
          onComplete: () => {
            el.innerHTML = `${val} <span>/month</span>`;
            gsap.to(el, {opacity: 1, y: 0, duration: 0.3, ease: "back.out"});
          }
        });
      });
    });
  }

  /* ---------- Testimonial Carousel ---------- */
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let carouselInterval;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  if (slides.length > 0) {
    // Click events
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        clearInterval(carouselInterval);
        goToSlide(index);
        startCarousel();
      });
    });

    // Auto rotate
    function startCarousel() {
      carouselInterval = setInterval(() => {
        let next = (currentSlide + 1) % slides.length;
        goToSlide(next);
      }, 5000);
    }
    startCarousel();
  }

  /* ---------- Back to Top Button ---------- */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Smooth Anchor Scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // If mobile menu is open, close it
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('open');
        }

        // Use GSAP scrollTo if included, otherwise native
        if (gsap.plugins.ScrollToPlugin) {
          gsap.to(window, {duration: 1, scrollTo: targetElement, ease: "power3.inOut"});
        } else {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

});
