/**
 * Common constants, functions, types used across all Tekton libraries.
 */
export const apiGroup = 'tekton.dev';
export const apiVersion = `${apiGroup}/v1alpha1`;

/**
 * Makes it easy to write Tekton CRD objects
 * @param name
 * @param kind
 * @param spec
 */
export const resource = (
  name: string,
  kind: string,
  spec: any,
  apiVersion: string
) => ({
  apiVersion,
  kind,
  metadata: { name },
  spec,
});
