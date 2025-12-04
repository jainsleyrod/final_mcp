#!/usr/bin/env node

import { resetEnvironment } from './env_reset.js';
import { logStep } from './logger.js';
import type { AttackLogEntry } from './attack_types.js';

interface AttackConfig {
  id: string;
  variant: string;
  serverPath: string;
  modulePath: string;
}

const ATTACKS: AttackConfig[] = [
  {
    id: 'MCP-001',
    variant: 'server-code-leakage',
    serverPath: 'src/filesystem-server-code-leakage/index.ts',
    modulePath: '../attacks/MCP-001_server_code_leak',
  },
  {
    id: 'MCP-002',
    variant: 'hardcoded-secret-leak',
    serverPath: 'src/filesystem-hardcoded-secret-leak/index.ts',
    modulePath: '../attacks/MCP-002_hardcoded_secret',
  },
  {
    id: 'MCP-003',
    variant: 'excessive-exposure',
    serverPath: 'src/filesystem-excessive-data-exposure/index.ts',
    modulePath: '../attacks/MCP-003_excessive_exposure',
  },
];

async function runAllAttacks(): Promise<void> {
  let totalSteps = 0;
  let successfulSteps = 0;
  let failedSteps = 0;

  for (const attack of ATTACKS) {
    console.error(`\n[${attack.id}] Running attack: ${attack.variant}`);
    
    try {
      // Reset environment (spawn new server)
      const { client } = await resetEnvironment(attack.serverPath);
      console.error(`[${attack.id}] Server started, waiting for readiness...`);
      
      // Import and run the attack
      const attackModule = await import(attack.modulePath);
      if (typeof attackModule.runAttack !== 'function') {
        throw new Error(`Attack module ${attack.modulePath} does not export runAttack function`);
      }

      // Track steps for this attack
      let attackSteps = 0;
      let attackSuccess = 0;
      let attackFailed = 0;

      await attackModule.runAttack(client, (entry: AttackLogEntry) => {
        attackSteps++;
        totalSteps++;
        if (entry.success) {
          attackSuccess++;
          successfulSteps++;
        } else {
          attackFailed++;
          failedSteps++;
        }
        logStep(entry);
        console.error(`[${attack.id}] Step ${entry.step}: ${entry.success ? '✓' : '✗'} ${entry.request.method || JSON.stringify(entry.request).slice(0, 50)}`);
      });

      console.error(`[${attack.id}] Completed: ${attackSuccess}/${attackSteps} steps succeeded`);
    } catch (error) {
      console.error(`[${attack.id}] Error:`, error instanceof Error ? error.message : String(error));
      failedSteps++;
    }
  }

  // Print summary
  console.error('\n' + '='.repeat(50));
  console.error('ATTACK SUMMARY');
  console.error('='.repeat(50));
  console.error(`Total steps: ${totalSteps}`);
  console.error(`Successful: ${successfulSteps}`);
  console.error(`Failed: ${failedSteps}`);
  console.error('='.repeat(50));
}

runAllAttacks().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

