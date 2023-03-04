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
    const device = await databaseClient.device.findUnique({
      where: {
        id: +deviceId,
      },
    })

    if (!device) return res.sendStatus(403)

    const data = await databaseClient.sensorData.create({
      data: {
        device_id: +deviceId,
        value: +distance,
      },
    })

    console.log(data)

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
        id: +req.param.id,
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

    const data = await databaseClient.device.update({
      where: {
        id: device.id,
      },
      data: {
        initial_distance: recentDistanceValue,
      },
    })

    console.log(data)

    return res.sendStatus(200)
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
        id: +req.param.id,
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

    const data = await databaseClient.device.update({
      where: {
        id: device.id,
      },
      data: {
        item_width: itemWidth,
        item_max_amount: maxAmount,
        date_calibrated: new Date().toISOString(),
      },
    })

    console.log(data)

    return res.sendStatus(200)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

const getUserDevices = (req, res) => {
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

        if (percent > 66) {
          device.item_stock_code = 3
        } else if (percent > 33) {
          device.item_stock_code = 2
        } else {
          device.item_stock_code = 1
        }

        delete device.sensor_data
        delete device.initial_distance
        delete device.item_width
      }
    }

    return res.status(200).json(devices)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

export { addDevice, addSensorData, calibrateInitialDistance, calibrateItemWidthAndMaxAmount, getUserDevices }
