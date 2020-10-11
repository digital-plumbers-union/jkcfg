import { Image, Name, Namespace } from '@dpu/jkcfg-k8s/parameters';
import { Boolean, String } from '@jkcfg/std/param';

export interface Parameters {
  name: string;
  namespace: string;
  image: string;
  sealedSecrets: boolean;
  spotifyDeviceName: string;
  deviceName: string;
  bitrate: string;
  username?: string;
  password?: string;
}

export const params: Parameters = {
  name: Name('spotifyd'),
  namespace: Namespace('spotifyd'),
  image: Image('ggoussard/spotifyd'),
  sealedSecrets: Boolean('sealedsecrets', false)!,
  spotifyDeviceName: String('spotifyDeviceName', 'ichabod')!,
  deviceName: String('deviceName', 'snd_usb_audio')!,
  bitrate: String('bitrate', '320')!,
  username: String('username'),
  password: String('password'),
};
