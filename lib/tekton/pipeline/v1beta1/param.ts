import { NameValueObj } from '@dpu/jkcfg-k8s';

export type ParameterType = 'string' | 'array';

/**
 * Generic Parameter shape, used when creating entities like Tasks and
 * Conditions.
 *
 * Type defaults to 'string' if not provided.
 */
export interface ParameterSpec {
  name?: string;
  type?: ParameterType;
  description?: string;
  default?: string | string[];
}

/**
 * Object representation of ParameterSpec Array
 */
export interface ParameterSpecs {
  [prop: string]: ParameterSpec;
}

/**
 * Represents a concrete value which would be passed to an entity (task,
 * clustertask, or condition) when creating runs.
 *
 * e.g., Defining your data as `Parameters` and mutating into proper end value:
 * ```
 * params: Parameters = {
 *  foo: 'bar',
 *  far: ['hi', 'hello']
 * }
 * ```
 * -->
 * ```
 * params:
 * - name: foo
 *   value: bar
 * - name: far
 *   value: ['hi', 'hello']
 * ```
 *
 * This is intended to be used for strongly typed return types, not parameter
 * types.  `Parameters` makes more sense for parameter types.
 */
export type ParameterValue = NameValueObj<string | string[]>;

/**
 * Object representation of multiple ParameterValues
 */
export interface Parameters {
  [prop: string]: string | string[];
}
