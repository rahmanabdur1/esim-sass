module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/plans',
        'http://localhost:3000/auth/login',
        'http://localhost:3000/about',
        'http://localhost:3000/contact',
      ],
      numberOfRuns:    3,
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'started server on',
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        'categories:performance':     ['error', { minScore: 0.90 }],
        'categories:accessibility':   ['error', { minScore: 0.90 }],
        'categories:best-practices':  ['error', { minScore: 0.90 }],
        'categories:seo':             ['error', { minScore: 0.90 }],
        'first-contentful-paint':     ['warn',  { maxNumericValue: 2000 }],
        'largest-contentful-paint':   ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift':    ['error', { maxNumericValue: 0.1  }],
        'interaction-to-next-paint':  ['warn',  { maxNumericValue: 200  }],
        'total-blocking-time':        ['warn',  { maxNumericValue: 300  }],
        'speed-index':                ['warn',  { maxNumericValue: 3000 }],
        'uses-optimized-images':      'warn',
        'uses-webp-images':           'warn',
        'uses-text-compression':      'error',
        'uses-responsive-images':     'warn',
        'efficient-animated-content': 'warn',
        'render-blocking-resources':  'warn',
        'unused-javascript':          'warn',
        'unused-css-rules':           'warn',
      },
    },
    upload: {
      target:         'temporary-public-storage',
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
    },
  },
};
