import { databaseClient } from '../db/client.js'
import { createHash } from 'crypto'
import { socketIo } from '../server.js'

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
    const device = await databaseClient.device.findUnique({
      where: {
        id: +deviceId,
      },
    })

    if (!device) return res.sendStatus(403)

    await databaseClient.sensorData.create({
      data: {
        device_id: +deviceId,
        value: +distance,
      },
    })

    socketIo.to('device:' + deviceId).emit('new-sensor-data', +deviceId)

    return res.sendStatus(201)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const calibrateInitialDistance = async (req, res) => {
  try {
    const device = await databaseClient.device.findUnique({
      where: {
        id: +req.params.id,
      },
      select: {
        id: true,
        user_id: true,
        sensor_data: {
          take: 1,
          orderBy: {
            id: 'desc',
          },
          select: {
            value: true,
          },
        },
      },
    })

    const recentDistanceValue = device?.sensor_data[0]?.value

    if (!device || device.user_id !== req.user.id) return res.sendStatus(403)
    if (!recentDistanceValue) return res.sendStatus(400)

    const updatedDevice = await databaseClient.device.update({
      where: {
        id: device.id,
      },
      data: {
        initial_distance: recentDistanceValue,
      },
      select: {
        id: true,
        initial_distance: true,
      },
    })

    console.log(updatedDevice)

    return res.status(200).json(updatedDevice)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const calibrateItemWidthAndMaxAmount = async (req, res) => {
  const { itemCount } = req.body

  try {
    const device = await databaseClient.device.findUnique({
      where: {
        id: +req.params.id,
      },
      select: {
        id: true,
        user_id: true,
        initial_distance: true,
        sensor_data: {
          take: 1,
          orderBy: {
            id: 'desc',
          },
          select: {
            value: true,
          },
        },
      },
    })

    if (!device || device.user_id !== req.user.id) return res.sendStatus(403)
    if (!device.initial_distance) return res.sendStatus(400)

    const recentDistanceValue = device.sensor_data[0].value
    const deltaDistance = device.initial_distance - recentDistanceValue
    const itemWidth = deltaDistance / itemCount
    const maxAmount = ~~((device.initial_distance - 50) / itemWidth)

    const updatedDevice = await databaseClient.device.update({
      where: {
        id: device.id,
      },
      data: {
        item_width: itemWidth,
        item_max_amount: maxAmount,
        date_calibrated: new Date().toISOString(),
      },
      select: {
        id: true,
        item_width: true,
        date_calibrated: true,
      },
    })

    console.log(updatedDevice)

    return res.status(200).json(updatedDevice)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const getUserDevices = async (req, res) => {
  try {
    const devices = await databaseClient.device.findMany({
      where: {
        user_id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        item_id: true,
        item_name: true,
        date_calibrated: true,
        initial_distance: true,
        item_max_amount: true,
        item_width: true,
        sensor_data: {
          take: 1,
          orderBy: {
            id: 'desc',
          },
          select: {
            value: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    if (!devices) return res.sendStatus(204)

    for (const device of devices) {
      if (device.date_calibrated) {
        const deltaDistance = device.initial_distance - device.sensor_data[0].value
        const stockAmount = Math.round(deltaDistance / device.item_width)
        const stockPercent = Math.round((stockAmount / device.item_max_amount) * 100)

        device.item_stock_amount = stockAmount
        device.item_stock_percent = stockPercent

        if (stockPercent > 66) {
          device.item_stock_code = 3
        } else if (stockPercent > 33) {
          device.item_stock_code = 2
        } else {
          device.item_stock_code = 1
        }
      }
      delete device.sensor_data
      delete device.initial_distance
      delete device.item_width
    }

    return res.status(200).json(devices)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const getUserDeviceById = async (req, res) => {
  try {
    const device = await databaseClient.device.findUnique({
      where: {
        id: +req.params.id,
      },
      select: {
        id: true,
        name: true,
        item_id: true,
        item_name: true,
        date_calibrated: true,
        initial_distance: true,
        item_max_amount: true,
        item_width: true,
        user_id: true,
        sensor_data: {
          take: 1,
          orderBy: {
            id: 'desc',
          },
          select: {
            value: true,
          },
        },
      },
    })

    if (!device || device.user_id !== req.user.id) return res.sendStatus(403)

    if (device.date_calibrated) {
      const deltaDistance = device.initial_distance - device.sensor_data[0].value
      const stockAmount = Math.round(deltaDistance / device.item_width)
      const stockPercent = Math.round((stockAmount / device.item_max_amount) * 100)

      device.item_stock_amount = stockAmount
      device.item_stock_percent = stockPercent

      if (stockPercent > 66) {
        device.item_stock_code = 3
      } else if (stockPercent > 33) {
        device.item_stock_code = 2
      } else {
        device.item_stock_code = 1
      }
    }
    delete device.sensor_data
    delete device.user_id

    return res.status(200).json(device)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const updateUserDeviceById = async (req, res) => {
  try {
    const device = await databaseClient.device.findFirst({
      where: {
        id: +req.params.id,
        user_id: req.user.id,
      },
    })

    if (!device) return res.sendStatus(403)

    const { deviceName, itemId, itemName } = req.body

    await databaseClient.device.update({
      where: {
        id: device.id,
      },
      data: {
        name: deviceName,
        item_id: itemId,
        item_name: itemName,
      },
    })

    return res.sendStatus(200)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

export {
  addDevice,
  addSensorData,
  calibrateInitialDistance,
  calibrateItemWidthAndMaxAmount,
  getUserDevices,
  getUserDeviceById,
  updateUserDeviceById,
}
