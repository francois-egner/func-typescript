## [1.5.0] - 2025-06-16
### Modified
- `get`, `getOrElse`, `getOrElseGet`, `getOrElseThrow` will no longer rerun the entire steps chain and return the latest/cached result

## [1.4.0] - 2025-04-21
### Added
- `sequence` for running Tries returning an array with the results.

## [1.3.0] - 2025-04-17
### Added
- `andThenTry` and `andFinallyTry` for running side affect functions returning a `Try`

## [1.2.0] - 2025-04-14
### Added
- `filterTry` and `filterNotTry` for filtering based on a `Try` returning predicate function

## [1.1.1] - 2025-03-15
### Fixed
- Return type of consumer function of `peek`, `andThen`, `onSuccess`, `onFailure`, `andFinally` in the Try class
- Return type of `run` method in the Option class

## [1.1.0] - 2025-03-02
### Fixed
- run() will return Option instance being run