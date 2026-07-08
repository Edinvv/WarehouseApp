import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        marginLeft: '220px',
        flex: 1,
        padding: '32px',
        backgroundColor: 'var(--bg)',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}