import { valuesForGenerate } from '@jkcfg/kubernetes/generate';
import { bzlremcache } from './lib';

export default valuesForGenerate(bzlremcache());

// also import library for direct users
export * from './lib';
