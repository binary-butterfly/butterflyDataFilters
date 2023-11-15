export const availableFilterTypes = [
    'childAttr',
    'childArrayAttr',
    'existence',
    'string',
    'array',
    'minDate',
    'maxDate',
    'dateRange',
    'dateTimeRange',
    'minNum',
    'minNumber',
    'maxNumber',
    'maxNum',
    'strict',
    'laxTrue',
    'laxFalse',
    'emptiness',
    'lax',
    'arrayIncludes',
    'arrayIncludesArray',
    'arrayIncludesArrayStrict',
];

export type FilterType =
    'childAttr' |
    'childArrayAttr' |
    'existence' |
    'string' |
    'array' |
    'minDate' |
    'maxDate' |
    'dateRange' |
    'dateTimeRange' |
    'minNum' |
    'minNumber' |
    'maxNumber' |
    'maxNum' |
    'strict' |
    'laxTrue' |
    'laxFalse' |
    'emptiness' |
    'lax' |
    'arrayIncludes' |
    'arrayIncludesArray' |
    'arrayIncludesArrayStrict'

type CustomDateFilter = {
    type: 'dateRange',
    value: 'custom',
    field: 'string',
    data: {
        from: string | number | Date,
        until: string | number | Date,
    }
}

type DateFilter = {
    field: 'string',
    type: 'dateRange',
    value?: 'today' | 'yesterday' | '7days' | 'month' | 'last_month' | '_any'
} | CustomDateFilter

type DateTimeFilter = {
    field: string,
    type: 'dateTimeRange',
    value?: string,
    data: {
        from: string | number | Date,
        until: string | number | Date,
    }
}

type GenericFilter = {
    field: string,
    type: FilterType,
    value?: any,
}

type ChildFilter = {
    type: 'childAttr' | 'childArrayAttr'
    field: 'string',
    value?: any,
    data: {
        child: Filter & {
            data?: any,
        },
    }
}

export type Filter = GenericFilter | DateFilter | DateTimeFilter | ChildFilter;

const convertIntoDateIfNotObject = (value: string | number | Date) => {
    return typeof value === 'object' ? value : new Date(value);
};

const numSafeToLowerCase = (input: string | number) => {
    return String(input).toLowerCase();
};

export const convertDateRangeValueToBeComparable = (filter: DateFilter) => {
    let from, until;
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (filter.value) {
        case ('today'):
            from = today;
            until = new Date(from.getTime() + 8.64e+7);
            break;
        case ('yesterday'):
            until = today;
            from = new Date(until.getTime() - 8.64e+7);
            break;
        case ('7days'):
            until = new Date(today.getTime() + 8.64e+7);
            from = new Date(until.getTime() - 6.048e+8);
            break;
        case ('month'):
            from = new Date(year, month, 1, 0, 0, 0, 0);
            until = new Date(year, month + 1, 1, 0, 0, 0, 0);
            break;
        case ('last_month'):
            from = new Date(year, month - 1, 1, 0, 0, 0, 0);
            until = new Date(year, month, 1, 0, 0, 0, 0);
            break;
        case ('custom'):
            from = new Date(filter.data.from);
            until = new Date(filter.data.until);

            // Ignore filter if from or until are malformed
            // @ts-ignore next
            if (isNaN(from) || isNaN(until)) {
                return true;
            }
            until.setHours(23);
            until.setMinutes(59);
            until.setSeconds(59);
            until.setMilliseconds(999);
            break;
        case ('_any'):
            return true;
        default:
            console.error('Filter date range ' + filter.value + ' not implemented. Skipping filter.');
            return true;
    }
    return [from, until];
};

const checkDateRangeFilter = (filter: DateFilter, value: string|number|Date) => {
    const comparable = convertDateRangeValueToBeComparable(filter);
    if (comparable === true) {
        return true;
    }
    return (comparable[0] <= value && comparable[1] >= value);
};

export const checkDateTimeRangeValueToBeComparable = (filter: DateTimeFilter) => {
    if (filter.value === '_any') {
        return false;
    }

    const from = new Date(filter.data.from);
    const until = new Date(filter.data.until);

    // @ts-ignore next
    if (isNaN(from) || isNaN(until)) {
        return false;
    }

    return [from, until];
};

const checkDateTimeRangeFilter = (filter: DateTimeFilter, value: string|number|Date) => {
    const comparable = checkDateTimeRangeValueToBeComparable(filter);
    if (comparable === false) {
        return true;
    }
    return (comparable[0] <= value && comparable[1] >= value);
};

const buildChildFilter = (filter: ChildFilter) => {
    return {
        type: filter.data.child.type,
        field: filter.data.child.field,
        value: filter.data.child.value,
        data: filter.data.child.data,
    };
};

