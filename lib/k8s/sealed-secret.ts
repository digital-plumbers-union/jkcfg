import { merge } from 'lodash-es';

const apiVersion = 'bitnami.com/v1alpha1';
const kind = 'SealedSecret';

interface SealedSecretOptions {
  encryptedData: any;
  template: {
    type?: 'string';
    metadata?: {
      labels?: { [prop: string]: string };
      annotations?: { [prop: string]: string };
    };
  };
}

const defaults = {
  encryptedData: {},
  template: {
    // todo: secret type enum
    type: 'Opaque',
  },
};

// TODO: have secret inherit labels of sealedsecret regardless
export const sealedSecret = (name: string, opts: SealedSecretOptions) => {
  const { encryptedData, template } = merge({}, defaults, opts);

  return {
    kind,
    apiVersion,
    metadata: { name },
    spec: { encryptedData, template },
  };
};
