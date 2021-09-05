const { DataSource } = require("apollo-datasource");
const { v4: uuidv4 } = require("uuid");

class DeviceRepairAPI extends DataSource {
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
      const { count, rows } = await this.datastore.repair.findAndCountAll({
        where: {},
        offset: parseInt(after),
        limit: pageSize,
        include: [
          {
            model: this.datastore.device,
            include: {
              model: this.datastore.category,
            },
          },
        ],
        order: [["CREATED_AT", "DESC"]],
      });
      rowCount = count;
      records = rows;
    } else {
      const { count, rows } = await this.datastore.repair.findAndCountAll({
        where: {},
        offset: parseInt(after),

        include: [
          {
            model: this.datastore.device,
            include: {
              model: this.datastore.category,
            },
          },
        ],
        order: [["CREATED_AT", "DESC"]],
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
          model: entry.DEVICE.dataValues.MODEL,
          vendor: entry.DEVICE.dataValues.VENDOR,
          purchaseDate: entry.DEVICE.dataValues.PURCHASE_DATE,
          warrantyExpiryDate: entry.DEVICE.dataValues.WARRANTY_EXPIRY_DATE,
          deviceStatus: entry.DEVICE.dataValues.DEVICE_STATUS,
          createdAt: entry.DEVICE.dataValues.CREATED_AT,
          updatedAt: entry.DEVICE.dataValues.UPDATED_AT,
          deviceCategory: {
            id: entry.DEVICE.dataValues.DEVICE_CATEGORY.dataValues.UUID,
            name: entry.DEVICE.dataValues.DEVICE_CATEGORY.dataValues.NAME,
            createdAt:
              entry.DEVICE.dataValues.DEVICE_CATEGORY.dataValues.CREATED_AT,
            updatedAt:
              entry.DEVICE.dataValues.DEVICE_CATEGORY.dataValues.UPDATED_AT,
          },
        },
        status: entry.STATUS,
        agent: entry.AGENT,
        description: entry.DESCRIPTION,
        createdAt: entry.CREATED_AT,
        updatedAt: entry.UPDATED_AT,
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
      DEVICE_ID: argsJson.input.deviceId,
      DESCRIPTION: argsJson.input.description,
      STATUS: "PENDING",
      AGENT: argsJson.input.agent,
      CREATED_AT: Date.now(),
      UPDATED_AT: Date.now(),
    });


     // Change status of the device to 'IN_REPAIR'
     await this.datastore.device.update(
      {
        STATUS: "IN_REPAIR",
      },
      {
        where: { UUID: argsJson.input.deviceId},
      }
    );

    const associatedDeviceEntry = await this.datastore.device.find({
      where: { UUID: argsJson.input.deviceId },
      include: [
        {
          model: this.datastore.category,
        },
      ],
    });

    return {
      id: uuidForRepairEntry,
      device: {
        id: associatedDeviceEntry.dataValues.UUID,
        serialNumber: associatedDeviceEntry.dataValues.SERIAL_NUMBER,
        model: associatedDeviceEntry.dataValues.MODEL,
        description: associatedDeviceEntry.dataValues.DESCRIPTION,
        vendor: associatedDeviceEntry.dataValues.VENDOR,
        deviceStatus: associatedDeviceEntry.dataValues.DEVICE_STATUS,
        purchaseDate: associatedDeviceEntry.dataValues.PURCHASE_DATE,
        warrantyExpiryDate:
          associatedDeviceEntry.dataValues.WARRANTY_EXPIRY_DATE,
        createdAt: associatedDeviceEntry.dataValues.CREATED_AT,
        updatedAt: associatedDeviceEntry.dataValues.UPDATED_AT,
        deviceCategory: {
          id: associatedDeviceEntry.DEVICE_CATEGORY.dataValues.UUID,
          name: associatedDeviceEntry.DEVICE_CATEGORY.dataValues.NAME,
          createdAt:
            associatedDeviceEntry.DEVICE_CATEGORY.dataValues.CREATED_AT,
          updatedAt:
            associatedDeviceEntry.DEVICE_CATEGORY.dataValues.UPDATED_AT,
        },
      },
      description: createdRepairEntry.dataValues.DESCRIPTION,
      status: createdRepairEntry.dataValues.STATUS,
      agent: createdRepairEntry.dataValues.AGENT,
      createdAt: createdRepairEntry.dataValues.CREATED_AT,
      updatedAt: createdRepairEntry.dataValues.UPDATED_AT,
    };
  }

  async deleteRepair(args) {
    const repairId = args.id;

      // Find DEVICE UUID of the relevant Repair Entry before deleting
      const deviceRepairEntry = await this.datastore.repair.findOne(
      {
        where: {
          UUID: repairId,
        },
      }
    );

    await this.datastore.repair.destroy({
      where: {
        UUID: repairId,
      },
    });

     // Change status of the device to 'AVAILABLE'
     await this.datastore.device.update(
      {
        STATUS: "AVAILABLE",
      },
      {
        where: { UUID: deviceRepairEntry.dataValues.DEVICE_ID },
      }
    );

    return repairId;
  }

  async updateRepair(args) {
    const argsJson = JSON.parse(JSON.stringify(args));
    await this.datastore.repair.update(
      {
        DESCRIPTION: argsJson.input.description,
        STATUS: argsJson.input.status,
        AGENT: argsJson.input.agent,
      },
      {
        where: { UUID: argsJson.input.id },
      }
    );

    const updatedRepairEntry = await this.datastore.repair.find({
      where: { UUID: argsJson.input.id },
      include: [
        {
          model: this.datastore.device,
          include: {
            model: this.datastore.category,
          },
        },
      ],
    });

    console.log(updatedRepairEntry);
    return {
      id: updatedRepairEntry.dataValues.UUID,
      device: {
        id: updatedRepairEntry.DEVICE.dataValues.UUID,
        serialNumber: updatedRepairEntry.DEVICE.dataValues.SERIAL_NUMBER,
        model: updatedRepairEntry.DEVICE.dataValues.MODEL,
        description: updatedRepairEntry.DEVICE.dataValues.DESCRIPTION,
        vendor: updatedRepairEntry.DEVICE.dataValues.VENDOR,
        deviceStatus: updatedRepairEntry.DEVICE.dataValues.DEVICE_STATUS,
        purchaseDate: updatedRepairEntry.DEVICE.dataValues.PURCHASE_DATE,
        warrantyExpiryDate:
          updatedRepairEntry.DEVICE.dataValues.WARRANTY_EXPIRY_DATE,
        createdAt: updatedRepairEntry.DEVICE.dataValues.CREATED_AT,
        updatedAt: updatedRepairEntry.DEVICE.dataValues.UPDATED_AT,
        deviceCategory: {
          id: updatedRepairEntry.DEVICE.DEVICE_CATEGORY.dataValues.UUID,
          name: updatedRepairEntry.DEVICE.DEVICE_CATEGORY.dataValues.NAME,
          createdAt:
            updatedRepairEntry.DEVICE.DEVICE_CATEGORY.dataValues.CREATED_AT,
          updatedAt:
            updatedRepairEntry.DEVICE.DEVICE_CATEGORY.dataValues.UPDATED_AT,
        },
      },
      description: updatedRepairEntry.dataValues.DESCRIPTION,
      status: updatedRepairEntry.dataValues.STATUS,
      agent: updatedRepairEntry.dataValues.AGENT,
      createdAt: updatedRepairEntry.dataValues.CREATED_AT,
      updatedAt: updatedRepairEntry.dataValues.UPDATED_AT,
    };
  }
}

module.exports = DeviceRepairAPI;
