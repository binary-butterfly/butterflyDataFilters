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

const convertIntoDateIfNotObject = (value) => {
    return typeof value === 'object' ? value : new Date(value);
};

const numSafeToLowerCase = (input) => {
    return String(input).toLowerCase();
};

export const convertDateRangeValueToBeComparable = (filter) => {
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

const checkDateRangeFilter = (filter, value) => {
    const comparable = convertDateRangeValueToBeComparable(filter);
    if (comparable === true) {
        return true;
    }
    return (comparable[0] <= value && comparable[1] >= value);
};

export const checkDateTimeRangeValueToBeComparable = (filter) => {
    const from = new Date(filter.data.from);
    const until = new Date(filter.data.until);

    if (isNaN(from) || isNaN(until)) {
        return true;
    }

    return [from, until];
}

const checkDateTimeRangeFilter = (filter, value) => {
    const comparable = checkDateTimeRangeValueToBeComparable(filter);
    if (comparable === true) {
        return true;
    }
    return (comparable[0] <= value && comparable[1] >= value);
}

const buildChildFilter = (filter) => {
    return {
        type: filter.data.child.type,
        field: filter.data.child.field,
        value: filter.data.child.value,
        data: filter.data.child.data,
    };
};

const checkFilter = (filter, valueRow, skipUndefined) => {
    if ((filter.value === undefined && filter.type !== 'laxTrue' && filter.type !== 'laxFalse' && filter.type !== 'childAttr' && filter.type !== 'childArrayAttr') || filter.field === undefined) {
        return true;
    }

    const value = valueRow?.[filter.field];
    if (value === undefined) {
        if (filter.type === 'existence') {
            if (typeof filter.value === 'boolean' && filter.value === true) {
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
            return !!skipUndefined;
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
            if (!checkDateRangeFilter(filter, convertIntoDateIfNotObject(value))) {
                return false;
            }
            break;
        }
        case ('dateTimeRange'): {
            if (!checkDateTimeRangeFilter(filter, convertIntoDateIfNotObject(value))) {
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
                if ((filter.value === false && !(value === null || value === '')) || (filter.value === true && value === '')) {
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
            if (!filter.data || !filter.data.child) {
                console.warn('Filter has childAttr type but no data set. Ignoring filter.');
                return true;
            }

            const childFilter = buildChildFilter(filter);
            return checkFilter(childFilter, value, skipUndefined);
        }
        case('childArrayAttr'): {
            if (!filter.data || !filter.data.child) {
                console.warn('Filter has childArrayAttr type but no data set. Ignoring filter.');
                return true;
            }

            if (skipUndefined && !value?.length) {
                return true;
            }

            const childFilters = [buildChildFilter(filter)];
            return applyFilters(childFilters, value, skipUndefined).length > 0;
        }
        default: {
            console.warn('Filter type not implemented: ' + filter.type + '. Ignoring filter.');
        }
    }
    return true;
};

export const applyFilters = (filters, values, skipUndefined = true) => {
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
