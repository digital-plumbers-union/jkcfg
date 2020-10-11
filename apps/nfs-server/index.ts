import { valuesForGenerate } from '@jkcfg/kubernetes/generate';
import { NfsServer } from './lib';

/**
 * `jkcfg generate` friendly export, can provide parameters via command line
 */
export default valuesForGenerate(NfsServer());

/**
 * Export for TypeScript/JavaScript consumers and other libraries rendered
 * via `jkcfg generate`
 */
export * from './lib';
