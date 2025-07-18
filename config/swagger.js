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
    components: {
      schemas: {
        Match: {
          type: "object",
          properties: {
            startTime: {
              type: "string",
              foramt: "date-time",
              example: "2025-07-10T09:00:00Z",
            },
            durationMinutes: { type: "integer", default: "60" },
            subFieldId: { type: "string", example: "6854cb573ff05b1bae8d9f66" },
            conditions: {
              type: "object",
              properties: {
                level: {
                  type: "string",
                  example: "초보 전용",
                },
                gender: {
                  type: "string",
                  example: "남녀 혼성",
                },
                matchFormat: {
                  type: "string",
                  example: "5v5",
                },
                theme: {
                  type: "string",
                  example: "풋살화 필수",
                },
              },
            },
            fee: { type: "integer", example: "12000" },
            participantInfo: {
              type: "object",
              properties: {
                minimumPlayers: { type: "integer", default: "6" },
                maximumPlayers: { type: "integer", default: "12" },
                applicationDeadlineMinutesBefore: {
                  type: "integer",
                  default: "10",
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Swagger 주석이 포함된 파일 경로
};

const specs = swaggerJSDoc(swaggerDefinition);

module.exports = {
  swaggerUi,
  specs,
};
