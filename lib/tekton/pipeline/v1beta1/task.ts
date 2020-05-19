import { ResourceDeclarations, ResourceDeclaration } from '../v1alpha1/resource';
import { ParameterSpecs, ParameterSpec } from './param';
import { core } from '@jkcfg/kubernetes/api';
import { KubernetesObject, objToNamedObj } from '@dpu/jkcfg-k8s';
import { Workspaces, Workspace } from './workspace';
import { resource } from './common';
import { merge } from 'lodash-es';

/**
 * Resource models.
 */
const kind = 'Task';

/**
 * Defines Tekton spec for Task objects
 */
export interface Task extends KubernetesObject {
  spec: {
    steps: Step[];
    volumes?: core.v1.Volume[];
    params?: ParameterSpec[];
    resources?: {
      inputs?: ResourceDeclaration[];
      outputs?: ResourceDeclaration[];
    }
    stepTemplate?: core.v1.Container;
    workspaces?: Workspace[];
    sidecars?: core.v1.Container[];
    results?: TaskResult[];
  };
}

export interface TaskRef {
  name: string;
  kind: string;
  apiVersion?: string;
}

export const taskRef = (name: string, apiVersion?: string) => ({
  name,
  kind,
  apiVersion,
});

export interface TaskResult {
  name?: string;
  description?: string;
}

export interface TaskResults {
  [prop: string]: TaskResult;
}

/**
 * Basic shape of a Task step. It is either a script string with a name, or a
 * full blown Container spec.
 *
 * TODO: Provide some higher-level Container creation functions to make
 *       container creation less verbose / boilerplatey.
 */
export type Step =
  | core.v1.Container
  | {
      name?: string;
      script: string;
      volumeMounts?: core.v1.VolumeMount;
    };

/**
 * Simplified internal representation of what goes into a Task, leaning on
 * Objects over Arrays
 */
export interface TaskOptions {
  steps: Step[];
  volumes?: core.v1.Volume[];
  resources?: {
    inputs?: ResourceDeclarations;
    outputs?: ResourceDeclarations;
  },
  params?: ParameterSpecs;
  stepTemplate?: core.v1.Container;
  workspaces?: Workspaces;
  sidecars?: core.v1.Container[];
  results?: TaskResults;
}

/**
 * Resource creation functions
 */

/**
 * @param name
 * @param opts
 */
export const task = (name: string, opts: TaskOptions): Task =>
  resource(name, kind, taskSpec(opts));

export const taskSpec = (opts: TaskOptions): Task['spec'] => {
  const { steps, volumes, stepTemplate, sidecars } = opts;
  const spec: Task['spec'] = {
    steps,
    volumes,
    stepTemplate,
    sidecars,
  };

  if (opts.results) spec.results = objToNamedObj(opts.results);
  if (opts.params) spec.params = objToNamedObj(opts.params);

  spec.resources = merge({},
    opts.resources?.inputs ? { inputs: objToNamedObj(opts.resources.inputs) } : {},
    opts.resources?.outputs ? { outputs: objToNamedObj(opts.resources.outputs) } : {})

  if (opts.workspaces) spec.workspaces = objToNamedObj(opts.workspaces);

  return spec;
};
