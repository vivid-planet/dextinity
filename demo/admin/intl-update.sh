#!/usr/bin/env sh
set -e

cd "$(dirname "$0")"

mkdir -p ./lang

[ -d lang/dextinity-demo-lang ] || git clone https://github.com/vivid-planet/dextinity-demo-lang lang/dextinity-demo-lang
[ -d lang/dextinity-lang ] || git clone https://github.com/vivid-planet/dextinity-lang.git lang/dextinity-lang
