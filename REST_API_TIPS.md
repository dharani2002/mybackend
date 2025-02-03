# REST api best practices

## naming and url structure

* use nouns to reprsent resources eg. /items
* use plural nouns for collections
* use hyphens for readability
* avoid going deeper than collection/resource/collection
* do not mirror database structure 

## versioning
* always version APIs to prevent breaking changes

## Data Handling
* implement pagination for large datasets
* use cursor based pagination (previous/next)

## API Operations
* use status code 202 for async operations, says the operation is accepted but not copleted
* use 204 for successfull empty repsonses
* use OpenAPI for API documentation