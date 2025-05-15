import LoadingSpinner from '@/components/loading-spinner'
import React from 'react'

const loading = () => {
  return (
    <div className='flex justify-center items-center' style={{minHeight:"60vh"}}>
      <LoadingSpinner/>
    </div>
  )
}

export default loading
