import * as esbuild from "https://deno.land/x/esbuild@v0.24.0/mod.js"; // The helper function to gather all HTML files
import { ensureDir, copy } from "jsr:@std/fs";
import { denoPlugins } from "https://jsr.io/@luca/esbuild-deno-loader/0.10.3/mod.ts";
import { expandGlob } from "jsr:@std/fs";
import { join, dirname, relative } from "jsr:@std/path@0.213/";

// Function to gather all HTML files
export async function getAllHTMLFiles(directory) {
  const htmlFiles = [];

  const templateDir = join(Deno.cwd(), "src/client/templates/custom"); // Source directory
  const publicDir = join(Deno.cwd(), "public/dist/templates/custom"); // Destination directory

  for await (const file of expandGlob(`${templateDir}/**/*.html`)) {
    const stat = await Deno.stat(file.path);

    if (stat.isFile) {
      const destPath = join(
        publicDir,
        relative(templateDir, file.path)
      );
      await ensureDir(dirname(destPath)); // Ensure the destination directory exists
      await copy(file.path, destPath);
      console.log(`Copied: ${file.path} -> ${destPath}`);
    } else {
      console.log(`Skipping directory: ${file.path}`);
    }
  }
}

// Gather all HTML files from the "src" directory
const htmlFiles = await getAllHTMLFiles("./src/client");

// Run Esbuild for bundling JS/TS files
esbuild
  .build({
    entryPoints: ["src/server/server.ts"],
    outdir: "../../public/dist",
    outfile: "../../public/dist/main.js",
    outExtension: { ".ts": ".js" },
    format: "esm",
    target: ["es2020"],
    platform: "browser",
    sourcemap: true,
    minify: false,
    plugins: [...denoPlugins()],
  })
  .then(async () => {
    console.log("JavaScript build finished!");

    console.log("HTML files copied successfully!");
  })
  .catch((error) => {
    console.error("Build failed:", error);
    Deno.exit(1);
  })
  .finally(() => {
    esbuild.stop();
  });
