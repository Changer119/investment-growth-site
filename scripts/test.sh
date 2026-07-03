#!/usr/bin/env bash
set -euo pipefail

mkdir -p logs
npm run test 2>&1 | tee logs/test.log
