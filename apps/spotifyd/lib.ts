// import separately due to transform paths bug
import {
  appNameSelector,
  Container,
  Deployment,
  finalize,
  KubernetesObject,
  sealedSecret as SealedSecret,
  VolumeTypes,
} from '@dpu/jkcfg-k8s';
import * as k8s from '@jkcfg/kubernetes/api';
import { merge } from 'lodash-es';
import { Parameters, params } from './params';

const spotifyd = (p?: Partial<Parameters>) => {
  const {
    name,
    namespace,
    image,
    spotifyDeviceName,
    deviceName,
    bitrate,
    username,
    password,
    sealedSecrets,
  } = merge({}, params, p || {});
  const selector = appNameSelector(name);

  if (username && !password) {
    throw new Error('Must specify password with username');
  }

  const { deployment, addVolume, addContainer } = Deployment(name, {
    labels: selector,
  });
  // mount /usr/share/alsa
  addVolume('alsa', VolumeTypes.hostPath, { path: '/usr/share/alsa' });
  // mount /dev/snd
  addVolume('snd', VolumeTypes.hostPath, { path: '/dev/snd' });
  // add secret if credentials are provided
  if (password) addVolume(name, VolumeTypes.secret);
  addContainer(
    merge(
      Container({
        name,
        image,
        command: ['spotifyd'],
        // log to stdout
        args: [
          '--verbose',
          '--no-daemon',
          '--device-name',
          spotifyDeviceName,
          '--device',
          deviceName,
          '--bitrate',
          bitrate,
          // add creds parameters if provided
        ].concat(
          password
            ? ['--username', username!, '--password-cmd', 'cat /creds/password']
            : []
        ),
        // need to set shell to ensure password-cmd works correctly
        // https://github.com/Spotifyd/spotifyd#shell-used-to-run-commands-indicated-by-password_cmd-or-on_song_changed_hook-
        env: password
          ? {
              SHELL: 'sh',
            }
          : undefined,
      }),
      // mount hostpath to /usr/share/alsa and /dev/snd
      {
        volumeMounts: [
          { name: 'alsa', mountPath: '/usr/share/alsa' },
          { name: 'snd', mountPath: '/dev/snd' },
          // add secret if creds are provided
        ].concat(password ? [{ name, mountPath: '/creds' }] : []),
      },
      // run as privileged
      {
        securityContext: { privileged: true },
      }
    )
  );

  // mixin pod-level security declarations
  merge(
    deployment,
    // spotifyd seems to fail if it cant operate on the host network
    { spec: { template: { spec: { hostNetwork: true } } } }
  );

  const resources: KubernetesObject[] = [deployment];

  if (password) {
    const secret = sealedSecrets
      ? SealedSecret(name, {
          encryptedData: { password },
          template: {
            metadata: { labels: selector },
          },
        })
      : new k8s.core.v1.Secret(name, {
          stringData: { password: password! },
        });

    resources.push(secret);
  }

  // run through finalize even though it is just one resource so that the
  // namespace is still conditionally created
  return finalize(resources, { labels: selector, namespace });
};

export default spotifyd;
