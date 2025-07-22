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

        Stadium: {
          type: "object",
          properties: {
            name: { type: "string", example: "공터 축구장" },
            location: {
              type: "object",
              properties: {
                province: { type: "string", example: "강원" },
                city: { type: "string", example: "원주시" },
                district: { type: "string", example: "무실동" },
                address: { type: "string", example: "무실아파트 주변 공터" },
              },
            },
            facilities: {
              type: "object",
              properties: {
                shower: { type: "boolean", default: false },
                freeParking: { type: "boolean", default: false },
                shoesRental: { type: "boolean", default: false },
                vestRental: { type: "boolean", default: false },
                ballRental: { type: "boolean", default: false },
                drinkSale: { type: "boolean", default: false },
                toiletGenderDivision: { type: "boolean", default: false },
              },
            },
          },
        },

        SubField: {
          type: "object",
          properties: {
            fieldName: { type: "string" },
            size: {
              type: "object",
              properties: {
                width: { type: "integer", exapmle: 20 },
                height: { type: "integer", exapmle: 20 },
              },
            },
            indoor: {
              type: "boolean",
              default: false,
            },
            surface: {
              type: "string",
              default: "잔디",
            },
            stadiumId: { type: "string" },
          },
        },

        User: {
          type: "object",
          properties: {
            email: {
              type: "string",
              description: "유저 Email",
              example: "test1234@test.com",
            },
            name: {
              type: "string",
              description: "유저 이름",
              example: "전전김",
            },
            birth: {
              type: "string",
              description: "유저 생일 (ISO 8601 형식)",
              format: "date-time",
              example: "1995-11-03T00:00:00.000Z",
            },
            _id: {
              type: "string",
              description: "유저 고유 ID",
              example: "6825ecd11b7ed07a429a4f1a",
            },
            gender: {
              type: "boolean",
              description: "유저의 성별 (남성 false, 여성 true)",
              example: true,
            },
            role: {
              type: "string",
              description: "유저의 역할",
              example: "user",
            },
            reservation: {
              description: "유저와 관련된 예약 고유 ID",
              type: "array",
              items: {
                type: "string",
              },
              example: "687c7e6a235057d352005a63",
            },
            profileImageUrl: {
              type: "string",
              format: "url",
              description: "유저 프로필 이미지 원본 url",
              example: "uploads/user/origin/1752757368132.jpg",
            },
            thumbnailImageUrl: {
              type: "string",
              description: "유저 프로필 이미지 썸네일 url",
              format: "url",
              example: "uploads/user/thumb/thumb-1752757368132.jpg",
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
