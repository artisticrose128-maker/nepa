import { Express, Request, Response } from "express";
import axios from "axios";
import { swaggerSpec } from "../../src/config/swagger";

/**
 * RapiDoc HTML Template
 * Provides a premium, interactive developer portal experience.
 */
const getRapiDocHtml = (specUrl: string) => `
<!doctype html>
<html>
<head>
  <title>Nepa Developer Portal</title>
  <meta charset="utf-8">
  <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
  <style>
    body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    rapi-doc { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <rapi-doc
    spec-url="${specUrl}"
    theme="dark"
    render-style="read"
    schema-style="table"
    show-header="true"
    allow-authentication="true"
    allow-server-selection="true"
    allow-api-list-style-selection="true"
    id="portal"
  >
    <img slot="nav-logo" src="https://via.placeholder.com/40" style="margin-left:20px" />
    <div slot="header" style="display:flex; align-items:center; margin-left:20px;">
        <span style="font-size:20px; font-weight:bold; color: #fff;">NEPA Developer Portal</span>
    </div>
  </rapi-doc>
</body>
</html>
`;

export const setupDocs = (app: Express) => {
  // 1. Serve the combined OpenAPI Spec
  app.get("/api-docs/openapi.json", (req: Request, res: Response) => {
    res.json(swaggerSpec);
  });

  // 2. Serve the RapiDoc Portal
  app.get("/docs", (req: Request, res: Response) => {
    res.send(getRapiDocHtml("/api-docs/openapi.json"));
  });

  // 3. API Statistics (Swagger Stats)
  // This satisfies the "API analytics and usage insights" requirement
  try {
    const swStats = require("swagger-stats");
    app.use(
      swStats.getMiddleware({
        swaggerSpec: swaggerSpec,
        uriPath: "/api-stats",
        name: "Nepa API Gateway",
      }),
    );
  } catch (e) {
    console.warn("swagger-stats not loaded. Run npm install.");
  }
};
