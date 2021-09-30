import {applyFilters} from '../filterHelper';

const now = new Date();
describe.each([
    [[], [], true, [], 'Empty stays empty'],
    [[{
        field: 'foo',
        value: 'bar',
        type: 'string',
    }], [{'banana': 'apple'}], true, [{'banana': 'apple'}], 'Non existent is skipped when skipUndefined is true'],
    [[{
        field: 'foo',
        value: 'bar',
        type: 'string',
    }], {foo: {'banana': 'apple'}}, true, [{'banana': 'apple'}], 'Object is converted to array'],
    [[{
        field: 'foo',
        value: 'bar',
        type: 'string',
    }], [{'banana': 'apple'}], undefined, [{'banana': 'apple'}], 'Non existent is skipped when skipUndefined is not set'],
    [[{
        field: 'foo',
        type: 'string',
    }], [{'banana': 'apple'}], true, [{'banana': 'apple'}], 'String filter is skipped when value is undefined'],
    [[{
        field: 'foo',
        value: 'bar',
        type: 'string',
    }], [{'banana': 'apple'}], false, [], 'Non existent is skipped not when skipUndefined is false'],
    [
        [
            {
                'field': 'banana',
                'type': 'string',
                'value': 'apple',
            },
        ],
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
        false,
        [{'banana': 'apple', 'computer': 'weird'}],
        'Full string match',
    ],
    [
        [
            {
                'field': 'banana',
                'type': 'string',
                'value': 'ap',
            },
        ],
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
        false,
        [{'banana': 'apple', 'computer': 'weird'}],
        'String begin match',
    ],
    [
        [
            {
                'field': 'banana',
                'type': 'string',
                'value': 'le',
            },
        ],
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
        false,
        [{'banana': 'apple', 'computer': 'weird'}],
        'String end match',
    ],
    [
        [
            {
                'field': 'banana',
                'type': 'string',
                'value': 'pp',
            },
        ],
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
        false,
        [{'banana': 'apple', 'computer': 'weird'}],
        'String middle match',
    ],
    [
        [
            {
                'field': 'banana',
                'type': 'string',
                'value': 'App',
            },
        ],
        [{'banana': 'aPple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
        false,
        [{'banana': 'aPple', 'computer': 'weird'}],
        'String matches case insensitive',
    ],
    [
        [
            {
                'field': 'computer',
                'type': 'array',
                'value': ['_any'],
            },
        ],
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
        false,
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
        'Array filter skipped when value = ["_any"]',
    ],
    [
        [
            {
                'field': 'computer',
                'type': 'array',
                'value': ['weird', 'apple'],
            },
        ],
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}, {
            'banana': 'apple',
            'computer': 'broken',
        }],
        false,
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
        'Array matches',
    ],
    [
        [
            {
                'field': 'banana',
                'type': 'string',
                'value': 'App',
            },
            {
                'field': 'computer',
                'type': 'array',
                'value': ['weird', 'apple'],
            },
        ],
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
        false,
        [{'banana': 'apple', 'computer': 'weird'}],
        'All filters have to match',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'minDate',
                'value': '2021-01-01',
            },
        ],
        [
            {'date': '2021-01-01'},
            {'date': '2020-01-01'},
        ],
        false,
        [{'date': '2021-01-01'}],
        'Min date with string date',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'minDate',
                'value': '2021-01-01',
            },
        ],
        [
            {'date': new Date('2021-01-01')},
            {'date': new Date('2020-01-01')},
        ],
        false,
        [{'date': new Date('2021-01-01')}],
        'Min date with date object',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'maxDate',
                'value': '2021-01-01',
            },
        ],
        [
            {'date': new Date('2021-01-02')},
            {'date': new Date('2020-01-01')},
        ],
        false,
        [{'date': new Date('2020-01-01')}],
        'Max date',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'dateRange',
                'value': 'today',
            },
        ],
        [
            {'date': now},
            {'date': new Date('2020-01-01')},
        ],
        false,
        [{'date': now}],
        'DateRange today',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'dateRange',
                'value': 'not implemented',
            },
        ],
        [
            {'date': now},
            {'date': new Date('2020-01-01')},
        ],
        false,
        [
            {'date': now}, {'date': new Date('2020-01-01')},
        ],
        'DateRange skipped when value not implemented',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'dateRange',
                'value': 'yesterday',
            },
        ],
        [
            {'date': new Date(now.getTime() - 8.64e+7)},
            {'date': new Date('2020-01-01')},
        ],
        false,
        [{'date': new Date(now.getTime() - 8.64e+7)}],
        'DateRange yesterday',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'dateRange',
                'value': '7days',
            },
        ],
        [
            {'date': now},
            {'date': new Date(now.getTime() - 8.64e+7)},
            {'date': new Date('2020-01-01')},
        ],
        false,
        [{'date': now}, {'date': new Date(now.getTime() - 8.64e+7)}],
        'DateRange last 7 days',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'dateRange',
                'value': 'month',
            },
        ],
        [
            {'date': now},
            {'date': new Date(now.getFullYear(), now.getMonth() + 1, 0, 12, 30)},
            {'date': new Date(now.getFullYear(), now.getMonth(), 1, 12, 30)},
            {'date': new Date('2020-01-01')},
        ],
        false,
        [
            {'date': now},
            {'date': new Date(now.getFullYear(), now.getMonth() + 1, 0, 12, 30)},
            {'date': new Date(now.getFullYear(), now.getMonth(), 1, 12, 30)},
        ],
        'DateRange current month',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'dateRange',
                'value': 'last_month',
            },
        ],
        [
            {'date': now},
            {'date': new Date(now.getFullYear(), now.getMonth(), 0, 12, 30)},
            {'date': new Date(now.getFullYear(), now.getMonth() - 1, 1, 12, 30)},
            {'date': new Date('2020-01-01')},
        ],
        false,
        [
            {'date': new Date(now.getFullYear(), now.getMonth(), 0, 12, 30)},
            {'date': new Date(now.getFullYear(), now.getMonth() - 1, 1, 12, 30)},
        ],
        'DateRange last month',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'dateRange',
                'value': 'custom',
                'data': {
                    'from': '2020-01-01',
                    'until': '2020-02-01',
                },
            },
        ],
        [
            {'date': '2020-01-01'},
            {'date': '2020-01-31'},
            {'date': '2021-01-01'},
        ],
        false,
        [
            {'date': '2020-01-01'},
            {'date': '2020-01-31'},
        ],
        'DateRange custom',
    ],
    [
        [
            {
                'field': 'date',
                'type': 'dateRange',
                'value': '_any',
            },
        ],
        [
            {'date': new Date('2021-01-01')},
            {'date': new Date('2020-01-01')},
        ],
        false,
        [
            {'date': new Date('2021-01-01')},
            {'date': new Date('2020-01-01')},
        ],
        'DateRange check skipped if value = _any',
    ],
    [
        [
            {
                'field': 'num',
                'type': 'minNum',
                'value': 1,
            },
        ],
        [
            {'num': 0}, {'num': 1}, {'num': 1000},
        ],
        false,
        [
            {'num': 1},
            {'num': 1000},
        ],
        'MinNum',
    ],
    [
        [
            {
                'field': 'num',
                'type': 'minNumber',
                'value': 1,
            },
        ],
        [
            {'num': 0}, {'num': 1}, {'num': 1000},
        ],
        false,
        [
            {'num': 1},
            {'num': 1000},
        ],
        'MinNumber behaves just like minNum',
    ],
    [
        [
            {
                'field': 'num',
                'type': 'maxNum',
                'value': 1,
            },
        ],
        [
            {'num': 0}, {'num': 1}, {'num': 1000},
        ],
        false,
        [
            {'num': 0}, {'num': 1},
        ],
        'MaxNum',
    ],
    [
        [
            {
                'field': 'num',
                'type': 'maxNumber',
                'value': 1,
            },
        ],
        [
            {'num': 0}, {'num': 1}, {'num': 1000},
        ],
        false,
        [
            {'num': 0}, {'num': 1},
        ],
        'MaxNumber behaves just like maxNum',
    ],
    [
        [
            {
                'field': 'bool',
                'type': 'strict',
                'value': false,
            },
        ],
        [
            {'bool': true}, {'bool': false}, {'bool': 'banana'}, {'bool': 'true'},
        ],
        false,
        [
            {'bool': false},
        ],
        'Strict equality',
    ],
    [
        [
            {
                'field': 'bool',
                'type': 'laxTrue',
            },
        ],
        [
            {'bool': true}, {'bool': false}, {'bool': 'banana'}, {'bool': 'true'}, {'bool': null},
        ],
        false,
        [
            {'bool': true}, {'bool': 'banana'}, {'bool': 'true'},
        ],
        'Lax true',
    ],
    [
        [
            {
                'field': 'bool',
                'type': 'laxFalse',
            },
        ],
        [
            {'bool': true}, {'bool': false}, {'bool': 'banana'}, {'bool': 'true'}, {'bool': null}, {'bool': 'false'},
        ],
        false,
        [
            {'bool': false}, {'bool': null},
        ],
        'Lax false',
    ],
    [
        [
            {
                'field': 'test',
                'type': 'existence',
                'value': true,
            },
        ],
        [
            {'test': true}, {'banana': false},
        ],
        false,
        [
            {'test': true},
        ],
        'Existence filter with bool value true',
    ],
    [
        [
            {
                'field': 'test',
                'type': 'existence',
                'value': false,
            },
        ],
        [
            {'test': true}, {'banana': false},
        ],
        false,
        [
            {'banana': false},
        ],
        'Existence filter with bool value false',
    ],
    [
        [
            {
                'field': 'test',
                'type': 'existence',
                'value': [false],
            },
        ],
        [
            {'test': true}, {'banana': false},
        ],
        false,
        [
            {'banana': false},
        ],
        'Existence filter with array value false',
    ],
    [
        [
            {
                'field': 'test',
                'type': 'existence',
                'value': [true],
            },
        ],
        [
            {'test': true}, {'banana': false},
        ],
        false,
        [
            {'test': true},
        ],
        'Existence filter with array value true',
    ],
    [
        [
            {
                'field': 'test',
                'type': 'existence',
                'value': [true, false],
            },
        ],
        [
            {'test': true}, {'banana': false},
        ],
        false,
        [
            {'test': true}, {'banana': false},
        ],
        'Existence filter with array value all allowed',
    ],
    [
        [
            {
                'field': 'test',
                'type': 'existence',
                'value': ['_any'],
            },
        ],
        [
            {'test': true}, {'banana': false},
        ],
        false,
        [
            {'test': true}, {'banana': false},
        ],
        'Existence filter with array value _any all allowed',
    ],
    [
        [
            {
                'field': 'child',
                'type': 'childAttr',
                'data': {
                    child: {
                        field: 'test',
                        type: 'strict',
                        value: 'foo',
                    },
                },
            },
        ],
        [
            {child: {test: 'foo'}}, {child: {'test': 'apple'}},
        ],
        false,
        [
            {child: {test: 'foo'}},
        ],
        'ChildAttr filter',
    ],
    [
        [
            {
                field: 'children',
                type: 'childArrayAttr',
                data: {
                    child: {
                        field: 'test',
                        type: 'strict',
                        value: 'foo',
                    },
                },
            },
        ],
        [
            {children: [{test: 'foo'}, {test: 'banana'}]}, {children: [{'test': 'apple'}]},
        ],
        false,
        [
            {children: [{test: 'foo'}, {test: 'banana'}]},
        ],
        'ChildArrayAttr filter',
    ],
    [
        [
            {
                'field': 'children',
                'type': 'childArrayAttr',
            },
        ],
        [
            {children: [{test: 'foo'}]}, {children: [{'test': 'apple'}]},
        ],
        false,
        [
            {children: [{test: 'foo'}]}, {children: [{'test': 'apple'}]},
        ],
        'ChildArrayAttr filter is skipped when data not set',
    ],
    [
        [
            {
                'field': 'child',
                'type': 'childAttr',
            },
        ],
        [
            {child: {test: 'foo'}}, {child: {'test': 'apple'}},
        ],
        false,
        [
            {child: {test: 'foo'}}, {child: {'test': 'apple'}},
        ],
        'ChildAttr filter is skipped when data not set',
    ],
    [
        [
            {
                'field': 'child',
                'type': 'childAttr',
                'data': {
                    child: {
                        field: 'test',
                        type: 'childAttr',
                        data: {
                            child: {
                                field: 'testSquared',
                                value: 'foo',
                                type: 'strict',
                            },
                        },
                    },
                },
            },
        ],
        [
            {child: {test: {testSquared: 'foo'}}}, {child: {'test': {testSquared: 'apple'}}},
        ],
        false,
        [
            {child: {test: {testSquared: 'foo'}}},
        ],
        'Recursive childAttr filter',
    ],
    [
        [
            {
                'field': 'banana',
                'type': 'not implemented',
                'value': 'foobar',
            },
        ],
        [
            {'banana': 'test'},
        ],
        false,
        [
            {'banana': 'test'},
        ],
        'Non implemented filter is skipped',
    ],
])('test applyFilters', (filters, values, skipUndefined, expected, name) => {
    test(name, () => {
        expect(applyFilters(filters, values, skipUndefined)).toStrictEqual(expected);
    });
});
