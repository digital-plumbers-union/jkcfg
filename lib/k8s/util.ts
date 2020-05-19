import * as k8s from '@jkcfg/kubernetes/api';
import { commonMetadata } from '@jkcfg/kubernetes/transform';
import { KubernetesObject, StringObject, NamedObj } from './models';

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

/**
 * Easily turn objects into arrays where the original key name is now `name:`
 * and the value is now `value:`
 *
 * e.g, { foo: bar } => [{ name: foo, value: bar }]
 *
 * @param obj
 */
export const objToNameValue = (
  obj: { [prop: string]: any },
  valueKeyName = 'value'
) => Object.keys(obj).map(key => ({ name: key, [valueKeyName]: obj[key] }));

/**
 * Easily turn objects into arrays of objects that have a `name` field based on
 * their original key name.  Contents of obj[key] are spread alongside name.
 * @param obj
 */
export const objToNamedObj = <T = NamedObj>(obj: {
  [prop: string]: any;
}): T[] => Object.keys(obj).map(key => ({ name: key, ...obj[key] }));

/**
 * Turns ['name1', 'name2', 'name3' ] => [{ name: name1, ... }]
 * @param arr
 */
export const arrToNamedObj = (arr: string[]) => arr.map(name => ({ name }));
