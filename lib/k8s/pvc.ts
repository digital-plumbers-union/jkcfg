import * as k8s from '@jkcfg/kubernetes/api';

export interface PVCOptions {
  size: string;
  storageClass: string;
  accessMode?: 'ReadWriteOnce' | 'ReadWriteMany';
}

export const PVC = (name: string, opts: PVCOptions) => {
  const { accessMode, size, storageClass } = opts;
  return new k8s.core.v1.PersistentVolumeClaim(name, {
    spec: {
      accessModes: [accessMode || 'ReadWriteOnce'],
      resources: { requests: { storage: size } },
      storageClassName: storageClass,
    },
  });
};
