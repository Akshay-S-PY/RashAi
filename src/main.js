// ============================================================
// RashAi, Main Entry Point
// ============================================================

import './styles/index.css';
import { initRouter } from './ui/app.js';
import { toggleLang, getLang, t } from './engine/i18n.js';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  createStarfield();
  setupMobileNav();
  setupLangToggle();
  updateStaticUI();
  initRouter();
});

/**
 * Create animated starfield background
 */
function createStarfield() {
  const container = document.getElementById('stars-container');
  if (!container) return;

  const starCount = 80;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--duration', `${2 + Math.random() * 5}s`);
    star.style.setProperty('--max-opacity', `${0.3 + Math.random() * 0.7}`);
    star.style.animationDelay = `${Math.random() * 5}s`;
    star.style.width = `${1 + Math.random() * 2}px`;
    star.style.height = star.style.width;
    container.appendChild(star);
  }
}

/**
 * Update static HTML elements (nav, trust strip) with current language
 */
function updateStaticUI() {
  // Nav links
  const navMap = {
    '#home': 'nav.home',
    '#calculator': 'nav.kundali',
    '#matching': 'nav.matching',
    '#panchang': 'nav.panchang',
    '#muhurta': 'nav.muhurta',
  };

  document.querySelectorAll('.nav-links a').forEach(link => {
    const key = navMap[link.getAttribute('href')];
    if (key) link.textContent = t(key);
  });

  // Trust strip text (keep SVG icons, update text nodes)
  const trustItems = document.querySelectorAll('.trust-item');
  const trustKeys = ['trust.browser', 'trust.noData', 'trust.precision'];
  trustItems.forEach((item, i) => {
    if (trustKeys[i]) {
      // Preserve SVG child, update text
      const svg = item.querySelector('svg');
      const text = ` ${t(trustKeys[i])}`;
      if (svg) {
        // Remove existing text nodes
        Array.from(item.childNodes).forEach(n => {
          if (n.nodeType === Node.TEXT_NODE) n.remove();
        });
        item.appendChild(document.createTextNode(text));
      } else {
        item.textContent = t(trustKeys[i]);
      }
    }
  });
}

/**
 * Setup language toggle button
 */
function setupLangToggle() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;

  const updateLabel = () => {
    const lang = getLang();
    btn.textContent = lang === 'en' ? 'हिन्दी' : 'English';
  };

  updateLabel();

  btn.addEventListener('click', () => {
    toggleLang();
    updateLabel();
    updateStaticUI();
    // Re-render current page by triggering hashchange
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

/**
 * Setup mobile navigation toggle
 */
function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });

    // Close nav when clicking a link
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
      });
    });
  }
}
