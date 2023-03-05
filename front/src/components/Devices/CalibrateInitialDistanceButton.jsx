import { calibrateInitialDistance } from '../../api/DeviceAPI'

function CalibrateInitialDistanceButton({ deviceId }) {
  const handleCalibration = async () => {
    try {
      await calibrateInitialDistance(deviceId)
    } catch (error) {
      console.error(error)
    }
  }

  return <button onClick={handleCalibration}>Calibrate Initial Distance</button>
}

export default CalibrateInitialDistanceButton
