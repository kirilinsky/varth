// @vitest-environment node
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { main, CliIO } from "./cli";

const dirs: string[] = [];

const makeIO = async (): Promise<CliIO & { lines: string[] }> => {
  const cwd = await mkdtemp(join(tmpdir(), "varth-cli-"));
  dirs.push(cwd);
  const lines: string[] = [];
  return { cwd, lines, log: (l) => lines.push(l), color: false };
};

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((d) => rm(d, { recursive: true, force: true })));
});

const MJS_CONFIG = `export default {
  themes: {
    light: { accent: "#3d6fb4", bg: "#ffffff", radius: "8px" },
    dark: { accent: "#7fa9e0", bg: "#212932", radius: "8px" },
  },
  properties: "auto",
  storageKey: "my-theme",
  out: { css: "out/theme.css", js: "out/theme.mjs" },
};
`;

describe("varth gen", () => {
  it("writes CSS, switcher and derived types from an .mjs config", async () => {
    const io = await makeIO();
    await writeFile(join(io.cwd, "varth.config.mjs"), MJS_CONFIG);
    const { mkdir } = await import("node:fs/promises");
    await mkdir(join(io.cwd, "out"));

    const code = await main(["gen"], io);
    expect(code).toBe(0);

    const css = await readFile(join(io.cwd, "out/theme.css"), "utf8");
    expect(css).toContain("--th-accent: light-dark(#3d6fb4, #7fa9e0)");
    expect(css).toContain("@property --th-accent");

    const js = await readFile(join(io.cwd, "out/theme.mjs"), "utf8");
    expect(js).toContain('const KEY = "my-theme"');
    expect(js).toContain('const NAMES = ["light","dark"]');
    expect(js).toContain("export const setTheme");
    expect(js).toContain("export const getTheme");

    // .d.ts basename derived from the js path so TS picks it up
    const dts = await readFile(join(io.cwd, "out/theme.d.ts"), "utf8");
    expect(dts).toContain('| "--th-accent"');
    expect(dts).toContain('setTheme(theme: ThemeName | "system"): void');

    const out = io.lines.join("\n");
    expect(out).toContain("3 tokens · 2 themes · strategy: light-dark");
    expect(out).toContain("out/theme.css");
    expect(out).toContain("██ accent");
  });

  it("skips the switcher when out.js is false", async () => {
    const io = await makeIO();
    await writeFile(
      join(io.cwd, "varth.config.mjs"),
      `export default { themes: { light: { a: "#fff" }, dark: { a: "#000" } }, out: { js: false } };\n`,
    );
    const code = await main(["gen"], io);
    expect(code).toBe(0);
    expect(existsSync(join(io.cwd, "varth.css"))).toBe(true);
    expect(existsSync(join(io.cwd, "varth.js"))).toBe(false);
  });

  it("fails cleanly without a config", async () => {
    const io = await makeIO();
    const code = await main(["gen"], io);
    expect(code).toBe(1);
    expect(io.lines.join("\n")).toContain('run "varth init" first');
  });

  it("fails cleanly on a config without themes", async () => {
    const io = await makeIO();
    await writeFile(join(io.cwd, "varth.config.mjs"), "export default { nope: 1 };\n");
    const code = await main(["gen"], io);
    expect(code).toBe(1);
    expect(io.lines.join("\n")).toContain('"themes" field');
  });
});

describe("varth init", () => {
  it("scaffolds a TS config and generates on the spot", async () => {
    const io = await makeIO();
    const code = await main(["init"], io);
    expect(code).toBe(0);
    expect(existsSync(join(io.cwd, "varth.config.ts"))).toBe(true);
    expect(existsSync(join(io.cwd, "varth.css"))).toBe(true);
    expect(existsSync(join(io.cwd, "varth.js"))).toBe(true);
    expect(existsSync(join(io.cwd, "varth.d.ts"))).toBe(true);

    const out = io.lines.join("\n");
    expect(out).toContain("varth.config.ts scaffolded");
    expect(out).toContain("next steps");
    expect(out).toContain('<link rel="stylesheet"'); // no package.json → plain html
  });

  it("refuses to overwrite an existing config", async () => {
    const io = await makeIO();
    await writeFile(join(io.cwd, "varth.config.mjs"), MJS_CONFIG);
    const code = await main(["init"], io);
    expect(code).toBe(0);
    expect(io.lines.join("\n")).toContain("already exists");
  });

  it("suggests an import line when a bundler is detected", async () => {
    const io = await makeIO();
    await writeFile(
      join(io.cwd, "package.json"),
      JSON.stringify({ devDependencies: { vite: "^7.0.0" } }),
    );
    await main(["init"], io);
    expect(io.lines.join("\n")).toContain('import "./varth.css"');
  });
});

describe("misc", () => {
  it("prints version", async () => {
    const io = await makeIO();
    const code = await main(["--version"], io);
    expect(code).toBe(0);
    expect(io.lines[0]).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("unknown command → help + exit 1", async () => {
    const io = await makeIO();
    const code = await main(["frobnicate"], io);
    expect(code).toBe(1);
    expect(io.lines.join("\n")).toContain("usage");
  });
});