const checkFilter = (filter: Filter, valueRow: {[key:string]: any}, skipUndefined?: boolean): boolean => {
    if ((filter.value === undefined && filter.type !== 'laxTrue' && filter.type !== 'laxFalse' && filter.type !== 'childAttr' && filter.type !== 'childArrayAttr') || filter.field === undefined) {
        return true;
    }

    const value = valueRow?.[filter.field];
    if (value === undefined) {
        if (filter.type === 'existence') {
            if (typeof filter.value === 'boolean' && filter.value) {
                return false;
            } else if (filter.value.length === 1 && filter.value[0] === true) {
                return false;
            }
            return true;
        } else if (filter.type === 'emptiness') {
            let filterVal;
            if (typeof filter.value === 'boolean') {
                filterVal = filter.value;
            } else if (filter.value.length === 1) {
                filterVal = filter.value[0];
            }

            if (filterVal !== undefined) {
                return filterVal;
            }
        } else {
            return Boolean(skipUndefined);
        }
    }

    switch (filter.type) {
        case ('string'): {
            const lowerCaseValue = numSafeToLowerCase(value);
            if (lowerCaseValue.search(numSafeToLowerCase(filter.value)) === -1) {
                return false;
            }
            break;
        }
        case ('array'): {
            if (filter.value !== '_any' && filter.value[0] !== '_any' && filter.value.indexOf(value) === -1) {
                return false;
            }
            break;
        }
        case ('arrayIncludes'): {
            if (value.indexOf(filter.value) === -1) {
                return false;
            }
            break;
        }
        case ('arrayIncludesArray'): {
            if (filter.value !== '_any' && filter.value[0] !== '_any') {
                let found = false;
                for (const filterValue of filter.value) {
                    if (value.indexOf(filterValue) !== -1) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    return false;
                }
            }
            break;
        }
        case('arrayIncludesArrayStrict'): {
            if (filter.value !== '_any' && filter.value[0] !== '_any') {
                let lost = false;
                for (const filterValue of filter.value) {
                    if (value.indexOf(filterValue) === -1) {
                        lost = true;
                        break;
                    }
                }

                if (lost) {
                    return false;
                }
            }
            break;
        }
        case ('minDate'): {
            if (new Date(filter.value) > convertIntoDateIfNotObject(value)) {
                return false;
            }
            break;
        }
        case ('maxDate'): {
            if (new Date(filter.value) < convertIntoDateIfNotObject(value)) {
                return false;
            }
            break;
        }
        case ('dateRange'): {
            if (!checkDateRangeFilter(filter as DateFilter, convertIntoDateIfNotObject(value))) {
                return false;
            }
            break;
        }
        case ('dateTimeRange'): {
            if (!checkDateTimeRangeFilter(filter as DateTimeFilter, convertIntoDateIfNotObject(value))) {
                return false;
            }
            break;
        }
        case('minNumber'):
        case ('minNum'): {
            if (value < filter.value) {
                return false;
            }
            break;
        }
        case('maxNumber'):
        case ('maxNum'): {
            if (value > filter.value) {
                return false;
            }
            break;
        }
        case ('strict'): {
            if (value !== filter.value) {
                return false;
            }
            break;
        }
        case ('lax'): {
            if (value != filter.value) {
                return false;
            }
            break;
        }
        case ('laxTrue'): {
            if (!value) {
                return false;
            }
            break;
        }
        case ('laxFalse'): {
            if (value) {
                return false;
            }
            break;
        }
        case ('existence'): {
            if (typeof filter.value === 'boolean') {
                if ((!filter.value && !(value === null || value === '')) || (filter.value && value === '')) {
                    return false;
                }
            } else if (filter.value.length === 1) {
                if ((filter.value[0] === false && !(value === null || value === '')) || (filter.value[0] === true && value === '')) {
                    return false;
                }
            }
            break;
        }
        case ('emptiness'): {
            let filterVal;
            if (typeof filter.value === 'boolean') {
                filterVal = filter.value;
            } else if (filter.value.length === 1) {
                filterVal = filter.value[0];
            }

            if (filterVal !== undefined) {
                if ((filterVal === true && !(value === null || value === '' || value?.length === 0))
                    || (filterVal === false && (value === '' || value === null || value?.length === 0))) {
                    return false;
                }
            }

            break;
        }
        case('childAttr'): {
            // @ts-ignore next
            if (!filter.data || !filter.data.child) {
                console.warn('Filter has childAttr type but no data set. Ignoring filter.');
                return true;
            }

            const childFilter = buildChildFilter(filter as ChildFilter);
            return checkFilter(childFilter, value, skipUndefined);
        }
        case('childArrayAttr'): {
            // @ts-ignore next
            if (!filter.data || !filter.data.child) {
                console.warn('Filter has childArrayAttr type but no data set. Ignoring filter.');
                return true;
            }

            if (skipUndefined && !value?.length) {
                return true;
            }

            const childFilters = [buildChildFilter(filter as ChildFilter)];
            return applyFilters(childFilters, value, skipUndefined).length > 0;
        }
        default: {
            // @ts-ignore next
            console.warn('Filter type not implemented: ' + filter?.type + '. Ignoring filter.');
        }
    }
    return true;
};

export const applyFilters = (filters: Array<Filter>, values: Array<{[key:string]: any}>, skipUndefined = true) => {
    if (!Array.isArray(values)) {
        values = Object.values(values);
    }

    return values.filter((valueRow) => {
        for (const filter of filters) {
            if (!checkFilter(filter, valueRow, skipUndefined)) {
                return false;
            }
        }
        return true;
    });
};

export default applyFilters;
