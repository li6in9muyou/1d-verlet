import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 13333,
  },
  plugins: [
    {
      name: "remove-jekyll-templates",
      transformIndexHtml(html) {
        const regex = /{% if site\.dev %}|{% else %}[\s\S]*?{% endif %}/g;
        return html.replace(regex, "");
      },
    },
  ],
});
