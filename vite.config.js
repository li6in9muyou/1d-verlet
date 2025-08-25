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
    // 添加一个新的插件来处理 vendor 目录的缓存标头
    {
      name: "add-cache-control-for-vendor",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Vite 会将 public 目录映射到根路径 /
          // 所以 public/vendor/some-file.js 的访问路径是 /vendor/some-file.js
          if (req.url.startsWith("/vendor/")) {
            res.setHeader(
              "Cache-Control",
              "public, max-age=31536000, immutable",
            );
          }
          // 将请求传递给下一个中间件
          next();
        });
      },
    },
  ],
});
