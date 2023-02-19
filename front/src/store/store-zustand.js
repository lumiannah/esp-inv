import { create } from 'zustand'

const useUserStore = create((set, get) => ({
  user: {},
  setUser: (user) => set({ user }),
  isLoggedIn: false,
  loginUser: () => {
    set({ isLoggedIn: true })
  },
  logoutUser: () => {
    set({ user: {}, isLoggedIn: false })
  },
}))

export const useUser = () => useUserStore((state) => state.user)
export const useSetUser = () => useUserStore((state) => state.setUser)
export const useIsLoggedIn = () => useUserStore((state) => state.isLoggedIn)
export const useLoginUser = () => useUserStore((state) => state.loginUser)
export const useLogoutUser = () => useUserStore((state) => state.logoutUser)
