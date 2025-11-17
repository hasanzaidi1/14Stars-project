jest.mock('../term.model', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const TermModel = require('../term.model');
const TermController = require('../term.controller');

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('TermController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTerm', () => {
    test('returns 201 when a term is created', async () => {
      const req = { body: { term_name: '1st', school_year: '2024-2025' } };
      const res = createResponse();
      TermModel.create.mockResolvedValue({ insertId: 10 });

      await TermController.createTerm(req, res);

      expect(TermModel.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Term created successfully',
        term: { insertId: 10 }
      });
    });

    test('handles database errors gracefully', async () => {
      const req = { body: { term_name: '1st', school_year: '2024-2025' } };
      const res = createResponse();
      TermModel.create.mockRejectedValue(new Error('db down'));

      await TermController.createTerm(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getAllTerms', () => {
    test('returns all terms with status 200', async () => {
      const req = {};
      const res = createResponse();
      const terms = [{ term_id: 1 }];
      TermModel.findAll.mockResolvedValue(terms);

      await TermController.getAllTerms(req, res);

      expect(TermModel.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(terms);
    });

    test('returns 500 when fetching fails', async () => {
      const req = {};
      const res = createResponse();
      TermModel.findAll.mockRejectedValue(new Error('oops'));

      await TermController.getAllTerms(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('updateTerm', () => {
    test('returns 400 when id param missing', async () => {
      const req = { params: {}, body: {} };
      const res = createResponse();

      await TermController.updateTerm(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Term ID is required' });
    });

    test('returns 404 when no rows updated', async () => {
      const req = { params: { id: '1' }, body: { term_name: 'Updated' } };
      const res = createResponse();
      TermModel.update.mockResolvedValue({ affectedRows: 0 });

      await TermController.updateTerm(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Term not found' });
    });

    test('returns success message when update occurs', async () => {
      const req = { params: { id: '1' }, body: { term_name: 'Updated' } };
      const res = createResponse();
      TermModel.update.mockResolvedValue({ affectedRows: 1 });

      await TermController.updateTerm(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Term updated successfully' });
    });
  });

  describe('deleteTerm', () => {
    test('returns 400 when id not provided', async () => {
      const req = { params: {} };
      const res = createResponse();

      await TermController.deleteTerm(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Term ID is required' });
    });

    test('returns 404 when delete affects no rows', async () => {
      const req = { params: { id: '1' } };
      const res = createResponse();
      TermModel.delete.mockResolvedValue({ affectedRows: 0 });

      await TermController.deleteTerm(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Term not found' });
    });

    test('returns success message when delete succeeds', async () => {
      const req = { params: { id: '1' } };
      const res = createResponse();
      TermModel.delete.mockResolvedValue({ affectedRows: 1 });

      await TermController.deleteTerm(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Term deleted successfully' });
    });
  });
});
