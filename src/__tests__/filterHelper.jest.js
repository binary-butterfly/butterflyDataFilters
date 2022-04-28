import {applyFilters} from '../filterHelper';

const now = new Date();
describe.each([
    [[], [], true, [], 'Empty stays empty'],
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
])('Test shared features', (filters, values, skipUndefined, expected, name) => {
    test(name, () => {
        expect(applyFilters(filters, values, skipUndefined)).toStrictEqual(expected);
    });
});

test('Test non implemented filter is skipped with warning', () => {
    const warn = jest.fn();
    global.console.warn = warn;
    expect(applyFilters([
                {
                    'field': 'banana',
                    'type': 'not implemented',
                    'value': 'foobar',
                },
            ],
            [
                {'banana': 'test'},
            ],
            false),
    )
        .toStrictEqual([
            {'banana': 'test'},
        ]);
    expect(warn).toHaveBeenCalledTimes(1);
});

describe.each([
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
])('Test string filters', (filters, values, skipUndefined, expected, name) => {
    test(name, () => {
        expect(applyFilters(filters, values, skipUndefined)).toStrictEqual(expected);
    });
});

describe.each([
    [
        [
            {
                'field': 'computer',
                'type': 'array',
                'value': ['_any'],
            },
        ],
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
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
        [{'banana': 'apple', 'computer': 'weird'}, {'banana': 'weird', 'computer': 'apple'}],
        'Array matches',
    ],
])('test array filter', (filters, values, expected, name) => {
    test(name, () => {
        expect(applyFilters(filters, values, false)).toStrictEqual(expected);
    });
});

describe.each([
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
        [{'date': now}],
        'DateRange today',
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
        [
            {'date': new Date('2021-01-01')},
            {'date': new Date('2020-01-01')},
        ],
        'DateRange check skipped if value = _any',
    ],
])('test date filter', (filters, values, expected, name) => {
    test(name, () => {
        expect(applyFilters(filters, values, false)).toStrictEqual(expected);
    });
});

test('test date filter DateRange skipped when value not implemented', () => {
    const error = jest.fn();
    global.console.error = error;
    expect(
        applyFilters([
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
        ))
        .toStrictEqual(
            [
                {'date': now},
                {'date': new Date('2020-01-01')},
            ],
        );
    expect(error).toHaveBeenCalledTimes(2);
});

describe.each([
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
        [
            {child: {test: 'foo'}},
        ],
        'works as intended',
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
        [
            {child: {test: {testSquared: 'foo'}}},
        ],
        'works recursively',
    ],
])('test childAttr filter', (filters, values, expected, name) => {
    test(name, () => {
        expect(applyFilters(filters, values, false)).toStrictEqual(expected);
    });
});

test('test childAttr filter is skipped when no data is set', () => {
    const warn = jest.fn();
    global.console.warn = warn;
    expect(
        applyFilters([
                {
                    'field': 'child',
                    'type': 'childAttr',
                },
            ],
            [
                {child: {test: 'foo'}}, {child: {'test': 'apple'}},
            ]))
        .toStrictEqual([
            {child: {test: 'foo'}}, {child: {'test': 'apple'}},
        ]);
    expect(warn).toHaveBeenCalledTimes(2);
});

describe.each([
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
        [
            {children: [{test: 'foo'}, {test: 'banana'}]},
        ],
        'works as intended',
    ],
])('test childArrayAttr filter', (filters, values, expected, name) => {
    test(name, () => {
        expect(applyFilters(filters, values, false)).toStrictEqual(expected);
    });
});

test('test childArrayAttr filter is skipped when no data set', () => {
    const warn = jest.fn();
    global.console.warn = warn;
    expect(
        applyFilters([
                {
                    'field': 'children',
                    'type': 'childArrayAttr',
                },
            ],
            [
                {children: [{test: 'foo'}]}, {children: [{'test': 'apple'}]},
            ]))
        .toStrictEqual([
            {children: [{test: 'foo'}]}, {children: [{'test': 'apple'}]},
        ]);
    expect(warn).toHaveBeenCalledTimes(2);
});

describe.each([
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
        [
            {'num': 0}, {'num': 1},
        ],
        'MaxNumber behaves just like maxNum',
    ],
])('Test number filter', (filters, values, expected, name) => {
    test(name, () => {
        expect(applyFilters(filters, values, false)).toStrictEqual(expected);
    });
});

describe.each([
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
        [
            {'bool': false}, {'bool': null},
        ],
        'Lax false',
    ],
])('Test boolean filters', (filters, values, expected, name) => {
    test(name, () => {
        expect(applyFilters(filters, values, false)).toStrictEqual(expected);
    });
});

describe.each([
    [
        [
            {
                'field': 'test',
                'type': 'existence',
                'value': true,
            },
        ],
        [
            {'test': true}, {'banana': false}, {'test': ''},
        ],
        [
            {'test': true},
        ],
        'bool value true',
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
            {'test': true}, {'banana': false}, {'test': ''},
        ],
        [
            {'banana': false}, {'test': ''},
        ],
        'bool value false',
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
            {'test': true}, {'banana': false}, {'test': ''},
        ],
        [
            {'banana': false}, {'test': ''},
        ],
        'array value false',
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
            {'test': true}, {'banana': false}, {'test': ''}
        ],
        [
            {'test': true},
        ],
        'array value true',
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
        [
            {'test': true}, {'banana': false},
        ],
        'array value all allowed',
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
        [
            {'test': true}, {'banana': false},
        ],
        'array value [_any] all allowed',
    ],
    [
        [
            {
                'field': 'test',
                'type': 'existence',
                'value': '_any',
            },
        ],
        [
            {'test': true}, {'banana': false},
        ],
        [
            {'test': true}, {'banana': false},
        ],
        'array value _any all allowed',
    ]
])('Test existence filters', (filters, values, expected, name) => {
    test(name, () => {
        expect(applyFilters(filters, values, false)).toStrictEqual(expected);
    });
});
