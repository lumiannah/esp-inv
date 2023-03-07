import { DateTime } from 'luxon'
import { useState } from 'react'
import { FaArrowsAltV, FaBoxes, FaRegCalendarAlt } from 'react-icons/fa'
import { calibrateItemWidthAndMaxAmount } from '../../api/DeviceAPI'

function CalibrateItemWidthForm({ device }) {
  const [itemCount, setItemCount] = useState(device.item_stock_amount || 0)
  const [itemWidth, setItemWidth] = useState(device.item_width || '')
  const [dateCalibrated, setDateCalibrated] = useState(device.date_calibrated || '')

  const date = DateTime.fromISO(dateCalibrated).setLocale('fi').toLocaleString(DateTime.DATETIME_SHORT)

  const handleCalibration = async () => {
    try {
      const calibratedDevice = await calibrateItemWidthAndMaxAmount(device.id, itemCount)
      setDateCalibrated(calibratedDevice.date_calibrated)
      setItemWidth(calibratedDevice.item_width)
    } catch (error) {
      console.error(error)
    }
  }

  const handleInput = (e) => {
    const value = (e.target.value |= 0)
    setItemCount(value)
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h3>Item Calibration</h3>

      <label htmlFor="itemCount" className="header-container">
        <FaBoxes />
        Item count
      </label>
      <input id="itemCount" type="number" step="1" value={itemCount} onInput={handleInput} />

      <label htmlFor="itemWidth" className="header-container">
        <FaArrowsAltV />
        Item Width (mm)
      </label>
      <input id="itemWidth" type="text" value={itemWidth} disabled />

      <label htmlFor="dateCalibrated" className="header-container">
        <FaRegCalendarAlt />
        Calibration Date
      </label>
      <input id="dateCalibrated" type="text" value={date} disabled />

      <button type="button" onClick={handleCalibration}>
        Calibrate Item Width
      </button>
    </form>
  )
}

export default CalibrateItemWidthForm
