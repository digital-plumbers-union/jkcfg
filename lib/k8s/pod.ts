import * as k8s from '@jkcfg/kubernetes/api';
import { V1EnvVarSource } from '@kubernetes/client-node';
import { StringObject } from './models';

export interface V1EnvFromFieldRef {
  name: string;
  valueFrom: Pick<V1EnvVarSource, 'fieldRef'>;
}

export const podNamespace: V1EnvFromFieldRef = {
  name: 'POD_NAMESPACE',
  valueFrom: { fieldRef: { fieldPath: 'metadata.namespace' } },
};

/**
 * Create a pod security context already nested for Deployments/Daemonsets
 * @param securityContext
 */
export const podSecCtx = (
  securityContext: k8s.core.v1.PodSecurityContext
): Partial<k8s.apps.v1.Deployment> => ({
  spec: { template: { spec: { securityContext } } },
});

/**
 * Create a pod template mixin object with a node selector
 * @param nodeSelector
 */
export const podNodeSelector = (
  nodeSelector: StringObject
): Partial<k8s.apps.v1.Deployment> => ({
  spec: { template: { spec: { nodeSelector } } },
});
