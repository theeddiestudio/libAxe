import { useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"

const ToggleTheme = () => {
    
    const [theme, setTheme] = useState(
        () => document.documentElement.getAttribute('data-theme') || 'nord'
    );

    const toggle = () => {
        const nextTheme = theme === 'nord' ? 'dark' : 'nord';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        setTheme(nextTheme);
    }
  
    return (
        <button className="btn btn-ghost btn-circle" onClick={toggle} aria-label="Toggle theme">
            {theme === 'nord' ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
        </button>
    )
}

export default ToggleTheme
