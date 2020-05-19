import { commonMetadata } from '@jkcfg/kubernetes/transform';
import { KubernetesObject } from '../models';

export const addLabels = (labels: {
  [prop: string]: string;
}): ((r: KubernetesObject) => KubernetesObject) => commonMetadata({ labels });
