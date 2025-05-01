export const loginToSalesforce = jest.fn((username, password) => {
    if (username === "validUser" && password === "validPass") {
      return Promise.resolve({
        accessToken: "mockAccessToken",
        instanceUrl: "https://mock.salesforce.com",
        identity: () => Promise.resolve({
          user_id: "mockUserId",
          display_name: "Mock User",
          organization_id: "mockOrgId"
        }),
      });
    }
    return Promise.reject({ message: "Invalid credentials" });
  });
  
  export const createSalesforceConnection = jest.fn((user) => {
    return {
      logout: jest.fn().mockResolvedValue(true),
      identity: jest.fn().mockResolvedValue({
        user_id: user.username,
        display_name: "Mock User",
        organization_id: "mockOrgId"
      }),
    };
  });
  