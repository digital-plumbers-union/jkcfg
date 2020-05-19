import * as k8s from '@jkcfg/kubernetes/api';
import * as shapes from '@jkcfg/kubernetes/shapes';
import { arrToNamedObj } from './util';

export interface ServiceAccountOptions {
  secrets?: string[];
  imagePullSecrets?: string[];
}

type Options = ServiceAccountOptions;

export const serviceAccount = (name: string, opts: Options) => {
  const { secrets, imagePullSecrets } = opts;
  const spec: Partial<shapes.core.v1.ServiceAccount> = {};
  if (secrets) spec.secrets = arrToNamedObj(secrets);
  if (imagePullSecrets) spec.imagePullSecrets = arrToNamedObj(imagePullSecrets);

  return new k8s.core.v1.ServiceAccount(name, spec);
};
