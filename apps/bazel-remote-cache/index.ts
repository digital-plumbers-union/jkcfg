import { bzlremcache } from './lib';
import { valuesForGenerate } from '@jkcfg/kubernetes/generate';

export default valuesForGenerate(bzlremcache());

// also import library for direct users
export * from './lib';
