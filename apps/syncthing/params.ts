import {
  Image,
  Ingress,
  IngressParameter,
  Name,
  Namespace,
  Persistence,
  PersistenceParameter,
  Port,
  Timezone,
} from '@dpu/jkcfg-k8s/parameters';
import { String } from '@jkcfg/std/param';

export interface Parameters {
  name: string;
  namespace: string;
  ingress: Partial<IngressParameter>;
  persistence: Partial<PersistenceParameter>;
  image: string;
  ports: {
    web: number;
    listening: number;
    discovery: number;
  };
  timezone: string;
  serviceType: string;
}

export const params: Parameters = {
  name: Name('syncthing'),
  namespace: Namespace('syncthing'),
  persistence: Persistence('500Gi'),
  ingress: Ingress(),
  image: Image('linuxserver/syncthing'),
  ports: {
    web: Port(8384),
    listening: Port(22000),
    discovery: Port(20127),
  },
  timezone: Timezone(),
  serviceType: String('serviceType', 'LoadBalancer')!,
};
