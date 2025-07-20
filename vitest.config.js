import CustomTitleReporter from "./custom-title-reporter";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: ["dot", new CustomTitleReporter()],
  },
});
