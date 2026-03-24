import {useAppSelector} from "./redux.ts";

export const useAuth = () => {
  const isAuthenticated = useAppSelector(state => state.authReducer.isAuthenticated);
  const userRole = useAppSelector(state => state.authReducer.role)

  return { isAuthenticated, userRole };
};
