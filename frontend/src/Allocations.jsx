import { useEffect, useState } from 'react'

function Allocations() {
  const [donations, setDonations] = useState([])
  const [requests, setRequests] = useState([])
  const [allocations, setAllocations] = useState([])

  const [donationId, setDonationId] = useState('')
  const [requestItemId, setRequestItemId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [message, setMessage] = useState('')

  async function loadData() {
    try {
      const [donationResponse, requestResponse, allocationResponse] =
        await Promise.all([
          fetch('http://localhost:5000/api/allocation-donations'),
          fetch('http://localhost:5000/api/allocation-requests'),
          fetch('http://localhost:5000/api/allocations')
        ])

      if (
        !donationResponse.ok ||
        !requestResponse.ok ||
        !allocationResponse.ok
      ) {
        throw new Error('Unable to load allocation data')
      }

      const donationData = await donationResponse.json()
      const requestData = await requestResponse.json()
      const allocationData = await allocationResponse.json()

      setDonations(donationData)
      setRequests(requestData)
      setAllocations(allocationData)
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectedDonation = donations.find(
    (donation) => String(donation.donation_id) === donationId
  )

  const matchingRequests = requests.filter(
    (request) =>
      selectedDonation &&
      Number(request.resource_id) === Number(selectedDonation.resource_id)
  )

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          donation_id: donationId,
          request_item_id: requestItemId,
          quantity_allocated: quantity
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to allocate resource')
      }

      setMessage('Resource allocated successfully!')
      setDonationId('')
      setRequestItemId('')
      setQuantity('')

      await loadData()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section id="allocations" className="requests-section allocation-section">
      <div className="section-heading">
        <div>
          <h2>Resource Allocation</h2>
          <p>Match donated resources with emergency relief requests.</p>
        </div>
      </div>

      <form className="allocation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Donation *</label>
          <select
            value={donationId}
            onChange={(e) => {
              setDonationId(e.target.value)
              setRequestItemId('')
            }}
            required
          >
            <option value="">Choose a donation</option>

            {donations.map((donation) => (
              <option
                key={donation.donation_id}
                value={donation.donation_id}
                disabled={Number(donation.remaining_quantity) <= 0}
              >
                {donation.donor_name} - {donation.resource_name}
                {' - Remaining: '}
                {donation.remaining_quantity} {donation.unit}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Matching Relief Request *</label>
          <select
            value={requestItemId}
            onChange={(e) => setRequestItemId(e.target.value)}
            required
            disabled={!donationId}
          >
            <option value="">Choose a relief request</option>

            {matchingRequests
              .filter((request) => Number(request.remaining_quantity) > 0)
              .map((request) => (
                <option
                  key={request.request_item_id}
                  value={request.request_item_id}
                >
                  {request.requester_name} - {request.location}
                  {' - '}
                  {request.urgency}
                  {' - Needed: '}
                  {request.remaining_quantity} {request.unit}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label>Allocation Quantity *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity to allocate"
            required
          />
        </div>

        <button type="submit">Allocate Resource</button>
      </form>

      {message && <p className="allocation-message">{message}</p>}

      <h3 className="allocation-list-title">Allocation History</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Donor</th>
              <th>Resource</th>
              <th>Relief Center</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {allocations.map((allocation) => (
              <tr key={allocation.allocation_id}>
                <td>{allocation.allocation_id}</td>
                <td>{allocation.donor_name}</td>
                <td>{allocation.resource_name}</td>
                <td>{allocation.requester_name}</td>
                <td>
                  {allocation.quantity_allocated} {allocation.unit}
                </td>
                <td>
                  {new Date(allocation.allocation_date).toLocaleDateString()}
                </td>
                <td><span className="status-badge">{allocation.allocation_status}</span></td>
              </tr>
            ))}

            {allocations.length === 0 && (
              <tr>
                <td colSpan="7">No allocations recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Allocations