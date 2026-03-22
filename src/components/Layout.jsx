import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
            <Outlet />
        </main>
        <Footer />
    </div>
  )
}

export default Layout
