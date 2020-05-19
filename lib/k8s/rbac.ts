import { V1PolicyRule, V1RoleRef } from '@kubernetes/client-node';
import * as shapes from '@jkcfg/kubernetes/shapes';
import * as api from '@jkcfg/kubernetes/api';

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

export const role = (name: string, rules: shapes.rbac.v1.PolicyRule[]) => {
  return new api.rbac.v1.Role(name, { rules });
};

export const configViewerRule: shapes.rbac.v1.PolicyRule = {
  apiGroups: [''],
  resources: ['configmaps'],
  verbs: ['get', 'list', 'watch'],
};

export const configViewerRole = (name = 'config-viewer', secrets = false) => {
  const obj = role(name, [configViewerRule]);
  if (secrets) obj.rules![0].resources?.push('secrets');
  return obj;
};

export const roleBinding = (
  name: string,
  roleRef: shapes.rbac.v1.RoleRef,
  subjects: shapes.rbac.v1.Subject[]
) => {
  return new api.rbac.v1.RoleBinding(name, { roleRef, subjects });
};
