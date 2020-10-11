import {
  appNameSelector,
  Container,
  Deployment,
  finalize,
  KubernetesObject,
  svcPort,
  VolumeTypes,
} from '@dpu/jkcfg-k8s';
import * as k8s from '@jkcfg/kubernetes/api';
import { merge } from 'lodash-es';
import { Parameters, params } from './params';

export const nfsServer = (p?: Partial<Parameters>): KubernetesObject[] => {
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

  return finalize([svc, deploy.resource], { labels: selector, namespace });
};
