
import { useEffect, useState } from 'react'

function Donors() {
  const [donors, setDonors] = useState([])
  const [name, setName] = useState('')
  const [type, setType] = useState('Individual')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function loadDonors() {
    try {
      const response = await fetch('http://localhost:5000/api/donors')

      if (!response.ok) {
        throw new Error('Unable to load donors')
      }

      const data = await response.json()
      setDonors(data)
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadDonors()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/donors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          donor_name: name,
          donor_type: type,
          phone: phone,
          email: email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to add donor')
      }

      setMessage('Donor added successfully!')
      setName('')
      setType('Individual')
      setPhone('')
      setEmail('')

      await loadDonors()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section id="donors" className="requests-section donor-section">
      <div className="section-heading">
        <div>
          <h2>Donor Management</h2>
          <p>Add donors and view registered donor details.</p>
        </div>
      </div>

      <form className="donor-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Donor Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter donor name"
            required
          />
        </div>

        <div className="form-group">
          <label>Donor Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Individual">Individual</option>
            <option value="NGO">NGO</option>
            <option value="Corporate">Corporate</option>
          </select>
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />
        </div>

        <button type="submit">Add Donor</button>
      </form>

      {message && <p className="donor-message">{message}</p>}

      <h3 className="donor-list-title">Registered Donors</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Donor Name</th>
              <th>Type</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            {donors.map((donor) => (
              <tr key={donor.donor_id}>
                <td>{donor.donor_id}</td>
                <td>{donor.donor_name}</td>
                <td>{donor.donor_type}</td>
                <td>{donor.phone || '-'}</td>
                <td>{donor.email || '-'}</td>
              </tr>
            ))}

            {donors.length === 0 && (
              <tr>
                <td colSpan="5">No donors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Donors
