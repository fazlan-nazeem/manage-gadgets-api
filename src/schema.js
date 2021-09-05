const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    getRepairs(pageSize: Int, after: String, keyword: String): RepairConnection!
    getDevices(pageSize: Int, after: String, keyword: String, deviceStatus: String): DeviceConnection!
    getDeviceCategories(
      pageSize: Int
      after: String
      keyword: String
    ): DeviceCategoryConnection!
    getDeviceById(id: ID!): Device!
    getDeviceAssignmentByDeviceId(deviceId: ID!): DeviceAssignment!
  }

  type Mutation {
    addDevice(input: DeviceInput): Device!
    updateDevice(input: DeviceInput): Device!
    deleteDevice(id: ID): ID!

    addDeviceCategory(name: String!): DeviceCategory!
    updateDeviceCategory(id: ID!, name: String): DeviceCategory!
    deleteDeviceCategory(id: ID!): ID!

    addRepair(input: RepairInput): Repair!
    updateRepair(input: RepairInput): Repair!
    deleteRepair(id: ID): ID!

    addOrUpdateDeviceAssignment(input: DeviceAssignmentInput): DeviceAssignment!
    deleteDeviceAssignment(id: ID!): ID!
  }

  input DeviceInput {
    id: ID
    categoryId: ID!
    serialNumber: String!
    model: String
    description: String
    vendor: String
    purchaseDate: String
    warrantyExpiryDate: String
  }

  type DeviceConnection {
    cursor: String!
    hasMore: Boolean!
    totalCount: Int!
    devices: [Device]!
  }

  type Device {
    id: ID!
    serialNumber: String!
    description: String
    model: String
    vendor: String
    deviceStatus: DevicStatus!
    purchaseDate: String
    warrantyExpiryDate: String
    createdAt: String
    updatedAt: String
    deviceCategory: DeviceCategory!
  }

  type DeviceCategory {
    id: ID!
    name: String!
    createdAt: String
    updatedAt: String
  }

  type DeviceCategoryConnection {
    cursor: String!
    hasMore: Boolean!
    totalCount: Int!
    deviceCategories: [DeviceCategory]!
  }

  input RepairInput {
    id: ID
    deviceId: ID
    description: String
    status: RepairStatus
    agent: String
  }

  type RepairConnection {
    cursor: String!
    hasMore: Boolean!
    totalCount: Int!
    repairs: [Repair]!
  }

  type Repair {
    id: ID!
    device: Device
    status: RepairStatus
    description: String
    agent: String
    createdAt: String
    updatedAt: String
  }

  type DeviceAssignment {
    id: ID
    deviceId: ID
    name: String
    email: String
    location: String
    createdAt: String
    updatedAt: String
  }

  input DeviceAssignmentInput {
    deviceId: ID!
    name: String!
    email: String!
    location: String
  }

  type User {
    id: ID!
    email: String!
    name: String!
    company: String!
  }

  enum DevicStatus {
    ALL
    ASSIGNED
    AVAILABLE
    IN_REPAIR
  }

  enum RepairStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
  }

  enum Category {
    LAPTOP
    MONITOR
    MOBILE
  }
`;

module.exports = typeDefs;
