
import { useEffect, useState } from 'react'

function Donations() {
  const [donors, setDonors] = useState([])
  const [resources, setResources] = useState([])
  const [donations, setDonations] = useState([])

  const [donorId, setDonorId] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [quantity, setQuantity] = useState('')

  const [message, setMessage] = useState('')

  async function loadData() {
    try {
      const [donorResponse, resourceResponse, donationResponse] =
        await Promise.all([
          fetch('http://localhost:5000/api/donors'),
          fetch('http://localhost:5000/api/resources'),
          fetch('http://localhost:5000/api/donations')
        ])

      if (!donorResponse.ok || !resourceResponse.ok || !donationResponse.ok) {
        throw new Error('Unable to load donation data')
      }

      const donorData = await donorResponse.json()
      const resourceData = await resourceResponse.json()
      const donationData = await donationResponse.json()

      setDonors(donorData)
      setResources(resourceData)
      setDonations(donationData)
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
      const response = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          donor_id: donorId,
          resource_id: resourceId,
          quantity: quantity
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to record donation')
      }

      setMessage('Donation recorded successfully!')
      setDonorId('')
      setResourceId('')
      setQuantity('')

      await loadData()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section id="donations" className="requests-section donation-section">
      <div className="section-heading">
        <div>
          <h2>Donation Management</h2>
          <p>Record donations received from registered donors.</p>
        </div>
      </div>

      <form className="donation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Donor *</label>
          <select
            value={donorId}
            onChange={(e) => setDonorId(e.target.value)}
            required
          >
            <option value="">Choose a donor</option>
            {donors.map((donor) => (
              <option key={donor.donor_id} value={donor.donor_id}>
                {donor.donor_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Resource *</label>
          <select
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            required
          >
            <option value="">Choose a resource</option>
            {resources.map((resource) => (
              <option key={resource.resource_id} value={resource.resource_id}>
                {resource.resource_name} ({resource.unit})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            required
          />
        </div>

        <button type="submit">Record Donation</button>
      </form>

      {message && <p className="donation-message">{message}</p>}

      <h3 className="donation-list-title">Donation History</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Donation ID</th>
              <th>Donor</th>
              <th>Resource</th>
              <th>Quantity</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {donations.map((donation) => (
              <tr key={donation.donation_id}>
                <td>{donation.donation_id}</td>
                <td>{donation.donor_name}</td>
                <td>{donation.resource_name}</td>
                <td>{donation.quantity} {donation.unit}</td>
                <td>
                  {new Date(donation.donation_date).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {donations.length === 0 && (
              <tr>
                <td colSpan="5">No donations recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Donations
