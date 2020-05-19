import { resource, apiGroup } from './common';
import { rbac } from '@jkcfg/kubernetes/shapes';
import { role, configViewerRule, roleBinding, roleRef } from '@dpu/jkcfg-k8s';

export interface EventListenerOptions {
  serviceAccount: string;
  triggers: {
    [prop: string]: {
      // TODO: implement proper types for interceptors
      interceptors?: any;
      bindings: string[];
      template: string;
    };
  };
}

export const eventListener = (name: string, opts: EventListenerOptions) => {
  const { serviceAccount, triggers } = opts;
  return resource(name, 'EventListener', {
    serviceAccountName: serviceAccount,
    triggers: Object.keys(triggers).map(key => ({
      interceptors: triggers[key].interceptors,
      bindings: Object.keys(triggers[key].bindings).map(binding => ({
        name: triggers[key].bindings[binding],
      })),
      template: { name: triggers[key].template },
    })),
  });
};

/**
 * Creates minimum Role and RoleBinding for EventListeners per official tekton
 * docs: https://github.com/tektoncd/triggers/blob/master/docs/eventlisteners.md#serviceaccountname
 * @param name Used for the Role name and the RoleBinding name.
 * @param saName
 */
export const eventListenerRBAC = (
  name: string,
  subjects: rbac.v1.Subject[]
) => [
  role(name, [
    configViewerRule,
    {
      apiGroups: [apiGroup],
      resources: ['eventlisteners', 'triggerbindings', 'triggertemplates'],
      verbs: ['get'],
    },
    {
      apiGroups: [apiGroup],
      resources: ['pipelineruns', 'pipelineresources', 'taskruns'],
      verbs: ['create'],
    },
  ]),
  roleBinding(name, roleRef('Role', name), subjects),
];

/**
 * Produces service name created for a given EventListener name.
 * @param name EventListener resource name
 */
export const svcName = (name: string) => `el-${name}`;