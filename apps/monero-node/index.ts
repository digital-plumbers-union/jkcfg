import {
  App,
  appNameSelector,
  Container,
  Deployment,
  image,
  ingress,
  metaLabels,
  name,
  namespace,
  persistence,
  port,
  PVC,
  sealedSecret,
  svcPort,
} from '@dpu/jkcfg-k8s';
import { addNamespace } from '@dpu/jkcfg-k8s/dist/mixins/namespace';
import * as k8s from '@jkcfg/kubernetes/api';
import { Boolean, String } from '@jkcfg/std/param';
import { isUndefined, merge } from 'lodash-es';

export const params = {
  name: name('monerod'),
  namespace: namespace('monerod'),
  image: image('xmrto/monero:v0.15.0.1'),
  port: port(18081),
  ingress,
  persistence: persistence('100Gi'),
  sealedSecrets: Boolean('sealedsecrets', true),
  secrets: {
    walletPass: String('walletpass'),
    rpcUser: String('moneroduser'),
    rpcPass: String('monerodpass'),
  },
};

const monerod = (p: Partial<typeof params>) => {
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
  const cmp = App(name);

  const selector = appNameSelector(name);
  const secretsEnabled =
    secrets.rpcPass || secrets.rpcUser || secrets.walletPass;

  const namespacedResources: any[] = [
    PVC(name, {
      // TODO: persistence.size has to be NonNulled via `!`
      size: persistence.size!,
      storageClass: persistence.storageClass!,
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

  if (secretsEnabled) {
    const secretData: { [prop: string]: string } = {};
    for (const secretName in secrets) {
      if (secrets[secretName] !== undefined) {
        secretData[secretName] = secrets[secretName];
      }
    }

    namespacedResources.push(
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
  if (secretsEnabled) moneroContainer.envFrom = [{ secretRef: { name } }];
  deploy.addContainer(moneroContainer);
  namespacedResources.push(deploy.resource);

  // ingress
  if (ingress.enabled) {
    const { annotations, host, tls } = ingress;
    // TODO: make this a function
    if (isUndefined(host)) {
      throw new Error('Host must be set if ingress.enabled is true');
    }
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
    namespacedResources.push(ing);
  }

  // add namespace to namespaced resources and add them to app
  cmp.add(namespacedResources.map(addNamespace(namespace)));

  // ensure namespace is created if we arent installing to default ns
  if (namespace !== 'default') {
    cmp.add(new k8s.core.v1.Namespace(name));
  }

  return cmp;
};

export default monerod;
