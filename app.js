import {
  query,
  update,
  uuid,
  sparqlEscapeString,
  sparqlEscapeUri
} from 'mu';
import * as queries from './construct-queries';
import { parseSparqlResults } from './util';

const GRAPHS = [
  'http://mu.semte.ch/graphs/organizations/kanselarij',
  'http://mu.semte.ch/graphs/organizations/minister',
  'http://mu.semte.ch/graphs/organizations/intern-regering',
  'http://mu.semte.ch/graphs/organizations/intern-overheid',
  'http://mu.semte.ch/graphs/public'
];

const KANSELARIJ_GRAPH = GRAPHS[0];
const INDIENINGSACT_BASE_URI = 'http://kanselarij.vo.data.gift/id/indieningsactiviteiten/';

async function fetchSubcaseBatch (batchSize, graph) {
  const listSubcasesQuery = queries.constructListSubcaseQuery(batchSize, graph);
  const queryResult = parseSparqlResults(await query(listSubcasesQuery));
  return queryResult.map((r) => r.subcase);
}

async function migrateBatch (subcaseUri) {
  const actUuid = uuid();
  const actUri = INDIENINGSACT_BASE_URI + actUuid;
  const actTriples = [
    { s: sparqlEscapeUri(actUri), p: 'a', o: sparqlEscapeUri('http://mu.semte.ch/vocabularies/ext/Indieningsactiviteit') },
    { s: sparqlEscapeUri(actUri), p: sparqlEscapeUri('http://mu.semte.ch/vocabularies/core/uuid'), o: sparqlEscapeString(actUuid) }
  ];
  const queryString = queries.constructSubmissionActivityQuery(KANSELARIJ_GRAPH, subcaseUri, actUri, actTriples);
  await update(queryString);
}

// Begin execution here

const BATCH_SIZE = (process.env.BATCH_SIZE && parseInt(process.env.BATCH_SIZE)) || 200;

(async function () {
  console.log('Convert documents on subcase to submissionActivity');
  let i = 1;
  while (true) {
    console.log(`Batch ${i} ...`);
    const subcaseUris = await fetchSubcaseBatch(BATCH_SIZE, KANSELARIJ_GRAPH);
    for (const subcaseUri of subcaseUris) {
      await migrateBatch(subcaseUri);
    }
    i++;
    if (subcaseUris.length < BATCH_SIZE) {
      break;
    }
  }
}());
