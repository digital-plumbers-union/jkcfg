// import separately due to transform paths bug
import { App } from '@dpu/jkcfg-k8s/app';
import { Container } from '@dpu/jkcfg-k8s/container';
import { Deployment } from '@dpu/jkcfg-k8s/deployment';
import { Ingress } from '@dpu/jkcfg-k8s/ingress';
import { appNameSelector } from '@dpu/jkcfg-k8s/labels';
import addNamespace from '@dpu/jkcfg-k8s/mixins/namespace';
import { KubernetesObject } from '@dpu/jkcfg-k8s/models';
import {
  image,
  ingress,
  name,
  namespace,
  persistence,
  port,
} from '@dpu/jkcfg-k8s/parameters';
import { PVC } from '@dpu/jkcfg-k8s/pvc';
import { svcPort } from '@dpu/jkcfg-k8s/service';
import * as k8s from '@jkcfg/kubernetes/api';
import { String } from '@jkcfg/std/param';
import { isUndefined, merge } from 'lodash-es';

export const params = {
  name: name('syncthing'),
  namespace: namespace('syncthing'),
  persistence: persistence('500Gi'),
  ingress,
  image: image('linuxserver/syncthing'),
  ports: {
    web: port(8384),
    listening: port(22000),
    discovery: port(20127),
  },
  timezone: String('timezone', 'America/New_York')!,
  serviceType: String('serviceType', 'LoadBalancer')!,
};

const syncthing = (p: Partial<typeof params>) => {
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
  const app = App(name);

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
    const { annotations, host, tls } = ingress;
    if (isUndefined(host)) {
      throw new Error('Must specify host if ingress.enabled === true');
    }
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

  app.add(resources.map(addNamespace(namespace)));

  // ensure namespace is created if we arent installing to default ns
  if (namespace !== 'default') {
    app.add(new k8s.core.v1.Namespace(namespace));
  }

  return app;
};

export default syncthing;
