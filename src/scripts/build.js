import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";
import { walk } from "https://deno.land/std/fs/mod.ts";

// Collect all .ts files from the client directory
async function getAllTsFiles(dir) {
  const tsFiles = [];
  for await (const entry of walk(dir, { exts: [".ts"], includeDirs: false })) {
    tsFiles.push(entry.path);
  }
  return tsFiles;
}

async function buildAllTsFiles() {
  const tsFiles = await getAllTsFiles("src/client");

  esbuild
    .build({
      entryPoints: tsFiles, // Transpile each file separately
      outdir: "public/dist", // Output directory
      format: "esm", // ES module format
      target: ["es2020"], // Target modern JavaScript
      minify: false, // Don't minify the code
      sourcemap: true, // Include source maps for debugging
      plugins: [...denoPlugins()],
      platform: "browser",
      bundle: true, // Bundle external dependencies
      loader: {
        ".ts": "ts", // TypeScript files
        ".js": "js", // JavaScript files
        ".wasm": "binary", // WebAssembly (if needed)
      },
    })
    .then(() => {
      console.log("Done");
    })
    .catch((error) => {
      console.error("Build failed:", error);
      process.exit(1);
    });
}

buildAllTsFiles();
