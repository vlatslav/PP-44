import {combineReducers, configureStore} from "@reduxjs/toolkit"
import userStore from "./../store/redusers/user/user.store.ts"
import authStore from "./redusers/auth/auth.store.ts";

export const combineReducer = combineReducers({
  userReducer: userStore,
  authReducer: authStore,

})

export const store = configureStore({
  reducer: combineReducer
})

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch;
export default store;