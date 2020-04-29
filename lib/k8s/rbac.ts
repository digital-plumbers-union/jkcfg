import { V1PolicyRule, V1RoleRef } from '@kubernetes/client-node';

interface Rule {
  apiGroups?: string[];
  resourceNames?: string[];
  resources: string[];
  verbs: string[];
}

export const rule = (r: Rule): V1PolicyRule => {
  const defaults = {
    apiGroups: [''],
  };
  return {
    ...defaults,
    ...r,
  };
};

export const roleRef = (
  kind: string,
  name: string,
  apiGroup?: string
): V1RoleRef => {
  return {
    apiGroup: apiGroup || 'rbac.authorization.k8s.io',
    kind,
    name,
  };
};
