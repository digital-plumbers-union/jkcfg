import { apiGroup, resource as factory } from '../../common';

export const apiVersion = `${apiGroup}/v1beta1`;

/**
 * Makes it easy to write Tekton CRD objects
 * @param name
 * @param kind
 * @param spec
 */
export const resource = (name: string, kind: string, spec: any) =>
  factory(name, kind, spec, apiVersion);
