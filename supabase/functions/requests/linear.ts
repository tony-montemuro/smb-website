/* ===== IMPORTS ===== */
import { SITE_URL } from "./constants.ts";
import type {
  IssueCreateInput,
  LinearConfig,
  Requester,
  RequestParams,
} from "./types.ts";

/* ===== FUNCTIONS ===== */

// FUNCTION 1: buildIssueInput - function that generates the input of the `issueCreate` mutation from a request
// PRECONDITIONS (3 parameters):
// 1.) params: the parameters of the request, already validated
// 2.) requester: the profile which the request is attributed to
// 3.) config: the workspace coordinates of the tracker
// POSTCONDITIONS (1 possible outcome):
// the input of the mutation is returned, whose description carries the request, followed by the identity of the requester
export const buildIssueInput = (
  params: RequestParams,
  requester: Requester,
  config: LinearConfig,
): IssueCreateInput => {
  const labelId = params.type === "bug"
    ? config.bugLabelId
    : config.featureLabelId;

  // the issue is created by the owner of the api key, so without this block, nothing in the tracker says who asked for it
  const attribution =
    `Submitted by [${requester.username}](${SITE_URL}/user/${requester.id}).`;

  return {
    title: params.title,
    description: `${params.description}\n\n---\n\n${attribution}`,
    teamId: config.teamId,
    projectId: config.projectId,
    labelIds: [labelId],
  };
};
