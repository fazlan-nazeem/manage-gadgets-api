const { DataSource } = require("apollo-datasource");
const { v4: uuidv4 } = require("uuid");
const logger = require("../logger");
const moment = require("moment");

class DeviceAPI extends DataSource {
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
   * Adds a device
   * @param {*} args
   */
  async addDevice(args) {
    logger.info("addDevice function execution started");
    const argsJson = JSON.parse(JSON.stringify(args));
    const uuidForDeviceEntry = uuidv4();
    await this.datastore.device.create({
      UUID: uuidForDeviceEntry,
      CATEGORY_ID: argsJson.input.categoryId,
      SERIAL_NUMBER: argsJson.input.serialNumber,
      MODEL: argsJson.input.model,
      DESCRIPTION: argsJson.input.description,
      VENDOR: argsJson.input.vendor,
      DEVICE_STATUS: argsJson.input.deviceStatus,
      PURCHASE_DATE: argsJson.input.purchaseDate,
      WARRANTY_EXPIRY_DATE: argsJson.input.warrantyExpiryDate,
    });

    const createdDeviceEntry = await this.datastore.device.find({
      where: { UUID: uuidForDeviceEntry },
    });

    const associatedDeviceCategoryEntry = await this.datastore.category.find({
      where: { UUID: argsJson.input.categoryId },
    });

    return {
      id: createdDeviceEntry.dataValues.UUID,
      serialNumber: createdDeviceEntry.dataValues.SERIAL_NUMBER,
      model: createdDeviceEntry.dataValues.MODEL,
      description: createdDeviceEntry.dataValues.DESCRIPTION,
      vendor: createdDeviceEntry.dataValues.VENDOR,
      deviceStatus: createdDeviceEntry.dataValues.DEVICE_STATUS,
      purchaseDate: createdDeviceEntry.dataValues.PURCHASE_DATE,
      warrantyExpiryDate: createdDeviceEntry.dataValues.WARRANTY_EXPIRY_DATE,
      createdAt: createdDeviceEntry.dataValues.CREATED_AT,
      updatedAt: createdDeviceEntry.dataValues.UPDATED_AT,
      deviceCategory: {
        id: associatedDeviceCategoryEntry.dataValues.UUID,
        name: associatedDeviceCategoryEntry.dataValues.NAME,
        createdAt: associatedDeviceCategoryEntry.dataValues.CREATED_AT,
        updatedAt: associatedDeviceCategoryEntry.dataValues.UPDATED_AT,
      },
    };
  }

  /**
   * Get all devices
   * @param {*} pageSize
   * @param {*} after
   * @param {*} keyword
   */
  async getAllDevices(pageSize = 10, after = "0", keyword = "") {
    logger.info("getAllDevices function execution started");
    let rowCount = 0;
    let records = {};

    if (keyword === "") {
      const { count, rows } = await this.datastore.device.findAndCountAll({
        where: {},
        offset: parseInt(after),
        limit: pageSize,
        order: [["CREATED_AT", "DESC"]],
        include: [
          {
            model: this.datastore.category,
          },
        ],
      });
      rowCount = count;
      records = rows;
    } else {
      const { count, rows } = await this.datastore.device.findAndCountAll({
        where: {
          SERIAL_NUMBER: { $like: `%${keyword}%` },
        },
        order: [["CREATED_AT", "DESC"]],
        include: [
          {
            model: this.datastore.category,
          },
        ],
      });
      rowCount = count;
      records = rows;
    }

    let devices = [];
    const rawResult = records
      .map((l) => l.dataValues)
      .filter((l) => devices.push(l));

    const processedResult = rawResult.map(function (entry) {
      return {
        id: entry.UUID,
        serialNumber: entry.SERIAL_NUMBER,
        model: entry.MODEL,
        description: entry.DESCRIPTION,
        vendor: entry.VENDOR,
        deviceStatus: entry.DEVICE_STATUS,
        purchaseDate: entry.PURCHASE_DATE,
        warrantyExpiryDate: entry.WARRANTY_EXPIRY_DATE,
        createdAt: entry.CREATED_AT,
        updatedAt: entry.UPDATED_AT,
        deviceCategory: {
          id: entry.DEVICE_CATEGORY.dataValues.UUID,
          name: entry.DEVICE_CATEGORY.dataValues.NAME,
          createdAt: entry.DEVICE_CATEGORY.dataValues.CREATED_AT,
          updatedAt: entry.DEVICE_CATEGORY.dataValues.UPDATED_AT,
        },
      };
    });

    return {
      cursor: processedResult.length,
      hasMore: rowCount > records.length,
      totalCount: rowCount,
      devices: processedResult,
    };
  }

