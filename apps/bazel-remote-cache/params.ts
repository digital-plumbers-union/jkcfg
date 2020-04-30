import {
  image,
  ingress,
  name,
  namespace,
  persistence,
  port,
} from '@dpu/jkcfg-k8s';
import { String, Number } from '@jkcfg/std/param';

// Directly based on https://github.com/buchgr/bazel-remote#command-line-flags
export const params = {
  name: name('bazel-remote'),
  namespace: namespace('bazel-remote'),
  image: image('buchgr/bazel-remote-cache'),
  maxSize: Number('maxSize', 100)!,
  port: port(8080),
  htpasswd: String('htpasswd-secret'),
  ingress,
  persistence: persistence('100Gi')
};
