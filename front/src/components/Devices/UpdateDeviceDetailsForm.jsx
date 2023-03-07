import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBarcode, FaDiceD6, FaMicrochip } from 'react-icons/fa'
import { updateUserDeviceById } from '../../api/DeviceAPI'

function UpdateDeviceDetailsForm({ device }) {
  const navigate = useNavigate()

  const initialDeviceData = {
    id: device.id,
    deviceName: device.name || '',
    itemId: device.item_id || '',
    itemName: device.item_name || '',
  }

  const [deviceData, setDeviceData] = useState(initialDeviceData)
  const { id, deviceName, itemId, itemName } = deviceData

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
    <form onSubmit={handleSubmit}>
      <h3>Device Details</h3>
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
    </form>
  )
}

export default UpdateDeviceDetailsForm
