import fs from 'fs';
import path from 'path';
import { sparqlEscapeUri, sparqlEscapeString } from 'mu';

/* eslint-disable-next-line no-extend-native */
String.prototype.replaceAll = function (from, to) {
  return this.split(from).join(to);
};

function constructListSubcaseQuery (batchSize, graph) {
  const p = path.resolve(__dirname, './queries/1-list-subcases.sparql');
  let query = fs.readFileSync(p, { encoding: 'utf8' });
  query = query.replace('# LIMIT_PLACEHOLDER', batchSize);
  query = query.replaceAll('# GRAPH_PLACEHOLDER', sparqlEscapeUri(graph));
  return query;
}

function constructSubmissionActivityQuery (submissionActivities) {
  const p = path.resolve(__dirname, './queries/2-submission-activity.sparql');
  let query = fs.readFileSync(p, { encoding: 'utf8' });
  let serializedValues = '';
  for (const submissionActivity of submissionActivities) {
    serializedValues += `(${sparqlEscapeUri(submissionActivity.uri)} ${sparqlEscapeString(submissionActivity.uuid)} ${sparqlEscapeUri(submissionActivity.subcaseUri)})\n            `;
  }
  query = query.replaceAll('# SUBMISSION_ACTIVITY_VALUES_PLACEHOLDER', serializedValues);
  return query;
}

export {
  constructListSubcaseQuery,
  constructSubmissionActivityQuery
};
