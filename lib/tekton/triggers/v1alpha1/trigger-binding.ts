import { StringObject, objToNameValue } from '@dpu/jkcfg-k8s';
import { resource } from './common';

export const triggerBinding = (name: string, opts: StringObject) => {
  return resource(name, 'TriggerBinding', {
    params: objToNameValue(opts),
  });
};
