/* ============================================================
   Nova SaaS — Main JavaScript
   GSAP Animations, Custom Cursor, Canvas Particles, etc.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Preloader ---------- */
  const preloader = document.querySelector('.preloader');
  let preloaderRemoved = false;
  
  function removePreloader() {
    if (preloaderRemoved) return;
    preloaderRemoved = true;
    if (preloader) preloader.classList.add('hidden');
    initHeroAnimations();
  }

  // Use DOMContentLoaded instead of load so it doesn't wait for external assets forever
  // Also add a fallback timeout just in case
  setTimeout(removePreloader, 2000);
  window.addEventListener('load', removePreloader);

  /* ---------- Custom Magnetic Cursor ---------- */
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || ('ontouchstart' in window);
  
  if (!isTouchDevice && cursor && follower) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    // Follow mouse
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Instant update for the small dot
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });

    // Spring physics for follower ring
    const renderFollower = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = `${followerX}px`;
      follower.style.top = `${followerY}px`;
      requestAnimationFrame(renderFollower);
    };
    renderFollower();

    // Hover effects
    document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover-active');
        follower.classList.add('hover-active');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover-active');
        follower.classList.remove('hover-active');
      });
    });

    // Magnetic effect for buttons
    document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta, .step-node, .dot').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      });
    });
  }

  /* ---------- Scroll Progress Bar ---------- */
  const scrollProgress = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const scrollPx = document.documentElement.scrollTop;
    const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollLen = (scrollPx / winHeightPx) * 100;
    if(scrollProgress) scrollProgress.style.width = scrollLen + '%';
  });

  /* ---------- Navbar Scroll Effect ---------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

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

  /* ---------- Canvas Particles (Hero & CTA) ---------- */
  function initParticles(canvasId, particleCount, colorStr) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    window.addEventListener('resize', () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorStr}, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }
  
  // Initialize particles (fewer on mobile for performance)
  const particleCount = isTouchDevice ? 15 : 50;
  initParticles('particle-canvas', particleCount, '168, 85, 247'); // Purple tint for hero

  /* ---------- GSAP Scroll Animations ---------- */
  
  // Standard Reveals
  gsap.utils.toArray('.g-reveal').forEach(element => {
    gsap.fromTo(element, 
      { y: 50, opacity: 0 },
      { 
        y: 0, opacity: 1, 
        duration: 1, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
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
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  });

  // Horizontal Scroll Showcase
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

  /* ---------- Feature Cards Glow Follow ---------- */
  if (!isTouchDevice) {
    document.querySelectorAll('.feature-card').forEach(card => {
      const glow = card.querySelector('.glow-blob');
      if (glow) {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          glow.style.left = `${x}px`;
          glow.style.top = `${y}px`;
        });
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
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

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
