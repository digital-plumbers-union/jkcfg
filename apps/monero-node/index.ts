import { valuesForGenerate } from '@jkcfg/kubernetes/generate';
import { Monerod } from './lib';

/**
 * `jkcfg generate` friendly export, can provide parameters via command line
 */
export default valuesForGenerate(Monerod());

/**
 * Export for TypeScript/JavaScript consumers and other libraries rendered
 * via `jkcfg generate`
 */
export * from './lib';
