#!/bin/bash
set -euo pipefail

# Enable async mode for faster session startup
echo '{"async": true, "asyncTimeout": 300000}'

# Only run in remote (web) environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Configure git identity
git config user.name "Nate"
git config user.email "mydreamstyle@gmail.com"

# Install dependencies
npm install
