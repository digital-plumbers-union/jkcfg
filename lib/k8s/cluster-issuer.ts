const apiVersion = 'cert-manager.io/v1alpha2';
const kind = 'ClusterIssuer';

interface ClusterIssuerOptions {
  name: string;
  email: string;
  server: string;
  privateKeySecretRef: {
    name: string;
  };
}

/**
 * Only supports ACME at the moment.
 * @param opts
 */
export const ClusterIssuer = (opts: ClusterIssuerOptions) => {
  const { name, email, server, privateKeySecretRef } = opts;

  return {
    apiVersion,
    kind,
    metadata: {
      name,
    },
    spec: {
      acme: {
        email,
        server,
        privateKeySecretRef,
        solvers: [
          {
            http01: { ingress: {} },
          },
        ],
      },
    },
  };
};

export const StagingAcme = (
  name: string,
  secretName: string,
  email: string
) => {
  return ClusterIssuer({
    name,
    email,
    server: 'https://acme-staging-v02.api.letsencrypt.org/directory',
    privateKeySecretRef: {
      name: secretName,
    },
  });
};

export const ProductionAcme = (
  name: string,
  secretName: string,
  email: string
) => {
  return ClusterIssuer({
    name,
    email,
    server: 'https://acme-v02.api.letsencrypt.org/directory',
    privateKeySecretRef: {
      name: secretName,
    },
  });
};
