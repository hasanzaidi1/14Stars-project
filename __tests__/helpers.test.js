const {
  validateRequiredFields,
  sendPortalResponse,
  isValidEmail,
  isValidPhoneNumber,
  isAuthenticated,
  determineSchoolYear,
  cleanData
} = require('../src/utils/helpers');

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn();
  return res;
};

describe('helpers.validateRequiredFields', () => {
  test('returns null when all required fields exist', () => {
    const fields = [
      { name: 'term_name', value: 'First' },
      { name: 'school_year', value: '2024-2025' }
    ];

    expect(validateRequiredFields(fields)).toBeNull();
  });

  test('returns readable message when a field is missing', () => {
    const fields = [
      { name: 'term_name', value: '' },
      { name: 'school_year', value: '2024-2025' }
    ];

    expect(validateRequiredFields(fields)).toBe('term_name is required.');
  });
});

describe('helpers.sendPortalResponse', () => {
  test('sends redirect for HTML form submissions', () => {
    const req = { headers: {}, xhr: false };
    const res = createResponse();

    sendPortalResponse(req, res, { success: true, message: 'Submitted' });

    expect(res.redirect).toHaveBeenCalledWith(
      303,
      expect.stringContaining('type=success')
    );
    expect(res.redirect.mock.calls[0][1]).toContain('message=Submitted');
    expect(res.json).not.toHaveBeenCalled();
  });

  test('sends JSON payload for API consumers and merges data', () => {
    const req = { headers: { accept: 'application/json' } };
    const res = createResponse();

    sendPortalResponse(req, res, {
      success: false,
      message: 'Invalid',
      statusCode: 422,
      data: { reason: 'Missing fields' }
    });

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid',
      reason: 'Missing fields'
    });
    expect(res.redirect).not.toHaveBeenCalled();
  });
});

describe('helpers validation utilities', () => {
  test('validates email addresses', () => {
    expect(isValidEmail('someone@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  test('validates phone numbers', () => {
    expect(isValidPhoneNumber('1234567890')).toBe(true);
    expect(isValidPhoneNumber('555-0100')).toBe(false);
  });
});

describe('helpers.isAuthenticated', () => {
  test('calls next when session flags indicate authentication', () => {
    const req = { session: { isAdmin: true } };
    const res = createResponse();
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 401 when no session or cookies are present', () => {
    const req = { session: {}, cookies: {} };
    const res = createResponse();
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required.' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('helpers.determineSchoolYear', () => {
  test('returns current year span when date is in or after July', () => {
    expect(determineSchoolYear('2024-07-15')).toBe('2024-2025');
  });

  test('returns prior year span when date is before July', () => {
    expect(determineSchoolYear('2024-01-05')).toBe('2023-2024');
  });
});

describe('helpers.cleanData', () => {
  test('converts undefined values to null while preserving others', () => {
    const input = { name: 'Test', nickname: undefined, age: 12, active: false };
    expect(cleanData(input)).toEqual({
      name: 'Test',
      nickname: null,
      age: 12,
      active: false
    });
  });
});
