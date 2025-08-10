'use client'

import React, { useState } from 'react'
import { User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Breadcrumb from './Breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Simulated auth check (replace with real auth logic)
const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('token')

function Navbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleClose = () => setOpen(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    handleClose()
    router.push('/login')
  }

  return (
    <nav className="w-full bg-gradient-to-r from-[#1f0f2e] via-[#2a1a4f] to-[#1a1a1a] px-6 py-3 flex items-center justify-between text-purple-300 shadow-lg backdrop-blur-md border-b border-purple-700/50">
      <h1 className="text-xl font-extrabold tracking-wide text-purple-400 select-none">
        Calorify
      </h1>

      <Breadcrumb />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open user settings"
            className="h-10 w-10 flex justify-center items-center rounded-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md transition-colors"
          >
            <User size={20} />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-[320px] rounded-2xl border border-purple-400/20 bg-white/10 backdrop-blur-lg shadow-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-purple-300 text-lg font-semibold mb-4">
              Settings
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button
                    className="w-full text-purple-200"
                    variant="ghost"
                    onClick={handleClose}
                  >
                    Profile
                  </Button>
                </Link>
                <Button
                  className="w-full text-purple-300 border border-purple-300 hover:bg-purple-700"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  className="w-full text-purple-200"
                  variant="ghost"
                  onClick={handleClose}
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  )
}

export default Navbar
