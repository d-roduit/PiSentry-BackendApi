export const isStringPositiveInteger = (stringValue) => {
    if (typeof stringValue !== 'string') return false;
    const positiveIntegerRegex = new RegExp('^(0|[1-9][0-9]*)$');
    return positiveIntegerRegex.test(stringValue);
}

export const isObjectEmpty = (obj) => {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) return false;
    }
    return true;
}

export const checkStringType = (value) => {
    if (typeof value !== 'string') return 'Value must be of type string';
    if (value.length === 0) return 'Value cannot be empty';
    return null;
}

export const checkStringLength = (value, minLength = 1, maxLength = 35) => {
    if (value.length < minLength || value.length > maxLength)
        return `Value must be between ${minLength} and ${maxLength} characters long`;
    return null;
}

export const checkTimeFormat = (value) => {
    const timeRegex = new RegExp('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
    if (!timeRegex.test(value)) return 'Value must be of format HH:MM 24-hour with leading 0'
    return null;
};

export const checkBooleanType = (value) => {
    if (typeof value !== 'boolean') return 'Value must be of type boolean';
    return null;
}