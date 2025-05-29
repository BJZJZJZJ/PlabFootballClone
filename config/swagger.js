const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "FlabFootball API Documentation",
    },
    servers: [
      {
        url: "http://localhost:44445",
      },
    ],
  },
  apis: ["./routes/*.js"], // Swagger 주석이 포함된 파일 경로
};

const specs = swaggerJSDoc(swaggerDefinition);

module.exports = {
  swaggerUi,
  specs,
};
