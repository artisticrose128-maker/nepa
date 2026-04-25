import { swaggerSpec } from "../src/config/swagger";
const OpenApiValidator = require("openapi-schema-validator").default;

/**
 * Validates the generated OpenAPI specification against the 3.0.0 standard.
 */
function validateSchema() {
  const validator = new OpenApiValidator({ version: 3 });
  const result = validator.validate(swaggerSpec);

  if (result.errors && result.errors.length > 0) {
    console.error("❌ OpenAPI Schema Validation Failed!");
    console.error(JSON.stringify(result.errors, null, 2));
    process.exit(1);
  } else {
    console.log("✅ OpenAPI Schema is valid!");
  }
}

try {
  validateSchema();
} catch (error) {
  console.error("❌ Error during validation:", error);
  process.exit(1);
}
