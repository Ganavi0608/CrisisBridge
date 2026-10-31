
import { useEffect, useState } from 'react'

function ReliefRequests() {
  const [events, setEvents] = useState([])
  const [resources, setResources] = useState([])
  const [requests, setRequests] = useState([])

  const [eventId, setEventId] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [location, setLocation] = useState('')
  const [urgency, setUrgency] = useState('High')
  const [resourceId, setResourceId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [message, setMessage] = useState('')

  async function loadData() {
    try {
      const [eventResponse, resourceResponse, requestResponse] =
        await Promise.all([
          fetch('http://localhost:5000/api/events'),
          fetch('http://localhost:5000/api/resources'),
          fetch('http://localhost:5000/api/relief-requests')
        ])

      if (
        !eventResponse.ok ||
        !resourceResponse.ok ||
        !requestResponse.ok
      ) {
        throw new Error('Unable to load relief request data')
      }

      const eventData = await eventResponse.json()
      const resourceData = await resourceResponse.json()
      const requestData = await requestResponse.json()

      setEvents(eventData)
      setResources(resourceData)
      setRequests(requestData)
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/relief-requests',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event_id: eventId,
            requester_name: requesterName,
            location: location,
            urgency: urgency,
            resource_id: resourceId,
            quantity_requested: quantity
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to add relief request')
      }

      setMessage('Relief request added successfully!')
      setEventId('')
      setRequesterName('')
      setLocation('')
      setUrgency('High')
      setResourceId('')
      setQuantity('')

      await loadData()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section id="requests" className="requests-section relief-section">
      <div className="section-heading">
        <div>
          <h2>Relief Request Management</h2>
          <p>Register emergency resource requirements.</p>
        </div>
      </div>

      <form className="relief-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Emergency Event *</label>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event.event_id} value={event.event_id}>
                {event.event_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Requester Name *</label>
          <input
            type="text"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            placeholder="Enter requester or relief center name"
            required
          />
        </div>

        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter affected location"
            required
          />
        </div>

        <div className="form-group">
          <label>Urgency *</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="form-group">
          <label>Required Resource *</label>
          <select
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            required
          >
            <option value="">Select a resource</option>
            {resources.map((resource) => (
              <option key={resource.resource_id} value={resource.resource_id}>
                {resource.resource_name} ({resource.unit})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Required Quantity *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter required quantity"
            required
          />
        </div>

        <button type="submit">Submit Relief Request</button>
      </form>

      {message && <p className="relief-message">{message}</p>}

      <h3 className="relief-list-title">Registered Relief Requests</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Emergency Event</th>
              <th>Requester</th>
              <th>Location</th>
              <th>Resources Required</th>
              <th>Urgency</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => (
              <tr key={request.request_id}>
                <td>{request.request_id}</td>
                <td>{request.event_name}</td>
                <td>{request.requester_name}</td>
                <td>{request.location}</td>
                <td>{request.required_resources}</td>
                <td>
                  <span className={`urgency ${request.urgency.toLowerCase()}`}>
                    {request.urgency}
                  </span>
                </td>
                <td><span className="status-badge">{request.status}</span></td>
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td colSpan="7">No relief requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ReliefRequests
