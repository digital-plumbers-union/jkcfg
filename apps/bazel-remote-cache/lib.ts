import {
  appNameSelector,
  Container,
  Deployment,
  finalize,
  KubernetesObject,
  PVC,
  StringObject,
  svcPort,
  VolumeTypes,
} from '@dpu/jkcfg-k8s';
import {
  AssertIngressParameter,
  AssertPersistenceParameter,
} from '@dpu/jkcfg-k8s/parameters';
import * as k8s from '@jkcfg/kubernetes/api';
import { merge } from 'lodash-es';
import { Parameters, params } from './params';

const htpasswdMountDir = '/secrets';
const htpasswdPath = `${htpasswdMountDir}/.htpasswd`;
const cacheMount = '/data';

const BazelRemoteCache = (p?: Partial<Parameters>): KubernetesObject[] => {
  const {
    name,
    namespace,
    ingress,
    persistence,
    port,
    image,
    htpasswd,
    maxSize,
  } = merge({}, params, p || {});

  // assert required settings/parameters
  AssertPersistenceParameter(persistence);

  const selector = appNameSelector(name);

  const pvc = PVC(name, {
    size: persistence.size,
    storageClass: persistence.storageClass,
  });

  const svc = new k8s.core.v1.Service(name, {
    spec: {
      ports: [svcPort(port)],
      selector,
    },
  });

  const env: StringObject = {
    BAZEL_REMOTE_MAX_SIZE: String(maxSize),
  };

  if (htpasswd) env.BAZEL_REMOTE_HTPASSWD_FILE = htpasswdPath;

  const deploy = Deployment(name, { labels: selector });
  deploy.addVolume(name);
  if (htpasswd) deploy.addVolume(htpasswd, VolumeTypes.secret);
  const serverContainer = Container({
    name,
    image,
    port,
    env,
    pvcs: [
      {
        mountPath: cacheMount,
        name,
      },
    ],
  });
  deploy.addContainer(
    merge(
      serverContainer,
      htpasswd
        ? {
            // have to re-add PVC volumeMount because otherwise it would be clobbered
            // here -- should resolve that more robustly
            volumeMounts: [
              { name: htpasswd, mountPath: htpasswdMountDir },
              { name, mountPath: cacheMount },
            ],
          }
        : {}
    )
  );

  const resources: KubernetesObject[] = [pvc, svc, deploy.deployment];

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

export { BazelRemoteCache };
