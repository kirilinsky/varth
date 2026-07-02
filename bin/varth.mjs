#!/usr/bin/env node
import { main } from "../dist/cli.mjs";

main(process.argv.slice(2), {
  cwd: process.cwd(),
  log: console.log,
  color: !!process.stdout.isTTY && !process.env.NO_COLOR,
}).then((code) => {
  process.exitCode = code;
});
