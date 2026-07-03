#!/usr/bin/env bash
set -euo pipefail

mkdir -p logs
npm run dev 2>&1 | tee logs/dev.log
