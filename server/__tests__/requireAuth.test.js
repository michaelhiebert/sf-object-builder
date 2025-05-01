import { requireAuth } from '../middleware/requireAuth.js';

describe('requireAuth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('calls next() when session.user exists', () => {
    req.session = { user: { foo: 'bar' } };
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when no user', () => {
    req.session = {};
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('works when req.user is pre-populated', () => {
    req.user = { baz: 'qux' };
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
