import { useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import CalibrateItemWidthButton from '../components/Devices/CalibrateItemWidthButton'
import CalibrateInitialDistanceButton from '../components/Devices/CalibrateInitialDistanceButton'
import { DateTime } from 'luxon'
import { updateUserDeviceById } from '../api/DeviceAPI'
import { FaBarcode, FaDiceD6, FaMicrochip } from 'react-icons/fa'

function DeviceSettings() {
  const device = useLoaderData()
  const navigate = useNavigate()

  const initialDeviceData = {
    id: device.id,
    deviceName: device.name || '',
    itemId: device.item_id || '',
    itemName: device.item_name || '',
    itemCount: device.item_stock_amount || 0,
    calibrationDate: device.date_calibrated,
  }

  const [deviceData, setDeviceData] = useState(initialDeviceData)
  const { id, deviceName, itemId, itemName, itemCount, calibrationDate } = deviceData

  const handleInput = (e) => {
    const { id, value } = e.target
    setDeviceData((current) => ({
      ...current,
      [id]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await updateUserDeviceById(id, deviceName, itemId, itemName)
      navigate('/devices')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <h2>Device Settings</h2>

        <label htmlFor="deviceName" className="header-container">
          <FaMicrochip />
          Device Name
        </label>
        <input value={deviceName} onInput={handleInput} type="text" id="deviceName" />

        <label htmlFor="itemId" className="header-container">
          <FaBarcode />
          Item ID
        </label>
        <input value={itemId} onInput={handleInput} type="text" id="itemId" />

        <label htmlFor="itemName" className="header-container">
          <FaDiceD6 />
          Item Name
        </label>
        <input value={itemName} onInput={handleInput} type="text" id="itemName" />

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
