// ============================================================
// RashAi, Home Page
// ============================================================

import { t } from '../../engine/i18n.js';

export function renderHome(container) {
  container.innerHTML = `
    <section class="hero">
      <div class="hero-glow"></div>
      <img src="/logo.png" alt="RashAi" class="hero-logo" />
      <span class="hero-badge">${t('home.badge')}</span>
      <h1 class="hero-title">
        ${t('home.title1')}<br>
        <span class="gradient-text">${t('home.title2')}</span>
      </h1>
      <p class="hero-subtitle">
        ${t('home.subtitle')}
      </p>
      <div class="hero-cta">
        <a href="#calculator" class="btn btn-primary btn-glow" id="cta-calculate">
          ${t('home.cta.generate')}
        </a>
        <a href="#matching" class="btn btn-secondary" id="cta-matching">
          ${t('home.cta.match')}
        </a>
      </div>

      <div class="hero-stats">
        <div class="hero-stat">
          <span class="hero-stat-value">9</span>
          <span class="hero-stat-label">${t('home.stat.planets')}</span>
        </div>
        <div class="hero-stat-divider"></div>
        <div class="hero-stat">
          <span class="hero-stat-value">27</span>
          <span class="hero-stat-label">${t('home.stat.nakshatras')}</span>
        </div>
        <div class="hero-stat-divider"></div>
        <div class="hero-stat">
          <span class="hero-stat-value">36</span>
          <span class="hero-stat-label">${t('home.stat.gunMilan')}</span>
        </div>
        <div class="hero-stat-divider"></div>
        <div class="hero-stat">
          <span class="hero-stat-value">6</span>
          <span class="hero-stat-label">${t('home.stat.strength')}</span>
        </div>
      </div>
    </section>

    <section class="how-it-works container">
      <h2 class="section-title">${t('home.howItWorks')}</h2>
      <p class="section-subtitle">${t('home.howItWorks.subtitle')}</p>

      <div class="steps-row mt-xl">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3 class="step-title">${t('home.step1.title')}</h3>
          <p class="step-desc">${t('home.step1.desc')}</p>
        </div>
        <div class="step-connector"></div>
        <div class="step-card">
          <div class="step-number">2</div>
          <h3 class="step-title">${t('home.step2.title')}</h3>
          <p class="step-desc">${t('home.step2.desc')}</p>
        </div>
        <div class="step-connector"></div>
        <div class="step-card">
          <div class="step-number">3</div>
          <h3 class="step-title">${t('home.step3.title')}</h3>
          <p class="step-desc">${t('home.step3.desc')}</p>
        </div>
      </div>
    </section>

    <section class="features container">
      <h2 class="section-title">${t('home.features.title')}</h2>
      <p class="section-subtitle">${t('home.features.subtitle')}</p>

      <div class="features-grid mt-xl">
        <div class="feature-card" id="feature-kundali">
          <div class="feature-icon-wrap feature-icon--purple">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
          </div>
          <h3 class="feature-title">${t('feature.birthChart')}</h3>
          <p class="feature-desc">${t('feature.birthChart.desc')}</p>
          <a href="#calculator" class="feature-link">${t('feature.birthChart.link')} &rarr;</a>
        </div>

        <div class="feature-card" id="feature-doshas">
          <div class="feature-icon-wrap feature-icon--amber">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 class="feature-title">${t('feature.doshas')}</h3>
          <p class="feature-desc">${t('feature.doshas.desc')}</p>
          <a href="#calculator" class="feature-link">${t('feature.doshas.link')} &rarr;</a>
        </div>

        <div class="feature-card" id="feature-matching">
          <div class="feature-icon-wrap feature-icon--rose">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h3 class="feature-title">${t('feature.matching')}</h3>
          <p class="feature-desc">${t('feature.matching.desc')}</p>
          <a href="#matching" class="feature-link">${t('feature.matching.link')} &rarr;</a>
        </div>

        <div class="feature-card" id="feature-rashi">
          <div class="feature-icon-wrap feature-icon--teal">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <h3 class="feature-title">${t('feature.rashi')}</h3>
          <p class="feature-desc">${t('feature.rashi.desc')}</p>
          <a href="#calculator" class="feature-link">${t('feature.rashi.link')} &rarr;</a>
        </div>

        <div class="feature-card" id="feature-dasha">
          <div class="feature-icon-wrap feature-icon--sky">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h3 class="feature-title">${t('feature.dasha')}</h3>
          <p class="feature-desc">${t('feature.dasha.desc')}</p>
          <a href="#calculator" class="feature-link">${t('feature.dasha.link')} &rarr;</a>
        </div>

        <div class="feature-card" id="feature-ai">
          <div class="feature-icon-wrap feature-icon--gold">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3 class="feature-title">${t('feature.ai')}</h3>
          <p class="feature-desc">${t('feature.ai.desc')}</p>
          <a href="#calculator" class="feature-link">${t('feature.ai.link')} &rarr;</a>
        </div>

        <div class="feature-card" id="feature-panchang">
          <div class="feature-icon-wrap feature-icon--purple">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <circle cx="12" cy="16" r="2"/>
            </svg>
          </div>
          <h3 class="feature-title">${t('feature.panchang')}</h3>
          <p class="feature-desc">${t('feature.panchang.desc')}</p>
          <a href="#panchang" class="feature-link">${t('feature.panchang.link')} &rarr;</a>
        </div>

        <div class="feature-card" id="feature-muhurta">
          <div class="feature-icon-wrap feature-icon--teal">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h3 class="feature-title">${t('feature.muhurta')}</h3>
          <p class="feature-desc">${t('feature.muhurta.desc')}</p>
          <a href="#muhurta" class="feature-link">${t('feature.muhurta.link')} &rarr;</a>
        </div>
      </div>
    </section>

    <section class="cta-section container">
      <div class="cta-card">
        <div class="cta-glow"></div>
        <h2 class="cta-title">${t('home.cta.ready')}</h2>
        <p class="cta-subtitle">${t('home.cta.readyDesc')}</p>
        <div class="cta-buttons">
          <a href="#calculator" class="btn btn-primary btn-glow btn-lg" id="cta-bottom">
            ${t('home.cta.generateNow')}
          </a>
          <a href="#matching" class="btn btn-secondary btn-lg" id="cta-bottom-match">
            ${t('home.cta.orMatch')}
          </a>
        </div>
      </div>
    </section>

  `;
}
