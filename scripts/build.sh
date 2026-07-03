#!/usr/bin/env bash
set -euo pipefail

mkdir -p logs
npm run build 2>&1 | tee logs/build.log
