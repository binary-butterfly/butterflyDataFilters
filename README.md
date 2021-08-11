# butterflyDataFilters

A simple library for data filtering in JavaScript.

## Motivation

We needed a simple, yet expandable way to filter locally cached data in a single page application.  
Because we did not find anything that was simple enough while also meeting all of our needs, we wrote a quick
script to do so.

Since this script is not too specific for the application it was written for, we decided to share it with
the open source community in hopes that someone else may benefit from it as well.

## How does it work?

For direct examples, check out src/__tests__/filterHelper.jest.js since it shows all ways the filters can be used.

* Install the library using `npm save --dev butterfly-data-filters`
* Add `import {applyFilters} from 'butterfly-data-filters';` where you want to use the filters
  * You can also import `availableFilterTypes`, which is a list of all types supported.
    * This list may be useful for validation before calling the filters or within React PropTypes
* Build your filters like in the examples below and combine them into a single array
* Call `applyFilters(filters, values, skipUndefined)`
  * If `skipUndefined` is false, only datasets that contain all fields that your filter apply to will be returned

### Substring filters

In order to filter your dataset for values that contain a certain substring, you will have to format your 
filters like so:
``` 
{
    'field': 'searchField',
    'type': 'string',
    'value': 'substring',
},
```

### Array filters

In order to filter your dataset for a list of values, you can use array filters:
```
{
  'field': 'searchField',
  'type': 'array',
  'value': ['honk', 'goose'],
},
```

This filter will return all datasets where `searchField` is either `honk` or `goose`.  
You can also pass `['_any']` as value to get all datasets and effectively skip this filter.  
This is useful as a default value when you don't know what the possible filter options are in advance.

### Date filters
There are a number of filters that allow you to search for datasets with specific date values.  
In general, these can be called with either a properly formatted string (a string that `new Date()` understands) or a 
vanillaJS `Data` object as value.

#### minDate
This filter will return any datasets where the search field date is after the specified one.
```
{
  'field': 'searchField',
  'type': 'minDate',
  'value': '2021-01-01',
}
```

#### maxDate
This filter will return any datasets where the search field date is before the specified one.
```
{
  'field': 'searchField',
  'type': 'maxDate',
  'value': '2021-01-01',
}
```

#### dateRange
This filter lets you specify different date ranges to search for.  
You may use one of the following date range presets:
* today
* yesterday
* 7days (the last week)
* month (the current month)
* last_month

Or a custom range like this:
```
{
  'field': 'searchField',
  'type': 'dateRange',
  'value': 'custom',
  'data': {
      'from': '2020-01-01',
      'until': '2020-02-01',
  },
},
```

You can also skip dateRange checks by setting the value to `_any`.

### Minimum number filters
You can filter for numeric numbers that are higher than a specified one like this:
```
{
  'field': 'searchField',
  'type': 'minNum',
  'value': 1,
},
```
### Maximum number filters
You can filter for numeric numbers that are lower than a specified one like this:
```
{
  'field': 'searchField',
  'type': 'maxNum',
  'value': 10,
},
```

### Strict equality filters
Use this filter to search for strict equality:
```
{
  'field': 'searchField',
  'type': 'strict',
  'value': false,
},
```

### Lax truthiness filters
Use this filter to search for datasets that have a truthy value as searchField
```
{
  'field': 'bool',
  'type': 'laxTrue',
},
```

### Lax falsiness filters
Use this filter to search for datasets that have a falsy value as searchField
```
{
  'field': 'bool',
  'type': 'laxFalse',
},
```

### Existence check filters
Use this filter to search for datasets that have any value set (or no value at all) for searchField.  
Note that this filter overrides the `skipUnset` param.
```{
    'field': 'test',
    'type': 'existence',
    'value': true,
},
```

You can also pass the array `[true, false]` or `[_any]` to this filter to effectively skip it.  
This is useful when using material-ui multi selects.

### Child attribute filters
With the childAttr filter type, you can search child fields recursively like this:
```
{
  'field': 'child',
  'type': 'childAttr',
  'data': {
      child: {
          field: 'searchField',
          type: 'strict',
          value: 'foo',
      },
},
```

You can use any filter type (including `childAttr` and `childArrayAttr`) in your child filter.

### Array child attribute filters
This filter functions just like the `childAttr` type but instead of querying a single child field.
It can be used to go through an array of child objects and return all datasets where at least one child 
fits the filter.
```
{
    field: 'children',
    type: 'childArrayAttr',
    data: {
        child: {
            field: 'searchField',
            type: 'strict',
            value: 'foo',
        },
    },
},
```

## Known issues

Currently idea IDEs refuse to autocomplete anything imported from this package and mark any usages as unresolvable.  
If someone knows how to fix that, help would be very appreciated.

This library was build for a specific dataset, following yagni (you aren't gonna need it) principles to some
extent.  
While it is meant to be used across projects, there are definitely some useful things that have not yet been implemented.

This library is expected to grow over time and more features will be added.

## Contributing

Contributions are very welcome, even if they are not related to code.  
If you found any bugs or are missing some specific feature, [please file an issue](https://github.com/binary-butterfly/butterflyDataFilters/issues/new).

Pull requests are obviously also very welcome.  
However, please note that we can only accept PRs that do not lower our test coverage of 100%.

In order to check that coverage, run `npm run coverage` before creating your pull request.
