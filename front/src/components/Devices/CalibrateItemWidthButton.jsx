import { useState } from 'react'
import { calibrateItemWidthAndMaxAmount } from '../../api/DeviceAPI'

function CalibrateItemWidthButton({ deviceId, initialItemCount = 0 }) {
  const [itemCount, setItemCount] = useState(initialItemCount)

  const handleCalibration = async () => {
    try {
      await calibrateItemWidthAndMaxAmount(deviceId, itemCount)
    } catch (error) {
      console.error(error)
    }
  }

  const handleInput = (e) => {
    const value = (e.target.value |= 0)
    setItemCount(value)
  }

  return (
    <>
      <label htmlFor="itemCount">Item count</label>
      <input id="itemCount" type="number" step="1" value={itemCount} onInput={handleInput} />
      <button type="button" onClick={handleCalibration}>
        Calibrate Item Width
      </button>
    </>
  )
}

export default CalibrateItemWidthButton
