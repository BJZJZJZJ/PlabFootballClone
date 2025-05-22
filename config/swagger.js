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


/*

  
  components: {
    schemas: {
      Match: {
        type: "object",
        properties: {
          _id: {
            type: "string",
          },
          title: {
            type: "string",
          },
          description: {
            type: "string",
          },
          dateTime: {
            type: "string",
            format: "date-time",
          },
          durationMinutes: {
            type: "integer",
          },
          location: {
            type: "object",
            properties: {
              address: {
                type: "string",
              },
              placeName: {
                type: "string",
              },
            },
          },
          conditions: {
            type: "object",
            properties: {
              level: {
                type: "string",
              },
              gender: {
                type: "string",
              },
              matchFormat: {
                type: "string",
              },
              theme: {
                type: "string",
              },
            },
          },
          participantInfo: {
            type: "object",
            properties: {
              playerCountRange: {
                type: "string",
              },
              playersJoined: {
                type: "integer",
              },
              femalePlayersCount: {
                type: "integer",
              },
              spotsLeft: {
                type: "integer",
              },
              isFull: {
                type: "boolean",
              },
              fee: {
                type: "integer",
              },
              applicationDeadlineMinutesBefore: {
                type: "integer",
              },
            },
          },
          manager: {
            type: "object",
            properties: {
              managerId: {
                type: "string",
              },
              name: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
*/
