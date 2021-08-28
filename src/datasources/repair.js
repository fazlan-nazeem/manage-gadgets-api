const { DataSource } = require("apollo-datasource");
const { v4: uuidv4 } = require("uuid");

class RepairsAPI extends DataSource {
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

  async getAllRepairs(pageSize = 10, after = "0", keyword = "") {
    let rowCount = 0;
    let records = {};

    if (keyword === "") {
      console.log("empty");
      const { count, rows } = await this.datastore.repair.findAndCountAll({
        where: {},
        offset: parseInt(after),
        limit: pageSize,
        include: [
          {
            model: this.datastore.device,
          },
        ],
        order: [["REPAIR_ADDED_TIME", "DESC"]],
      });
      rowCount = count;
      records = rows;
    } else {
      console.log("not empty");
      const { count, rows } = await this.datastore.repair.findAndCountAll({
        where: {},
        offset: parseInt(after),

        include: [
          {
            model: this.datastore.device,
            where: {
              $or: [
                { SERIAL_NUMBER: { $like: `%${keyword}%` } },
                { ASSIGNED_EMPLOYEE_NAME: { $like: `%${keyword}%` } },
              ],
            },
          },
        ],
        order: [["REPAIR_ADDED_TIME", "DESC"]],
      });
      rowCount = count;
      records = rows;
    }

    let repairs = [];

    const rawResult = records
      .map((l) => l.dataValues)
      .filter((l) => repairs.push(l));

    const processedResult = rawResult.map(function (entry) {
      return {
        id: entry.UUID,
        device: {
          id: entry.DEVICE.dataValues.UUID,
          serialNumber: entry.DEVICE.dataValues.SERIAL_NUMBER,
          description: entry.DEVICE.dataValues.DESCRIPTION,
          category: entry.DEVICE.dataValues.CATEGORY,
          employee: {
            name: entry.DEVICE.dataValues.ASSIGNED_EMPLOYEE_NAME,
            email: entry.DEVICE.dataValues.ASSIGNED_EMPLOYEE_EMAIL,
          },
        },
        createdDate: entry.REPAIR_ADDED_TIME,
        status: entry.REPAIR_STATUS,
        repairDescription: entry.REPAIR_DESCRIPTION,
      };
    });

    return {
      cursor: processedResult.length,
      hasMore: rowCount > records.length,
      totalCount: rowCount,
      repairs: processedResult,
    };
  }

  async addRepair(args) {
    const argsJson = JSON.parse(JSON.stringify(args));
    const uuidForRepairEntry = uuidv4();
    const createdRepairEntry = await this.datastore.repair.create({
      UUID: uuidForRepairEntry,
      DEVICE_ID: argsJson.input.deviceUuid,
      REPAIR_DESCRIPTION: argsJson.input.repairDescription,
      REPAIR_STATUS: "PENDING",
      REPAIR_ADDED_TIME: Date.now(),
    });

    const associatedDeviceEntry = await this.datastore.device.find({
      where: { UUID: argsJson.input.deviceUuid },
    });

    return {
      id: uuidForRepairEntry,
      device: {
        id: associatedDeviceEntry.dataValues.UUID,
        serialNumber: associatedDeviceEntry.dataValues.SERIAL_NUMBER,
        category: associatedDeviceEntry.dataValues.CATEGORY,
        description: associatedDeviceEntry.dataValues.DESCRIPTION,
        employee: {
          name: associatedDeviceEntry.dataValues.ASSIGNED_EMPLOYEE_NAME,
          email: associatedDeviceEntry.dataValues.ASSIGNED_EMPLOYEE_EMAIL,
        },
      },
      createdDate: createdRepairEntry.dataValues.REPAIR_ADDED_TIME,
      status: createdRepairEntry.dataValues.REPAIR_STATUS,
      repairDescription: createdRepairEntry.dataValues.REPAIR_DESCRIPTION,
    };
  }

  async deleteRepair(id) {
    const repairId = id.repairId;
    console.log(repairId);

    await this.datastore.repair.destroy({
      where: {
        UUID: repairId,
      },
    });

    return {
      id: repairId,
    };
  }

  async updateRepair(args) {
    const argsJson = JSON.parse(JSON.stringify(args));
    await this.datastore.repair.update(
      {
        REPAIR_DESCRIPTION: argsJson.input.repairDescription,
        REPAIR_STATUS: argsJson.input.repairStatus,
      },
      {
        where: { UUID: argsJson.input.repairUuid },
      }
    );

    const updatedRepairEntry = await this.datastore.repair.find({
      where: { UUID: argsJson.input.repairUuid },
    });

    console.log(updatedRepairEntry);

    const associatedDeviceEntry = await this.datastore.device.find({
      where: { UUID: updatedRepairEntry.dataValues.DEVICE_ID },
    });

    return {
      id: updatedRepairEntry.dataValues.UUID,
      device: {
        id: associatedDeviceEntry.dataValues.UUID,
        serialNumber: associatedDeviceEntry.dataValues.SERIAL_NUMBER,
        category: associatedDeviceEntry.dataValues.CATEGORY,
        description: associatedDeviceEntry.dataValues.DESCRIPTION,
        employee: {
          name: associatedDeviceEntry.dataValues.ASSIGNED_EMPLOYEE_NAME,
          email: associatedDeviceEntry.dataValues.ASSIGNED_EMPLOYEE_EMAIL,
        },
      },
      createdDate: updatedRepairEntry.dataValues.REPAIR_ADDED_TIME,
      status: updatedRepairEntry.dataValues.REPAIR_STATUS,
      repairDescription: updatedRepairEntry.dataValues.REPAIR_DESCRIPTION,
    };
  }
}

module.exports = RepairsAPI;
