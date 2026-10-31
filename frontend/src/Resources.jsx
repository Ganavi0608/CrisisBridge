
import { useEffect, useState } from 'react'

function Resources() {
  const [resources, setResources] = useState([])
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('pieces')
  const [message, setMessage] = useState('')

  async function loadResources() {
    try {
      const response = await fetch('http://localhost:5000/api/resources')

      if (!response.ok) {
        throw new Error('Unable to load resources')
      }

      const data = await response.json()
      setResources(data)
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resource_name: name,
          unit: unit
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to add resource')
      }

      setMessage('Resource added successfully!')
      setName('')
      setUnit('pieces')

      await loadResources()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section id="resources" className="requests-section resource-section">
      <div className="section-heading">
        <div>
          <h2>Resource Management</h2>
          <p>Add and manage the resources used for emergency relief.</p>
        </div>
      </div>

      <form className="resource-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Resource Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: Water"
            required
          />
        </div>

        <div className="form-group">
          <label>Unit *</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="litres">Litres</option>
            <option value="kits">Kits</option>
            <option value="pieces">Pieces</option>
            <option value="packs">Packs</option>
            <option value="kg">Kilograms</option>
            <option value="boxes">Boxes</option>
          </select>
        </div>

        <button type="submit">Add Resource</button>
      </form>

      {message && <p className="resource-message">{message}</p>}

      <h3 className="resource-list-title">Available Resources</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Resource ID</th>
              <th>Resource Name</th>
              <th>Unit</th>
            </tr>
          </thead>

          <tbody>
            {resources.map((resource) => (
              <tr key={resource.resource_id}>
                <td>{resource.resource_id}</td>
                <td>{resource.resource_name}</td>
                <td>{resource.unit}</td>
              </tr>
            ))}

            {resources.length === 0 && (
              <tr>
                <td colSpan="3">No resources found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Resources
