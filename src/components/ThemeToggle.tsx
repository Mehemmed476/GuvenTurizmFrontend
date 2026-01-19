"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { FiMoon, FiSun } from "react-icons/fi"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-default">
                <FiSun className="h-[1.2rem] w-[1.2rem] invisible" />
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full transition-colors duration-200 
                 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700
                 text-gray-900 dark:text-gray-100"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <FiSun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
                <FiMoon className="h-[1.2rem] w-[1.2rem]" />
            )}
        </button>
    )
}
