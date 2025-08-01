import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // <-- Add this line
  server: {
    allowedHosts: ["q37985-5173.csb.app"],
    //for production enable the following codeline and disable the one above
    // allowedHosts: ["all"],
    host: true,
    strictPort: false,
  },
});
