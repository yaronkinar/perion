import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { createPinia } from 'pinia';
import '../src/assets/styles.css';

setup((app) => {
  app.use(createPinia());
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="p-6 bg-slate-50 min-h-[200px]"><story /></div>',
    }),
  ],
};

export default preview;
