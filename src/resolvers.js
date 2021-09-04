module.exports = {
  Query: {
    getRepairs: (_, { pageSize, after, keyword }, { dataSources }) =>
      dataSources.deviceRepairAPI.getAllRepairs(pageSize, after, keyword),
    getDevices: (_, { pageSize, after, keyword }, { dataSources }) =>
      dataSources.deviceAPI.getAllDevices(pageSize, after, keyword),
    getDeviceCategories: (_, { pageSize, after, keyword }, { dataSources }) =>
      dataSources.deviceCategoryAPI.getAllDeviceCategories(
        pageSize,
        after,
        keyword
      ),
    getDeviceById: (_, args, { dataSources }) =>
      dataSources.deviceAPI.getDeviceById(args),
    getDeviceAssignmentByDeviceId: (_, args, { dataSources }) =>
      dataSources.deviceAssignmentAPI.getDeviceAssignmentByDeviceId(args),
  },
  Mutation: {
    addRepair: (_, args, { dataSources }) =>
      dataSources.deviceRepairAPI.addRepair(args),
    deleteRepair: (_, args, { dataSources }) =>
      dataSources.deviceRepairAPI.deleteRepair(args),
    updateRepair: (_, args, { dataSources }) =>
      dataSources.deviceRepairAPI.updateRepair(args),

    addDevice: (_, args, { dataSources }) =>
      dataSources.deviceAPI.addDevice(args),
    deleteDevice: (_, id, { dataSources }) =>
      dataSources.deviceAPI.deleteDevice(id),
    updateDevice: (_, args, { dataSources }) =>
      dataSources.deviceAPI.updateDevice(args),

    addDeviceCategory: (_, name, { dataSources }) =>
      dataSources.deviceCategoryAPI.addDeviceCategory(name),
    updateDeviceCategory: (_, args, { dataSources }) =>
      dataSources.deviceCategoryAPI.updateDeviceCategory(args),
    deleteDeviceCategory: (_, id, { dataSources }) =>
      dataSources.deviceCategoryAPI.deleteDeviceCategory(id),

    addOrUpdateDeviceAssignment: (_, args, { dataSources }) =>
      dataSources.deviceAssignmentAPI.addOrUpdateDeviceAssignment(args),
    deleteDeviceAssignment: (_, id, { dataSources }) =>
      dataSources.deviceAssignmentAPI.deleteDeviceAssignment(id),
  },
};
