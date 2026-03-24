import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit"
import { Axios } from "axios"
import {initialState} from "./user.state.ts";

export const fetchProfile = createAsyncThunk(
    "profile/fetProfile",
    async (axios: Axios) => (await axios.get("api/account")).data
)

const userStore = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ uid: string, name: string, email: string | null }>) => {
      state.uid = action.payload.uid;
      state.name = action.payload.name;
      state.email = action.payload.email;
      localStorage.setItem('uid', action.payload.uid);
    },
    clearUser: (state) => {
      state.uid = null;
      state.name = null;
      state.email = null;
      localStorage.removeItem('uid');
      localStorage.removeItem('idToken');
    }
  }
})

export const {
  setUser,
  clearUser
} = userStore.actions

export default userStore.reducer
