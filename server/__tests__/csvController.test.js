import fs from "fs";
import path from "path";
import {
  processCsvUpload,
  getSalesforceObjects,
} from "../controllers/csvController.js";
import csvParser from "../utils/csvParser.js";
import * as salesforce from "../config/salesforce.js";

// Mock dependencies
jest.mock("../utils/csvParser.js");
jest.mock("../config/salesforce.js");
jest.mock("fs");

describe("CSV Controller Tests", () => {
  let mockRequest;
  let mockResponse;
  let mockSalesforceConn;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock Salesforce connection
    mockSalesforceConn = {
      sobject: jest.fn().mockReturnThis(),
      create: jest.fn(),
      describe: jest.fn().mockResolvedValue({
        sobjects: [
          {
            name: "Contact",
            label: "Contact",
            createable: true,
            fields: [],
          },
          {
            name: "Account",
            label: "Account",
            createable: true,
            fields: [],
          },
        ],
      }),
    };

    salesforce.createSalesforceConnection.mockReturnValue(mockSalesforceConn);

    // Mock fs functions
    fs.unlinkSync = jest.fn();
  });

  describe("processCsvUpload", () => {
    test("should return 400 if no file is uploaded", async () => {
      mockRequest = {
        file: undefined,
        body: {},
        session: {
          user: {
            accessToken: "test-token",
            instanceUrl: "https://test.salesforce.com",
          },
        },
      };

      await processCsvUpload(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "No file uploaded",
        })
      );
    });

    test("should return 401 if user is not authenticated", async () => {
      mockRequest = {
        file: {
          path: "/tmp/test.csv",
          originalname: "test.csv",
        },
        body: {},
        session: {},
      };

      await processCsvUpload(mockRequest, mockResponse);

      expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/test.csv");
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Authentication required",
        })
      );
    });

    test("should return 400 if file is not a CSV", async () => {
      mockRequest = {
        file: {
          path: "/tmp/test.txt",
          originalname: "test.txt",
        },
        body: {},
        session: {
          user: {
            accessToken: "test-token",
            instanceUrl: "https://test.salesforce.com",
          },
        },
      };

      await processCsvUpload(mockRequest, mockResponse);

      expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/test.txt");
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Only CSV files are allowed",
        })
      );
    });

    test("should return 400 if CSV is empty", async () => {
      mockRequest = {
        file: {
          path: "/tmp/test.csv",
          originalname: "test.csv",
        },
        body: {
          objectType: "Contact",
        },
        session: {
          user: {
            accessToken: "test-token",
            instanceUrl: "https://test.salesforce.com",
          },
        },
      };

      csvParser.parseFile.mockResolvedValue([]);

      await processCsvUpload(mockRequest, mockResponse);

      expect(csvParser.parseFile).toHaveBeenCalledWith("/tmp/test.csv");
      expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/test.csv");
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("empty"),
        })
      );
    });

    test("should parse CSV and return objectName and fields", async () => {
      mockRequest = {
        file: {
          path: "/tmp/test.csv",
          originalname: "test.csv",
        },
        body: {},
        session: {
          user: {
            accessToken: "test-token",
            instanceUrl: "https://test.salesforce.com",
          },
        },
      };

      const mockCsvData = [
        { FirstName: "John", LastName: "Doe", Email: "john@example.com" },
        { FirstName: "Jane", LastName: "Smith", Email: "jane@example.com" },
      ];

      csvParser.parseFile.mockResolvedValue(mockCsvData);

      await processCsvUpload(mockRequest, mockResponse);

      expect(csvParser.parseFile).toHaveBeenCalledWith("/tmp/test.csv");
      expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/test.csv");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "CSV parsed successfully",
          objectName: "test",
          fields: mockCsvData,
        })
      );
    });
  });

  describe("getSalesforceObjects", () => {
    test("should return 401 if user is not authenticated", async () => {
      mockRequest = {
        session: {},
      };

      await getSalesforceObjects(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Authentication required",
        })
      );
    });

    test("should return available Salesforce objects", async () => {
      mockRequest = {
        session: {
          user: {
            accessToken: "test-token",
            instanceUrl: "https://test.salesforce.com",
          },
        },
      };

      await getSalesforceObjects(mockRequest, mockResponse);

      expect(salesforce.createSalesforceConnection).toHaveBeenCalledWith(
        mockRequest.session.user
      );
      expect(mockSalesforceConn.describe).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          objects: expect.arrayContaining([
            expect.objectContaining({
              name: "Contact",
            }),
            expect.objectContaining({
              name: "Account",
            }),
          ]),
        })
      );
    });
  });
});
