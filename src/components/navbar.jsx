"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, DollarSign, Users, FileText, BookCopy } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Add Expense", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Dues", href: "/dues", icon: <DollarSign className="w-5 h-5" /> },
    { name: "Expenses", href: "/expenses", icon: <FileText className="w-5 h-5" /> },
    { name: "Members", href: "/members", icon: <Users className="w-5 h-5" /> },
    { name: "Expense Types", href: "/expense-types", icon: <BookCopy className="w-5 h-5" /> },
  ]

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between py-4">
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="text-2xl font-bold text-purple-600">Blade</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-purple-100 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
