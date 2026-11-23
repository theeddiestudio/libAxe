import React from 'react'

const Loader = ({ full = false }) => {
  return (
    <div className={`flex items-center justify-center ${full ? "min-h-screen" : "py-20"}`}>
        <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  )
}

export default Loader
