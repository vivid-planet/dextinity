#!/usr/bin/env sh

cd "$(dirname "$0")" || exit

rm -rf ./lang/
mkdir -p ./lang

git clone https://github.com/vivid-planet/dextinity-demo-lang lang/dextinity-demo-lang
git clone https://github.com/vivid-planet/dextinity-lang.git lang/dextinity-lang
