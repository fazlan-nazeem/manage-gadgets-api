const { UUID } = require("sequelize");
const SQL = require("sequelize");
var config = require("./config");

module.exports.paginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
  // can pass in a function to calculate an item's cursor
  getCursor = () => null,
}) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);
  const cursorIndex = results.findIndex((item) => {
    // if an item has a `cursor` on it, use that, otherwise try to generate one
    let itemCursor = item.cursor ? item.cursor : getCursor(item);

    // if there's still not a cursor, return false by default
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1 // don't let us overflow
      ? []
      : results.slice(
          cursorIndex + 1,
          Math.min(results.length, cursorIndex + 1 + pageSize)
        )
    : results.slice(0, pageSize);
};

module.exports.createStore = () => {
  const Op = SQL.Op;
  const operatorsAliases = {
    $in: Op.in,
  };

  const db = new SQL(
    config.db.database,
    config.db.username,
    config.db.password,
    {
      host: config.db.host,
      dialect: "mysql",
      logging: function () {},
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },

      define: {
        paranoid: true,
      },
    }
  );

  const device = db.define(
    "DEVICE",
    {
      UUID: {
        type: SQL.STRING,
        primaryKey: true,
      },
      CATEGORY_ID: SQL.STRING,
      SERIAL_NUMBER: SQL.STRING,
      MODEL: SQL.STRING,
      DESCRIPTION: SQL.STRING,
      VENDOR: SQL.STRING,
      DEVICE_STATUS: SQL.STRING,
      PURCHASE_DATE: SQL.STRING,
      WARRANTY_EXPIRY_DATE: SQL.STRING,
      CREATED_AT: SQL.DATE,
      UPDATED_AT: SQL.DATE,
    },
    {
      tableName: "DEVICE",
      timestamps: false,
    }
  );

  const category = db.define(
    "DEVICE_CATEGORY",
    {
      UUID: {
        type: SQL.STRING,
        primaryKey: true,
      },
      NAME: SQL.STRING,
      CREATED_AT: SQL.DATE,
      UPDATED_AT: SQL.DATE,
    },
    {
      tableName: "DEVICE_CATEGORY",
      timestamps: false,
    }
  );

  const repair = db.define(
    "DEVICE_REPAIR",
    {
      UUID: {
        type: SQL.STRING,
        primaryKey: true,
      },
      DEVICE_ID: SQL.STRING,
      DESCRIPTION: SQL.STRING,
      STATUS: SQL.STRING,
      AGENT: SQL.STRING,
      CREATED_AT: SQL.DATE,
      UPDATED_AT: SQL.DATE,
    },
    {
      tableName: "DEVICE_REPAIR",
      timestamps: false,
    }
  );

  const deviceAssignment = db.define(
    "DEVICE_ASSIGNMENT",
    {
      UUID: {
        type: SQL.STRING,
        primaryKey: true,
      },
      DEVICE_ID: SQL.STRING,
      NAME: SQL.STRING,
      EMAIL: SQL.STRING,
      LOCATION: SQL.STRING,

      CREATED_AT: SQL.DATE,
      UPDATED_AT: SQL.DATE,
    },
    {
      tableName: "DEVICE_ASSIGNMENT",
      timestamps: false,
    }
  );

  device.belongsTo(category, {
    foreignKey: "CATEGORY_ID",
  });

  repair.belongsTo(device, {
    foreignKey: "DEVICE_ID",
  });

  deviceAssignment.belongsTo(device, {
    foreignKey: "DEVICE_ID",
  });

  return { device, repair, category, deviceAssignment };
};
