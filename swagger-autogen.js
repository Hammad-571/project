const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger-output.json';
const endpointsFiles = ['index.js']; // Specify the path(s) to your route files using a glob pattern

module.exports = swaggerAutogen(outputFile, endpointsFiles);
