import { useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import CalibrateItemWidthButton from '../components/Devices/CalibrateItemWidthButton'
import CalibrateInitialDistanceButton from '../components/Devices/CalibrateInitialDistanceButton'
import { DateTime } from 'luxon'

function DeviceSettings() {
  const device = useLoaderData()

  const initialDeviceData = {
    id: device.id,
    name: device.name || '',
    description: device.description || '',
    itemCount: device.item_stock_amount || 0,
    calibrationDate: device.date_calibrated,
  }

  const [deviceData, setDeviceData] = useState(initialDeviceData)
  const { id, name, description, itemCount, calibrationDate } = deviceData

  const handleInput = (e) => {
    const { id, value } = e.target
    setDeviceData((current) => ({
      ...current,
      [id]: value,
    }))
  }

  const handleSubmit = async () => {}

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <h2>Device Settings</h2>

        <label htmlFor="name">Device Name</label>
        <input value={name} onInput={handleInput} type="text" id="name" />

        <label htmlFor="description">Description</label>
        <textarea value={description} onInput={handleInput} id="description" />

        <input type="submit" value="Update" />

        <h3>Calibrate</h3>
        <p>Previous calibration:</p>
        <p>{DateTime.fromISO(calibrationDate).setLocale('fi').toLocaleString(DateTime.DATETIME_SHORT)}</p>
        <CalibrateInitialDistanceButton deviceId={id} />
        <CalibrateItemWidthButton deviceId={id} initialItemCount={itemCount} />
      </form>
    </section>
  )
}

export default DeviceSettings
