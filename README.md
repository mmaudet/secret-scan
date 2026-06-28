# secret-scan 🔍

CLI tool that scans directories for leaked secrets (API keys, private keys, JWTs, env assignments) and outputs a deterministic JSON report.

## Features

- **Zero dependencies**, only TypeScript + Node 20+ stdlib
- **9 secret detectors**: AWS keys, Google API, GitHub tokens, Slack tokens, Stripe keys, generic `sk-` keys, PEM private keys, JWTs, env assignments
- **False positive filtering**, removes placeholders (EXAMPLE, CHANGEME, etc.) and UUIDs
- **Binary file detection**, skips binary files by extension and content analysis
- **Deterministic output**, findings sorted by file (lexicographic) then line (ascending)
- **CI-friendly**, exit codes: `0` (clean), `1` (findings), `2` (error)
- **Redacted values**, first 4 + last 4 characters visible, middle censored
- **Memory-efficient**, streaming scan, one file at a time
- **Summarized mode**, `--summary` for quick overview of affected files

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Scan current directory
npx tsx src/cli.ts

# Scan a specific directory
npx tsx src/cli.ts ./path/to/scan

# Verbose mode (logs to stderr)
npx tsx src/cli.ts -v ./path/to/scan

# Summary mode (JSON with affected files only)
npx tsx src/cli.ts --summary ./path/to/scan

# Text mode (formatted console output)
npx tsx src/cli.ts --text ./path/to/scan

# HTML mode (generates HTML report)
npx tsx src/cli.ts --html report.html ./path/to/scan

# Custom file size limit (default: 1MB)
npx tsx src/cli.ts --max-file-size 2097152 ./path/to/scan

# Limit findings count (default: 10000)
npx tsx src/cli.ts --max-findings 5000 ./path/to/scan
```

### Running from compiled output

```bash
npm run build
node dist/cli.js
node dist/cli.js -v ./path/to/scan
node dist/cli.js --summary ./path/to/scan
node dist/cli.js --text ./path/to/scan
node dist/cli.js --html report.html ./path/to/scan
```

## Output Modes

The scanner supports multiple output formats:

### 1️⃣ JSON (default)

Full detailed report to stdout:

```json
{
  "version": "1",
  "scannedFiles": 5,
  "findings": [
    {
      "file": "config.env",
      "line": 2,
      "category": "env-assignment",
      "severity": "medium",
      "redacted": "wJal************************CRET"
    }
  ]
}
```

**Best for:** CI/CD pipelines, scripts, programmatic processing

---

### 2️⃣ Summary (`--summary`)

Compact JSON with only affected files:

```json
{
  "version": "1",
  "scannedFiles": 150000,
  "affectedFiles": [
    {"file": "config.env", "findings": 3},
    {"file": "server.key", "findings": 1}
  ]
}
```

**Best for:** Quick overview, large directory scans

---

### 3️⃣ Text (`--text`)

Formatted console output with emojis and visual separation:

```
╔══════════════════════════════════════════════════╗
║           SECRET SCAN REPORT                     ║
╠══════════════════════════════════════════════════╣
║ Files scanned: 150                               ║
║ Findings: 7                                      ║
║ Time: 2.3s                                       ║
╠══════════════════════════════════════════════════╣
║ 🔴 HIGH (4)                                      ║
╠══════════════════════════════════════════════════╣
║ config.env:2   │ env-assignment   │ wJal...CRET  ║
║ server.key:1   │ private-key      │ ----... KEY  ║
╠══════════════════════════════════════════════════╣
║ 🟡 MEDIUM (2)                                    ║
╠══════════════════════════════════════════════════╣
║ config.toml:2  │ env-assignment   │ ***REDACTED***║
╚══════════════════════════════════════════════════╝
```

**Best for:** Human inspection, terminal usage

---

### 4️⃣ HTML (`--html report.html`)

Modern, responsive HTML report with statistics and styled table:

![HTML Report](https://i.imgur.com/placeholder.png)

Features:
- Statistics cards (files scanned, findings count, scan time)
- Color-coded severity indicators (🔴 high, 🟡 medium, 🔵 low)
- Responsive design for mobile/desktop
- Monospace redacted values
- Generated timestamp

**Best for:** Reports, sharing results, documentation

---

### Redaction format

All modes use conservative redaction, never reveals more than the type prefix:
- Values ≤ 6 chars: fully masked (`****`)
- Values > 6 chars: first **3 chars** visible (e.g., `AKI****`, `ghp****`), rest censored
- Never reveals suffix or exact length, preventing partial reconstruction

### Exit codes

| Code | Meaning |
|------|---------|
| 0 | No findings |
| 1 | Findings detected |
| 2 | Error (invalid path, permission denied, etc.) |

## Detectors

| Detector | Category | Severity | Pattern |
|----------|----------|----------|---------|
| AWS Access Key | `aws-access-key` | high | `AKIA[0-9A-Z]{16}` |
| AWS Secret Key | `aws-secret-key` | high | 40-char near `aws_secret` |
| Google API Key | `google-api-key` | high | `AIza[0-9A-Za-z\-_]{35}` |
| GitHub Token | `github-token` | high | `gh[pous]_[A-Za-z0-9]{36,}` / `github_pat_...` |
| Slack Token | `slack-token` | high | `xox[baprs]-...` |
| Stripe Key | `stripe-key` | high | `sk_live_[0-9a-zA-Z]{24,}` |
| Generic Key | `generic-secret-key` | high | `sk-...` (not `sk_live_`) |
| Private Key | `private-key` | high | `-----BEGIN ... PRIVATE KEY-----` |
| JWT | `jwt-token` | medium | `eyJ...` with entropy ≥ 3.5 |
| Env Assignment | `env-assignment` | medium | `SECRET_KEY=value` in config files |

**Note:** The high-entropy string detector was removed due to >99.99% false positive rate.

## Configuration File Extensions

Env-assignment detector only scans files with these extensions:

`.env`, `.env.local`, `.env.development`, `.env.test`, `.env.production`,
`.config.js`, `.config.ts`, `.config.json`, `.config.yml`, `.config.yaml`,
`.yaml`, `.yml`, `.toml`, `.json`, `.ini`, `.cfg`, `.conf`

## Ignored Directories

- `.git/`, `node_modules/`, `.svn/`, `.hg/`, `dist/`, `build/`

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No findings |
| 1 | Findings detected |
| 2 | Error (invalid path, permission denied, etc.) |

## Performance

Based on a scan of ~140K files:

| Mode | Time | Findings |
|------|------|----------|
| Detailed | ~47s | ~200 (no false positives) |
| Summary | ~47s | ~100 affected files |

The scanner uses streaming architecture, only findings accumulate in memory, not file contents.

## Development

```bash
# Install dependencies
npm install

