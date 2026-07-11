import { NavLink } from 'react-router-dom'

export default function SectorTabs({ sectorId }) {
  const tabStyle = (isActive) => ({
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'Barlow, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    textDecoration: 'none',
    borderRadius: '7px',
    color: isActive ? '#0F1117' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
    border: isActive ? 'none' : '1px solid var(--border)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
      <NavLink to={`/sectors/${sectorId}`} end style={({ isActive }) => tabStyle(isActive)}>
        Board
      </NavLink>
      <NavLink to={`/sectors/${sectorId}/products`} style={({ isActive }) => tabStyle(isActive)}>
        Products
      </NavLink>
    </div>
  )
}
