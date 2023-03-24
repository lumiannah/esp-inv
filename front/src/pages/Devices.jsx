import { useEffect } from 'react'
import { useLoaderData } from 'react-router-dom'
import DeviceList from '../components/Devices/DeviceList'
import { useDevices, useSetDevices } from '../store/store-zustand'

function Devices() {
  const deviceData = useLoaderData()
  const setDevices = useSetDevices()
  const devices = useDevices()

  useEffect(() => {
    setDevices(deviceData)
  }, [])

  return (
    <section className="devices">
      <DeviceList devices={devices} />
    </section>
  )
}

export default Devices
