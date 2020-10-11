import { valuesForGenerate } from '@jkcfg/kubernetes/generate';
import NfsClientProvisioner from './lib';

/**
 * `jkcfg generate` friendly export, can provide parameters via command line
 */
export default valuesForGenerate(NfsClientProvisioner());

/**
 * Export for TypeScript/JavaScript consumers and other libraries rendered
 * via `jkcfg generate`
 */
export * from './lib';
