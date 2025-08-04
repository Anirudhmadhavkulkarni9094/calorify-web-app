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
    localStorage.removeItem('token') // or use your auth logic
    handleClose()
    router.push('/login') // optional redirect
  }

  return (
    <div className='flex justify-between p-4 text-purple-400'>
      <h1 className='text-lg font-bold'>Calorify</h1>

      <Breadcrumb />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            onClick={() => setOpen(true)}
            className='h-10 w-10 flex justify-center items-center rounded-full bg-purple-500 text-white'
          >
            <User />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-[300px] rounded-xl">
          <DialogHeader>
            <DialogTitle className='text-purple-600'>Settings</DialogTitle>
          </DialogHeader>

          <div className='flex flex-col gap-3'>
            {isAuthenticated ? (
              <>
                <Link href='/profile'>
                  <Button className='w-full' onClick={handleClose}>
                    Profile
                  </Button>
                </Link>
                <Button className='w-full' variant='outline' onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href='/login'>
                  <Button className='w-full' onClick={handleClose}>
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Navbar
