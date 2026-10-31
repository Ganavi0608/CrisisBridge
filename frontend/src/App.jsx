
import { useEffect, useState } from 'react'
import './App.css'
import Donors from './Donors'
import Resources from './Resources'
import Donations from './Donations'
import ReliefRequests from './ReliefRequests'
import Allocations from './Allocations'
import Reports from './Reports'
import Events from './Events'

const iconPaths = {
  dashboard: 'M3 3h7v7H3z M14 3h7v4h-7z M14 11h7v10h-7z M3 14h7v7H3z',
  donors: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 8v6 M23 11h-6',
  resources: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.3 7 12 12l8.7-5 M12 22V12',
  donations: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z M12 5.7v15.1',
  requests: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  allocations: 'M20 7h-9 M14 17H5 M15 3l4 4-4 4 M9 13l-4 4 4 4',
  reports: 'M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3',
  events: 'M12 9v4 M12 17h.01 M10.3 3.9 1.8 18.2A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0z',
  bridge: 'M3 20h18 M5 20V9m14 11V9 M3 9h18 M5 9c2-3 4-4 7-4s5 1 7 4 M9 20v-6m6 6v-6'
}

function Icon({ name, className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}

function App() {
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    totalDonors: 0,
    totalRequests: 0,
    totalDonated: 0
  })

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const statsResponse = await fetch(
          'http://localhost:5000/api/dashboard'
        )

        const requestsResponse = await fetch(
          'http://localhost:5000/api/recent-requests'
        )

        if (!statsResponse.ok || !requestsResponse.ok) {
          throw new Error('Unable to load dashboard data')
        }

        const statsData = await statsResponse.json()
        const requestsData = await requestsResponse.json()

        setStats(statsData)
        setRequests(requestsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const statCards = [
    {
      title: 'Active Emergencies',
      number: stats.activeEmergencies,
      icon: 'events'
    },
    {
      title: 'Total Donors',
      number: stats.totalDonors,
      icon: 'donors'
    },
    {
      title: 'Relief Requests',
      number: stats.totalRequests,
      icon: 'requests'
    },
    {
      title: 'Total Donated Quantity',
      number: stats.totalDonated,
      icon: 'resources'
    }
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-mark"><Icon name="bridge" /></span>
          <span>CrisisBridge</span>
        </a>
        <p className="sidebar-subtitle">Emergency Coordination</p>

        <nav>
          <a className="active" href="#dashboard"><Icon name="dashboard" />Dashboard</a>
          <a href="#donors"><Icon name="donors" />Donors</a>
          <a href="#resources"><Icon name="resources" />Resources</a>
          <a href="#donations"><Icon name="donations" />Donations</a>
          <a href="#requests"><Icon name="requests" />Relief Requests</a>
          <a href="#allocations"><Icon name="allocations" />Allocations</a>
          <a href="#reports"><Icon name="reports" />Reports</a>
          <a href="#events"><Icon name="events" />Emergency Events</a>
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-status-dot" />
          <div>
            <p>Response coordination</p>
            <small>Relief through coordination</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar" id="dashboard">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Dashboard</h1>
            <p>Welcome to the CrisisBridge emergency coordination system.</p>
          </div>
          <span className="admin-label"><span className="admin-avatar">A</span>Administrator</span>
        </header>

        {loading && <p className="dashboard-notice">Loading dashboard data...</p>}

        {error && <p className="error-message">{error}</p>}

        <section className="stats-grid">
          {statCards.map((stat) => (
            <div className="stat-card" key={stat.title}>
              <div className={`stat-icon stat-icon-${stat.icon}`}><Icon name={stat.icon} /></div>
              <div className="stat-copy">
                <p>{stat.title}</p>
                <h2>{stat.number}</h2>
              </div>
            </div>
          ))}
        </section>

        <section className="emergency-banner">
          <div>
            <h2><Icon name="events" />Emergency Response Overview</h2>
            <p>
              Coordinating relief operations across Mysuru,
              Hubballi and Mangaluru.
            </p>
          </div>
          <span className="active-events-count">{stats.activeEmergencies} Active Events</span>
        </section>

        <section className="requests-section">
          <div className="section-heading">
            <div>
              <h2>Recent Relief Requests</h2>
              <p>Latest resource requirements from the database.</p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Required Resources</th>
                  <th>Urgency</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request, index) => (
                  <tr key={index}>
                    <td>{request.requester_name}</td>
                    <td>{request.resources}</td>
                    <td>
                      <span className={`urgency ${request.urgency.toLowerCase()}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td><span className="status-badge">{request.status}</span></td>
                  </tr>
                ))}

                {!loading && requests.length === 0 && (
                  <tr>
                    <td colSpan="4">No relief requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <Donors />
        <Resources />
        <Donations />
        <ReliefRequests />
        <Allocations />
        <Reports />
        <Events />

        <footer>
          CrisisBridge © 2026 | Emergency Resource Coordination System
        </footer>
      </main>
    </div>
  )
}

export default App
