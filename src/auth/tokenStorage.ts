const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? 'ticketseller_token';

export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);
