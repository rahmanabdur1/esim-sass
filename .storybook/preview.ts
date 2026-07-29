import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
});

const preview: Preview = {
  parameters: {
    actions:    { argTypesRegex: '^on[A-Z].*' },
    controls:   { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout:     'centered',
    viewport: {
      viewports: {
        mobile:  { name: 'Mobile (375px)',  styles: { width: '375px',  height: '812px' } },
        tablet:  { name: 'Tablet (768px)',  styles: { width: '768px',  height: '1024px'} },
        laptop:  { name: 'Laptop (1024px)', styles: { width: '1024px', height: '768px' } },
        desktop: { name: 'Desktop (1440px)',styles: { width: '1440px', height: '900px' } },
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark',  value: '#0f172a' },
        { name: 'gray',  value: '#f8fafc' },
      ],
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast',      enabled: true },
          { id: 'label',               enabled: true },
          { id: 'button-name',         enabled: true },
          { id: 'aria-required-attr',  enabled: true },
          { id: 'focus-trap',          enabled: true },
        ],
      },
    },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: ['Design System', 'Atoms', 'Molecules', 'Organisms', 'Templates', 'Features', 'Pages'],
      },
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="font-sans antialiased">
            <Story />
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  ],
  globalTypes: {
    locale: {
      name:        'Locale',
      description: 'Internationalization locale',
      defaultValue:'en',
      toolbar: {
        icon:  'globe',
        items: [
          { value: 'en', right: '🇺🇸', title: 'English'  },
          { value: 'de', right: '🇩🇪', title: 'Deutsch'  },
          { value: 'fr', right: '🇫🇷', title: 'Français' },
          { value: 'es', right: '🇪🇸', title: 'Español'  },
          { value: 'ar', right: '🇸🇦', title: 'Arabic'   },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      name:        'Theme',
      description: 'Color theme',
      defaultValue:'light',
      toolbar: {
        icon:  'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun'  },
          { value: 'dark',  title: 'Dark',  icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
