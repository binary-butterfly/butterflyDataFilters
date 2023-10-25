# butterflyDataFilters

A simple library for data filtering in JavaScript.

[![.github/workflows/test.yml](https://github.com/binary-butterfly/butterflyDataFilters/actions/workflows/test.yml/badge.svg)](https://github.com/binary-butterfly/butterflyDataFilters/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/binary-butterfly/butterflyDataFilters/badge.svg?branch=main)](https://coveralls.io/github/binary-butterfly/butterflyDataFilters?branch=main)

## Motivation

We needed a simple, yet expandable way to filter locally cached data in a single page application.  
Because we did not find anything that was simple enough while also meeting all of our needs, we wrote a quick
script to do so.

Since this script is not too specific for the application it was written for, we decided to share it with
the open source community in hopes that someone else may benefit from it as well.

## How does it work?

For direct examples, check out src/__tests__/filterHelper.test.js since it shows all ways the filters can be used.

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
You can also pass `['_any']` or just the string `_any` as value to get all datasets and effectively skip this filter.  
This is useful as a default value when you don't know what the possible filter options are in advance.

### Array includes filters

In order to filter your dataset for fields where an array field contains a certain value, you can use `arrayIncludes` filters:

```
{
    field: 'searchField',
    type: 'arrayIncludes',
    value: 'banana',
}
```

This filter will return all datasets where `searchField` is an array that includes the string `banana`.

### Array includes array filters

Similarly, you can search for fields where an array field contains any of a given list of values using `arrayIncludesArray` filters:

```
{
    field: 'test',
    type: 'arrayIncludesArray',
    value: ['banana', 'apple'],
}
```

This will return all datasets where `searchField` is an array that includes either `banana` or `apple` (or both).

### Strict array includes array filters

If you only want fields where an array field contains **all** of a given list of values, you can use `arrayIncludesArrayStrict` filters:

```
{
    field: 'test',
    type: 'arrayIncludesArrayStrict',
    value: ['apple', 'banana'],
}
```

This will only return datasets where `searchField` is an array that contains **both** `apple` and `banana`.

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

#### dateTimeRange

This filter lets you specify different date-time ranges to search for.

```
{
  'field': 'searchField',
  'type': 'dateTimeRange',
  'data': {
      'from': '2020-01-01T01:00',
      'until': '2020-02-01T23:00',
  },
},
```

You can also skip dateTimeRange checks by setting the `value` to `_any`.

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

### Lax equality filters

Use this filter to search for lax equality:

```
{
  'field': 'searchField',
  'type': 'strict',
  'value': 123,
},
```

Note that you should not use this if it can be helped because it will lead to potentially unexpected results due to type coercion.

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

```
{
    'field': 'test',
    'type': 'existence',
    'value': true,
},
```

You can also pass the array `[true, false]` or `[_any]` to this filter to effectively skip it.  
This is useful when using material-ui multi selects.

### Emptiness check filter

Use this filter to search for datasets that have an empty value set for searchField.
Note that this filter overrides the `skipUnset` param.

```
{
    'field': 'test',
    'type': 'emptiness',
    'value': [true, false]
}
```

You can pass either a boolean or an array that contains one or two booleans or the string `_any`.  
Pass `true` to only get fields with an emtpy value and `false` for fields with non empty values.  
In this regard, the filter works exactly opposite to the existence filter.

Note that this filter will not work as expected for object children as they are always considered non empty.

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

## Helper functions

### convertDateRangeValueToBeComparable

This function is used internally to convert a DateRange filter to a `from` and `until` Date object with which values
can be compared.  
It is also exported by the library since it may be useful in some cases.

This function requires the filter value and data within an object as param.  
It will either return an array with from and until values or `true` if the filter should always return true for the given
value.

## Known issues

Currently, idea IDEs refuse to autocomplete anything imported from this package and mark any usages as unresolvable.  
If someone knows how to fix that, help would be very appreciated.

This library was build for a specific dataset, following yagni (you aren't gonna need it) principles to some
extent.  
While it is meant to be used across projects, there are definitely some useful things that have not yet been implemented.

This library is expected to grow over time and more features will be added.

## Contributing

Contributions are very welcome, even if they are not related to code.  
If you found any bugs or are missing some specific
feature, [please file an issue](https://github.com/binary-butterfly/butterflyDataFilters/issues/new).

Pull requests are obviously also very welcome.  
However, please note that we can only accept PRs that do not lower our test coverage of 100%.

In order to check that coverage, run `npm run coverage` before creating your pull request.
