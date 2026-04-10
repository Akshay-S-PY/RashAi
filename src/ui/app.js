// ============================================================
// RashAi, SPA Router (hash-based)
// ============================================================

import { renderHome } from './pages/home.js';
import { renderCalculator } from './pages/calculator.js';
import { renderResults } from './pages/results.js';
import { renderMatching } from './pages/matching.js';
import { renderPanchang } from './pages/panchang.js';
import { renderMuhurta } from './pages/muhurta.js';

const routes = {
  '':           renderHome,
  'home':       renderHome,
  'calculator': renderCalculator,
  'results':    renderResults,
  'matching':   renderMatching,
  'panchang':   renderPanchang,
  'muhurta':    renderMuhurta,
};

let currentRoute = '';

/**
 * Initialize the SPA router
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute);
  handleRoute();
}

/**
 * Handle hash route changes
 */
function handleRoute() {
  const hash = window.location.hash.slice(1).split('?')[0] || 'home';
  const app = document.getElementById('app');

  if (!app) return;

  // Update nav active state
  document.querySelectorAll('.nav-links a').forEach(link => {
    const linkHash = link.getAttribute('href')?.slice(1) || 'home';
    link.classList.toggle('active', linkHash === hash);
  });

  const renderer = routes[hash];
  if (renderer) {
    currentRoute = hash;
    app.innerHTML = '';
    renderer(app);
    window.scrollTo(0, 0);
  } else {
    app.innerHTML = `
      <div class="hero">
        <h1 class="hero-title">404</h1>
        <p class="hero-subtitle">Page not found</p>
        <a href="#home" class="btn btn-primary">Go Home</a>
      </div>
    `;
  }
}

/**
 * Navigate to a route
 */
export function navigateTo(route, params = {}) {
  const queryString = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  window.location.hash = queryString ? `${route}?${queryString}` : route;
}

/**
 * Get current route params
 */
export function getRouteParams() {
  const hash = window.location.hash.slice(1);
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) return {};

  const params = {};
  const search = hash.slice(queryIndex + 1);
  new URLSearchParams(search).forEach((v, k) => {
    params[k] = v;
  });
  return params;
}
