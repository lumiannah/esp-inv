import { useState } from 'react'
import { FaArrowsAltH } from 'react-icons/fa'
import { calibrateInitialDistance } from '../../api/DeviceAPI'

function CalibrateInitialDistanceForm({ device }) {
  const [initialDistance, setInitialDistance] = useState(device.initial_distance)

  const handleCalibration = async () => {
    try {
      const calibratedDevice = await calibrateInitialDistance(device.id)
      setInitialDistance(calibratedDevice.initial_distance)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h3>Empty Calibration</h3>
      <label htmlFor="initialDistance" className="header-container">
        <FaArrowsAltH />
        Initial Distance (mm)
      </label>
      <input value={initialDistance} type="text" id="initialDistance" disabled />

      <button onClick={handleCalibration}>Calibrate Initial Distance</button>
    </form>
  )
}

export default CalibrateInitialDistanceForm
