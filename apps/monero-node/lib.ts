import {
  appNameSelector,
  Container,
  Deployment,
  finalize,
  KubernetesObject,
  metaLabels,
  PVC,
  sealedSecret,
  svcPort,
} from '@dpu/jkcfg-k8s';
import {
  AssertIngressParameter,
  AssertPersistenceParameter,
} from '@dpu/jkcfg-k8s/parameters';
import * as k8s from '@jkcfg/kubernetes/api';
import { merge } from 'lodash-es';
import { Parameters, params } from './params';

/**
 * Renders a deployable set of manifests for a Monero node.
 * @param p
 */
const Monerod = (p?: Partial<Parameters>): KubernetesObject[] => {
  const {
    name,
    namespace,
    ingress,
    persistence,
    port,
    image,
    sealedSecrets,
    secrets,
  } = merge({}, params, p);

  // verify required parameters
  AssertPersistenceParameter(persistence);

  const selector = appNameSelector(name);

  const createSecrets =
    (secrets.rpcCreds?.user && secrets.rpcCreds?.pass) || secrets.walletPass;

  const resources: KubernetesObject[] = [
    PVC(name, {
      size: persistence.size,
      storageClass: persistence.storageClass,
    }),
    new k8s.core.v1.Service(name, {
      spec: {
        ports: [svcPort(port)],
        // default behavior of App is to add standard kube app label with
        // string provided, so we can rely on that for the service selector
        selector,
      },
    }),
  ];

  if (createSecrets) {
    const secretData: { [prop: string]: string } = {};
    for (const secretName in secrets) {
      if (secrets[secretName] !== undefined) {
        secretData[secretName] = secrets[secretName];
      }
    }

    resources.push(
      sealedSecrets
        ? sealedSecret(name, {
            encryptedData: secretData,
            // ensures result secret is discoverable via app label
            // until sealed-secret module ensures secrets inherit labels
            template: { ...metaLabels(selector) },
          })
        : new k8s.core.v1.Secret(name, { stringData: secretData })
    );
  }

  const deploy = Deployment(name, { labels: selector });
  deploy.addVolume(name);
  const moneroContainer = Container({
    name,
    image,
    port,
    pvcs: [
      {
        name,
        mountPath: '/monero',
      },
    ],
    command: ['monerod'],
    args: [
      '--data-dir',
      '/monero',
      '--log-level',
      '0',
      '--non-interactive',
      '--rpc-bind-ip',
      '0.0.0.0',
      '--restricted-rpc',
      '--confirm-external-bind',
      '--block-sync-size',
      '100',
    ],
    resources: {
      limits: {
        memory: '2Gi',
      },
    },
  });
  if (createSecrets) moneroContainer.envFrom = [{ secretRef: { name } }];
  deploy.addContainer(moneroContainer);
  resources.push(deploy.resource);

  // ingress
  if (ingress.enabled) {
    AssertIngressParameter(ingress);
    const { annotations, host, tls } = ingress;
    const ing = new k8s.extensions.v1beta1.Ingress(name, {
      metadata: { annotations },
      spec: {
        rules: [
          {
            host,
            http: {
              paths: [
                {
                  path: '/',
                  backend: {
                    serviceName: name,
                    servicePort: port,
                  },
                },
              ],
            },
          },
        ],
        // TODO: refactor to use new ingress function
        tls: tls ? [{ hosts: [host], secretName: tls }] : [],
      },
    });
    resources.push(ing);
  }

  return finalize(resources, { labels: selector, namespace });
};

export { Monerod };
