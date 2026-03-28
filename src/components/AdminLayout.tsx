import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/admin', label: 'Pedidos', icon: '📋', end: true },
  { to: '/admin/menu', label: 'Menú', icon: '🍔', end: false },
  { to: '/admin/mesas', label: 'Mesas', icon: '🪑', end: false },
  { to: '/admin/qr', label: 'QR', icon: '📱', end: false },
]

function NavItem({
  to,
  label,
  icon,
  end,
  mobile,
}: {
  to: string
  label: string
  icon: string
  end: boolean
  mobile?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        mobile
          ? `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              isActive ? 'text-amber-400' : 'text-neutral-500'
            }`
          : `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-amber-500/15 text-amber-400'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`
      }
    >
      <span className={mobile ? 'text-lg' : 'text-base'}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:shrink-0 bg-neutral-900 border-r border-neutral-800 sticky top-0 h-screen">
        <div className="px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-500 font-bold text-xl tracking-tight">
              pediya
            </span>
            <span className="text-neutral-500 font-normal text-sm">
              admin
            </span>
          </div>
          <img
            src="/garage-logo.svg"
            alt="Garage Craft Haus"
            className="h-6 opacity-70"
          />
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom tabs */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 z-40">
        <div className="flex justify-around py-2 px-2">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} mobile />
          ))}
        </div>
      </nav>
    </div>
  )
}
