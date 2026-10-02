#!/usr/bin/env sh
# Publishes landing/site to the gh-pages branch (GitHub Pages serves that branch).
set -e
root=$(git rev-parse --show-toplevel)
tmp=$(mktemp -d)
cp -R "$root/landing/site/." "$tmp/"
cd "$tmp"
git init -q -b gh-pages
git config user.name "$(git -C "$root" config user.name)"
git config user.email "$(git -C "$root" config user.email)"
git add -A
git commit -q -m "Deploy landing page from $(git -C "$root" rev-parse --short HEAD)"
git push -f "$(git -C "$root" remote get-url origin)" gh-pages
rm -rf "$tmp"
