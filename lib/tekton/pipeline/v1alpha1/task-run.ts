import { Parameters, ParameterValue } from './param';
import { Task, TaskRef, TaskOptions } from './task';
import { taskRef, taskSpec } from './task';
import { Workspace, Workspaces } from './workspace';
import { core } from '@jkcfg/kubernetes/api';
import { KubernetesObject, objToNamedObj, objToNameValue } from '@dpu/jkcfg-k8s';
import { apiVersion } from './common';
import { TaskResourceBinding, TaskResourceBindings } from '../v1beta1/task-run';

/**
 * Resource models
 */

/**
 * Define Tekton spec for TaskRun objects
 */
export interface TaskRun extends KubernetesObject {
  spec: {
    inputs?: TaskRunInputs;
    outputs?: TaskRunOutputs;
    taskRef?: TaskRef;
    taskSpec?: Task['spec'];
    serviceAccountName?: string;
    // TODO: add specific types for this
    // https://github.com/tektoncd/pipeline/blob/v0.10.1/pkg/apis/pipeline/v1alpha1/taskrun_types.go#L24
    status?: any;
    timeout?: string;
    podTemplate?: core.v1.PodSpec;
    workspaces?: Workspace[];
  };
}

interface TaskRunInputs {
  resources?: TaskResourceBinding[];
  params?: ParameterValue[];
}

interface TaskRunOutputs {
  resources?: TaskResourceBinding[];
}

/**
 * Simplified internal representation of what goes into a TaskRun, leaning on
 * Objects over Arrays
 */
export interface TaskRunOptions {
  inputs?: {
    resources?: TaskResourceBindings;
    params?: Parameters;
  };
  outputs?: {
    resources?: TaskResourceBindings;
  };
  serviceAccount?: string;
  taskRef?: string;
  taskSpec?: TaskOptions;
  timeout?: string;
  podTemplate?: core.v1.PodSpec;
  workspaces?: Workspaces;
}

/**
 * Resource creation functions
 */

export const taskRun = (name: string, opts: TaskRunOptions): TaskRun => {
  const spec: TaskRun['spec'] = {};
  if (opts.podTemplate) spec.podTemplate = opts.podTemplate;
  if (opts.serviceAccount) spec.serviceAccountName = opts.serviceAccount;
  if (opts.taskRef) spec.taskRef = taskRef(opts.taskRef);
  if (opts.taskSpec) spec.taskSpec = taskSpec(opts.taskSpec);
  if (opts.timeout) spec.timeout = opts.timeout;
  if (opts.workspaces) spec.workspaces = objToNamedObj(opts.workspaces);

  if (opts.inputs) spec.inputs = {};
  if (opts.inputs?.params) {
    // TODO: figure out why I need to cast this and resolve types more
    //       elegantly.  should be able to do the same thing as ./resource.ts#107
    spec.inputs!.params = objToNameValue(
      opts.inputs.params
    ) as ParameterValue[];
  }
  if (opts.inputs?.resources) {
    spec.inputs!.resources = objToNamedObj(opts.inputs.resources);
  }

  if (opts.outputs && opts.outputs.resources) {
    spec.outputs = { resources: objToNamedObj(opts.outputs.resources) };
  }

  return {
    apiVersion,
    kind: 'TaskRun',
    metadata: { generateName: name.endsWith('-') ? name : `${name}-` },
    spec,
  };
};
