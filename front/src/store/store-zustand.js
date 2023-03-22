import { create } from 'zustand'
import { WebSocket } from '../api/WebSocket'

const useUserStore = create((set, get) => ({
  user: {},
  setUser: (user) => set({ user }),
  isLoggedIn: false,
  loginUser: () => {
    useNotificationStore.getState().initializeNotificationService()
    set({ isLoggedIn: true })
  },
  logoutUser: () => {
    set({ user: {}, isLoggedIn: false })
  },
}))

const useNotificationStore = create((set, get) => ({
  notifications: [],
  initializeNotificationService: () => {
    WebSocket.connect()
    WebSocket.on('notification', (newNotification) => {
      get().addNotification(newNotification)
    })
  },
  terminateNotificationService: () => {
    set({ notifications: [] })
    WebSocket.disconnect()
    WebSocket.removeAllListeners('notification')
  },
  addNotification: (newNotification) => {
    console.log(newNotification)
    set((state) => ({ notifications: [...state.notifications, newNotification] }))
  },
}))

export const useUser = () => useUserStore((state) => state.user)
export const useSetUser = () => useUserStore((state) => state.setUser)
export const useIsLoggedIn = () => useUserStore((state) => state.isLoggedIn)
export const useLoginUser = () => useUserStore((state) => state.loginUser)
export const useLogoutUser = () => useUserStore((state) => state.logoutUser)

export const useNotifications = () => useNotificationStore((state) => state.notifications)
export const useAddNotification = () => useNotificationStore((state) => state.addNotification)
export const useFetchNotifications = () => useNotificationStore((state) => state.fetchNotifications)
