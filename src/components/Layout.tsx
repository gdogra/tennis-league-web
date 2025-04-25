import React from 'react'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <header className="bg-blue-600 text-white p-4">Tennis League</header>
    <main className="flex-1 container mx-auto p-4">{children}</main>
    <footer className="bg-gray-200 text-center p-4">© 2025 Tennis League</footer>
  </div>
)

export default Layout
