import { ResourceDeclarations, ResourceDeclaration } from './resource';
import { ParameterSpecs, ParameterSpec } from './param';
import { core } from '@jkcfg/kubernetes/api';
import { KubernetesObject, objToNamedObj } from '@dpu/jkcfg-k8s';
import { Workspaces, Workspace } from './workspace';
import { resource } from './common';
import { TaskRef, taskRef, Step } from '../v1beta1/task';

export { TaskRef, taskRef, Step };

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
    inputs?: TaskInputs;
    outputs?: TaskOutputs;
    stepTemplate?: core.v1.Container;
    workspaces?: Workspace[];
    sidecars?: core.v1.Container[];
  };
}

interface TaskInputs {
  resources?: ResourceDeclaration[];
  params?: ParameterSpec[];
}

interface TaskOutputs {
  resources?: ResourceDeclaration[];
}

/**
 * Simplified internal representation of what goes into a Task, leaning on
 * Objects over Arrays
 */
export interface TaskOptions {
  steps: Step[];
  volumes?: core.v1.Volume[];
  inputs?: {
    resources?: ResourceDeclarations;
    params?: ParameterSpecs;
  };
  outputs?: {
    resources?: ResourceDeclarations;
  };
  stepTemplate?: core.v1.Container;
  workspaces?: Workspaces;
  sidecars?: core.v1.Container[];
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

  if (opts.inputs) spec.inputs = {};
  if (opts.inputs?.params) {
    // TODO: could use assertions to avoid all of these !s
    spec.inputs!.params = objToNamedObj(opts.inputs.params);
  }
  if (opts.inputs?.resources) {
    spec.inputs!.resources = objToNamedObj(opts.inputs.resources);
  }

  if (opts.outputs && opts.outputs.resources) {
    spec.outputs = { resources: objToNamedObj(opts.outputs.resources) };
  }

  if (opts.workspaces) spec.workspaces = objToNamedObj(opts.workspaces);

  return spec;
};
