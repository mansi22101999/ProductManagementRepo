
 const { DynamoDBClient, GetItemCommand, PutItemCommand,DeleteItemCommand,
  UpdateItemCommand, } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });

module.exports.handler = async (event) => {
  const tableName = 'Products';
  let response;

  try {
    switch (event.httpMethod) {
      case 'POST': {
        let body;


try {
  body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
} catch (error) {
  throw new Error('Invalid JSON body');
}
        if (!body.ProductId) {
          throw new Error('ProductId is required');
        }
        
        const item = {
          ProductId: { S: body.ProductId },
          Name: { S: body.Name || "Unknown" },
          Price: { N: body.Price ? body.Price.toString() : "0" },
          Stocks: { N: body.Stocks ? body.Stocks.toString() : "0" },
          Category: { S: body.Category || "Uncategorized" },
          Description: { S: body.Description || "No description" },
          CreatedAt: { S: body.CreatedAt || new Date().toISOString() },
          UpdatedAt: { S: body.UpdatedAt || new Date().toISOString() }
        };
        
        const params = {
          TableName: "Products",
          Item: item
        };
        try{
        await client.send(new PutItemCommand(params));
          return {
            statusCode: 200, // Use the appropriate status code
            headers: {
              "Content-Type": "application/json",
            },     
            body: JSON.stringify({ message: "Product added successfully!"}),
          };
        } catch (error) {
          console.error('Error creating item:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({
              message: 'An error occurred',
              error: error.message,
            }),
          };
        }
        break;
      }
      
    case 'GET': {
        const primaryKey = event.queryStringParameters?.ProductId;
      
        if (!primaryKey) {
          response = {
            statusCode: 400,
            body: JSON.stringify({
              message: 'Primary key is required',
            }),
          };
          break;
        }
      
        const params = {
          TableName: 'Products',
          Key: {
            ProductId: { S: primaryKey },
          },
        };
      
        try {
          const data = await client.send(new GetItemCommand(params));
      
          if (!data.Item) {
            response = {
              statusCode: 404,
              body: JSON.stringify({
                message: 'Item not found',
              }),
            };
          } else {
            response = {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ProductId: data.Item.ProductId?.S || null, 
                Name: data.Item.Name?.S || 'Unknown',
                Price: data.Item.Price ? parseFloat(data.Item.Price.N) : null,
                Stocks: data.Item.Stocks ? parseInt(data.Item.Stocks.N) : null,
                Category: data.Item.Category?.S || 'Uncategorized',
                Description: data.Item.Description?.S || 'No description',
                CreatedAt: data.Item.CreatedAt?.S,
                UpdatedAt: data.Item.UpdatedAt?.S,
              }),
            };
          }
        } catch (error) {
          console.error('Error fetching item:', error);
          response = {
            statusCode: 500,
            body: JSON.stringify({
              message: 'An error occurred',
              error: error.message,
            }),
          };
        }
        break;
      }
      
      case 'PUT': {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
        const primaryKey = body.ProductId;
      
        if (!primaryKey) {
          response = {
            statusCode: 400,
            body: JSON.stringify({ message: 'Primary key is required' }),
          };
          break;
        }
      
        const params = {
          TableName: 'Products',
          Key: { ProductId: { S: primaryKey } },
          UpdateExpression: 'SET #name = :name, #price = :price',
          ExpressionAttributeNames: {
            '#name': 'Name',
            '#price': 'Price',
          },
          ExpressionAttributeValues: {
            ':name': { S: body.Name },
            ':price': { N: body.Price.toString() },
          },
          ReturnValues: 'ALL_NEW',
        };
      
        try {
          const data = await client.send(new UpdateItemCommand(params));
          response = {
            statusCode: 200,
            body: JSON.stringify({
              message: 'Item successfully updated',
          
            }),
          };
        } catch (error) {
          response = {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
          };
        }
        break;
      }
      
      case 'DELETE': {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
        const primaryKey = body.ProductId;
      
        if (!primaryKey) {
          response = {
            statusCode: 400,
            body: JSON.stringify({ message: 'Primary key is required' }),
          };
          break;
        }
      
        const params = {
          TableName: 'Products',
          Key: { ProductId: { S: primaryKey } },
        };
      
        try {
          await client.send(new DeleteItemCommand(params));
          response = {
            statusCode: 200,
            body: JSON.stringify({ message: `Item with ProductId ${primaryKey} successfully deleted` }),
          };
        } catch (error) {
          response = {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
          };
        }
        break;
      }
      
      default:
        response = {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    response = {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }

  return response;
};
