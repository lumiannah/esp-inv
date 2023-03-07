import { useLoaderData } from 'react-router-dom'
import CalibrateItemWidthForm from '../components/Devices/CalibrateItemWidthForm'
import CalibrateInitialDistanceForm from '../components/Devices/CalibrateInitialDistanceForm'
import UpdateDeviceDetailsForm from '../components/Devices/UpdateDeviceDetailsForm'

function DeviceSettings() {
  const device = useLoaderData()

  return (
    <>
      <h2>Device Settings</h2>

      <section className="grid col-3">
        <UpdateDeviceDetailsForm device={device} />
        <CalibrateInitialDistanceForm device={device} />
        <CalibrateItemWidthForm device={device} />
      </section>
    </>
  )
}

export default DeviceSettings
