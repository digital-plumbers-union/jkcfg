import * as k8s from '@jkcfg/kubernetes/api';
import { StringObject } from './models';

export interface IngressOptions {
  annotations?: StringObject;
  labels?: StringObject;
  hosts: Hosts;
  tls?: StringObject;
}

type Options = IngressOptions;

interface BackendService {
  serviceName: string;
  servicePort: number;
}

const isBackendService = (val: any): val is BackendService =>
  val.serviceName && val.servicePort ? true : false;

/**
 * An extremely naive representation of an Ingress Host object
 */
interface Hosts {
  [prop: string]: {
    // a single backend can be provided for all paths
    paths:
      | {
          [prop: string]: BackendService;
        }
      | { backend: BackendService };
  };
}

export const Ingress = (name: string, opts: Options) => {
  const { annotations, labels, hosts, tls } = opts;
  const ing = new k8s.extensions.v1beta1.Ingress(name, {
    spec: {
      rules: Object.keys(hosts).map(key => {
        const host = {
          host: key,
          http: {
            // some type shenanigans that wll allow you to specify backend
            // services that apply to all paths
            paths:
              hosts[key].paths.backend &&
              isBackendService(hosts[key].paths.backend)
                ? [hosts[key].paths as { backend: BackendService }]
                : Object.keys(hosts[key].paths).map(pathKey => ({
                    path: pathKey,
                    backend: {
                      serviceName: hosts[key].paths[pathKey].serviceName,
                      servicePort: hosts[key].paths[pathKey].servicePort,
                    },
                  })),
          },
        };
        return host;
      }),
    },
  });

  if (tls) {
    ing.spec!.tls = Object.keys(tls).map(key => ({
      hosts: [key],
      secretName: tls[key],
    }));
  }
  if (annotations) ing.metadata!.annotations = annotations;
  if (labels) ing.metadata!.labels = labels;

  return ing;
};
