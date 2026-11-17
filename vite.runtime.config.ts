import { localIconPlugin } from "./scripts/local-icon-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig(({ command }) => ({
  base: "./",
  optimizeDeps: { entries: ["index.html"] },
  plugins: [
    localIconPlugin(command),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "捡手机",
        short_name: "捡手机",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [{ src: "icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: [
          "**/*.{js,css,html,svg,json,txt,png,jpg}",
          // 大体积视频：托管主机不支持 Range 且会截断长响应，
          // 纳入 SW 预缓存后播放走本地缓存，稳定可靠
          "videos/n22-*.mp4",
          "videos/n24-*.mp4",
        ],
        maximumFileSizeToCacheInBytes: 120000000,
      },
    }),
  ],
}));
