import { databaseClient } from '../db/client.js'
import { createHash } from 'crypto'

const addDevice = async (req, res) => {
  const { mac, email } = req.body

  try {
    const hashedEmail = createHash('sha256').update(email.trim()).digest('base64')

    const user = await databaseClient.user.findUnique({
      where: {
        email: hashedEmail,
      },
      select: {
        id: true,
      },
    })

    if (!user) return res.sendStatus(403)

    const newDevice = await databaseClient.device.create({
      data: {
        mac,
        user_id: user.id,
      },
      select: {
        id: true,
      },
    })
    return res.status(201).send(newDevice.id.toString())
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const addSensorData = async (req, res) => {
  const { deviceId, distance } = req.body

  try {
    await databaseClient.sensorData.create({
      data: {
        device_id: +deviceId,
        value: +distance,
      },
    })
    return res.sendStatus(201)
  } catch (error) {
    console.error(error)
    return res.sendStatus(403)
  }
}

const getDevices = (req, res) => {
  try {
    const devices = databaseClient.device.findMany({
      where: {
        user_id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        date_calibrated: true,
        initial_distance: true,
        item_max_amount: true,
        item_width: true,
      },
    })
    return res.status(200).json(devices)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

export { addDevice, addSensorData, getDevices }
