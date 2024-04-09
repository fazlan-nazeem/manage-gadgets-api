const { DataSource } = require("apollo-datasource");
const { v4: uuidv4 } = require("uuid");
const logger = require("../logger");

class DeviceCategoryAPI extends DataSource {
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
   * Adds a device category
   * @param {*} args contains arguments id, name
   */
  async addDeviceCategory(args) {
    logger.info("addDeviceCategory function execution started");
    const uuidForDeviceCategoryEntry = uuidv4();
    await this.datastore.category.create({
      UUID: uuidForDeviceCategoryEntry,
      NAME: args.name,
      CREATED_AT: Date.now(),
    });

    const createdDeviceCategoryEntry = await this.datastore.category.findOne({
      where: { UUID: uuidForDeviceCategoryEntry },
    });

    return {
      id: uuidForDeviceCategoryEntry,
      name: createdDeviceCategoryEntry.dataValues.NAME,
      createdAt: createdDeviceCategoryEntry.dataValues.CREATED_AT,
      updatedAt: createdDeviceCategoryEntry.dataValues.UPDATED_AT,
    };
  }

  /**
   * Updates a device category
   * @param {*} args contains arguments id,name
   */
  async updateDeviceCategory(args) {
    logger.info("updateDeviceCategory function execution started");
    await this.datastore.category.update(
      {
        NAME: args.name,
        UPDATED_AT: Date.now(),
      },
      {
        where: { UUID: args.id },
      }
    );

    const updatedDeviceCategoryEntry = await this.datastore.category.findOne({
      where: { UUID: args.id },
    });

    return {
      id: updatedDeviceCategoryEntry.UUID,
      name: updatedDeviceCategoryEntry.dataValues.NAME,
      createdAt: updatedDeviceCategoryEntry.dataValues.CREATED_AT,
      updatedAt: updatedDeviceCategoryEntry.dataValues.UPDATED_AT,
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
      const { count, rows } = await this.datastore.category.findAndCountAll({
        where: {},
        offset: parseInt(after),
        limit: pageSize,
        order: [["CREATED_AT", "DESC"]],
      });
      rowCount = count;
      records = rows;
    } else {
      const { count, rows } = await this.datastore.category.findAndCountAll({
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
   * Deletes a device category given the id
   * @param {*} args
   */
  async deleteDeviceCategory(args) {
    logger.info("deleteDeviceCategory function executtion started");
    const deviceCategoryId = args.id;

    await this.datastore.category.destroy({
      where: {
        UUID: deviceCategoryId,
      },
    });

    return deviceCategoryId;
  }
}

module.exports = DeviceCategoryAPI;
