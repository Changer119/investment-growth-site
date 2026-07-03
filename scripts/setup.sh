#!/usr/bin/env bash
set -euo pipefail

mkdir -p logs
npm install 2>&1 | tee logs/setup.log
