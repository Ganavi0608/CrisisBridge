
const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

app.get('/', (req, res) => {
  res.send('CrisisBridge Backend is Running!')
})

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DATABASE() AS database_name')

    res.json({
      message: 'MySQL connected successfully!',
      database: rows[0].database_name
    })
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    })
  }
})

app.get('/api/dashboard', async (req, res) => {
  try {
    const [donors] = await db.query(
      'SELECT COUNT(*) AS total FROM donors'
    )

    const [events] = await db.query(
      "SELECT COUNT(*) AS total FROM emergency_events WHERE event_status = 'Active'"
    )

    const [requests] = await db.query(
      'SELECT COUNT(*) AS total FROM relief_requests'
    )

    const [donations] = await db.query(
      'SELECT COALESCE(SUM(quantity), 0) AS total FROM donations'
    )

    res.json({
      totalDonors: donors[0].total,
      activeEmergencies: events[0].total,
      totalRequests: requests[0].total,
      totalDonated: donations[0].total
    })
  } catch (error) {
    res.status(500).json({
      message: 'Unable to load dashboard statistics',
      error: error.message
    })
  }
})

app.get('/api/recent-requests', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        rr.requester_name,
        GROUP_CONCAT(r.resource_name SEPARATOR ', ') AS resources,
        rr.urgency,
        rr.status
      FROM relief_requests rr
      JOIN request_items ri ON rr.request_id = ri.request_id
      JOIN resources r ON ri.resource_id = r.resource_id
      GROUP BY
        rr.request_id,
        rr.requester_name,
        rr.urgency,
        rr.status
      ORDER BY rr.request_date DESC
      LIMIT 5
    `)

    res.json(rows)
  } catch (error) {
    res.status(500).json({
      message: 'Unable to load recent requests',
      error: error.message
    })
  }
})


// Get all donors
app.get('/api/donors', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM donors ORDER BY donor_id DESC'
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a new donor
app.post('/api/donors', async (req, res) => {
  try {
    const { donor_name, donor_type, phone, email } = req.body

    if (!donor_name || !donor_type) {
      return res.status(400).json({
        message: 'Donor name and donor type are required'
      })
    }

    const [result] = await db.query(
      `INSERT INTO donors
       (donor_name, donor_type, phone, email)
       VALUES (?, ?, ?, ?)`,
      [donor_name, donor_type, phone || null, email || null]
    )

    res.status(201).json({
      message: 'Donor added successfully!',
      donor_id: result.insertId
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all resources
app.get('/api/resources', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM resources ORDER BY resource_id DESC'
    )

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a new resource
app.post('/api/resources', async (req, res) => {
  try {
    const { resource_name, unit } = req.body

    if (!resource_name || !unit) {
      return res.status(400).json({
        message: 'Resource name and unit are required'
      })
    }

    const [result] = await db.query(
      'INSERT INTO resources (resource_name, unit) VALUES (?, ?)',
      [resource_name, unit]
    )

    res.status(201).json({
      message: 'Resource added successfully!',
      resource_id: result.insertId
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


 // Get all donations with donor and resource names
app.get('/api/donations', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        d.donation_id,
        dn.donor_name,
        r.resource_name,
        d.quantity,
        r.unit,
        d.donation_date
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.donor_id
      JOIN resources r ON d.resource_id = r.resource_id
      ORDER BY d.donation_id DESC
    `)

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a new donation
app.post('/api/donations', async (req, res) => {
  try {
    const { donor_id, resource_id, quantity } = req.body

    if (!donor_id || !resource_id || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        message: 'Please provide a donor, resource and positive quantity'
      })
    }

    const [result] = await db.query(
      `INSERT INTO donations
       (donor_id, resource_id, quantity, donation_date)
       VALUES (?, ?, ?, CURDATE())`,
      [donor_id, resource_id, quantity]
    )

    res.status(201).json({
      message: 'Donation recorded successfully!',
      donation_id: result.insertId
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get emergency events for the request form
app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT event_id, event_name, affected_area
       FROM emergency_events
       WHERE event_status = 'Active'
       ORDER BY event_id DESC`
    )

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


// Get all emergency events for management
app.get('/api/events/all', async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT *
       FROM emergency_events
       ORDER BY event_id DESC`
    )

    res.json(events)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a new emergency event
app.post('/api/events', async (req, res) => {
  const {
    event_name,
    event_type,
    affected_area,
    start_date
  } = req.body

  if (!event_name || !event_type || !affected_area || !start_date) {
    return res.status(400).json({
      message: 'Please fill in all emergency event details'
    })
  }

  try {
    const [result] = await db.query(
      `INSERT INTO emergency_events
       (event_name, event_type, affected_area, start_date, event_status)
       VALUES (?, ?, ?, ?, 'Active')`,
      [event_name, event_type, affected_area, start_date]
    )

    res.status(201).json({
      message: 'Emergency event added successfully!',
      event_id: result.insertId
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Edit an existing emergency event
app.put('/api/events/:id', async (req, res) => {
  const {
    event_name,
    event_type,
    affected_area,
    start_date,
    event_status
  } = req.body

  const allowedStatuses = ['Active', 'Resolved', 'Closed']

  if (
    !event_name ||
    !event_type ||
    !affected_area ||
    !start_date ||
    !allowedStatuses.includes(event_status)
  ) {
    return res.status(400).json({
      message: 'Please provide valid emergency event details'
    })
  }

  try {
    const [result] = await db.query(
      `UPDATE emergency_events
       SET event_name = ?,
           event_type = ?,
           affected_area = ?,
           start_date = ?,
           event_status = ?
       WHERE event_id = ?`,
      [
        event_name,
        event_type,
        affected_area,
        start_date,
        event_status,
        req.params.id
      ]
    )

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        'SELECT event_id FROM emergency_events WHERE event_id = ?',
        [req.params.id]
      )

      if (existing.length === 0) {
        return res.status(404).json({
          message: 'Emergency event not found'
        })
      }
    }

    res.json({
      message: 'Emergency event updated successfully!'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


// Get all relief requests
app.get('/api/relief-requests', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        rr.request_id,
        rr.requester_name,
        rr.location,
        rr.urgency,
        rr.status,
        rr.request_date,
        ee.event_name,
        GROUP_CONCAT(
          CONCAT(r.resource_name, ' (', ri.quantity_requested, ' ', r.unit, ')')
          SEPARATOR ', '
        ) AS required_resources
      FROM relief_requests rr
      JOIN emergency_events ee ON rr.event_id = ee.event_id
      JOIN request_items ri ON rr.request_id = ri.request_id
      JOIN resources r ON ri.resource_id = r.resource_id
      GROUP BY
        rr.request_id,
        rr.requester_name,
        rr.location,
        rr.urgency,
        rr.status,
        rr.request_date,
        ee.event_name
      ORDER BY rr.request_id DESC
    `)

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a relief request and its requested resource
app.post('/api/relief-requests', async (req, res) => {
  const {
    event_id,
    requester_name,
    location,
    urgency,
    resource_id,
    quantity_requested
  } = req.body

  if (
    !event_id ||
    !requester_name ||
    !location ||
    !urgency ||
    !resource_id ||
    !quantity_requested ||
    Number(quantity_requested) <= 0
  ) {
    return res.status(400).json({
      message: 'Please complete all fields and enter a positive quantity'
    })
  }

  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    const [requestResult] = await connection.query(
      `INSERT INTO relief_requests
       (event_id, requester_name, location, urgency)
       VALUES (?, ?, ?, ?)`,
      [event_id, requester_name, location, urgency]
    )

    await connection.query(
      `INSERT INTO request_items
       (request_id, resource_id, quantity_requested)
       VALUES (?, ?, ?)`,
      [requestResult.insertId, resource_id, quantity_requested]
    )

    await connection.commit()

    res.status(201).json({
      message: 'Relief request added successfully!',
      request_id: requestResult.insertId
    })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({ message: error.message })
  } finally {
    connection.release()
  }
})

 // Get donations with their remaining quantities
app.get('/api/allocation-donations', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        d.donation_id,
        d.donor_id,
        dn.donor_name,
        d.resource_id,
        r.resource_name,
        r.unit,
        d.quantity,
        d.quantity - COALESCE(
          (SELECT SUM(a.quantity_allocated)
           FROM allocations a
           WHERE a.donation_id = d.donation_id
           AND a.allocation_status = 'Allocated'), 0
        ) AS remaining_quantity
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.donor_id
      JOIN resources r ON d.resource_id = r.resource_id
      ORDER BY d.donation_id DESC
    `)

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get relief request items with their remaining quantities
app.get('/api/allocation-requests', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        ri.request_item_id,
        rr.request_id,
        rr.requester_name,
        rr.location,
        rr.urgency,
        ri.resource_id,
        r.resource_name,
        r.unit,
        ri.quantity_requested,
        ri.quantity_requested - COALESCE(
          (SELECT SUM(a.quantity_allocated)
           FROM allocations a
           WHERE a.request_item_id = ri.request_item_id
           AND a.allocation_status = 'Allocated'), 0
        ) AS remaining_quantity
      FROM request_items ri
      JOIN relief_requests rr ON ri.request_id = rr.request_id
      JOIN resources r ON ri.resource_id = r.resource_id
      ORDER BY
        FIELD(rr.urgency, 'Critical', 'High', 'Medium', 'Low'),
        rr.request_date ASC
    `)

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get allocation history
app.get('/api/allocations', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        a.allocation_id,
        dn.donor_name,
        r.resource_name,
        rr.requester_name,
        a.quantity_allocated,
        r.unit,
        a.allocation_date,
        a.allocation_status
      FROM allocations a
      JOIN donations d ON a.donation_id = d.donation_id
      JOIN donors dn ON d.donor_id = dn.donor_id
      JOIN request_items ri ON a.request_item_id = ri.request_item_id
      JOIN relief_requests rr ON ri.request_id = rr.request_id
      JOIN resources r ON ri.resource_id = r.resource_id
      ORDER BY a.allocation_id DESC
    `)

    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Allocate a donation to a relief request

app.post('/api/allocations', async (req, res) => {
  const { donation_id, request_item_id, quantity_allocated } = req.body
  const quantity = Number(quantity_allocated)

  if (
    !donation_id ||
    !request_item_id ||
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return res.status(400).json({
      message: 'Select a donation, a relief request and enter a positive quantity'
    })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    // Lock the donation row
    const [donations] = await connection.query(
      `SELECT donation_id, resource_id, quantity
       FROM donations
       WHERE donation_id = ?
       FOR UPDATE`,
      [donation_id]
    )

    if (donations.length === 0) {
      throw new Error('Donation not found')
    }

    // Lock the requested item
    const [items] = await connection.query(
      `SELECT request_item_id, request_id, resource_id, quantity_requested
       FROM request_items
       WHERE request_item_id = ?
       FOR UPDATE`,
      [request_item_id]
    )

    if (items.length === 0) {
      throw new Error('Relief request item not found')
    }

    const donation = donations[0]
    const item = items[0]

    if (Number(donation.resource_id) !== Number(item.resource_id)) {
      throw new Error('Donation and relief request must have the same resource')
    }

    // Check remaining donation quantity
    const [donationUsed] = await connection.query(
      `SELECT COALESCE(SUM(quantity_allocated), 0) AS total
       FROM allocations
       WHERE donation_id = ?
       AND allocation_status = 'Allocated'`,
      [donation_id]
    )

    // Check remaining request quantity
    const [requestUsed] = await connection.query(
      `SELECT COALESCE(SUM(quantity_allocated), 0) AS total
       FROM allocations
       WHERE request_item_id = ?
       AND allocation_status = 'Allocated'`,
      [request_item_id]
    )

    const donationRemaining =
      Number(donation.quantity) - Number(donationUsed[0].total)

    const requestRemaining =
      Number(item.quantity_requested) - Number(requestUsed[0].total)

    if (quantity > donationRemaining) {
      throw new Error(
        `Only ${donationRemaining} units remain in this donation`
      )
    }

    if (quantity > requestRemaining) {
      throw new Error(
        `The request needs only ${requestRemaining} more units`
      )
    }

    // Insert the allocation
    await connection.query(
      `INSERT INTO allocations
       (donation_id, request_item_id, quantity_allocated)
       VALUES (?, ?, ?)`,
      [donation_id, request_item_id, quantity]
    )

    // Calculate total requested and allocated quantities
    const [requestTotals] = await connection.query(
      `SELECT
          SUM(ri.quantity_requested) AS total_requested,
          COALESCE(SUM(
            (
              SELECT COALESCE(SUM(a.quantity_allocated), 0)
              FROM allocations a
              WHERE a.request_item_id = ri.request_item_id
              AND a.allocation_status = 'Allocated'
            )
          ), 0) AS total_allocated
       FROM request_items ri
       WHERE ri.request_id = ?`,
      [item.request_id]
    )

    const totalRequested = Number(requestTotals[0].total_requested)
    const totalAllocated = Number(requestTotals[0].total_allocated)

    // Update the relief request status
    let newStatus = 'Pending'

    if (totalAllocated >= totalRequested) {
      newStatus = 'Fulfilled'
    } else if (totalAllocated > 0) {
      newStatus = 'Partially Fulfilled'
    }

    await connection.query(
      `UPDATE relief_requests
       SET status = ?
       WHERE request_id = ?`,
      [newStatus, item.request_id]
    )

    // Save allocation and status together
    await connection.commit()

    res.status(201).json({
      message: 'Resource allocated successfully!',
      request_status: newStatus
    })

  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(400).json({ message: error.message })

  } finally {
    if (connection) {
      connection.release()
    }
  }
})

const PORT = 5000

// FULFILLMENT REPORT
app.get('/api/reports/fulfillment', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        ri.request_item_id,
        rr.requester_name,
        rr.location,
        rr.urgency,
        r.resource_name,
        ri.quantity_requested,
        COALESCE(SUM(
          CASE
            WHEN a.allocation_status = 'Allocated'
            THEN a.quantity_allocated
            ELSE 0
          END
        ), 0) AS quantity_allocated,
        GREATEST(
          ri.quantity_requested - COALESCE(SUM(
            CASE
              WHEN a.allocation_status = 'Allocated'
              THEN a.quantity_allocated
              ELSE 0
            END
          ), 0),
          0
        ) AS shortage
      FROM request_items ri
      JOIN relief_requests rr
        ON ri.request_id = rr.request_id
      JOIN resources r
        ON ri.resource_id = r.resource_id
      LEFT JOIN allocations a
        ON ri.request_item_id = a.request_item_id
      WHERE rr.status != 'Cancelled'
      GROUP BY
        ri.request_item_id,
        rr.requester_name,
        rr.location,
        rr.urgency,
        r.resource_name,
        ri.quantity_requested
      ORDER BY shortage DESC
    `)

    res.json(rows)
  } catch (error) {
    res.status(500).json({
      message: 'Unable to generate fulfillment report',
      error: error.message
    })
  }
})

// SHORTAGE REPORT
app.get('/api/reports/shortages', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        rr.requester_name,
        rr.location,
        rr.urgency,
        r.resource_name,
        ri.quantity_requested,
        COALESCE(SUM(
          CASE
            WHEN a.allocation_status = 'Allocated'
            THEN a.quantity_allocated
            ELSE 0
          END
        ), 0) AS quantity_allocated,
        GREATEST(
          ri.quantity_requested - COALESCE(SUM(
            CASE
              WHEN a.allocation_status = 'Allocated'
              THEN a.quantity_allocated
              ELSE 0
            END
          ), 0),
          0
        ) AS shortage
      FROM request_items ri
      JOIN relief_requests rr
        ON ri.request_id = rr.request_id
      JOIN resources r
        ON ri.resource_id = r.resource_id
      LEFT JOIN allocations a
        ON ri.request_item_id = a.request_item_id
      WHERE rr.status != 'Cancelled'
      GROUP BY
        ri.request_item_id,
        rr.requester_name,
        rr.location,
        rr.urgency,
        r.resource_name,
        ri.quantity_requested
      HAVING shortage > 0
      ORDER BY
        CASE rr.urgency
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
        END,
        shortage DESC
    `)

    res.json(rows)
  } catch (error) {
    res.status(500).json({
      message: 'Unable to generate shortage report',
      error: error.message
    })
  }
})


app.listen(PORT, () => {
  console.log(`CrisisBridge backend running on port ${PORT}`)
})
