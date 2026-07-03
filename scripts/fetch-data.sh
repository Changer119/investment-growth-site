#!/usr/bin/env bash
set -euo pipefail

mkdir -p logs public/data
npm run fetch:data 2>&1 | tee logs/fetch-data.log
