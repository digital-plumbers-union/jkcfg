import { core, meta } from '@jkcfg/kubernetes/api';
import { isEmpty } from 'lodash-es';

export interface StringObject {
  [prop: string]: string;
}
export type Selector = StringObject | SetBasedSelector;
export interface MatchExpression {
  key: string;
  operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist';
  values?: string[];
}
export interface SetBasedSelector {
  matchLabels: { [prop: string]: string };
  matchExpressions: Array<MatchExpression>;
}

export function isMatchExpression(val: any): asserts val is MatchExpression {
  if (
    (val.operator === 'NotIn' || val.operator === 'In') &&
    isEmpty(val.values)
  ) {
    throw new Error(
      'MatchExpression must provide non-empty value if operator is "In" or "NotIn"'
    );
  }
}

export interface KubernetesObject {
  apiVersion?: string;
  kind?: string;
  metadata?: meta.v1.ObjectMeta;
  spec?: any;
}

export interface NamedObj {
  name: string;
  [prop: string]: any;
}

export interface NameValueObj<T> {
  name: string;
  value: T;
}

export enum VolumeTypes {
  pvc = 'persistentVolumeClaim',
  nfs = 'nfs',
  configMap = 'configMap',
  secret = 'secret',
  emptyDir = 'emptyDir',
  hostPath = 'hostPath',
}

// Partial overrides allow me to incrementally customize options to
// reduce (too much) boilerplate without limiting use of options we haven't
// implemented customizations for
export type VolumeOptions =
  | core.v1.PersistentVolumeClaimVolumeSource
  | core.v1.NFSVolumeSource
  | { items?: core.v1.KeyToPath[] }
  | core.v1.EmptyDirVolumeSource
  | core.v1.HostPathVolumeSource;
