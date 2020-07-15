import * as k8s from '@jkcfg/kubernetes/api';
import { isArray, isObject, isString, isUndefined } from 'lodash-es';
import { KubernetesObject } from './models';

export function assertKubeObj(val: any): asserts val is KubernetesObject {
  if (!isObject(val) && (!val.kind || !val.metadata || !val.apiVersion)) {
    throw new Error(`${val} is expected to be a valid Kubernetes Object`);
  }
}

export function assertKubeObjArray(
  val: any
): asserts val is Array<KubernetesObject> {
  if (!isArray(val)) {
    throw new Error(`${val} is expected to be an array`);
  }
  val.forEach(assertKubeObj);
}

export function assertEnvFromSource(
  val: any
): asserts val is k8s.core.v1.EnvFromSource {
  if (isUndefined(val)) {
    throw new Error('EnvFromSource must be defined, received undefined');
  }
  if (val.configMapRef && val.secretRef) {
    throw new Error(
      'EnvFromSource must not specify both configMapRef and secretRef'
    );
  }
  const keys = Object.keys(val).filter(key => key === 'prefix');
  if (keys.length !== 1) {
    throw new Error(`EnvFromSource has too many keys: ${keys}`);
  }
  const ref = keys.pop()!;
  if (!val[ref].name) {
    throw new Error(`EnvFromSource has no name defined on ref: ${val[ref]}`);
  }
  if (!isString(val[ref].name)) {
    throw new Error('EnvFromSource name must be a string');
  }
}
