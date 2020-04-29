/**
 * Taken from https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/#labels
 */
export enum AppLabels {
  Name = 'app.kubernetes.io/name',
  Instance = 'app.kubernetes.io/instance',
  Version = 'app.kubernetes.io/version',
  Component = 'app.kubernetes.io/component',
  PartOf = 'app.kubernetes.io/part-of',
  ManagedBy = 'app.kubernetes.io/managed-by',
}

/**
 * Create standard app name label object to use for selectors.
 * @param name App name
 */
export const appNameSelector = (name: string): { [prop: string]: string } => ({
  [AppLabels.Name]: name,
});

/**
 * Taken from
 * https://github.com/rancher/k3s/blob/756a7f106987806c1e64bdf9cc29e505ebabf27b/pkg/cloudprovider/instances.go#L13
 */
export enum K3s {
  InternalIp = 'k3s.io/internal-ip',
  ExternalIp = 'k3s.io/external-ip',
  Hostname = 'k3s.io/hostname',
}
