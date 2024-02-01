const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "http://localhost:3000/taskPro/",
      version: "1.0.0",
      description: "API description",
    },
  },
  apis: ["./routes/api/appRoutes.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
