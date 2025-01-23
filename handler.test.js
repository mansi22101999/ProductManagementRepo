const { handler } = require('./index');  // Use require instead of import
const { 
  DynamoDBClient, 
  GetItemCommand, 
  PutItemCommand,
  DeleteItemCommand, 
  UpdateItemCommand 
} = require('@aws-sdk/client-dynamodb');

jest.mock('@aws-sdk/client-dynamodb');

describe('Lambda Function Tests', () => {
  let event;

  beforeEach(() => {
    jest.clearAllMocks();
    event = {
      httpMethod: '',
      body: '',
      queryStringParameters: {},
    };
  });

  test('POST - Should add product successfully', async () => {
    event.httpMethod = 'POST';
    event.body = JSON.stringify({
      ProductId: '123',
      Name: 'Test Product',
      Price: 100,
      Stocks: 10,
      Category: 'Test Category',
      Description: 'Test Description',
    });

    jest.mocked(PutItemCommand).mockImplementation(() => {
      return { promise: () => Promise.resolve({}) };
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe('Product added successfully!');
  });

  test('POST - Should return error if ProductId is missing', async () => {
    event.httpMethod = 'POST';
    event.body = JSON.stringify({});

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe('ProductId is required');
  });


  test('GET - Should return error if ProductId is missing', async () => {
    event.httpMethod = 'GET';

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe('Primary key is required');
  });

  test('DELETE - Should delete product successfully', async () => {
    event.httpMethod = 'DELETE';
    event.body = JSON.stringify({ ProductId: '123' });

    DeleteItemCommand.mockImplementation(() => {
      return {
        promise: () => Promise.resolve({})
      };
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe('Item with ProductId 123 successfully deleted');
  });

  test('PUT - Should update product successfully', async () => {
    event.httpMethod = 'PUT';
    event.body = JSON.stringify({ ProductId: '123', Name: 'Updated Product', Price: 150 });

    UpdateItemCommand.mockImplementation(() => {
      return {
        promise: () => Promise.resolve({})
      };
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe('Item successfully updated');
  });

  test('Unsupported HTTP method should return 405', async () => {
    event.httpMethod = 'PATCH';

    const response = await handler(event);

    expect(response.statusCode).toBe(405);
    expect(JSON.parse(response.body).message).toBe('Method Not Allowed');
  });
});
