/**
 * Kubernetes Secret types.
 */
export enum SecretTypes {
  docker = 'kubernetes.io/dockercfg',
  saToken = 'kubernetes.io/service-account-token',
  opaque = 'Opaque',
  basicAuth = 'kubernetes.io/basic-auth',
}