const { DataSource } = require("apollo-datasource");

class EmployeeAPI extends DataSource {
  constructor({ datastore }) {
    super();
    this.datastore = datastore;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config) {
    this.context = config.context;
  }

  async getDeviceById(id) {
    const UUID = id;
    const found = await this.datastore.device.findOne({
      where: { UUID },
    });
    const entry = found.dataValues;

    return {
      serialNumber: entry.SERIAL_NUMBER,
      description: entry.DESCRIPTION,
      category: entry.CATEGORY,
    };
  }

  async getAllEmployees(pageSize = 10, after = "0") {
    const { count, rows } = await this.datastore.employee.findAndCountAll({
      where: {},
      offset: parseInt(after),
      limit: pageSize,
    });

    let employees = [];
    const rawResult = rows
      .map((l) => l.dataValues)
      .filter((l) => employees.push(l));

    const processedResult = rawResult.map(function (entry) {
      return {
        name: entry.NAME,
        email: entry.EMAIL,
      };
    });

    return {
      cursor: processedResult.length,
      hasMore: count > rows.length,
      employees: processedResult,
    };
  }

  async addEmployee(UUID) {
    const found = await this.datastore.employee.create({
      UUID: UUID.id.toString(),
      NAME: "harris doe",
      EMAIL: "harris@foo.com",
    });

    console.log(found);
    return {
      name: found.dataValues.NAME,
      email: found.dataValues.EMAIL,
    };
  }
}

module.exports = EmployeeAPI;
