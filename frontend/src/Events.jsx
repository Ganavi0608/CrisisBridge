
import { useEffect, useState } from 'react'

function Events() {
  const [events, setEvents] = useState([])
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    event_name: '',
    event_type: '',
    affected_area: '',
    start_date: '',
    event_status: 'Active'
  })

  async function loadEvents() {
    try {
      const response = await fetch(
        'http://localhost:5000/api/events/all'
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load events')
      }

      setEvents(data)
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    })
  }

  function resetForm() {
    setForm({
      event_name: '',
      event_type: '',
      affected_area: '',
      start_date: '',
      event_status: 'Active'
    })

    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const url = editingId
        ? `http://localhost:5000/api/events/${editingId}`
        : 'http://localhost:5000/api/events'

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to save event')
      }

      setMessage(result.message)
      resetForm()
      await loadEvents()
    } catch (error) {
      setMessage(error.message)
    }
  }

  function handleEdit(event) {
    setEditingId(event.event_id)

    setForm({
      event_name: event.event_name,
      event_type: event.event_type,
      affected_area: event.affected_area,
      start_date: String(event.start_date).slice(0, 10),
      event_status: event.event_status
    })

    setMessage('')
  }

  return (
    <section id="events" className="requests-section events-section">
      <div className="section-heading">
        <div>
          <h2>Emergency Events</h2>
          <p>Manage disasters and emergency situations.</p>
        </div>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Emergency Event' : 'Add New Emergency'}</h3>

        <div className="event-form-grid">
          <div className="form-group">
            <label>Emergency Name *</label>
            <input
              type="text"
              name="event_name"
              value={form.event_name}
              onChange={handleChange}
              placeholder="Example: Karnataka Earthquake Response"
              required
            />
          </div>

          <div className="form-group">
            <label>Emergency Type *</label>
            <input
              type="text"
              name="event_type"
              value={form.event_type}
              onChange={handleChange}
              placeholder="Flood, Earthquake, Fire, Cyclone..."
              required
            />
          </div>

          <div className="form-group">
            <label>Affected Area *</label>
            <input
              type="text"
              name="affected_area"
              value={form.affected_area}
              onChange={handleChange}
              placeholder="Enter city or district"
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
            />
          </div>

          {editingId && (
            <div className="form-group">
              <label>Emergency Status *</label>
              <select
                name="event_status"
                value={form.event_status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          )}
        </div>

        <div className="event-form-buttons">
          <button type="submit">
            {editingId ? 'Update Emergency' : 'Add Emergency'}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {message && <p className="event-message">{message}</p>}

      <h3 className="event-list-title">Registered Emergency Events</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Emergency Name</th>
              <th>Type</th>
              <th>Affected Area</th>
              <th>Start Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {events.map((item) => (
              <tr key={item.event_id}>
                <td>{item.event_id}</td>
                <td>{item.event_name}</td>
                <td>{item.event_type}</td>
                <td>{item.affected_area}</td>
                <td>{String(item.start_date).slice(0, 10)}</td>
                <td><span className="status-badge">{item.event_status}</span></td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {events.length === 0 && (
              <tr>
                <td colSpan="7">No emergency events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Events
