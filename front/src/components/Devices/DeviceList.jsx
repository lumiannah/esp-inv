import { Link } from 'react-router-dom'
import { FaTools, FaMicrochip, FaBarcode, FaDiceD6 } from 'react-icons/fa'

const statusColor = (item_stock_percent = 0, isHighContrast = false) => {
  if (item_stock_percent > 66) {
    return isHighContrast ? 'var(--color-stock-good-hc)' : 'var(--color-stock-good)'
  } else if (item_stock_percent > 33) {
    return isHighContrast ? 'var(--color-stock-neutral-hc)' : 'var(--color-stock-neutral)'
  } else {
    return isHighContrast ? 'var(--color-stock-warning-hc)' : 'var(--color-stock-warning)'
  }
}

function DeviceList({ devices = [] }) {
  return (
    <table className="devices-list">
      <caption>User's Registered Devices</caption>
      <thead>
        <tr>
          <th scope="col">Status</th>
          <th scope="col">
            <div className="header-container ">
              <FaMicrochip />
              <span>Device Name</span>
            </div>
          </th>
          <th scope="col">
            <div className="header-container ">
              <FaBarcode />
              <span>Item ID</span>
            </div>
          </th>
          <th scope="col">
            <div className="header-container ">
              <FaDiceD6 />
              <span>Item Name</span>
            </div>
          </th>

          <th scope="col">Settings</th>
        </tr>
      </thead>
      <tbody>
        {devices.length > 0 ? (
          devices.map((device) => {
            const {
              id,
              name,
              item_id,
              item_name,
              item_stock_code,
              item_stock_amount,
              item_max_amount,
              item_stock_percent,
            } = device
            return (
              <tr key={id} className="device" data-item-stock-code={item_stock_code}>
                <td className="center-text">
                  {item_stock_amount || '0'} / {item_max_amount || '?'}
                  <div
                    aria-hidden="true"
                    style={{
                      marginTop: '.5em',
                      height: '.75em',
                      boxShadow: `0 0 0 5px ${statusColor(item_stock_percent)}, 0 0 0 6px`,
                      background: `linear-gradient(to right, ${statusColor(
                        item_stock_percent,
                        true
                      )} ${item_stock_percent}%, transparent ${item_stock_percent}%`,
                    }}
                  ></div>
                </td>
                <th scope="row">{name || 'No device name added'}</th>
                <td>{item_id || 'No item id added'}</td>
                <td>{item_name || 'No item name added'}</td>
                <td className="center-text hoverable">
                  <Link to={`${id}`}>
                    <button className="btn-with-icon">
                      <FaTools />
                    </button>
                  </Link>
                </td>
              </tr>
            )
          })
        ) : (
          <tr>
            <th>No devices registered yet.</th>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export default DeviceList
