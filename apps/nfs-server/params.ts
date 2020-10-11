import { StringObject } from '@dpu/jkcfg-k8s';
import { Image, Name, Namespace, Port } from '@dpu/jkcfg-k8s/parameters';
import { Number, Object, String } from '@jkcfg/std/param';

export interface Parameters {
  name: string;
  namespace: string;
  image: string;
  clusterIP: string;
  port: number;
  servicePort?: number;
  serviceType: string;
  hostPath: string;
  nodeSelector?: StringObject;
  replicas: number;
}

export const params: Parameters = {
  name: Name('nfs-server'),
  namespace: Namespace('default'),
  image: Image('itsthenetwork/nfs-server-aslpine:latest-arm'),
  clusterIP: String('clusterIP', '10.43.217.217')!,
  port: Port(2049),
  servicePort: Number('servicePort'),
  serviceType: String('serviceType', 'LoadBalancer')!,
  hostPath: String('hostPath')!,
  nodeSelector: Object('nodeSelector')! as StringObject,
  replicas: Number('replicas', 1)!,
};
