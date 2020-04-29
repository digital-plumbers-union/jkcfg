import * as k8s from '@jkcfg/kubernetes/api';
import { Format, stringify } from '@jkcfg/std';
import { isUndefined } from 'lodash-es';
import { metaLabels, selector } from './label-selectors';
import { VolumeOptions, VolumeTypes } from './models';

interface DeploymentOptions {
  replicas?: number;
  // TODO: fully support set-based reqs
  labels: { [prop: string]: string };
}

export const Deployment = (name: string, opts: DeploymentOptions) => {
  const { replicas, labels } = opts;

  // Create base object
  const deployment = new k8s.apps.v1.Deployment(name, {
    spec: {
      ...selector(labels, true),
      replicas: replicas || 1,
      template: {
        ...metaLabels(labels),
      },
    },
  });

  // initialize containers and volumes
  deployment.spec!.template!.spec = {
    containers: [],
    volumes: [],
  };
  const addContainer = (container: k8s.core.v1.Container) =>
    deployment.spec!.template!.spec!.containers!.push(container);

  const volumes = deployment.spec!.template!.spec.volumes;

  /**
   * Possibly stupid utility function that allows for adding Volumes with
   * minimal boilerplate, based on type of Volume.  Where possible, `name` will
   * be used to point to the Volume source identifier, e.g., PVC, Secret, CM
   * @param name
   * @param type
   * @param opts
   */
  const addVolume = (
    name: string,
    type: VolumeTypes = VolumeTypes.pvc,
    opts?: VolumeOptions
  ) => {
    if (type === VolumeTypes.configMap || type === VolumeTypes.secret) {
      const vol: any = { name };
      // SecretVolumeSource and ConfigMapVolumeSource use different names
      // for some reason
      if (type === VolumeTypes.configMap) vol.configMap = { name };
      if (type === VolumeTypes.secret) vol.secret = { secretName: name };

      if (opts) {
        if (!isItemOpts(opts)) {
          throw new Error(
            `Unexpected options type given for Volume type ${type}`
          );
        }
        // add items to correct key
        vol.configMap
          ? (vol.configMap.items = opts.items)
          : (vol.secret.items = opts.items);
      }

      volumes!.push(vol);
      return;
    }

    if (type === VolumeTypes.pvc) {
      volumes!.push({ name, persistentVolumeClaim: { claimName: name } });
      return;
    }

    if (type === VolumeTypes.hostPath) {
      assertHostPathOptions(opts);
      volumes!.push({ name, hostPath: opts });
      return;
    }

    throw new Error(`${type} is not implemented yet : D`);
  };

  // leave resource for backwards compatibility for now
  const resource = deployment;

  return {
    deployment,
    resource,
    addContainer,
    addVolume,
  } as const;
};

function isItemOpts(val: any): val is { items?: k8s.core.v1.KeyToPath[] } {
  if (val.items) return true;
  return false;
}

function assertHostPathOptions(
  val: any
): asserts val is k8s.core.v1.HostPathVolumeSource {
  if (isUndefined(val) || isUndefined(val.path)) {
    throw new Error(
      `Invalid HostPathSourceVolume: ${stringify(val, Format.JSON)}`
    );
  }
}
