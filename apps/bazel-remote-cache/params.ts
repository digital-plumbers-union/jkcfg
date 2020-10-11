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
import { Number, String } from '@jkcfg/std/param';

export interface Parameters {
  name: string;
  namespace: string;
  image: string;
  maxSize: number;
  port: number;
  htpasswd: string | undefined;
  ingress: IngressParameter;
  persistence: PersistenceParameter;
}

// Directly based on https://github.com/buchgr/bazel-remote#command-line-flags
export const params: Parameters = {
  name: Name('bazel-remote'),
  namespace: Namespace('bazel-remote'),
  image: Image('buchgr/bazel-remote-cache'),
  maxSize: Number('maxSize', 100)!,
  port: Port(8080),
  htpasswd: String('htpasswd-secret'),
  ingress: Ingress(),
  persistence: Persistence('100Gi'),
};
