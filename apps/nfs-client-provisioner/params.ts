import { Image, Name, Namespace } from '@dpu/jkcfg-k8s/parameters';
import { String } from '@jkcfg/std/param';

export interface Parameters {
  name: string;
  namespace: string;
  image: string;
  provisionerName: string;
  nfs: {
    server: string;
    path: string;
  };
  serviceAccount: string;
}

export const params: Partial<Parameters> = {
  name: Name('nfs-client-provisioner'),
  namespace: Namespace('nfs-client-provisioner'),
  image: Image('vbouchaud/nfs-client-provisioner:latest'),
  provisionerName: String('provisionerName', 'nfs-provisioner')!,
  nfs: {
    server: String('nfs.server')!,
    path: String('nfs.path', '/')!,
  },
  serviceAccount: String('serviceAccount', 'nfs-client-provisioner'),
};
