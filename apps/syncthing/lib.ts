// import separately due to transform paths bug
import {
  appNameSelector,
  Container,
  Deployment,
  finalize,
  Ingress,
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

const Syncthing = (p?: Partial<Parameters>) => {
  const {
    name,
    namespace,
    ingress,
    image,
    persistence,
    ports,
    timezone,
    serviceType,
  } = merge({}, params, p);

  AssertPersistenceParameter(persistence);

  const selector = appNameSelector(name);

  const resources: KubernetesObject[] = [];

  resources.push(
    PVC(name, {
      size: persistence.size!,
      storageClass: persistence.storageClass!,
      accessMode: 'ReadWriteMany',
    })
  );

  const deploy = Deployment(name, { labels: selector });
  deploy.addVolume(name);
  deploy.addContainer(
    Container({
      name,
      image,
      ports: [ports.web, ports.listening, ports.discovery],
      env: {
        TZ: timezone,
      },
      pvcs: [
        {
          name,
          mountPath: '/config',
          subPath: 'config',
        },
        {
          name,
          mountPath: '/data',
          subPath: 'data',
        },
      ],
    })
  );
  resources.push(deploy.resource);

  resources.push(
    new k8s.core.v1.Service(name, {
      spec: {
        ports: [
          svcPort(ports.web),
          svcPort(ports.listening, { name: 'sync' }),
          svcPort(ports.discovery, { name: 'discovery' }),
        ],
        selector,
        type: serviceType,
      },
    })
  );

  if (ingress.enabled) {
    AssertIngressParameter(ingress);
    const { annotations, host, tls } = ingress;
    resources.push(
      Ingress(name, {
        annotations,
        hosts: {
          [host]: {
            paths: {
              backend: {
                serviceName: name,
                servicePort: ports.web,
              },
            },
          },
        },
        tls: tls
          ? {
              [host]: tls,
            }
          : {},
      })
    );
  }

  return finalize(resources, { labels: selector, namespace });
};

export { Syncthing };
