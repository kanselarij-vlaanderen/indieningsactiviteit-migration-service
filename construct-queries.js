import fs from 'fs';
import path from 'path';
import { sparqlEscapeUri } from 'mu';

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

function constructSubmissionActivityQuery (graph, subcaseUri, submissionActivityUri, submissionActivityTriples) {
  const p = path.resolve(__dirname, './queries/2-submission-activity.sparql');
  let query = fs.readFileSync(p, { encoding: 'utf8' });
  query = query.replaceAll('# SUBCASE_PLACEHOLDER', sparqlEscapeUri(subcaseUri));
  query = query.replaceAll('# SUBMISSION_ACTIVITY_PLACEHOLDER', sparqlEscapeUri(submissionActivityUri));
  let serializedTriples = '';
  for (const trip of submissionActivityTriples) {
    serializedTriples += `${trip.s} ${trip.p} ${trip.o} .\n            `;
  }
  query = query.replaceAll('# SUBMISSION_ACTIVITY_TRIPLES_PLACEHOLDER', serializedTriples);
  return query;
}

export {
  constructListSubcaseQuery,
  constructSubmissionActivityQuery
};
