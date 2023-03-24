import { create } from 'zustand'
import { getUserDeviceById } from '../api/DeviceAPI'
import { WebSocket } from '../api/WebSocket'
import { mergeArrayWithObject } from '../utils/utils'

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

const useDevicesStore = create((set, get) => ({
  devices: [],
  setDevices: (devices) => set({ devices }),
  getUpdatedData: async (deviceId) => {
    const data = await getUserDeviceById(deviceId)
    set((state) => ({ devices: mergeArrayWithObject(state.devices, data) }))
  },
}))

const useNotificationStore = create((set, get) => ({
  notifications: [],
  initializeNotificationService: () => {
    WebSocket.connect()
    WebSocket.on('new-sensor-data', (deviceId) => {
      useDevicesStore.getState().getUpdatedData(deviceId)
    })
    WebSocket.on('notification', (notification) => {
      get().addNotification(notification)
    })
  },
  terminateNotificationService: () => {
    set({ notifications: [] })
    WebSocket.disconnect()
    WebSocket.removeAllListeners('notification')
  },
  addNotification: (newNotification) => {
    set((state) => ({ notifications: [...state.notifications, newNotification] }))
  },
}))

export const useUser = () => useUserStore((state) => state.user)
export const useSetUser = () => useUserStore((state) => state.setUser)
export const useIsLoggedIn = () => useUserStore((state) => state.isLoggedIn)
export const useLoginUser = () => useUserStore((state) => state.loginUser)
export const useLogoutUser = () => useUserStore((state) => state.logoutUser)

export const useDevices = () => useDevicesStore((state) => state.devices)
export const useSetDevices = () => useDevicesStore((state) => state.setDevices)

export const useNotifications = () => useNotificationStore((state) => state.notifications)
export const useAddNotification = () => useNotificationStore((state) => state.addNotification)
export const useFetchNotifications = () => useNotificationStore((state) => state.fetchNotifications)
