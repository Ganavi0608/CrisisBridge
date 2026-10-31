
import { useEffect, useState } from 'react'

function Reports() {
  const [fulfillment, setFulfillment] = useState([])
  const [shortages, setShortages] = useState([])
  const [message, setMessage] = useState('')

  async function loadReports() {
    try {
      const [fulfillmentResponse, shortageResponse] =
        await Promise.all([
          fetch('http://localhost:5000/api/reports/fulfillment'),
          fetch('http://localhost:5000/api/reports/shortages')
        ])

      if (!fulfillmentResponse.ok || !shortageResponse.ok) {
        throw new Error('Unable to load reports')
      }

      const fulfillmentData = await fulfillmentResponse.json()
      const shortageData = await shortageResponse.json()

      setFulfillment(fulfillmentData)
      setShortages(shortageData)
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  return (
    <section id="reports" className="requests-section reports-section">
      <div className="section-heading">
        <div>
          <h2>Reports and Analytics</h2>
          <p>Track resource distribution and identify remaining shortages.</p>
        </div>

        <button type="button" onClick={loadReports}>
          Refresh Reports
        </button>
      </div>

      {message && <p className="reports-message">{message}</p>}

      <h3 className="allocation-list-title">Fulfillment Report</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Relief Center</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Resource</th>
              <th>Requested</th>
              <th>Allocated</th>
              <th>Shortage</th>
            </tr>
          </thead>

          <tbody>
            {fulfillment.map((item) => (
              <tr key={item.request_item_id}>
                <td>{item.requester_name}</td>
                <td>{item.location}</td>
                <td>
                  <span className={`urgency ${item.urgency.toLowerCase()}`}>
                    {item.urgency}
                  </span>
                </td>
                <td>{item.resource_name}</td>
                <td>{item.quantity_requested}</td>
                <td>{item.quantity_allocated}</td>
                <td>{item.shortage}</td>
              </tr>
            ))}

            {fulfillment.length === 0 && (
              <tr>
                <td colSpan="7">No fulfillment records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="allocation-list-title">Resource Shortage Report</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Relief Center</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Resource</th>
              <th>Requested</th>
              <th>Allocated</th>
              <th>Still Needed</th>
            </tr>
          </thead>

          <tbody>
            {shortages.map((item, index) => (
              <tr key={`${item.requester_name}-${item.resource_name}-${index}`}>
                <td>{item.requester_name}</td>
                <td>{item.location}</td>
                <td>
                  <span className={`urgency ${item.urgency.toLowerCase()}`}>
                    {item.urgency}
                  </span>
                </td>
                <td>{item.resource_name}</td>
                <td>{item.quantity_requested}</td>
                <td>{item.quantity_allocated}</td>
                <td>{item.shortage}</td>
              </tr>
            ))}

            {shortages.length === 0 && (
              <tr>
                <td colSpan="7">No resource shortages found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Reports
