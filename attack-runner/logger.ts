import fs from 'fs';
import path from 'path';

let logFilePath: string | null = null;

function getLogFilePath(): string {
  if (logFilePath) {
    return logFilePath;
  }

  // Create logs directory if it doesn't exist
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Generate timestamp-based filename
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
  
  logFilePath = path.join(logsDir, `${timestamp}.jsonl`);
  return logFilePath;
}

export function logStep(entry: AttackLogEntry): void {
  const filePath = getLogFilePath();
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(filePath, line, 'utf-8');
}

