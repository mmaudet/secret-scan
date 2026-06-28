# secret-scan 🔍

CLI tool that scans directories for leaked secrets (API keys, private keys, JWTs, env assignments) and outputs a deterministic JSON report.

## Features

- **Zero dependencies** — only TypeScript + Node 20+ stdlib
- **9 secret detectors**: AWS keys, Google API, GitHub tokens, Slack tokens, Stripe keys, generic `sk-` keys, PEM private keys, JWTs, env assignments
- **False positive filtering** — removes placeholders (EXAMPLE, CHANGEME, etc.) and UUIDs
- **Binary file detection** — skips binary files by extension and content analysis
- **Deterministic output** — findings sorted by file (lexicographic) then line (ascending)
- **CI-friendly** — exit codes: `0` (clean), `1` (findings), `2` (error)
- **Redacted values** — first 4 + last 4 characters visible, middle censored
- **Memory-efficient** — streaming scan, one file at a time
- **Summarized mode** — `--summary` for quick overview of affected files

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

# Summarized mode (only affected files, no details)
npx tsx src/cli.ts --summary ./path/to/scan

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
```

## Output

JSON report to stdout:

### Default mode (detailed)

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

### Summary mode (`--summary`)

```json
{
  "version": "1",
  "scannedFiles": 1000,
  "affectedFiles": [
    {"file": "config.env", "findings": 3},
    {"file": "server.key", "findings": 1}
  ]
}
```

### Redaction format

- Values ≤ 10 chars: fully masked (`**********`)
- Values > 10 chars: first 4 + last 4 visible, middle censored with `*`

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

The scanner uses streaming architecture — only findings accumulate in memory, not file contents.

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
└── reporters/
    └── json.ts         # JSON report generation with redaction
```

Each detector is a pure function: `(content, lines, filename) => RawFinding[]`

## License

AGPL v3.0