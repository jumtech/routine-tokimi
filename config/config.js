const defaultValue = {
  "username": process.env.POSTGRES_USER,
  "password": null,
  "host": "postgres",
  "dialect": "postgres"
};

const developmentValue = {
  "database": "tokimi_development"
};
const testValue = {
  "database": "tokimi_test"
};
const productionValue = {
  "database": "tokimi_production",
  "use_env_variable": "DATABASE_URL"
};

module.exports = {
  "development": Object.assign({}, defaultValue, developmentValue),
  "test": Object.assign({}, defaultValue, testValue),
  "production": Object.assign({}, defaultValue, productionValue)
};
