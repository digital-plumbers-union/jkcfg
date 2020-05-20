import { resource } from './common';
import {
  KubernetesObject,
  NameValueObj,
  StringObject,
  objToNameValue,
} from '@dpu/jkcfg-k8s';

/**
 * Resource models
 */

/**
 * Supported resource types
 */
export enum ResourceTypes {
  git = 'git',
  image = 'image',
  pullRequest = 'pullRequest',
  cluster = 'cluster',
  storage = 'storage',
  cloudEvent = 'cloudEvent',
}

/**
 * Defines input/output PipelineResources declared as a requirement by another
 * type such as Task/Condition.  Not to be confused with `PipelineResource.spec`
 * as seen below *facepalm*
 */
export interface ResourceDeclaration {
  name?: string;
  type?: ResourceTypes;
  description?: string;
  targetPath?: string;
  optional?: boolean;
}

/**
 * Object representation of ResourceDeclaration Array
 */
export interface ResourceDeclarations {
  [prop: string]: ResourceDeclaration;
}

/**
 * Interface representing final shape of generated PipelineResource
 */
export interface PipelineResource extends KubernetesObject {
  spec: PipelineResourceSpec;
}

/**
 * PipelineSpec matching Tekton spec
 * https://github.com/tektoncd/pipeline/blob/fdbe7245299fd9be2e2bbdc74b351f0c3e95adad/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L95
 */
export interface PipelineResourceSpec {
  type?: ResourceTypes;
  params?: ResourceParameter[];
  secrets?: SecretParameter[];
  resourceRef?: StringObject;
}

/**
 * https://github.com/tektoncd/pipeline/blob/fdbe7245299fd9be2e2bbdc74b351f0c3e95adad/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L104
 */
interface SecretParameter {
  fieldName: string;
  secretKey: string;
  secretName: string;
}

/**
 * Connects a reference to a resource to a resource dependency
 * https://github.com/tektoncd/pipeline/blob/v0.10.1/pkg/apis/pipeline/v1alpha2/resource_types.go#L96
 *
 * TODO: move to pipeline-run, symmetric with task-run and TaskResourceBinding
 */
export interface PipelineResourceBinding {
  name?: string;
  resourceSpec?: PipelineResourceSpec;
  // simplify to string while keeping flexibility
  // https://github.com/tektoncd/pipeline/blob/v0.10.1/pkg/apis/pipeline/v1alpha2/resource_types.go#L118
  resourceRef?: string | { name: string };
}

/**
 * Object version of PipelineResourceBinding[]
 *
 * TODO: move to pipeline-run, symmetric with task-run and TaskResourceBinding
 */
export interface PipelineResourceBindings {
  [prop: string]: PipelineResourceBinding;
}

/**
 * Parameters that can be passed to a PipelineResource
 * Main difference between this and `ParameterValue` is that it does not accept
 * string arrays, only strings.
 */
export type ResourceParameter = NameValueObj<string>;

/**
 * Resource creation functions
 */

/**
 * Naive implementation of a `PipelineResource`.  Does not perform any
 * param or type validation.
 * @param name
 * @param type
 * @param params
 */
export const pipelineResource = (
  name: string,
  type: ResourceTypes,
  params: StringObject
): PipelineResource =>
  resource(name, 'PipelineResource', {
    type,
    params: objToNameValue(params),
  });
