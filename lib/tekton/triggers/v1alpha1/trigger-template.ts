import { resource } from './common';
import { objToNamedObj } from '@dpu/jkcfg-k8s';
import { ParameterSpecs } from '../../pipeline/v1beta1/param';

/**
 *
 * @param name
 * @param params
 * @param resourcetemplates Array of Tekton resources templates, not validated
 *                          until trigger activation time
 */
export const triggerTemplate = (
  name: string,
  params: ParameterSpecs,
  resourcetemplates: any[]
) =>
  resource(name, 'TriggerTemplate', {
    params: objToNamedObj(params),
    resourcetemplates,
  });
