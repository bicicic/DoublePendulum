#!/bin/sh
set -eu

wasm-pack build --target web --release --out-dir docs/pkg

# wasm-pack creates this file with "*", which would exclude the files that
# GitHub Pages needs. The output is intentionally committed in this project.
rm -f docs/pkg/.gitignore
