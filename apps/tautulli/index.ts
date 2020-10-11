import { valuesForGenerate } from '@jkcfg/kubernetes/generate';
import { tautulli } from './lib';

/**
 * `jkcfg generate` friendly export, can provide parameters via command line
 */
export default valuesForGenerate(tautulli());

/**
 * Export for TypeScript/JavaScript consumers and other libraries rendered
 * via `jkcfg generate`
 */
export * from './lib';
