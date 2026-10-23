(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* Footer year */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* Header border on scroll + mobile menu */
  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  const nav = $('#nav');

  const onScroll = () => { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* Reveal on scroll */
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  $$('.reveal').forEach((el) => { if (observer) observer.observe(el); else el.classList.add('in'); });

  /* Pre-select the support type when a service card is clicked */
  const typeSelect = $('#support-type');
  $$('[data-support]').forEach((a) => {
    a.addEventListener('click', () => { if (typeSelect) typeSelect.value = a.dataset.support; });
  });

  /* Contact form — sent to the company inbox through Web3Forms (see the access_key field in index.html) */
  const form = $('#contact-form');
  if (form && /^YOUR_/.test(form.elements.access_key.value)) {
    // No Web3Forms key yet: show a notice instead of a form that can't deliver
    form.hidden = true;
    const pending = $('#form-pending');
    if (pending) pending.hidden = false;
  } else if (form) {
    const status = $('#form-status');
    const done = $('#form-done');
    const button = $('button[type="submit"]', form);
    const label = button.textContent;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      button.disabled = true;
      button.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) throw new Error(data.message || 'HTTP ' + res.status);
        form.hidden = true;
        done.hidden = false;
        done.focus();
      } catch (err) {
        status.textContent = 'Sorry, something went wrong and your message was not sent. Please try again in a moment.';
        button.disabled = false;
        button.textContent = label;
      }
    });
  }
})();
