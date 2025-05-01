import React from 'react';

const mockNavigate = jest.fn();

export const MemoryRouter = ({ children }) => <div>{children}</div>;
export const useNavigate = () => mockNavigate;
export const useLocation = () => ({ pathname: '/' });
export const useParams = () => ({});
export const Link = ({ children, to }) => <a href={to}>{children}</a>;
export const Navigate = ({ to }) => <div>Navigate to: {to}</div>;
export const Outlet = () => <div>Outlet</div>;