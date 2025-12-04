import { Readable, Writable } from 'stream';

export interface MCPClient {
  sendRequest(method: string, params?: any): Promise<any>;
  sendNotification(method: string, params?: any): void;
}

interface PendingRequest {
  id: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export function makeClient(stdout: Readable, stdin: Writable): MCPClient {
  let requestId = 1;
  const pendingRequests = new Map<number, PendingRequest>();
  let buffer = '';

  // Read from stdout (server responses)
  stdout.on('data', (chunk: Buffer) => {
    buffer += chunk.toString('utf-8');
    
    // Process complete JSON-RPC messages (lines ending with \n)
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const message = JSON.parse(line);
        
        // Handle JSON-RPC response
        if (message.id !== undefined && pendingRequests.has(message.id)) {
          const pending = pendingRequests.get(message.id)!;
          pendingRequests.delete(message.id);
          
          if (message.error) {
            pending.reject(new Error(message.error.message || JSON.stringify(message.error)));
          } else {
            pending.resolve(message.result);
          }
        }
      } catch (error) {
        // Ignore parse errors for non-JSON lines (like server logs)
      }
    }
  });

  return {
    sendRequest: (method: string, params?: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        const id = requestId++;
        const request = {
          jsonrpc: '2.0',
          id,
          method,
          params: params || {},
        };

        pendingRequests.set(id, { id, resolve, reject });
        
        const message = JSON.stringify(request) + '\n';
        stdin.write(message, 'utf-8', (error) => {
          if (error) {
            pendingRequests.delete(id);
            reject(error);
          }
        });
      });
    },
    sendNotification: (method: string, params?: any): void => {
      const notification = {
        jsonrpc: '2.0',
        method,
        params: params || {},
      };
      const message = JSON.stringify(notification) + '\n';
      stdin.write(message, 'utf-8');
    },
  };
}

export async function waitForMCPReady(client: MCPClient, timeout: number = 5000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      // Try to initialize the MCP connection
      await client.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'attack-runner',
          version: '1.0.0',
        },
      });
      
      // Send initialized notification (no response expected)
      client.sendNotification('notifications/initialized', {});
      
      return;
    } catch (error) {
      // Wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  throw new Error('MCP server did not become ready within timeout');
}

