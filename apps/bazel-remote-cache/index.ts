import bazelremcache from './lib';
import { valuesForGenerate } from '@jkcfg/kubernetes/generate';

export default valuesForGenerate(bazelremcache());

// also import library for direct users
export * as bazelremcache from './lib';
