import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Tienda() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tienda, setTienda] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarTienda()
  }, [id])

  const cargarTienda = async () => {
    try {
      const { data } = await api.get(`/tiendas/${id}`)
      setTienda(data.tienda)
    } catch (error) {
      toast.error('Error al cargar la tienda')
    } finally {
      setLoading(false)
    }
  }

  const agregarAlCarrito = (item) => {
    const existe = carrito.find(c => c.productoId === item.productoId)
    if (existe) {
      setCarrito(carrito.map(c =>
        c.productoId === item.productoId
          ? { ...c, cantidad: c.cantidad + 1 }
          : c
      ))
    } else {
      setCarrito([...carrito, { ...item, cantidad: 1 }])
    }
    toast.success(`${item.nombre} agregado`)
  }

  const quitarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(c => c.productoId !== productoId))
  }

  const total = carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0)

  const categorias = tienda?.inventario
    ? [...new Set(tienda.inventario.map(i => i.producto.categoria))]
    : []

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* Header */}
      <div style={{
        background: '#2D7A3A',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ←
        </button>
        <div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '800' }}>
            {tienda?.nombre}
          </h1>
          <p style={{ color: '#a8d5a2', margin: 0, fontSize: '12px' }}>
            📍 {tienda?.direccion}
          </p>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>

        {/* Productos por categoría */}
        {categorias.map(categoria => (
          <div key={categoria} style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#2D7A3A', fontWeight: '700', marginBottom: '12px' }}>
              {categoria === 'FRUTAS' ? '🍎 Frutas' :
               categoria === 'VERDURAS_HORTALIZAS' ? '🥦 Verduras' :
               categoria === 'FRUTOS_SECOS_SEMILLAS' ? '🌰 Frutos secos' :
               categoria === 'CEREALES' ? '🌾 Cereales' : categoria}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {tienda.inventario
                .filter(i => i.producto.categoria === categoria)
                .map(item => {
                  const enCarrito = carrito.find(c => c.productoId === item.productoId)
                  return (
                    <div key={item.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '14px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      <p style={{ color: '#333', fontWeight: '600', margin: '0 0 4px', fontSize: '14px' }}>
                        {item.producto.nombre}
                      </p>
                      <p style={{ color: '#999', margin: '0 0 8px', fontSize: '12px' }}>
                        por {item.producto.unidad.toLowerCase()}
                      </p>
                      <p style={{ color: '#2D7A3A', fontWeight: '700', margin: '0 0 10px', fontSize: '16px' }}>
                        ${item.precioVenta.toLocaleString('es-CO')}
                      </p>
                      {enCarrito ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#2D7A3A', fontWeight: '700' }}>
                            x{enCarrito.cantidad}
                          </span>
                          <button
                            onClick={() => quitarDelCarrito(item.productoId)}
                            style={{
                              background: '#ff4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => agregarAlCarrito({
                            productoId: item.productoId,
                            nombre: item.producto.nombre,
                            precioVenta: item.precioVenta
                          })}
                          style={{
                            width: '100%',
                            background: '#2D7A3A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          + Agregar
                        </button>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}

        {/* Carrito flotante */}
        {carrito.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#2D7A3A',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '50px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            minWidth: '280px',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '14px' }}>
              🛒 {carrito.length} productos
            </span>
            <span style={{ fontWeight: '800', fontSize: '16px' }}>
              ${total.toLocaleString('es-CO')}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              Pedir →
            </span>
          </div>
        )}
      </div>
    </div>
  )
}