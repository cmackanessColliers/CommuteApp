import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
import react from "@vitejs/plugin-react-swc";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react({ devTarget: "es2022" }),
    basicSsl(),
    visualizer({ filename: "SubmarketUpdateApp/stats.html" }),
  ],
  server: {
    port: 5174,
    open: true,
    https: true,
  },
  // Pre-bundle commonly used ArcGIS submodules to speed up Vite dev server
  optimizeDeps: {
    include: [
      "@arcgis/core/rest/support/Query",
      "@arcgis/core/layers/FeatureLayer",
      "@arcgis/core/Graphic",
      "@arcgis/core/geometry/Polygon",
      "@arcgis/core/config",
      "@arcgis/core/renderers/SimpleRenderer",
      "@arcgis/core/identity/OAuthInfo",
      "@arcgis/core/identity/IdentityManager",
    ],
  },
  build: {
    outDir: "SubmarketUpdateApp",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Group modules into manual chunks. Don't reference the package root
        // '@arcgis/core' directly because that package is consumed via
        // subpath imports (e.g. '@arcgis/core/Graphic') and doesn't expose
        // a single entry the bundler can resolve. Instead, group by id.
        manualChunks(id) {
          if (id.includes("node_modules/@arcgis")) {
            return "arcgis";
          }
          if (id.includes("node_modules/react")) {
            return "vendor";
          }
        },
      },
    },
    // Use terser for slightly better compression (slower than esbuild)
    minify: "terser",
    terserOptions: {
      maxWorkers: 20,
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    // Production sourcemaps disabled by default for smaller bundles
    sourcemap: false,
    target: "es2022",
  },
  base: "/portal/apps/SubmarketUpdateApp/",
});
