import {
  App,
  appNameSelector,
  Container,
  Deployment,
  image,
  name,
  VolumeTypes,
} from '@dpu/jkcfg-k8s';
import { String } from '@jkcfg/std/param';
import { isUndefined, merge } from 'lodash-es';

const params = {
  name: name('nfs-client-provisioner')!,
  image: image('vbouchaud/nfs-client-provisioner:latest')!,
  provisionerName: String('provisionerName'),
  nfs: {
    server: String('nfs.server'),
    path: String('nfs.path'),
  },
  serviceAccount: String('serviceAccount', 'nfs-client-provisioner'),
};

export const NfsClientProvisioner = (p: Partial<typeof params>) => {
  const { name, image, provisionerName, nfs } = merge(params, p);
  const app = App(name);
  const selector = appNameSelector(name);

  if (isUndefined(nfs.server)) throw new Error('server host must be set');
  const path = nfs.path || '/';
  const volName = 'nfs-client-root';

  const deploy = Deployment(name, { labels: selector });
  deploy.addVolume(volName, VolumeTypes.nfs, {
    server: nfs.server,
    path,
  });

  if (isUndefined(provisionerName)) {
    throw new Error('provisioner name must be set');
  }
  const container = Container({
    name,
    image,
    env: {
      PROVISIONER_NAME: provisionerName,
      NFS_SERVER: nfs.server,
      NFS_PATH: path,
    },
  });
  // TODO: handle container volume mounts more elegantly
  container.volumeMounts = [
    {
      name: volName,
      mountPath: '/persistentvolumes',
    },
  ];

  deploy.addContainer(container);

  // TODO: RBAC
  // const crName = 'nfs-client-provisioner-runner';
  // const cr = new k8s.rbac.v1.ClusterRole()
  app.add([storageClass(name, provisionerName)]);

  return app;
};

const storageClass = (name: string, provisioner: string) => ({
  apiVersion: 'storage.k8s.io/v1',
  kind: 'StorageClass',
  metadata: { name },
  provisioner,
  parameters: {
    archiveOnDelete: 'false',
  },
});
