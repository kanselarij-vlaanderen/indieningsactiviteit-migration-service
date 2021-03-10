# Indieningsactiviteit migration

Adds a single submission activity to all subcases that are related to at least one document, transferring the relationship `subcase`-`document` to the submission activity.

## Docker compose snippet

Add to `docker-compose.override.yml` (build  locally as it is a temporary service)
```yml
submission-activity-migration:
  build: https://github.com/kanselarij-vlaanderen/indieningsactiviteit-migration-service.git
  environment:
    BATCH_SIZE: 1
  links:
    - triplestore:database

```

## Configuration
The query batch size can be configured through the `BATCH_SIZE` env var, but testing has shown that the query runs best with a batch size of 1.

## Running instructions
1. Bring the stack into a maintenance state
```
drc down
```
2. Start the DB
```
drc up triplestore
```
3. Start the migration
```
drc up submission-activity-migration
```
4. Wait for the migration to finish and take it down
```
drc down
```
5. Remove the temporary entry in the docker-compose.override file