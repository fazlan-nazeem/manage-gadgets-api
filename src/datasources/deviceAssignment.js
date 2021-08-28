const { DataSource } = require("apollo-datasource");
const { v4: uuidv4 } = require("uuid");
const logger = require("../logger");

class DeviceAssignmentAPI extends DataSource {
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

  /**
   * Add a deviceAssignment
   * @param {*} args contains arguments id, name
   */
  async addOrUpdateDeviceAssignment(args) {
    logger.info("addDeviceAssignment function execution started");
    const argsJson = JSON.parse(JSON.stringify(args));

    //check if deviceId already exists. If so it is an update
    const entry = await this.datastore.deviceAssignment.findOne({
      where: { DEVICE_ID: argsJson.input.deviceId },
    });

    console.log(entry);
    if (entry) {
      // Entry found. Therefore update
      console.log("found");
      await this.datastore.deviceAssignment.update(
        {
          NAME: argsJson.input.name,
          EMAIL: argsJson.input.email,
          LOCATION: argsJson.input.location,
          CREATED_AT: Date.now(),
        },
        {
          where: { DEVICE_ID: argsJson.input.deviceId },
        }
      );
    } else {
      // No entry found. Therefore insert
      console.log("not found");
      const uuidForDeviceAssignmentEntry = uuidv4();
      await this.datastore.deviceAssignment.create({
        UUID: uuidForDeviceAssignmentEntry,
        DEVICE_ID: argsJson.input.deviceId,
        NAME: argsJson.input.name,
        EMAIL: argsJson.input.email,
        LOCATION: argsJson.input.location,
        CREATED_AT: Date.now(),
      });
    }

    const createdDeviceAssignmentEntry = await this.datastore.deviceAssignment.findOne(
      {
        where: { DEVICE_ID: argsJson.input.deviceId },
      }
    );

    console.log(argsJson.input.deviceId);

    return {
      id: createdDeviceAssignmentEntry.dataValues.UUID,
      deviceId: createdDeviceAssignmentEntry.dataValues.DEVICE_ID,
      name: createdDeviceAssignmentEntry.dataValues.NAME,
      email: createdDeviceAssignmentEntry.dataValues.EMAIL,
      location: createdDeviceAssignmentEntry.dataValues.LOCATION,
      createdAt: createdDeviceAssignmentEntry.dataValues.CREATED_AT,
      updatedAt: createdDeviceAssignmentEntry.dataValues.UPDATED_AT,
    };
  }

  /**
   * Get all device categories
   * @param {*} pageSize the number of elements to retrieve
   * @param {*} after the offset
   * @param {*} keyword searc h query
   */
  async getAllDeviceCategories(pageSize = 10, after = "0", keyword = "") {
    logger.info("getAllDeviceCategories function execution started");
    let rowCount = 0;
    let records = {};

    if (keyword === "") {
      const {
        count,
        rows,
      } = await this.datastore.deviceAssignment.findAndCountAll({
        where: {},
        offset: parseInt(after),
        limit: pageSize,
        order: [["CREATED_AT", "DESC"]],
      });
      rowCount = count;
      records = rows;
    } else {
      const {
        count,
        rows,
      } = await this.datastore.deviceAssignment.findAndCountAll({
        where: {
          NAME: { $like: `%${keyword}%` },
        },
        order: [["CREATED_AT", "DESC"]],
      });
      rowCount = count;
      records = rows;
    }

    let deviceCategories = [];
    const rawResult = records
      .map((l) => l.dataValues)
      .filter((l) => deviceCategories.push(l));

    const processedResult = rawResult.map(function (entry) {
      return {
        id: entry.UUID,
        name: entry.NAME,
        createdAt: entry.CREATED_AT,
        updatedAt: entry.UPDATED_AT,
      };
    });

    return {
      cursor: processedResult.length,
      hasMore: rowCount > records.length,
      totalCount: rowCount,
      deviceCategories: processedResult,
    };
  }

  /**
   * Deletes a device deviceAssignment given the id
   * @param {*} args
   */
  async deleteDeviceAssignment(args) {
    logger.info("deleteDeviceAssignment function executtion started");
    const DeviceAssignmentId = args.id;

    await this.datastore.deviceAssignment.destroy({
      where: {
        UUID: DeviceAssignmentId,
      },
    });

    return DeviceAssignmentId;
  }

  /**
   * Get deviceAssignment by deviceId
   * @param {*} args
   */
  async getDeviceAssignmentByDeviceId(args) {
    logger.info("getDeviceAssignment function executtion started");
    const DeviceAssignmentId = args.id;

    const deviceAssignmentEntry = await this.datastore.deviceAssignment.findOne(
      {
        where: {
          DEVICE_ID: args.deviceId,
        },
      }
    );

    if (deviceAssignmentEntry) {
      return {
        id: deviceAssignmentEntry.dataValues.UUID,
        deviceId: deviceAssignmentEntry.dataValues.DEVICE_ID,
        name: deviceAssignmentEntry.dataValues.NAME,
        email: deviceAssignmentEntry.dataValues.EMAIL,
        location: deviceAssignmentEntry.dataValues.LOCATION,
        createdAt: deviceAssignmentEntry.dataValues.CREATED_AT,
        updatedAt: deviceAssignmentEntry.dataValues.UPDATED_AT,
      };
    } else {
      return {};
    }
  }
}

module.exports = DeviceAssignmentAPI;