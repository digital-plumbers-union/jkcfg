import * as k8s from '@jkcfg/kubernetes/api';
import { assertEnvFromSource } from './assertions';
import { StringObject } from './models';

export interface ContainerOptions {
  image: string;
  name?: string;
  ports?: number[];
  port?: number;
  command?: string[];
  args?: string[];
  pvcs?: Array<{
    name: string;
    mountPath: string;
    volumeName?: string;
    subPath?: string;
  }>;
  envFrom?: Array<{
    secretRef?: string;
    configMapRef?: string;
    prefix?: string;
  }>;
  // TODO: should properly account for individual secret/cm keyrefs
  env?: StringObject;
  resources?: k8s.core.v1.ResourceRequirements;
  // TODO:
  // - handle secret/configmap volumes
}

export const Container = (opts: ContainerOptions) => {
  const {
    resources,
    ports,
    port,
    args,
    command,
    pvcs,
    envFrom,
    env,
    image,
    name,
  } = opts;

  const container = new k8s.core.v1.Container();
  container.image = image;
  container.imagePullPolicy = 'Always';

  if (name) container.name = name;
  // add port boilerplate
  if (ports && port) throw new Error('Dont provide both port and ports, dummy');
  if (port) container.ports = [{ containerPort: port }];
  if (ports) container.ports = ports.map(p => ({ containerPort: p }));
  if (command) container.command = command;
  if (args) container.args = args;
  // convert env from map to array
  if (env) {
    container.env = Object.keys(env).map(key => {
      return { name: key, value: env[key] };
    });
  }
  // inflate envFrom string references
  if (envFrom) {
    container.envFrom = envFrom.map((i: any) => {
      // TODO: make this less stupidly naive
      if (i.secretRef) i.secretRef = { name: i.secretRef };
      if (i.configMapRef) i.configMapRef = { name: i.configMapRef };
      assertEnvFromSource(i);
      return i;
    });
  }
  // wire up mounts, use pvc as name unless specific
  // volume name is given, this makes it easy if you name
  // the volume name on the pod the same name as the pvc
  if (pvcs) {
    container.volumeMounts = pvcs.map(pvc => ({
      name: pvc.volumeName || pvc.name,
      mountPath: pvc.mountPath,
      subPath: pvc.subPath,
    }));
  }
  if (resources) container.resources = resources;

  return container;
};
