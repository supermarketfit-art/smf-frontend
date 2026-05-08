import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function PanelFruver() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [tienda, setTienda] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarDatos, 30000)
    return () => clearInterval(interval)
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: tiendas } = await api.get('/tiendas')
      const miTienda = tiendas.tiendas.find(t => t.owner?.nombre === user?.nombre)
      if (!miTienda) return
      setTienda(miTienda)

      const { data } = await api.get(`/pedidos/tienda/${miTienda.id}`)
      setPedidos(data.pedidos)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await api.patch(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado })
      toast.success('Estado actualizado')
      cargarDatos()
    } catch (error) {
      toast.error('Error al actualizar estado')
    }
  }

  const getEstadoColor = (estado) => {
    const colores = {
      PAGADO: '#F59E0B',
      PREPARANDO: '#3B82F6',
      LISTO_PARA_RECOGER: '#8B5CF6',
      EN_CAMINO: '#F97316',
      ENTREGADO: '#10B981',
      CANCELADO: '#EF4444'
    }
    return colores[estado] || '#6B7280'
  }

  const getSiguienteEstado = (estado) => {
    const siguientes = {
      PAGADO: { estado: 'PREPARANDO', label: 'Iniciar preparación' },
      PREPARANDO: { estado: 'LISTO_PARA_RECOGER', label: 'Marcar listo' },
      LISTO_PARA_RECOGER: { estado: 'EN_CAMINO', label: 'En camino' },
      EN_CAMINO: { estado: 'ENTREGADO', label: 'Marcar entregado' }
    }
    return siguientes[estado]
  }

  const pedidosActivos = pedidos.filter(p => p.estado !== 'ENTREGADO' && p.estado !== 'CANCELADO')
  const pedidosEntregados = pedidos.filter(p => p.estado === 'ENTREGADO')
  const gananciasHoy = pedidosEntregados.reduce((sum, p) => sum + p.pagoTienda, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* Header */}
      <div style={{
        background: '#2D7A3A',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🏪</span>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '800' }}>
              {tienda?.nombre || 'Mi Tienda'}
            </h1>
            <p style={{ color: '#a8d5a2', margin: 0, fontSize: '12px' }}>
              Panel del Fruver · {user?.nombre}
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

      {/* Resumen del día */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        padding: '16px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '16px', textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>Pedidos activos</p>
          <p style={{ color: '#2D7A3A', fontSize: '28px', fontWeight: '800', margin: 0 }}>
            {pedidosActivos.length}
          </p>
        </div>
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '16px', textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>Entregados hoy</p>
          <p style={{ color: '#2D7A3A', fontSize: '28px', fontWeight: '800', margin: 0 }}>
            {pedidosEntregados.length}
          </p>
        </div>
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '16px', textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{ color: '#999', fontSize: '12px', margin: '0 0 4px' }}>Ganancias</p>
          <p style={{ color: '#2D7A3A', fontSize: '20px', fontWeight: '800', margin: 0 }}>
            ${gananciasHoy.toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      {/* Pedidos activos */}
      <div style={{ padding: '0 16px 16px', maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ color: '#333', fontWeight: '700', marginBottom: '12px' }}>
          Pedidos activos 🔔
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Cargando...</p>
        ) : pedidosActivos.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '32px', textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🎉</p>
            <p style={{ color: '#999', margin: 0 }}>Sin pedidos pendientes</p>
          </div>
        ) : (
          pedidosActivos.map(pedido => {
            const siguiente = getSiguienteEstado(pedido.estado)
            return (
              <div key={pedido.id} style={{
                background: 'white', borderRadius: '12px',
                padding: '16px', marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${getEstadoColor(pedido.estado)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontWeight: '700', color: '#333', margin: '0 0 4px' }}>
                      Pedido #{pedido.id.substring(0, 8).toUpperCase()}
                    </p>
                    <p style={{ color: '#666', fontSize: '13px', margin: '0 0 4px' }}>
                      👤 {pedido.comprador?.nombre}
                    </p>
                    <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                      📍 {pedido.direccionEntrega || 'Recoger en tienda'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      background: getEstadoColor(pedido.estado),
                      color: 'white', padding: '4px 10px',
                      borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                    }}>
                      {pedido.estado.replace('_', ' ')}
                    </span>
                    <p style={{ color: '#2D7A3A', fontWeight: '700', margin: '8px 0 0', fontSize: '16px' }}>
                      ${pedido.pagoTienda.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                {/* Items del pedido */}
                <div style={{
                  background: '#f9f9f9', borderRadius: '8px',
                  padding: '10px', marginBottom: '12px'
                }}>
                  {pedido.items?.map(item => (
                    <p key={item.id} style={{ margin: '4px 0', color: '#555', fontSize: '13px' }}>
                      • {item.producto.nombre} x{item.cantidad} — ${item.subtotal.toLocaleString('es-CO')}
                    </p>
                  ))}
                </div>

                {/* Botón siguiente estado */}
                {siguiente && (
                  <button
                    onClick={() => cambiarEstado(pedido.id, siguiente.estado)}
                    style={{
                      width: '100%',
                      background: getEstadoColor(siguiente.estado),
                      color: 'white', border: 'none',
                      borderRadius: '8px', padding: '10px',
                      cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                    }}
                  >
                    {siguiente.label} →
                  </button>
                )}
              </div>
            )
          })
        )}

        {/* Pedidos entregados */}
        {pedidosEntregados.length > 0 && (
          <>
            <h3 style={{ color: '#333', fontWeight: '700', margin: '24px 0 12px' }}>
              Entregados hoy ✅
            </h3>
            {pedidosEntregados.map(pedido => (
              <div key={pedido.id} style={{
                background: 'white', borderRadius: '12px',
                padding: '14px', marginBottom: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderLeft: '4px solid #10B981',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', opacity: 0.8
              }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#333', margin: '0 0 2px', fontSize: '14px' }}>
                    #{pedido.id.substring(0, 8).toUpperCase()}
                  </p>
                  <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
                    {pedido.comprador?.nombre}
                  </p>
                </div>
                <p style={{ color: '#10B981', fontWeight: '700', margin: 0 }}>
                  ${pedido.pagoTienda.toLocaleString('es-CO')}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
