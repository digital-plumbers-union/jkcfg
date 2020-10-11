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

export interface Parameters {
  name: string;
  namespace: string;
  ingress: Partial<IngressParameter>;
  persistence: Partial<PersistenceParameter>;
  image: string;
  port: number;
  timezone: string;
}

export const params: Partial<Parameters> = {
  name: Name('tautulli'),
  namespace: Namespace('tautulli'),
  persistence: Persistence('1Gi'),
  ingress: Ingress(),
  image: Image('tautulli/tautulli'),
  port: Port(8181),
  timezone: Timezone('EST5EDT'),
};
