import { Boolean, Number, Object, String } from '@jkcfg/std/param';
// separate imports due to bug in transform paths
import { StringObject } from '../models';

/**
 * General jkcfg parameters for common differences across app installs
 */

// TODO:
// come up with more elegant types, rather than
// using `!` to make result of $ParameterType() NonNullable

/**
 * These values always have defaults provided, so we modify their types
 */

/**
 * Creates jkcfg String parameter for an applicaiton's name (this will
 * influence generated labels, resource names, etc) with the default value
 * provided.
 * @param d the default value
 */
export const Name = (d: string) => String('name', d)!;

/**
 * Creates jkcfg String parameter for an application's namespace with the
 * default value provided.
 * @param d the default value
 */
export const Namespace = (d = 'default') => String('namespace', d)!;

/**
 * Creates jkcfg String parameter for an application's container iamge with the
 * default value provided.
 * @param d the default value
 */
export const Image = (d: string) => String('image', d)!;

/**
 * Creates jkcfg Number parameter for an application's port with the default
 * value provided.
 * @param d the default value
 */
export const Port = (d: number) => Number('port', d)!;

/**
 * Creates jkcfg String parameter with the default value provided.
 * @param d the default value
 */
export const Timezone = (d: string = 'America/New_York') =>
  String('timezone', d)!;

/**
 * Ingress
 */

/**
 * Interface representing jkcfg parameters
 */
export interface IngressParameter {
  enabled: boolean | undefined;
  annotations: StringObject | undefined;
  tls: string | undefined;
  host: string | undefined;
}

export const Ingress = (params?: IngressParameter): IngressParameter => ({
  enabled: Boolean('ingress.enabled', params?.enabled || false),
  annotations: Object('ingress.annotations', params?.annotations || {}) as
    | StringObject
    | undefined,
  tls: String('ingress.secret-name', params?.tls || undefined),
  host: String('host', params?.host || undefined),
});

/**
 * Persistence / PVCs
 */

export interface PersistenceParameter {
  storageClass: string | undefined;
  size: string | undefined;
}

/**
 * @param size
 * @param storageClass
 */
export const Persistence = (
  size?: string,
  storageClass?: string
): PersistenceParameter => ({
  storageClass: String('persistence.storageClass', storageClass),
  size: String('persistence.size', size),
});
