import {
  App,
  appNameSelector,
  Container,
  Deployment,
  image,
  name,
  namespace,
  port,
  svcPort,
  VolumeTypes,
} from '@dpu/jkcfg-k8s';
import { addNamespace } from '@dpu/jkcfg-k8s/mixins/namespace';
import * as k8s from '@jkcfg/kubernetes/api';
import { Number, Object, String } from '@jkcfg/std/param';
import { merge } from 'lodash-es';

export const params = {
  name: name('nfs-server'),
  namespace: namespace('default'),
  image: image('itsthenetwork/nfs-server-alpine:latest-arm'),
  clusterIP: String('clusterIP', '10.43.217.217')!,
  port: port(2049),
  servicePort: Number('servicePort'),
  serviceType: String('serviceType', 'LoadBalancer')!,
  hostPath: String('hostPath'),
  nodeSelector: Object('nodeSelector', {}),
  replicas: Number('replicas', 1)!,
};

const nfsServer = (p: Partial<typeof params>) => {
  const {
    name,
    namespace,
    image,
    clusterIP,
    port,
    servicePort,
    hostPath,
    nodeSelector,
    serviceType,
    replicas,
  } = merge({}, params, p);
  const app = App(name);
  const selector = appNameSelector(name);

  const svc = new k8s.core.v1.Service(name, {
    spec: {
      clusterIP,
      ports: [svcPort(servicePort ? servicePort : port, { targetPort: port })],
      selector,
      type: serviceType,
    },
  });

  const deploy = Deployment(name, { labels: selector, replicas });
  const volumeName = 'host-path';
  const mountPath = '/share';
  // TODO: make `type: 'Directory'` default
  deploy.addVolume(volumeName, VolumeTypes.hostPath, {
    path: hostPath,
    type: 'Directory',
  });
  const serverContainer = Container({
    name,
    image,
    port,
    env: {
      SHARED_DIRECTORY: mountPath,
    },
  });
  // TODO: container cant handle non-PVC volumeMounts
  serverContainer.volumeMounts = [
    {
      mountPath,
      name: volumeName,
    },
  ];
  serverContainer.securityContext = {
    capabilities: {
      add: ['SYS_ADMIN', 'SETPCAP', 'SYS_RESOURCE', 'DAC_READ_SEARCH'],
    },
  };
  deploy.addContainer(serverContainer);
  if (nodeSelector) {
    // TODO: more poor types from parameters
    deploy.deployment.spec!.template!.spec!.nodeSelector = nodeSelector as {
      [prop: string]: string;
    };
  }

  app.add([svc, deploy.deployment].map(addNamespace(namespace)));

  if (namespace !== 'default') {
    app.add(new k8s.core.v1.Namespace(namespace));
  }

  return app.resources;
};

export default nfsServer;
