import { spawn, ChildProcess } from 'child_process';
import { Readable, Writable } from 'stream';
import { makeClient, waitForMCPReady, MCPClient } from './mcp_client.js';
import { join } from 'path';

let currentServer: ChildProcess | null = null;
let currentClient: MCPClient | null = null;
let currentStdin: Writable | null = null;
let currentStdout: Readable | null = null;

export async function resetEnvironment(serverPath: string): Promise<{ client: MCPClient; stdin: Writable; stdout: Readable }> {
  // Kill previous server if running
  if (currentServer) {
    try {
      currentServer.kill('SIGTERM');
      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 500));
      if (currentServer.killed === false) {
        currentServer.kill('SIGKILL');
      }
    } catch (error) {
      // Ignore errors when killing
    }
    currentServer = null;
    currentClient = null;
    currentStdin = null;
    currentStdout = null;
  }

  // Spawn new server using tsx
  // Use node with the local tsx executable for cross-platform compatibility
  const tsxPath = join(process.cwd(), 'node_modules', '.bin', 'tsx');
  const isWindows = process.platform === 'win32';
  const tsxExecutable = isWindows ? `${tsxPath}.cmd` : tsxPath;
  
  const server = spawn(tsxExecutable, [serverPath], {
    stdio: ['pipe', 'pipe', 'inherit'],
    cwd: process.cwd(),
    shell: isWindows, // Use shell on Windows to handle .cmd files
  });

  currentServer = server;
  currentStdin = server.stdin!;
  currentStdout = server.stdout!;

  // Create MCP client
  const client = makeClient(currentStdout, currentStdin);
  currentClient = client;

  // Wait for MCP to be ready
  await waitForMCPReady(client, 10000);

  return {
    client,
    stdin: currentStdin,
    stdout: currentStdout,
  };
}

export function cleanup(): void {
  if (currentServer) {
    try {
      currentServer.kill('SIGTERM');
      setTimeout(() => {
        if (currentServer && !currentServer.killed) {
          currentServer.kill('SIGKILL');
        }
      }, 1000);
    } catch (error) {
      // Ignore
    }
  }
}

// Cleanup on process exit
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

