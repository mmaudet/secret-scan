#!/usr/bin/env bash
# scan-all.sh — Combined working tree + git history secret scan
# Usage: ./scan-all.sh [directory] [--verbose]

set -euo pipefail

DIR="${1:-.}"
VERBOSE=""
if [[ "${2:-}" == "--verbose" ]]; then
  VERBOSE="-v"
fi

echo "=== Secret Scan (Working Tree) ==="
secret-scan $VERBOSE --text "$DIR"
TREE_EXIT=$?

echo ""
echo "=== Gitleaks (Git History) ==="
if command -v gitleaks &> /dev/null; then
  gitleaks detect --source "$DIR" --report-format table 2>&1 || HIST_EXIT=$?
  HIST_EXIT=${HIST_EXIT:-0}
else
  echo "⚠ gitleaks not installed. Install with: brew install gitleaks"
  HIST_EXIT=1
fi

echo ""
echo "=== Summary ==="
if [[ $TREE_EXIT -eq 0 && $HIST_EXIT -eq 0 ]]; then
  echo "✅ Clean — no secrets detected"
  exit 0
elif [[ $TREE_EXIT -eq 1 || $HIST_EXIT -eq 1 ]]; then
  echo "⚠ Findings detected"
  if [[ $TREE_EXIT -eq 1 ]]; then
    echo "  - Working tree: potential secrets found"
  fi
  if [[ $HIST_EXIT -eq 1 ]]; then
    echo "  - Git history: potential secrets found"
  fi
  exit 1
else
  echo "❌ Error during scan"
  exit 2
fi