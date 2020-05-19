import { ParameterSpecs, ParameterValue } from './param';
import { resource } from './common';
import { Step } from './task';
import { ResourceDeclarations, ResourceDeclaration } from '../v1alpha1/resource';
import { KubernetesObject, objToNamedObj } from '@dpu/jkcfg-k8s';

export interface Condition extends KubernetesObject {
  spec: ConditionSpec;
}

export interface ConditionSpec {
  params?: ParameterValue[];
  resources?: ResourceDeclaration[];
  check: Step;
  description?: string;
}

export interface ConditionOptions {
  params?: ParameterSpecs;
  resources?: ResourceDeclarations;
  check: Step;
  description?: string;
}

export const condition = (name: string, opts: ConditionOptions) => {
  const { params, resources, check, description } = opts;
  const spec: ConditionSpec = { check };

  if (params) spec.params = objToNamedObj(params);
  if (resources) spec.resources = objToNamedObj(resources);
  if (description) spec.description = description;

  return resource(name, 'Condition', spec);
};
