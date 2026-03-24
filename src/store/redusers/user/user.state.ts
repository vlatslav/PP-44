export type ProfileT = {
  uid?: string | null
  email?: string | null
  name: string | null
}

export const initialState: ProfileT = {
  uid: localStorage.getItem('uid'),
  email: "",
  name: "",
}
