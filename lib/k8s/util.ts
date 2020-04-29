import * as k8s from '@jkcfg/kubernetes/api';
import { commonMetadata } from '@jkcfg/kubernetes/transform';
import { KubernetesObject, StringObject } from './models';

interface CommonMetadata {
  labels?: null | StringObject;
  annotations?: null | StringObject;
  namespace?: null | string;
}

/**
 * A helper function that allows you to create a series of manifests for an app
 * and then add common labels as well as creating a namespace, only if needed
 * @param resources
 * @param meta
 */
export const finalize = (
  resources: KubernetesObject[],
  meta: CommonMetadata = { labels: null, annotations: null, namespace: null }
) =>
  resources
    .map(commonMetadata(meta))
    .concat(
      meta.namespace === 'default'
        ? []
        : new k8s.core.v1.Namespace(meta.namespace!)
    );
