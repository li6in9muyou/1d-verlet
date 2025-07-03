import { defineConfig } from 'vitest/config';
import CustomTitleReporter from './custom-title-reporter'; // Adjust path

export default defineConfig({
  test: {
    reporters: ['default', new CustomTitleReporter()],
  },
});
