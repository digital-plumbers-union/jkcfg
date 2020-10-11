import {
  Image,
  Ingress,
  IngressParameter,
  Name,
  Namespace,
  Persistence,
  PersistenceParameter,
  Port,
} from '@dpu/jkcfg-k8s/parameters';
import { Boolean, String } from '@jkcfg/std/param';

export interface Parameters {
  name: string;
  namespace: string;
  image: string;
  port: number;
  ingress: Partial<IngressParameter>;
  persistence: Partial<PersistenceParameter>;
  sealedSecrets: boolean;
  secrets: Partial<{
    walletPass: string;
    rpcCreds: {
      user: string;
      pass: string;
    };
  }>;
}

export const params: Parameters = {
  name: Name('monerod'),
  namespace: Namespace('monerod'),
  image: Image('xmrto/monero:v0.17.0.1'),
  port: Port(18081),
  ingress: Ingress(),
  persistence: Persistence('100Gi'),
  sealedSecrets: Boolean('sealedsecrets', false)!,
  secrets: {
    rpcCreds: {
      user: String('moneroduser')!,
      pass: String('monerodpass')!,
    },
  },
};
