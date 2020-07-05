import {
  image,
  ingress,
  name,
  namespace,
  persistence,
  port,
  StringObject,
} from '@dpu/jkcfg-k8s';
import { Number, String } from '@jkcfg/std/param';

export interface Parameters {
  name: string;
  namespace: string;
  image: string;
  maxSize: number;
  port: number;
  htpasswd: string | undefined;
  // TODO: make these shareable interfaces
  ingress: {
    enabled: boolean | undefined;
    annotations: StringObject | undefined;
    tls: string | undefined;
    host: string | undefined;
  };
  persistence: { storageClass: string | undefined; size: string | undefined };
}

// Directly based on https://github.com/buchgr/bazel-remote#command-line-flags
export const params: Parameters = {
  name: name('bazel-remote'),
  namespace: namespace('bazel-remote'),
  image: image('buchgr/bazel-remote-cache'),
  maxSize: Number('maxSize', 100)!,
  port: port(8080),
  htpasswd: String('htpasswd-secret'),
  ingress,
  persistence: persistence('100Gi'),
};
