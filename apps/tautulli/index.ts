import { App } from '@dpu/jkcfg-k8s/app';
import { Container } from '@dpu/jkcfg-k8s/container';
import { Deployment } from '@dpu/jkcfg-k8s/deployment';
import { appNameSelector } from '@dpu/jkcfg-k8s/labels';
import addNamespace from '@dpu/jkcfg-k8s/mixins/namespace';
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
  name: name('tautulli'),
  port: port(8181),
  namespace: namespace('default'),
  image: image('tautulli/tautulli'),
  ingress,
  persistence: persistence('1Gi'),
  timezone: String('timezone', 'EST5EDT')!,
};

const tautulli = (p: Partial<typeof params>) => {
  const {
    name,
    port,
    persistence,
    ingress,
    namespace,
    image,
    timezone,
  } = merge({}, params, p);

  const cmp = App(name);
  const selector = appNameSelector(name);

  const pvc = PVC(name, {
    size: persistence.size!,
    storageClass: persistence.storageClass!,
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

  const namespacedResources: any[] = [pvc, deploy.resource, svc];

  if (ingress.enabled) {
    const { annotations, host, tls } = ingress;
    // TODO: make this a function
    if (isUndefined(host)) {
      throw new Error('Host must be set if ingress.enabled is true');
    }
    namespacedResources.push(
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

  cmp.add([pvc, deploy.resource, svc].map(addNamespace(namespace)));

  if (namespace !== 'default') cmp.add(new k8s.core.v1.Namespace(namespace));

  return cmp;
};

// export finalized array that can be used by jkcfg directly if i want
export default tautulli;

// also export app itself so that top-level cluster files can import and
// make necessary modifications
