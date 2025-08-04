'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon } from 'lucide-react'

export default function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav className="text-sm m-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/"
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <HomeIcon className="w-4 h-4 mr-1" />
            Home 
          </Link>
        </li>

        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/')
          const isLast = index === segments.length - 1

          return (
            <li key={href} className="flex items-center space-x-2">
              <span className="text-purple-600">/</span>
              {!isLast ? (
                <Link
                  href={href}
                  className="text-purple-400 hover:text-purple-300 capitalize transition-colors"
                >
                  {decodeURIComponent(segment)}
                </Link>
              ) : (
                <span className="text-white font-medium capitalize">
                  {decodeURIComponent(segment)}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
