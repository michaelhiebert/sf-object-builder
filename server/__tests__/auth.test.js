import request from "supertest";
import session from "supertest-session";
import app from "../testServer.js";

console.log("Running server tests");

describe("Auth Flow", () => {
  let testSession = null;

  beforeEach(() => {
    testSession = session(app);
  });

  it("should login with correct credentials", async () => {
    const response = await testSession
      .post("/auth/login")
      .send({ username: "validUser", password: "validPass" });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/index.html");
  });

  it("should fail login with incorrect credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ username: "invalid", password: "wrong" });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("should retrieve user info after login", async () => {
    await testSession
      .post("/auth/login")
      .send({ username: "validUser", password: "validPass" });

    const whoami = await testSession.get("/auth/whoami");
    expect(whoami.statusCode).toBe(200);
    expect(whoami.body).toHaveProperty("user_id", "mockUserId");
  });

  it("should logout and clear session", async () => {
    await testSession
      .post("/auth/login")
      .send({ username: "validUser", password: "validPass" });

    const logout = await testSession.post("/auth/logout");
    expect(logout.statusCode).toBe(200);

    const whoami = await testSession.get("/auth/whoami");
    expect(whoami.statusCode).toBe(401);
  });
});