  /**
   * Update a device category
   * @param {*} args
   */
  async updateDevice(args) {
    logger.info("updateDevice function execution started");
    const argsJson = JSON.parse(JSON.stringify(args));

    const purchaseDate = new Date(
      moment(argsJson.input.purchaseDate, "DD/MM/YYYY")
    );
    const warrantyExpiryDate = new Date(
      moment(argsJson.input.warrantyExpiryDate, "DD/MM/YYYY")
    );
    await this.datastore.device.update(
      {
        CATEGORY_ID: argsJson.input.categoryId,
        SERIAL_NUMBER: argsJson.input.serialNumber,
        MODEL: argsJson.input.model,
        DESCRIPTION: argsJson.input.description,
        VENDOR: argsJson.input.vendor,
        DEVICE_STATUS: argsJson.input.deviceStatus,
        PURCHASE_DATE: purchaseDate
          .toISOString()
          .slice(0, 10)
          .replace("T", " "),
        WARRANTY_EXPIRY_DATE: warrantyExpiryDate

          .toISOString()
          .slice(0, 10)
          .replace("T", " "),
      },
      {
        where: { UUID: argsJson.input.id },
      }
    );

    const updatedDeviceEntry = await this.datastore.device.find({
      where: { UUID: argsJson.input.id },
    });

    const associatedDeviceCategoryEntry = await this.datastore.category.find({
      where: { UUID: argsJson.input.categoryId },
    });

    return {
      id: updatedDeviceEntry.dataValues.UUID,
      serialNumber: updatedDeviceEntry.dataValues.SERIAL_NUMBER,
      model: updatedDeviceEntry.dataValues.MODEL,
      description: updatedDeviceEntry.dataValues.DESCRIPTION,
      vendor: updatedDeviceEntry.dataValues.VENDOR,
      deviceStatus: updatedDeviceEntry.dataValues.DEVICE_STATUS,
      purchaseDate: updatedDeviceEntry.dataValues.PURCHASE_DATE,
      warrantyExpiryDate: updatedDeviceEntry.dataValues.WARRANTY_EXPIRY_DATE,
      createdAt: updatedDeviceEntry.dataValues.CREATED_AT,
      updatedAt: updatedDeviceEntry.dataValues.UPDATED_AT,
      deviceCategory: {
        id: associatedDeviceCategoryEntry.dataValues.UUID,
        name: associatedDeviceCategoryEntry.dataValues.NAME,
        createdAt: associatedDeviceCategoryEntry.dataValues.CREATED_AT,
        updatedAt: associatedDeviceCategoryEntry.dataValues.UPDATED_AT,
      },
    };
  }

  /**
   * Deletes a device given its Id
   * @param {*} id
   */
  async deleteDevice(args) {
    const deviceId = args.id;
    await this.datastore.device.destroy({
      where: {
        UUID: deviceId,
      },
    });

    return deviceId;
  }

  /**
   * Get device by Id
   * @param {*} id
   */
  async getDeviceById(args) {
    const deviceId = args.id;
    const deviceEntry = await this.datastore.device.find({
      where: {
        UUID: deviceId,
      },
      include: [
        {
          model: this.datastore.category,
        },
      ],
    });

    return {
      id: deviceEntry.dataValues.UUID,
      serialNumber: deviceEntry.dataValues.SERIAL_NUMBER,
      model: deviceEntry.dataValues.MODEL,
      description: deviceEntry.dataValues.DESCRIPTION,
      vendor: deviceEntry.dataValues.VENDOR,
      deviceStatus: deviceEntry.dataValues.DEVICE_STATUS,
      purchaseDate: deviceEntry.dataValues.PURCHASE_DATE,
      warrantyExpiryDate: deviceEntry.dataValues.WARRANTY_EXPIRY_DATE,
      createdAt: deviceEntry.dataValues.CREATED_AT,
      updatedAt: deviceEntry.dataValues.UPDATED_AT,
      deviceCategory: {
        id: deviceEntry.DEVICE_CATEGORY.dataValues.UUID,
        name: deviceEntry.DEVICE_CATEGORY.dataValues.NAME,
        createdAt: deviceEntry.DEVICE_CATEGORY.dataValues.CREATED_AT,
        updatedAt: deviceEntry.DEVICE_CATEGORY.dataValues.UPDATED_AT,
      },
    };
  }
}

module.exports = DeviceAPI;
