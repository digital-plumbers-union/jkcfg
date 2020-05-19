import { V1ObjectMeta } from '@kubernetes/client-node';
import { merge } from 'lodash-es';
import { SecretTypes } from './secrets';

const apiVersion = 'bitnami.com/v1alpha1';
const kind = 'SealedSecret';

interface SealedSecretOptions {
  encryptedData: any;
  template: {
    type?: SecretTypes;
    metadata?: {
      labels?: { [prop: string]: string };
      annotations?: { [prop: string]: string };
    };
  };
  clusterWide?: boolean;
  namespaceWide?: boolean;
}

export enum SealedSecretAnnotations {
  clusterWide = 'sealedsecrets.bitnami.com/cluster-wide',
  namespaceWide = 'sealedsecrets.bitnami.com/namespace-wide',
}

const defaults = {
  encryptedData: {},
  template: {
    type: SecretTypes.opaque,
  },
};

// TODO: have secret inherit labels of sealedsecret regardless
export const sealedSecret = (name: string, opts: SealedSecretOptions) => {
  const { encryptedData, template } = merge({}, defaults, opts);
  const metadata: V1ObjectMeta = { name };

  if (opts.clusterWide) {
    metadata.annotations = {
      [SealedSecretAnnotations.clusterWide]: 'true',
    };
  }

  if (opts.namespaceWide) {
    metadata.annotations = {
      [SealedSecretAnnotations.namespaceWide]: 'true',
    };
  }

  return {
    kind,
    apiVersion,
    metadata,
    spec: { encryptedData, template },
  };
};
