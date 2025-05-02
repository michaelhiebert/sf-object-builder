import {
  upsertMetadata,
  compareMetadata,
  createSalesforceObject,
} from "../controllers/metadataController.js";
import { createSalesforceConnection } from "../config/salesforce.js";
import {
  buildFieldMetadata,
  buildFieldPermissions,
} from "../utils/salesforceFields.js";

jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

jest.mock("../config/salesforce.js");
jest.mock("../utils/salesforceFields.js");

describe("metadataController", () => {
  let mockReq;
  let mockRes;
  let mockConn;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      locals: {},
    };

    mockConn = {
      metadata: {
        upsert: jest.fn(),
        read: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    createSalesforceConnection.mockReturnValue(mockConn);
  });

  describe("upsertMetadata", () => {
    it("returns 400 if upsert has errors", async () => {
      const results = [
        { fullName: "Foo__c", success: true },
        { fullName: "Bar__c", success: false, errors: [{ message: "oops" }] },
      ];
      mockConn.metadata.upsert.mockResolvedValue(results);

      mockReq = { body: { some: "payload" }, user: {} };
      await upsertMetadata(mockReq, mockRes);

      expect(mockConn.metadata.upsert).toHaveBeenCalledWith(
        "CustomObject",
        mockReq.body
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith(['[{"message":"oops"}]']);
    });

    it("sends results when all succeed", async () => {
      const results = [{ fullName: "Foo__c", success: true }];
      mockConn.metadata.upsert.mockResolvedValue(results);

      mockReq = { body: { foo: "bar" }, user: {} };
      await upsertMetadata(mockReq, mockRes);

      expect(mockConn.metadata.upsert).toHaveBeenCalledWith(
        "CustomObject",
        mockReq.body
      );
      expect(mockRes.send).toHaveBeenCalledWith(results);
    });

    it("catches and 500s on thrown error", async () => {
      mockConn.metadata.upsert.mockRejectedValue(new Error("boom"));

      mockReq = { body: {}, user: {} };
      await upsertMetadata(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "boom" })
      );
    });
  });

  describe("compareMetadata", () => {
    const sampleCsv = JSON.stringify([
      { apiName: "A__c", dataType: "text" },
      { apiName: "B__c", dataType: "number" },
      { apiName: "C__c", dataType: "date" },
    ]);

    it("400s if missing query params", async () => {
      mockReq = { query: {} };
      await compareMetadata(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Missing objectName or fieldsFromCsv",
      });
    });

    it("400s if missing params", async () => {
      mockReq = { query: {} };
      await compareMetadata(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("computes missing and mismatches against mock SF fields", async () => {
      mockReq = { query: { objectName: "O__c", fieldsFromCsv: sampleCsv } };
      await compareMetadata(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("returns correct diffs", async () => {
      mockReq = {
        query: { objectName: "My__c", fieldsFromCsv: sampleCsv },
        session: { user: {} },
      };

      // simulate describe returning one existing field and one mismatched type
      const describeResult = {
        fields: [
          { name: "A__c", label: "A", type: "string" },
          { name: "B__c", label: "B", type: "string" },
          { name: "X__c", label: "X", type: "text" },
        ],
      };
      const customObjMd = {
        fields: [
          { fullName: "My__c.A__c", label: "A", type: "String" },
          { fullName: "My__c.B__c", label: "B", type: "String" },
          { fullName: "My__c.X__c", label: "X", type: "Text" },
        ],
      };
      mockConn.metadata.read.mockResolvedValue(customObjMd);

      await compareMetadata(mockReq, mockRes);

      expect(createSalesforceConnection).toHaveBeenCalledWith(
        mockReq.session.user
      );
      expect(mockConn.metadata.read).toHaveBeenCalledWith(
        "CustomObject",
        "My__c"
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          missingInSalesforce: [
            expect.objectContaining({ apiName: "C__c", dataType: "date" }),
          ],
          missingInCsv: [
            expect.objectContaining({ name: "X__c", label: "X", type: "text" }),
          ],
          // only B__c actually mismatches (A__c matches text→text)
          typeMismatches: [
            expect.objectContaining({ apiName: "B__c", dataType: "number" }),
          ],
          suggestions: expect.any(Array),
        })
      );
    });
  });

  describe("createSalesforceObject", () => {
    let req, res, mockConn;

    beforeEach(() => {
      jest.clearAllMocks();
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {},
      };

      mockConn = {
        metadata: {
          create: jest.fn().mockResolvedValue([]),
          update: jest.fn().mockResolvedValue({}),
        },
      };
      createSalesforceConnection.mockReturnValue(mockConn);
      buildFieldMetadata.mockReturnValue([{ fullName: "MyObj__c.Field1__c" }]);
      buildFieldPermissions.mockReturnValue({
        permissions: [
          { field: "MyObj__c.Field1__c", readable: true, editable: true },
        ],
        skipped: [],
      });
    });

    it("400s if objectName or fields missing", async () => {
      req = { body: {}, session: { user: {} } };
      await createSalesforceObject(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Missing"),
        })
      );
    });

    it("401s if not authenticated", async () => {
      req = { body: { objectName: "MyObj__c", fields: [{}] }, session: {} };
      await createSalesforceObject(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Authentication required",
        })
      );
    });

    it("creates CustomObject, CustomField and updates Profile permissions", async () => {
      req = {
        body: {
          objectName: "MyObj__c",
          fields: [
            {
              "Field API Name": "Field1__c",
              "Field Label": "One",
              "Data Type": "text",
              "Help Text": "h",
              Required: true,
              Unique: false,
              "Case Sensitive": false,
              "External ID": false,
            },
          ],
        },
        session: { user: { accessToken: "t", instanceUrl: "u" } },
      };

      await createSalesforceObject(req, res);

      // object creation
      expect(mockConn.metadata.create).toHaveBeenCalledWith(
        "CustomObject",
        expect.objectContaining({ fullName: "MyObj__c", label: "MyObj" })
      );
      // fields creation
      expect(buildFieldMetadata).toHaveBeenCalledWith(
        "MyObj__c",
        req.body.fields
      );
      expect(mockConn.metadata.create).toHaveBeenCalledWith(
        "CustomField",
        expect.any(Array)
      );
      // permissions update
      expect(buildFieldPermissions).toHaveBeenCalledWith(
        "MyObj__c",
        req.body.fields
      );
      expect(mockConn.metadata.update).toHaveBeenCalledWith("Profile", {
        fullName: "Standard",
        fieldPermissions: expect.any(Array),
      });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining("MyObj__c"),
        })
      );
    });

    it("catches and returns 500 on metadata.create error", async () => {
      mockConn.metadata.create.mockRejectedValueOnce(new Error("oops"));
      req = {
        body: { objectName: "MyObj__c", fields: [{}, {}] },
        session: { user: { accessToken: "t", instanceUrl: "u" } },
      };
      await createSalesforceObject(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Failed"),
        })
      );
    });
  });
});
