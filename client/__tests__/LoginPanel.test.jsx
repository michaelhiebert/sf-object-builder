// import React from "react";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import LoginPanel from "../components/LoginPanel.jsx";
// import * as authApi from "../components/api/auth.jsx";
// import { MemoryRouter } from "react-router-dom";
// import { mockNavigate } from "../__mocks__/react-router-dom.jsx";

// // Mock the auth API
// jest.mock("../components/api/auth.jsx");

// // Mock the UI components if needed
// jest.mock("../components/ui/Loading.jsx", () => () => <div data-testid="loading-spinner">Loading...</div>);
// jest.mock("../components/ui/Alert.jsx", () => ({ alert, handleClose }) => (
//   <div data-testid="alert" className={`alert-${alert.type}`}>
//     {alert.message}
//     <button onClick={handleClose} data-testid="close-alert">Close</button>
//   </div>
// ));

// describe("LoginPanel", () => {
//   beforeEach(() => {
//     // Clear all mocks before each test
//     jest.clearAllMocks();
//   });

//   it("renders the login form correctly", () => {
//     render(
//       <MemoryRouter>
//         <LoginPanel setUser={jest.fn()} />
//       </MemoryRouter>
//     );
    
//     // Check for form elements
//     expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
//     expect(screen.getByText(/log in/i)).toBeInTheDocument();
    
//     // Check initial state (no alerts visible)
//     expect(screen.queryByTestId("alert")).not.toBeInTheDocument();
//     expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
//   });

//   it("shows warning if fields are empty", () => {
//     render(
//       <MemoryRouter>
//         <LoginPanel setUser={jest.fn()} />
//       </MemoryRouter>
//     );
    
//     // Try to submit with empty fields
//     fireEvent.click(screen.getByText(/log in/i));
    
//     // Check that warning is displayed
//     expect(screen.getByTestId("alert")).toHaveClass("alert-warning");
//     expect(screen.getByText(/enter your username and password/i)).toBeInTheDocument();
//   });

//   it("shows warning if only username is provided", () => {
//     render(
//       <MemoryRouter>
//         <LoginPanel setUser={jest.fn()} />
//       </MemoryRouter>
//     );
    
//     // Enter only username
//     fireEvent.change(screen.getByLabelText(/username/i), {
//       target: { value: "validUser" },
//     });
    
//     // Try to submit
//     fireEvent.click(screen.getByText(/log in/i));
    
//     // Check that warning is displayed
//     expect(screen.getByTestId("alert")).toHaveClass("alert-warning");
//     expect(screen.getByText(/enter your username and password/i)).toBeInTheDocument();
//   });

//   it("shows warning if only password is provided", () => {
//     render(
//       <MemoryRouter>
//         <LoginPanel setUser={jest.fn()} />
//       </MemoryRouter>
//     );
    
//     // Enter only password
//     fireEvent.change(screen.getByLabelText(/password/i), {
//       target: { value: "validPass" },
//     });
    
//     // Try to submit
//     fireEvent.click(screen.getByText(/log in/i));
    
//     // Check that warning is displayed
//     expect(screen.getByTestId("alert")).toHaveClass("alert-warning");
//     expect(screen.getByText(/enter your username and password/i)).toBeInTheDocument();
//   });

//   it("shows loading state during login attempt", async () => {
//     // Create a promise that we can resolve manually
//     let resolveLogin;
//     authApi.login.mockImplementationOnce(() => new Promise(resolve => {
//       resolveLogin = resolve;
//     }));
//     authApi.whoami.mockResolvedValueOnce({ name: "Mock User", user_id: "123" });

//     render(
//       <MemoryRouter>
//         <LoginPanel setUser={jest.fn()} />
//       </MemoryRouter>
//     );
    
//     // Fill in the form
//     fireEvent.change(screen.getByLabelText(/username/i), {
//       target: { value: "validUser" },
//     });
//     fireEvent.change(screen.getByLabelText(/password/i), {
//       target: { value: "validPass" },
//     });
    
//     // Submit the form
//     fireEvent.click(screen.getByText(/log in/i));
    
//     // Check for loading state
//     expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
//     expect(screen.getByTestId("alert")).toHaveClass("alert-info");
//     expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    
//     // Resolve the login promise
//     resolveLogin();
//   });

//   it("logs in successfully and navigates to upload page", async () => {
//     const mockSetUser = jest.fn();
    
//     // Mock successful API responses
//     authApi.login.mockResolvedValueOnce();
//     authApi.whoami.mockResolvedValueOnce({ name: "Mock User", user_id: "123" });

