import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function PanelAdmin() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ pedidos: 0, tiendas: 0, usuarios: 0, ingresos: 0 })
  const [tiendas, setTiendas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [vista, setVista] = useState('resumen')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: tiendasData } = await api.get('/tiendas')
      setTiendas(tiendasData.tiendas)

      const pedidosTodos = []
      for (const tienda of tiendasData.tiendas) {
        try {
          const { data } = await api.get(`/pedidos/tienda/${tienda.id}`)
          pedidosTodos.push(...data.pedidos.map(p => ({ ...p, tiendaNombre: tienda.nombre })))
        } catch (e) {}
      }
      setPedidos(pedidosTodos)

      const ingresosSmf = pedidosTodos
        .filter(p => p.estado === 'ENTREGADO')
        .reduce((sum, p) => sum + p.comisionSmf, 0)

      setStats({
        pedidos: pedidosTodos.length,
        tiendas: tiendasData.tiendas.length,
        ingresos: ingresosSmf
      })
    } catch (error) {
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado) => {
    const colores = {
      PENDIENTE_PAGO: '#9CA3AF',
      PAGADO: '#F59E0B',
      PREPARANDO: '#3B82F6',
      LISTO_PARA_RECOGER: '#8B5CF6',
      EN_CAMINO: '#F97316',
      ENTREGADO: '#10B981',
      CANCELADO: '#EF4444'
    }
    return colores[estado] || '#6B7280'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* Header */}
      <div style={{
        background: '#1a4a1f',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>⚙️</span>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '800' }}>
              Panel Admin — SMF
            </h1>
            <p style={{ color: '#a8d5a2', margin: 0, fontSize: '12px' }}>
              {user?.nombre}
            </p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 16px',
            cursor: 'pointer', fontSize: '14px'
          }}
        >
          Salir
        </button>
      </div>

      {/* Navegación */}
      <div style={{
        background: 'white',
        padding: '0 24px',
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid #eee'
      }}>
        {['resumen', 'pedidos', 'tiendas'].map(v => (
          <button
            key={v}
            onClick={() => setVista(v)}
            style={{
              background: 'none',
              border: 'none',
              padding: '14px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: vista === v ? '700' : '400',
              color: vista === v ? '#2D7A3A' : '#666',
              borderBottom: vista === v ? '2px solid #2D7A3A' : '2px solid transparent'
            }}
          >
            {v === 'resumen' ? '📊 Resumen' :
             v === 'pedidos' ? '📦 Pedidos' : '🏪 Fruvers'}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>

        {/* RESUMEN */}
        {vista === 'resumen' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <p style={{ color: '#999', fontSize: '12px', margin: '0 0 8px' }}>Total pedidos</p>
                <p style={{ color: '#2D7A3A', fontSize: '32px', fontWeight: '800', margin: 0 }}>{stats.pedidos}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <p style={{ color: '#999', fontSize: '12px', margin: '0 0 8px' }}>Fruvers activos</p>
                <p style={{ color: '#2D7A3A', fontSize: '32px', fontWeight: '800', margin: 0 }}>{stats.tiendas}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <p style={{ color: '#999', fontSize: '12px', margin: '0 0 8px' }}>Comisiones SMF</p>
                <p style={{ color: '#2D7A3A', fontSize: '22px', fontWeight: '800', margin: 0 }}>${stats.ingresos.toLocaleString('es-CO')}</p>
              </div>
            </div>

            <h3 style={{ color: '#333', fontWeight: '700', marginBottom: '12px' }}>Últimos pedidos</h3>
            {pedidos.slice(0, 5).map(pedido => (
              <div key={pedido.id} style={{
                background: 'white', borderRadius: '12px',
                padding: '14px 16px', marginBottom: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderLeft: `4px solid ${getEstadoColor(pedido.estado)}`
              }}>
                <div>
                  <p style={{ fontWeight: '600', margin: '0 0 2px', fontSize: '14px' }}>
                    #{pedido.id.substring(0, 8).toUpperCase()}
                  </p>
                  <p style={{ color: '#999', margin: 0, fontSize: '12px' }}>
                    {pedido.tiendaNombre} · {pedido.comprador?.nombre}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: getEstadoColor(pedido.estado),
                    color: 'white', padding: '3px 8px',
                    borderRadius: '20px', fontSize: '11px'
                  }}>
                    {pedido.estado}
                  </span>
                  <p style={{ color: '#2D7A3A', fontWeight: '700', margin: '4px 0 0', fontSize: '14px' }}>
                    ${pedido.total?.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* PEDIDOS */}
        {vista === 'pedidos' && (
          <>
            <h3 style={{ color: '#333', fontWeight: '700', marginBottom: '12px' }}>
              Todos los pedidos ({pedidos.length})
            </h3>
            {pedidos.map(pedido => (
              <div key={pedido.id} style={{
                background: 'white', borderRadius: '12px',
                padding: '14px 16px', marginBottom: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${getEstadoColor(pedido.estado)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '600', margin: '0 0 2px', fontSize: '14px' }}>
                      #{pedido.id.substring(0, 8).toUpperCase()}
                    </p>
                    <p style={{ color: '#666', margin: '0 0 2px', fontSize: '12px' }}>
                      🏪 {pedido.tiendaNombre}
                    </p>
                    <p style={{ color: '#999', margin: 0, fontSize: '12px' }}>
                      👤 {pedido.comprador?.nombre}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      background: getEstadoColor(pedido.estado),
                      color: 'white', padding: '3px 8px',
                      borderRadius: '20px', fontSize: '11px'
                    }}>
                      {pedido.estado}
                    </span>
                    <p style={{ color: '#2D7A3A', fontWeight: '700', margin: '4px 0 0' }}>
                      ${pedido.total?.toLocaleString('es-CO')}
                    </p>
                    <p style={{ color: '#999', margin: '2px 0 0', fontSize: '11px' }}>
                      SMF: ${pedido.comisionSmf?.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* TIENDAS */}
        {vista === 'tiendas' && (
          <>
            <h3 style={{ color: '#333', fontWeight: '700', marginBottom: '12px' }}>
              Fruvers en la red ({tiendas.length})
            </h3>
            {tiendas.map(tienda => (
              <div key={tienda.id} style={{
                background: 'white', borderRadius: '12px',
                padding: '16px', marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: '#2D7A3A', margin: '0 0 4px', fontWeight: '700' }}>
                      {tienda.nombre}
                    </h4>
                    <p style={{ color: '#666', margin: '0 0 4px', fontSize: '13px' }}>
                      📍 {tienda.direccion}
                    </p>
                    <p style={{ color: '#999', margin: '0 0 4px', fontSize: '12px' }}>
                      📱 {tienda.whatsapp}
                    </p>
                    <p style={{ color: '#999', margin: 0, fontSize: '12px' }}>
                      💰 Comisión SMF: {tienda.comisionPct}%
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      background: tienda.activa ? '#dcfce7' : '#fee2e2',
                      color: tienda.activa ? '#16a34a' : '#dc2626',
                      padding: '6px 14px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: '600'
                    }}>
                      {tienda.activa ? 'Activa' : 'Inactiva'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}