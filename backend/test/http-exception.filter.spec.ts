import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { MESSAGES } from '../src/common/messages';

interface ResponseMock {
  status: jest.Mock;
  json: jest.Mock;
  statusCode: number;
}

function makeHost(): { host: ArgumentsHost; res: ResponseMock } {
  const res: ResponseMock = {
    status: jest.fn(),
    json: jest.fn(),
    statusCode: HttpStatus.OK,
  };
  res.status.mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });

  const host = {
    switchToHttp: () => ({
      getResponse: <T>(): T => res as unknown as T,
      getRequest: <T>(): T => ({}) as T,
      getNext: <T>(): T => ({}) as T,
    }),
  } as unknown as ArgumentsHost;

  return { host, res };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('preserves status + message from a known HttpException', () => {
    const { host, res } = makeHost();
    filter.catch(new NotFoundException('User 1 not found'), host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      message: 'User 1 not found',
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('flattens validation error arrays into message + errors[]', () => {
    const { host, res } = makeHost();
    const validation = new BadRequestException({
      message: ['email must be an email', 'password must be longer than 8'],
      error: 'Bad Request',
      statusCode: 400,
    });
    filter.catch(validation, host);

    const body = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(body.message).toBe(
      'email must be an email, password must be longer than 8',
    );
    expect(body.errors).toEqual([
      'email must be an email',
      'password must be longer than 8',
    ]);
  });

  it('masks unknown errors with INTERNAL_ERROR (no message leak)', () => {
    const { host, res } = makeHost();
    filter.catch(new Error('database password = secret123'), host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      message: MESSAGES.INTERNAL_ERROR,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });
});
