import {
  query,
  update,
  uuid
} from 'mu';
import * as queries from './construct-queries';
import { parseSparqlResults } from './util';

if (process.env.DRY_RUN === 'true') {
  update = console.log;
}

const KANSELARIJ_GRAPH = 'http://mu.semte.ch/graphs/organizations/kanselarij';
const INDIENINGSACT_BASE_URI = 'http://kanselarij.vo.data.gift/id/indieningsactiviteiten/';

async function fetchSubcaseBatch (batchSize, graph) {
  const listSubcasesQuery = queries.constructListSubcaseQuery(batchSize, graph);
  const queryResult = parseSparqlResults(await query(listSubcasesQuery));
  return queryResult.map((r) => r.subcase);
}

async function migrateBatch (subcaseUris) {
  const submissionActivities = [];
  for (var subcaseUri of subcaseUris) {
    const activity = {
      uuid: uuid(),
      subcaseUri
    };
    activity.uri = INDIENINGSACT_BASE_URI + activity.uuid;
    submissionActivities.push(activity);
  }
  const queryString = queries.constructSubmissionActivityQuery(submissionActivities);
  await update(queryString);
}

// Begin execution here

const BATCH_SIZE = (process.env.BATCH_SIZE && parseInt(process.env.BATCH_SIZE)) || 200;

(async function () {
  console.log('Convert documents on subcase to submissionActivity');
  let i = 1;
  while (true) {
    const subcaseUris = await fetchSubcaseBatch(BATCH_SIZE, KANSELARIJ_GRAPH);
    if (!subcaseUris.length) {
      break;
    }
    console.log(`Batch ${i} ...`);
    await migrateBatch(subcaseUris);
    i++;
  }
}());
