import { useLoaderData } from 'react-router-dom'
import DeviceList from '../components/Devices/DeviceList'

function Devices() {
  const devices = useLoaderData()

  return (
    <section className="devices">
      <DeviceList devices={devices} />
    </section>
  )
}

export default Devices
