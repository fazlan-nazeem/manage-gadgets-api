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

       // Change status of the device to 'ASSIGNED'
       await this.datastore.device.update(
        {
          STATUS: "ASSIGNED",
        },
        {
          where: { UUID: argsJson.input.deviceId },
        }
      );
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
   * Deletes a device deviceAssignment given the id
   * @param {*} args
   */
  async deleteDeviceAssignment(args) {
    logger.info("deleteDeviceAssignment function executtion started");
    const DeviceAssignmentId = args.id;


     // Find DEVICE UUID of the relevant DeviceAssignmentId before deleting
     const deviceAssignmentEntry = await this.datastore.deviceAssignment.findOne(
      {
        where: {
          UUID: DeviceAssignmentId,
        },
      }
    );

    await this.datastore.deviceAssignment.destroy({
      where: {
        UUID: DeviceAssignmentId,
      },
    });


     // Change status of the device to 'AVAILABLE'
     await this.datastore.device.update(
      {
        STATUS: "AVAILABLE",
      },
      {
        where: { UUID: deviceAssignmentEntry.dataValues.DEVICE_ID },
      }
    );

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