//     render(
//       <MemoryRouter>
//         <LoginPanel setUser={mockSetUser} />
//       </MemoryRouter>
//     );
    
//     // Fill in the form
//     fireEvent.change(screen.getByLabelText(/username/i), {
//       target: { value: "validUser" },
//     });
//     fireEvent.change(screen.getByLabelText(/password/i), {
//       target: { value: "validPass" },
//     });
    
//     // Submit the form
//     fireEvent.click(screen.getByText(/log in/i));
    
//     // Wait for the login process to complete
//     await waitFor(() => {
//       expect(mockSetUser).toHaveBeenCalledWith({
//         name: "Mock User",
//         user_id: "123",
//       });
//     });
    
//     // Check for success message
//     expect(screen.getByTestId("alert")).toHaveClass("alert-success");
//     expect(screen.getByText(/logged in/i)).toBeInTheDocument();
    
//     // Check that navigate was called with the correct path
//     expect(mockNavigate).toHaveBeenCalledWith("/upload");
    
//     // Check form was reset
//     expect(screen.getByLabelText(/username/i).value).toBe("");
//     expect(screen.getByLabelText(/password/i).value).toBe("");
//   });

//   it("shows error message when login fails", async () => {
//     // Mock failed login
//     authApi.login.mockRejectedValueOnce({
//       response: { data: { message: "Invalid credentials" } }
//     });

//     render(
//       <MemoryRouter>
//         <LoginPanel setUser={jest.fn()} />
//       </MemoryRouter>
//     );
    
//     // Fill in the form
//     fireEvent.change(screen.getByLabelText(/username/i), {
//       target: { value: "invalidUser" },
//     });
//     fireEvent.change(screen.getByLabelText(/password/i), {
//       target: { value: "invalidPass" },
//     });
    
//     // Submit the form
//     fireEvent.click(screen.getByText(/log in/i));
    
//     // Wait for error message
//     await waitFor(() => {
//       expect(screen.getByTestId("alert")).toHaveClass("alert-error");
//       expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
//     });
    
//     // Check that navigate was not called
//     expect(mockNavigate).not.toHaveBeenCalled();
//   });

//   it("shows generic error message when login fails without response data", async () => {
//     // Mock failed login with no response data
//     authApi.login.mockRejectedValueOnce(new Error("Network error"));

//     render(
//       <MemoryRouter>
//         <LoginPanel setUser={jest.fn()} />
//       </MemoryRouter>
//     );
    
//     // Fill in the form
//     fireEvent.change(screen.getByLabelText(/username/i), {
//       target: { value: "user" },
//     });
//     fireEvent.change(screen.getByLabelText(/password/i), {
//       target: { value: "pass" },
//     });
    
//     // Submit the form
//     fireEvent.click(screen.getByText(/log in/i));
    
//     // Wait for error message
//     await waitFor(() => {
//       expect(screen.getByTestId("alert")).toHaveClass("alert-error");
//       expect(screen.getByText(/incorrect username and\/or password/i)).toBeInTheDocument();
//     });
//   });

//   it("closes the alert when close button is clicked", async () => {
//     render(
//       <MemoryRouter>
//         <LoginPanel setUser={jest.fn()} />
//       </MemoryRouter>
//     );
    
//     // Trigger an alert by submitting empty form
//     fireEvent.click(screen.getByText(/log in/i));
    
//     // Verify alert is shown
//     expect(screen.getByTestId("alert")).toBeInTheDocument();
    
//     // Close the alert
//     fireEvent.click(screen.getByTestId("close-alert"));
    
//     // Verify alert is gone
//     expect(screen.queryByTestId("alert")).not.toBeInTheDocument();
//   });

//   it("handles input changes correctly", () => {
//     render(
//       <MemoryRouter>
//         <LoginPanel setUser={jest.fn()} />
//       </MemoryRouter>
//     );
    
//     // Check initial empty values
//     expect(screen.getByLabelText(/username/i).value).toBe("");
//     expect(screen.getByLabelText(/password/i).value).toBe("");
    
//     // Enter username
//     fireEvent.change(screen.getByLabelText(/username/i), {
//       target: { value: "testuser" },
//     });
//     expect(screen.getByLabelText(/username/i).value).toBe("testuser");
    
//     // Enter password
//     fireEvent.change(screen.getByLabelText(/password/i), {
//       target: { value: "testpass" },
//     });
//     expect(screen.getByLabelText(/password/i).value).toBe("testpass");
//   });
// });