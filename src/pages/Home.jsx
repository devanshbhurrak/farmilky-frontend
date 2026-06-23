import React from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import useDocumentTitle from '../hooks/useDocumentTitle'

const Home = () => {
  useDocumentTitle("")
  return (
    <>
      <Hero />
      <Features />
    </>
  )
}

export default Home;
