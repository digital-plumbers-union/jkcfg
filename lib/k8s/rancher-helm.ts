import { Format, stringify } from '@jkcfg/std';

const apiVersion = 'helm.cattle.io/v1';
const kind = 'HelmChart';

interface HelmChartSpec {
  chart: string;
  set?: { [prop: string]: any };
  valuesContent?: { [prop: string]: any };
}

interface HelmChartReference {
  name: string;
  version: string;
  repository?: string;
}
/**
 * Builds a Helm Chart URL for you based on reference parameters.
 * Useful if you are baking Helm Chart URLs into Helm Operator CRDs,
 * e.g., the rancher helm operator
 *
 * Example reference: https://kubernetes-charts.storage.googleapis.com/nextcloud-1.9.1.tgz
 * @param opts
 */
export const HelmChartURL = (opts: HelmChartReference) => {
  const defaults = {
    repository: 'https://kubernetes-charts.storage.googleapis.com',
  };
  const ref = {
    ...defaults,
    ...opts,
  };
  if (ref.repository.endsWith('/')) {
    ref.repository = ref.repository.slice(0, ref.repository.length - 1);
  }
  return `${ref.repository}/${ref.name}-${ref.version}.tgz`;
};

/**
 * Extra garbage shim to let me wrangle a half-ass piece of technology.
 *
 * Don't care because as soon as I have time I'm re-implementing all my Helm
 * stuff as @jkcfg
 */
export const HelmChart = (
  name: string,
  spec: HelmChartSpec,
  namespace = 'default'
) => {
  const { chart, set, valuesContent } = spec;
  return {
    kind,
    apiVersion,
    metadata: {
      name,
      namespace,
    },
    spec: {
      chart,
      set,
      valuesContent: stringify(valuesContent, Format.YAML),
    },
  };
};
