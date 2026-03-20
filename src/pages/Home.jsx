import React from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import { useSelector } from 'react-redux';

const Home = () => {
  return (
    <>
      <Hero />
      <Features />
    </>
  )
}

export default Home;