import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const MUST_ADD_WORKFLOW_FOR_BRANCH = 'MUST_ADD_WORKFLOW_FOR_BRANCH';
export const WORKFLOW_NOT_FOUND = 'WORKFLOW_NOT_FOUND';
export const WORKFLOW_DOES_EXIST = 'WORKFLOW_DOES_EXIST';
export const BRANCH_HAVE_A_WORKFLOW = 'BRANCH_HAVE_A_WORKFLOW';

export type TWorkflowErrorCodeKey =
  | typeof MUST_ADD_WORKFLOW_FOR_BRANCH
  | typeof WORKFLOW_NOT_FOUND
  | typeof WORKFLOW_DOES_EXIST
  | typeof BRANCH_HAVE_A_WORKFLOW;
export type TWorkflowErrorCode = Record<TWorkflowErrorCodeKey, TErrorCodeValue>;

// 133000 - 134000
export const WorkflowValidation: TWorkflowErrorCode = {
  MUST_ADD_WORKFLOW_FOR_BRANCH: createErrorCode(
    133000,
    'Must add workflow for branch',
  ),
  WORKFLOW_NOT_FOUND: createErrorCode(133001, 'Workflow not found'),
  WORKFLOW_DOES_EXIST: createErrorCode(133002, 'Workflow does exist'),
  BRANCH_HAVE_A_WORKFLOW: createErrorCode(
    133003,
    'Branch have a workflow, can not add',
  ),
};
