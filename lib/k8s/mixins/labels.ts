import { merge } from 'lodash-es';
import { KubernetesObject } from '../models';

export const addLabels = (labels: { [prop: string]: string }) => (
  r: KubernetesObject
) => {
  return merge({}, r, { metadata: labels });
};
