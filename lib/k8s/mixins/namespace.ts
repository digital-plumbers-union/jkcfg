import { commonMetadata } from '@jkcfg/kubernetes/transform';
import { KubernetesObject } from '../models';

export const addNamespace = (
  namespace: string
): ((r: KubernetesObject) => KubernetesObject) => commonMetadata({ namespace });
