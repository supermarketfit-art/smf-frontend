import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [tiendas, setTiendas] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    cargarTiendas()
  }, [])

  const cargarTiendas = async () => {
    try {
      const { data } = await api.get('/tiendas')
      setTiendas(data.tiendas)
    } catch (error) {
      toast.error('Error al cargar tiendas')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* Header */}
      <div style={{
        background: '#2D7A3A',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🥦</span>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '800' }}>
              SuperMarket Fit
            </h1>
            <p style={{ color: '#a8d5a2', margin: 0, fontSize: '12px' }}>
              Hola, {user?.nombre} 👋
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Salir
        </button>
      </div>

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a4a1f, #2D7A3A)',
        padding: '32px 24px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 0 8px' }}>
          Frutas y verduras frescas 🍎
        </h2>
        <p style={{ color: '#a8d5a2', margin: '0', fontSize: '15px' }}>
          Directo del fruver de tu barrio a tu puerta
        </p>
      </div>

      {/* Contenido */}
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>

        {/* Acceso rápido */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
            <p style={{ color: '#2D7A3A', fontWeight: '700', margin: 0, fontSize: '14px' }}>
              Hacer mercado
            </p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🥗</div>
            <p style={{ color: '#2D7A3A', fontWeight: '700', margin: 0, fontSize: '14px' }}>
              Plan nutricional
            </p>
          </div>
        </div>

        {/* Fruvers cercanos */}
        <h3 style={{ color: '#333', fontWeight: '700', marginBottom: '16px' }}>
          Fruvers disponibles 🏪
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Cargando tiendas...</p>
        ) : tiendas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>No hay tiendas disponibles</p>
        ) : (
          tiendas.map(tienda => (
            <div
              key={tienda.id}
              onClick={() => navigate(`/tienda/${tienda.id}`)}
              style={{
                background: 'white',
                borderRadius: '14px',
                padding: '20px',
                marginBottom: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div>
                <h4 style={{ color: '#2D7A3A', margin: '0 0 4px', fontWeight: '700' }}>
                  {tienda.nombre}
                </h4>
                <p style={{ color: '#666', margin: '0 0 4px', fontSize: '13px' }}>
                  📍 {tienda.direccion}
                </p>
                <p style={{ color: '#999', margin: 0, fontSize: '12px' }}>
                  🚴 Domicilio: ${tienda.costodomicilio?.toLocaleString('es-CO')} · ⏱ {tienda.tiempoEstimadoMin} min
                </p>
              </div>
              <div style={{
                background: '#f0f9f1',
                color: '#2D7A3A',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                Ver →
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}