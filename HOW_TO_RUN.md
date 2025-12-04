# How to Run the Attack System

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn** package manager
3. **ts-node** installed globally or locally

## Setup Steps

### 1. Install ts-node (if not already installed)

```bash
npm install -g ts-node
```

Or install it locally in the project:
```bash
npm install --save-dev ts-node
```

### 2. Ensure dependencies are installed

From the project root:
```bash
npm install
```

## Running the Attacks

### Option 1: Run all attacks at once

From the project root directory:

```bash
node --loader ts-node/esm attack-runner/run_all_attacks.ts
```

Or if ts-node is installed locally:
```bash
npx ts-node --esm attack-runner/run_all_attacks.ts
```

### Option 2: Run a single attack manually

You can test individual servers first:

**Test Variant 1 (Server Code Leakage):**
```bash
node --loader ts-node/esm src/filesystem-server-code-leakage/index.ts
```

**Test Variant 2 (Hardcoded Secret Leak):**
```bash
node --loader ts-node/esm src/filesystem-hardcoded-secret-leak/index.ts
```

**Test Variant 3 (Excessive Data Exposure):**
```bash
node --loader ts-node/esm src/filesystem-excessive-data-exposure/index.ts
```

## What to Expect

When you run `run_all_attacks.ts`, you should see:

1. **Console output** showing:
   - Each attack being started
   - Step-by-step progress (✓ for success, ✗ for failure)
   - Summary at the end with total steps, successes, and failures

2. **Log file** created in `logs/` directory:
   - Filename format: `YYYY-MM-DD_HH-mm-ss.jsonl`
   - Each line is a JSON object with attack details
   - Contains: timestamp, attackId, variant, step, request, responseSnippet, success

## Checking the Results

### View the log file:

```bash
# List log files
ls logs/

# View the latest log file (on Linux/Mac)
cat logs/$(ls -t logs/ | head -1)

# View the latest log file (on Windows PowerShell)
Get-Content logs\$(Get-ChildItem logs\ | Sort-Object LastWriteTime -Descending | Select-Object -First 1).Name
```

### Parse JSONL logs:

You can use a JSON parser to view formatted output:

```bash
# Using jq (if installed)
cat logs/*.jsonl | jq '.'

# Or using Node.js
node -e "const fs=require('fs'); const data=fs.readFileSync('logs/'+fs.readdirSync('logs').pop(),'utf8'); data.split('\\n').filter(l=>l).forEach(l=>console.log(JSON.stringify(JSON.parse(l),null,2)))"
```

## Expected Behavior

### MCP-001 (Server Code Leakage)
- **Should succeed**: Listing directory and reading files from the repo root
- **Vulnerability**: Over-broad root allows access to entire repository

### MCP-002 (Hardcoded Secret Leak)
- **Should succeed**: Reading files with "config" in path or ending with ".env"
- **Vulnerability**: Hardcoded bypass allows access to sensitive files

### MCP-003 (Excessive Data Exposure)
- **May succeed/fail**: Path traversal attempts (depends on actual file structure)
- **Vulnerability**: Missing normalization allows path traversal attacks

## Troubleshooting

### Error: "Cannot find module 'ts-node'"
- Install ts-node: `npm install -g ts-node`

### Error: "Cannot find module '@modelcontextprotocol/sdk'"
- Run `npm install` from project root

### Error: "MCP server did not become ready within timeout"
- The server might be taking longer to start
- Check if the server path is correct
- Ensure TypeScript files compile without errors

### No log file created
- Check that the `logs/` directory exists (it should be created automatically)
- Check file permissions
- Look for error messages in console output

## Manual Testing

To manually test a specific vulnerability:

1. Start the vulnerable server:
   ```bash
   node --loader ts-node/esm src/filesystem-server-code-leakage/index.ts
   ```

2. In another terminal, you can send MCP requests (requires an MCP client)
   - Or use the attack scripts directly by importing them

## Notes

- All attacks use **stdio** (standard input/output) - no network ports
- Each attack spawns a fresh server process
- Logs are appended in JSONL format (one JSON object per line)
- The attack runner automatically cleans up server processes

