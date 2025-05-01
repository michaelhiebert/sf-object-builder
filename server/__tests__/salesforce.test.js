import jsforce from "jsforce";
import { createSalesforceConnection, loginToSalesforce } from "../config/salesforce.js";

// mock the jsforce module
jest.mock("jsforce", () => ({
  Connection: jest.fn(() => ({
    login: jest.fn(() => Promise.resolve()), // mock .login()
  })),
}));

describe("config/salesforce", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.loginUrl = "https://login.salesforce.com";
  });

  describe("createSalesforceConnection", () => {
    it("returns a Connection when given a valid user", () => {
      const user = { accessToken: "abc", instanceUrl: "https://inst.salesforce.com" };
      const conn = createSalesforceConnection(user);
      expect(jsforce.Connection).toHaveBeenCalledWith({
        instanceUrl: user.instanceUrl,
        accessToken: user.accessToken,
      });
      expect(conn).toHaveProperty("login");
      expect(typeof conn.login).toBe("function");
    });

    it("throws when user object is missing or incomplete", () => {
      expect(() => createSalesforceConnection(null)).toThrow("Invalid Salesforce user session");
      expect(() => createSalesforceConnection({})).toThrow("Invalid Salesforce user session");
      expect(() => createSalesforceConnection({ accessToken: "x" })).toThrow(
        "Invalid Salesforce user session"
      );
    });
  });

  describe("loginToSalesforce", () => {
    it("constructs a Connection with loginUrl and calls login", async () => {
      const mockConn = { login: jest.fn().mockResolvedValue() };
      jsforce.Connection.mockImplementationOnce(() => mockConn);

      const conn = await loginToSalesforce("user", "pass");
      expect(jsforce.Connection).toHaveBeenCalledWith({ loginUrl: process.env.loginUrl });
      expect(mockConn.login).toHaveBeenCalledWith("user", "pass");
      expect(conn).toBe(mockConn);
    });
  });
});
