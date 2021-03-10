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
- Bring the stack into a maintenance state
```
drc down
```
- Start the DB
```
drc up -d triplestore
```
- Start the migration
```
drc up -d submission-activity-migration
```
- Monitor the migration to make sure all goes well 
```
drc logs -f submission-activity-migration
```
- Wait for the migration to finish and take it down
```
drc down
```
- Remove the temporary entry in the docker-compose.override file