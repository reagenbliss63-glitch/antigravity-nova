document.addEventListener('DOMContentLoaded', () => {

  /* ---- GSAP safety gate ---- */
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('gsap-ready');
  }

  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || ('ontouchstart' in window);
  const isMobile = window.innerWidth <= 768;

  /* Preloader */
  const preloader = document.querySelector('.preloader');
  let preloaderRemoved = false;
  function removePreloader() {
    if (preloaderRemoved) return;
    preloaderRemoved = true;
    if (preloader) {
      preloader.classList.add('hidden');
      setTimeout(() => { if (preloader.parentNode) preloader.remove(); }, 500);
    }
    if (!isMobile && hasGSAP) initHeroAnimations();
  }
  setTimeout(removePreloader, isMobile ? 50 : 500);
  window.addEventListener('load', removePreloader);

  /* Cursor */
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  if (!isTouchDevice && !isMobile && cursor && follower) {
    document.body.classList.add('custom-cursor');
    let mx = 0, my = 0, fx = 0, fy = 0, raf;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx-4}px,${my-4}px)`;
    }, {passive:true});
    const tick = () => {
      fx += (mx-fx)*0.14; fy += (my-fy)*0.14;
      follower.style.transform = `translate(${fx-18}px,${fy-18}px)`;
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };
    tick();
    document.addEventListener('visibilitychange', () => { document.hidden ? cancelAnimationFrame(raf) : tick(); });
    document.addEventListener('mouseover', e => {
      if (e.target.closest('[data-cursor="hover"]')) { cursor.classList.add('hover-active'); follower.classList.add('hover-active'); }
    }, {passive:true});
    document.addEventListener('mouseout', e => {
      if (e.target.closest('[data-cursor="hover"]')) { cursor.classList.remove('hover-active'); follower.classList.remove('hover-active'); }
    }, {passive:true});
  }

  /* Scroll progress + navbar */
  const sp = document.getElementById('scroll-progress');
  const nb = document.getElementById('navbar');
  const btt = document.getElementById('back-to-top');
  let st = false;
  window.addEventListener('scroll', () => {
    if (st) return; st = true;
    requestAnimationFrame(() => {
      const s = document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (sp) sp.style.width = (s/h)*100 + '%';
      if (nb) nb.classList.toggle('scrolled', s > 40);
      if (btt) btt.classList.toggle('visible', s > 400);
      st = false;
    });
  }, {passive:true});

  /* Mobile menu */
  const ham = document.getElementById('hamburger');
  const mm = document.getElementById('mobile-menu');
  if (ham && mm) {
    ham.addEventListener('click', () => { ham.classList.toggle('active'); mm.classList.toggle('open'); });
    mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { ham.classList.remove('active'); mm.classList.remove('open'); }));
  }

  /* Hero animations (only when GSAP is available) */
  function initHeroAnimations() {
    const tl = gsap.timeline();
    const h1 = document.querySelector('.split-text');
    if (h1) tl.fromTo(h1, {y:40,opacity:0}, {y:0,opacity:1,duration:.8,ease:"power3.out"});

    const revealItems = document.querySelectorAll('.reveal-item');
    if (revealItems.length) tl.fromTo(revealItems, {y:24,opacity:0}, {y:0,opacity:1,duration:.6,stagger:.15,ease:"power3.out"}, "-=.4");

    const mockup = document.querySelector('.hero-mockup');
    if (mockup) tl.fromTo(mockup, {y:60,opacity:0,rotateX:12}, {y:0,opacity:1,rotateX:5,duration:1,ease:"power4.out"}, "-=.7");
  }

  /* GSAP scroll animations - desktop only, only when GSAP loaded */
  if (!isMobile && hasGSAP) {
    gsap.utils.toArray('.g-reveal').forEach(el => {
      gsap.fromTo(el, {y:30,opacity:0}, {y:0,opacity:1,duration:.7,ease:"power3.out",
        scrollTrigger:{trigger:el,start:"top 88%",toggleActions:"play none none none"}});
    });
    ['.features-grid','.stats-grid','.pricing-grid','.steps-grid'].forEach(sel => {
      const g = document.querySelector(sel);
      if (g) {
        const staggerEls = g.querySelectorAll('.g-stagger');
        if (staggerEls.length) {
          gsap.fromTo(staggerEls, {y:30,opacity:0},
            {y:0,opacity:1,duration:.5,stagger:.08,ease:"power3.out",
             scrollTrigger:{trigger:g,start:"top 85%",toggleActions:"play none none none"}});
        }
      }
    });
  }

  /* Stats counters */
  if (hasGSAP) {
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
      ScrollTrigger.create({
        trigger: statsSection, start: "top 80%", once: true,
        onEnter: () => {
          document.querySelectorAll('.count-up').forEach(el => {
            const t = parseInt(el.dataset.target, 10);
            const s = el.dataset.suffix || '';
            gsap.to(el, {innerHTML:t, duration:1.5, snap:{innerHTML:1},
              onUpdate() { el.innerHTML = Math.round(this.targets()[0].innerHTML).toLocaleString() + s; }});
          });
        }
      });
    }
  }

  /* Pricing toggle */
  const ti = document.getElementById('pricing-checkbox');
  const lm = document.getElementById('label-monthly');
  const ly = document.getElementById('label-yearly');
  if (ti) {
    ti.addEventListener('change', e => {
      const y = e.target.checked;
      lm.classList.toggle('active', !y); ly.classList.toggle('active', y);
      document.querySelectorAll('.pricing-price').forEach(el => {
        const v = y ? el.dataset.yearly : el.dataset.monthly;
        if (hasGSAP) {
          gsap.to(el, {opacity:0,y:-8,duration:.15,onComplete:()=>{
            el.innerHTML = `${v} <span>/month</span>`;
            gsap.to(el, {opacity:1,y:0,duration:.2,ease:"back.out"});
          }});
        } else {
          el.innerHTML = `${v} <span>/month</span>`;
        }
      });
    });
  }

  /* Testimonial carousel */
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  let cur = 0, ci;
  function goTo(i) {
    slides[cur].classList.remove('active'); dots[cur].classList.remove('active');
    cur = i;
    slides[cur].classList.add('active'); dots[cur].classList.add('active');
  }
  if (slides.length) {
    dots.forEach((d,i) => d.addEventListener('click', () => { clearInterval(ci); goTo(i); startC(); }));
    function startC() { ci = setInterval(() => goTo((cur+1)%slides.length), 5000); }
    startC();
  }

  /* Back to top */
  if (btt) btt.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  /* Smooth anchors */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const t = document.querySelector(id);
      if (t) { e.preventDefault(); if (mm && mm.classList.contains('open')) { ham.classList.remove('active'); mm.classList.remove('open'); } t.scrollIntoView({behavior:'smooth'}); }
    });
  });
});
