const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    info: {
      title: "learning express_test",
      version: "1.0.0",
      description: "Test Api with express",
    },
    host: "localhost:3000",
    basePath: "/",
  },
  apis: ["./swagger/*", "./*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
