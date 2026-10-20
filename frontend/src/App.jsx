
import { useEffect, useState } from 'react';
import Admin from './Admin';
import './App.css';

const API_URL = 'http://localhost:8080/api/requests';
const AUTH_URL = 'http://localhost:8080/api/auth';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  const [citizen, setCitizen] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('citizen'));
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
  });

  async function fetchRequests() {
    try {
      setError('');

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Could not load service requests.');
      }

      const data = await response.json();
      setRequests(data);
    } catch {
      setError(
          'Could not connect to the server. Please check that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (citizen) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [citizen]);

  function handleAuthChange(event) {
    const { name, value } = event.target;

    setAuthForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    const isRegister = authMode === 'register';
    const endpoint = isRegister ? '/register' : '/login';

    try {
      const response = await fetch(`${AUTH_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            isRegister
                ? authForm
                : {
                  email: authForm.email,
                  password: authForm.password,
                }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
            data.detail ||
            data.message ||
            (response.status === 409
                ? 'An account with this email already exists.'
                : 'Authentication failed. Please check your details.')
        );
      }

      if (isRegister) {
        setAuthSuccess(
            'Account created successfully! You can now log in.'
        );

        setAuthMode('login');

        setAuthForm({
          fullName: '',
          email: authForm.email,
          password: '',
        });
      } else {
        const signedInCitizen = {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
        };

        localStorage.setItem(
            'citizen',
            JSON.stringify(signedInCitizen)
        );

        setCitizen(signedInCitizen);
        setShowAdmin(false);

        setAuthForm({
          fullName: '',
          email: '',
          password: '',
        });
      }
    } catch (err) {
      setAuthError(
          err.message ||
          'Could not connect to the server. Please try again.'
      );
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('citizen');

    setCitizen(null);
    setShowAdmin(false);
    setAuthMode('login');
    setAuthError('');
    setAuthSuccess('');
    setRequests([]);
    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
            data.errors
                ?.map((item) => item.defaultMessage)
                .join(', ') ||
            data.detail ||
            data.message ||
            'Please check your details and try again.'
        );
      }

      setRequests((previousRequests) => [
        data,
        ...previousRequests,
      ]);

      setForm({
        title: '',
        description: '',
        category: '',
        location: '',
      });

      setSuccess(
          'Your service request has been submitted successfully.'
      );
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id, status) {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
          `${API_URL}/${id}/status?status=${status}`,
          { method: 'PATCH' }
      );

      if (!response.ok) {
        throw new Error('Could not update the request status.');
      }

      const updatedRequest = await response.json();

      setRequests((previousRequests) =>
          previousRequests.map((request) =>
              request.id === id ? updatedRequest : request
          )
      );

      setSuccess(
          `Request #${id} updated to ${status.replace('_', ' ')}.`
      );
    } catch (err) {
      setError(err.message || 'Could not update the request.');
    }
  }

  const isAdmin = citizen?.email === 'admin@example.com';

  const pendingCount = requests.filter(
      (request) => request.status === 'PENDING'
  ).length;

  const inProgressCount = requests.filter(
      (request) => request.status === 'IN_PROGRESS'
  ).length;

  const resolvedCount = requests.filter(
      (request) => request.status === 'RESOLVED'
  ).length;

  if (showAdmin && isAdmin) {
    return <Admin />;
  }

  if (!citizen) {
    return (
        <div className="app auth-page">
          <header className="topbar">
            <a className="brand" href="#home">
              <span className="brand-icon">PS</span>
              <span>
              <strong>Public Service</strong>
              <small>REQUEST PORTAL</small>
            </span>
            </a>

            <span className="online-label">
            <span className="online-dot"></span>
            Citizen Portal
          </span>
          </header>

          <main className="auth-main" id="home">
            <section className="auth-intro">
            <span className="eyebrow">
              YOUR COMMUNITY, OUR PRIORITY
            </span>

              <h1>Better communities start with your voice.</h1>

              <p>
                Create an account to submit community service requests
                and follow their progress.
              </p>

              <div className="auth-benefits">
                <p>✓ Report local issues</p>
                <p>✓ Track service request progress</p>
                <p>✓ Help improve your community</p>
              </div>
            </section>

            <section className="panel auth-panel">
              <div className="section-heading">
                <div>
                <span className="section-kicker">
                  {authMode === 'login'
                      ? 'WELCOME BACK'
                      : 'JOIN THE PORTAL'}
                </span>

                  <h2>
                    {authMode === 'login'
                        ? 'Citizen login'
                        : 'Create an account'}
                  </h2>

                  <p>
                    {authMode === 'login'
                        ? 'Log in to access the service portal.'
                        : 'Enter your details to get started.'}
                  </p>
                </div>
              </div>

              {authError && (
                  <div className="alert alert-error" role="alert">
                    {authError}
                  </div>
              )}

              {authSuccess && (
                  <div className="alert alert-success" role="status">
                    {authSuccess}
                  </div>
              )}

              <form onSubmit={handleAuthSubmit}>
                {authMode === 'register' && (
                    <div className="form-group">
                      <label htmlFor="fullName">Full name</label>

                      <input
                          id="fullName"
                          name="fullName"
                          value={authForm.fullName}
                          onChange={handleAuthChange}
                          placeholder="Enter your full name"
                          maxLength={100}
                          autoComplete="name"
                          required
                      />
                    </div>
                )}

                <div className="form-group">
                  <label htmlFor="authEmail">Email address</label>

                  <input
                      id="authEmail"
                      name="email"
                      type="email"
                      value={authForm.email}
                      onChange={handleAuthChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="authPassword">Password</label>

                  <input
                      id="authPassword"
                      name="password"
                      type="password"
                      value={authForm.password}
                      onChange={handleAuthChange}
                      placeholder={
                        authMode === 'register'
                            ? 'At least 8 characters'
                            : 'Enter your password'
                      }
                      minLength={
                        authMode === 'register' ? 8 : undefined
                      }
                      autoComplete={
                        authMode === 'register'
                            ? 'new-password'
                            : 'current-password'
                      }
                      required
                  />
                </div>

                <button
                    className="primary-button submit-button"
                    type="submit"
                    disabled={authLoading}
                >
                  {authLoading
                      ? 'Please wait...'
                      : authMode === 'login'
                          ? 'Log in'
                          : 'Create account'}

                  {!authLoading && <span>→</span>}
                </button>
              </form>

              <p className="auth-switch">
                {authMode === 'login'
                    ? "Don't have an account?"
                    : 'Already have an account?'}{' '}

                <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setAuthMode(
                          authMode === 'login' ? 'register' : 'login'
                      );
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                >
                  {authMode === 'login' ? 'Register here' : 'Log in'}
                </button>
              </p>
            </section>
          </main>

          <footer className="footer">
            <span>Public Service Request Portal</span>
            <span>Making community services more accessible.</span>
          </footer>
        </div>
    );
  }

  return (
      <div className="app">
        <header className="topbar">
          <a className="brand" href="#home">
            <span className="brand-icon">PS</span>
            <span>
            <strong>Public Service</strong>
            <small>REQUEST PORTAL</small>
          </span>
          </a>

          <nav>
            <a href="#home">Home</a>
            <a href="#submit">Submit a Request</a>
            <a href="#requests">Track Requests</a>
          </nav>

          <div className="account-actions">
            {isAdmin && (
                <button
                    className="logout-button"
                    type="button"
                    onClick={() => setShowAdmin(true)}
                >
                  Admin Dashboard
                </button>
            )}

            <span className="online-label">
            <span className="online-dot"></span>
              {citizen.fullName}
          </span>

            <button
                className="logout-button"
                type="button"
                onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <main id="home">
          <section className="hero">
            <div className="hero-content">
            <span className="eyebrow">
              YOUR COMMUNITY, OUR PRIORITY
            </span>

              <h1>
                How can we help
                <br />
                you today?
              </h1>

              <p>
                Report an issue in your community and follow its progress
                from submission to resolution.
              </p>

              <a className="primary-button hero-button" href="#submit">
                Submit a request <span>→</span>
              </a>
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="art-circle circle-one"></div>
              <div className="art-circle circle-two"></div>

              <div className="art-card">
                <span className="art-check">✓</span>
                <strong>We're here to help</strong>
                <small>Every request matters.</small>
              </div>

              <div className="art-sparkle sparkle-one">✦</div>
              <div className="art-sparkle sparkle-two">✧</div>
            </div>
          </section>

          <section className="stats" aria-label="Request summary">
            <div className="stat-card">
              <span className="stat-icon pending-icon">◷</span>
              <div>
                <p>Pending</p>
                <strong>{pendingCount}</strong>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon progress-icon">↻</span>
              <div>
                <p>In Progress</p>
                <strong>{inProgressCount}</strong>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon resolved-icon">✓</span>
              <div>
                <p>Resolved</p>
                <strong>{resolvedCount}</strong>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon total-icon">▤</span>
              <div>
                <p>Total Requests</p>
                <strong>{requests.length}</strong>
              </div>
            </div>
          </section>

          <div className="content-grid">
            <section className="panel form-panel" id="submit">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">GET STARTED</span>
                  <h2>Submit a request</h2>
                  <p>
                    Tell us what needs attention in your community.
                  </p>
                </div>

                <span className="heading-icon">＋</span>
              </div>

              {error && (
                  <div className="alert alert-error" role="alert">
                    {error}
                  </div>
              )}

              {success && (
                  <div className="alert alert-success" role="status">
                    {success}
                  </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Request title</label>

                  <input
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Broken streetlight"
                      maxLength={150}
                      required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Service category</label>

                  <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                  >
                    <option value="">Select a category</option>
                    <option value="Roads and Infrastructure">
                      Roads and Infrastructure
                    </option>
                    <option value="Water and Sanitation">
                      Water and Sanitation
                    </option>
                    <option value="Waste Management">
                      Waste Management
                    </option>
                    <option value="Electricity and Lighting">
                      Electricity and Lighting
                    </option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>

                  <input
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Ruiru, Kiambu"
                      maxLength={150}
                      required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Describe the issue</label>

                  <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Please provide details to help us understand the issue..."
                      maxLength={2000}
                      rows={4}
                      required
                  />

                  <small className="field-hint">
                    Maximum 2,000 characters
                  </small>
                </div>

                <button
                    className="primary-button submit-button"
                    type="submit"
                    disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit request'}
                  {!submitting && <span>→</span>}
                </button>
              </form>
            </section>

            <section className="panel requests-panel" id="requests">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">KEEP UP TO DATE</span>
                  <h2>Recent requests</h2>
                  <p>
                    View service request progress.
                  </p>
                </div>

                <button
                    className="refresh-button"
                    type="button"
                    onClick={fetchRequests}
                    title="Refresh requests"
                    aria-label="Refresh requests"
                >
                  ↻
                </button>
              </div>

              {loading ? (
                  <div className="empty-state">
                    Loading requests...
                  </div>
              ) : requests.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">▤</span>
                    <strong>No requests yet</strong>
                    <p>Your submitted requests will appear here.</p>
                  </div>
              ) : (
                  <div className="request-list">
                    {requests
                        .slice()
                        .sort((a, b) => b.id - a.id)
                        .map((request) => (
                            <article
                                className="request-card"
                                key={request.id}
                            >
                              <div className="request-card-top">
                        <span className="request-id">
                          REQUEST #{request.id}
                        </span>

                                <span
                                    className={`status-badge status-${request.status.toLowerCase()}`}
                                >
                          {request.status.replace('_', ' ')}
                        </span>
                              </div>

                              <h3>{request.title}</h3>

                              <p className="request-description">
                                {request.description}
                              </p>

                              <div className="request-meta">
                                <span>⌖ {request.location}</span>
                                <span>{request.category}</span>
                              </div>

                              <div className="request-footer">
                                <small>
                                  {request.createdAt
                                      ? new Date(
                                          request.createdAt
                                      ).toLocaleDateString()
                                      : 'Date unavailable'}
                                </small>

                                {isAdmin && (
                                    <label
                                        className="status-control"
                                        htmlFor={`status-${request.id}`}
                                    >
                                      Update status

                                      <select
                                          id={`status-${request.id}`}
                                          value={request.status}
                                          onChange={(event) =>
                                              updateStatus(
                                                  request.id,
                                                  event.target.value
                                              )
                                          }
                                      >
                                        <option value="PENDING">
                                          Pending
                                        </option>
                                        <option value="IN_PROGRESS">
                                          In Progress
                                        </option>
                                        <option value="RESOLVED">
                                          Resolved
                                        </option>
                                      </select>
                                    </label>
                                )}
                              </div>
                            </article>
                        ))}
                  </div>
              )}
            </section>
          </div>
        </main>

        <footer className="footer">
          <span>Public Service Request Portal</span>
          <span>Making community services more accessible.</span>
        </footer>
      </div>
  );
}

export default App;
