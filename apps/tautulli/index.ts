import {
  App,
  appNameSelector,
  Container,
  Deployment,
  image,
  ingress,
  name,
  namespace,
  persistence,
  port,
  PVC,
  svcPort,
} from '@dpu/jkcfg-k8s';
import { addNamespace } from '@dpu/jkcfg-k8s/dist/mixins/namespace';
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

  cmp.add(namespacedResources.map(addNamespace(namespace)));

  if (namespace !== 'default') cmp.add(new k8s.core.v1.Namespace(namespace));

  return cmp;
};

// export finalized array that can be used by jkcfg directly if i want
export default tautulli;

// also export app itself so that top-level cluster files can import and
// make necessary modifications
