const { formatCompanyName, isValidStatus } = require('../utils');

describe('formatCompanyName', () => {
    test('formats lowercase company name', () => {
        expect(formatCompanyName('google')).toBe('Google');
    });

    test('returns "Unknown Company" for empty string (edge case)', () => {
        expect(formatCompanyName('')).toBe('Unknown Company');
    });

    test('returns "Unknown Company" for non-string input (failure case)', () => {
        expect(formatCompanyName(123)).toBe('Unknown Company');
    });
});

describe('isValidStatus', () => {
    test('returns true for valid status "Interview"', () => {
        expect(isValidStatus('Interview')).toBe(true);
    });

    test('returns false for invalid status "Pending" (edge case)', () => {
        expect(isValidStatus('Pending')).toBe(false);
    });
});
