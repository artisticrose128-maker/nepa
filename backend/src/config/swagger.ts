import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nepa API",
      version: "1.0.0",
      description: "API documentation for Nepa Billing System",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        UserCreate: {
          type: "object",
          required: ["email", "password", "firstName", "lastName"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", default: "USER" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "string" },
            billId: { type: "string" },
            userId: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string", default: "XLM" },
            status: { type: "string", enum: ["PENDING", "SUCCESS", "FAILED"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        PaymentCreate: {
          type: "object",
          required: ["billId", "userId", "amount"],
          properties: {
            billId: { type: "string" },
            userId: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string", default: "XLM" },
          },
        },
      },
    },
  },
  apis: ["./**/*.ts"], // Scan all ts files for annotations
};

export const swaggerSpec = swaggerJsdoc(options);

/**
 * Generate versioned Swagger specifications
 */
export function getVersionedSwaggerSpec(version: string = 'v1'): any {
  const versionedOptions = {
    ...options,
    definition: {
      ...options.definition,
      info: {
        ...options.definition.info,
        version: version === 'v2' ? '2.0.0' : '1.0.0',
        title: `Nepa API ${version.toUpperCase()}`,
        description: `API documentation for Nepa Billing System - ${version.toUpperCase()}`
      },
      servers: [
        {
          url: `http://localhost:3000/api/${version}`,
          description: `Development server (${version})`
        },
        ...(version === 'v1' ? [{
          url: 'https://api.nepa.com/v1',
          description: 'Production server (v1)'
        }] : [{
          url: 'https://api.nepa.com/v2',
          description: 'Production server (v2)'
        }])
      ]
    },
    apis: version === 'v2' ? ['./**/*.v2.ts', './**/v2/**/*.ts'] : ['./**/*.ts']
  };
  
  return swaggerJsdoc(versionedOptions);
}
