import { merge } from 'lodash-es';
import { KubernetesObject } from '../models';

export const addNamespace = (namespace: string) => (r: KubernetesObject) => {
  return merge({}, r, { metadata: { namespace } });
};
