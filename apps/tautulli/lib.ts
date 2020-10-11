import {
  appNameSelector,
  Container,
  Deployment,
  finalize,
  KubernetesObject,
  PVC,
  svcPort,
} from '@dpu/jkcfg-k8s';
import {
  AssertIngressParameter,
  AssertPersistenceParameter,
} from '@dpu/jkcfg-k8s/parameters';
import * as k8s from '@jkcfg/kubernetes/api';
import { merge } from 'lodash-es';
import { Parameters, params } from './params';

export const tautulli = (p?: Partial<Parameters>) => {
  const {
    name,
    port,
    persistence,
    ingress,
    namespace,
    image,
    timezone,
  } = merge({}, params, p);

  AssertPersistenceParameter(persistence);

  const selector = appNameSelector(name);

  const pvc = PVC(name, {
    size: persistence.size,
    storageClass: persistence.storageClass,
  });

  const svc = new k8s.core.v1.Service(name, {
    spec: {
      ports: [svcPort(port)],
      // default behavior of App is to add standard kube app label with
      // string provided, so we can rely on that for the service selector
      selector,
    },
  });

  const deploy = Deployment(name, { labels: selector });
  deploy.addVolume(name);
  const serverContainer = Container({
    name,
    image,
    port,
    env: {
      TZ: timezone,
    },
    pvcs: [
      {
        mountPath: '/config',
        name,
      },
    ],
  });
  serverContainer.livenessProbe = {
    failureThreshold: 10000,
    httpGet: {
      path: '/',
      port,
    },
  };
  deploy.addContainer(serverContainer);

  const resources: KubernetesObject[] = [pvc, deploy.resource, svc];

  if (ingress.enabled) {
    AssertIngressParameter(ingress);
    const { annotations, host, tls } = ingress;
    resources.push(
      new k8s.extensions.v1beta1.Ingress(name, {
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
          tls: tls ? [{ hosts: [host], secretName: tls }] : [],
        },
      })
    );
  }

  return finalize(resources, { labels: selector, namespace });
};