# Build source
npm run build

# Run tests
npm test

# Type-check only
npx tsc --noEmit
```

## Output Modes Summary

| Mode | Flag | Output | Best For |
|------|------|--------|----------|
| **JSON** (default) | *(none)* | stdout | CI/CD, scripts |
| **Summary** | `--summary` | JSON (compact) | Quick overview |
| **Text** | `--text` | Formatted console | Human inspection |
| **HTML** | `--html <file>` | HTML file | Reports, sharing |

## Architecture

```
src/
├── cli.ts              # Entry point, argument parsing, orchestration
├── scanner.ts          # Recursive directory traversal (streaming)
├── types.ts            # Shared types (Finding, RawFinding, ScanResult)
├── detectors/          # One file per secret type
│   ├── aws.ts
│   ├── google.ts
│   ├── github.ts
│   ├── slack.ts
│   ├── stripe.ts
│   ├── generic-key.ts
│   ├── private-key.ts
│   ├── jwt.ts
│   ├── env-assignment.ts
│   └── orchestrator.ts # Runs all detectors + deduplication
├── filters/
│   ├── binary.ts       # Binary file detection
│   └── false-positives.ts # Placeholder/UUID removal
├── reporters/
│   ├── json.ts         # JSON report generation with redaction
│   ├── text.ts         # Formatted console output
│   └── html.ts         # HTML report generation
```

Each detector is a pure function: `(content, lines, filename) => RawFinding[]`

## Security Considerations

- **Zero runtime dependencies**, no supply chain risk
- **Conservative redaction**, only 3-char prefix visible, never suffix or length
- **XSS-safe HTML output**, all user-controlled fields are escaped
- **Scans dotfiles**, `.env`, `.npmrc`, `.aws/credentials` are included (the #1 leak source)
- **No ReDoS**, all regex patterns are linear, no catastrophic backtracking
- **Does NOT scan git history**, only the working tree. Use `gitleaks` or `trufflehog` for history scans
- **High-entropy detector removed**, too many false positives (>99.99%), not useful for real secret detection

## Limitations

- Only scans the working tree, not git history
- Regex-based detection only, not a replacement for tools like `gitleaks` or `trufflehog` for production use
- A "green scan" does NOT prove absence of secrets, only absence of detected patterns

## Production Workflow

Use `secret-scan` for working-tree checks + `gitleaks` for git history:

```bash
# Working tree scan (fast, catches new leaks)
secret-scan --text .

# Git history scan (catches secrets committed then deleted)
gitleaks detect --source . --report-format json --report-path gitleaks-report.json

# Combined CI check
if secret-scan --max-findings 0 .; then
  echo "Working tree clean"
fi
gitleaks detect --source . || echo "⚠ History contains potential secrets"
```

Install gitleaks: `brew install gitleaks` or `go install github.com/gitleaks/gitleaks/v2/cmd/gitleaks@latest`

## License

AGPL v3.0