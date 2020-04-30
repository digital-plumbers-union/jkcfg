import { Boolean, Number, Object, String } from '@jkcfg/std/param';
// separate imports due to bug in transform paths
import { StringObject } from '../models';

export const serviceAccount = (d?: string) => String('sa', d);

// TODO:
// come up with more elegant types, rather than
// using `!` to make result of $ParameterType() NonNullable

// These values always have defaults provided, so we modify their types
export const name = (d: string) => String('name', d)!;
export const namespace = (d = 'default') => String('namespace', d)!;
export const image = (d: string) => String('image', d)!;
export const port = (d: number) => Number('port', d)!;
export const timezone = (d: string = 'America/New_York') =>
  String('timezone', d)!;

export const ingress = {
  enabled: Boolean('ingress.enabled', false),
  annotations: Object('ingress.annotations', {}) as StringObject,
  tls: String('ingress.secret-name'),
  host: String('host'),
};

/**
 * @param size
 * @param storageClass
 */
export const persistence = (size?: string, storageClass?: string) => ({
  storageClass: String('persistence.storageClass', storageClass),
  size: String('persistence.size', size),
});
