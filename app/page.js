'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from './firebase'
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore'

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commenterName, setCommenterName] = useState('')
  const [rating, setRating] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [totalVoters, setTotalVoters] = useState(0)
  const [chatInput, setChatInput] = useState('')
  const [chatResponse, setChatResponse] = useState('')

  // Theme handling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode')
      if (savedMode) {
        setDarkMode(savedMode === 'true')
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true)
      }
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', darkMode)
    }
  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  // Fetch comments and ratings from Firestore
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // Fetch comments
        const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'))
        const commentsSnapshot = await getDocs(commentsQuery)
        const commentsData = commentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setComments(commentsData)

        // Fetch ratings
        const ratingsQuery = query(collection(db, 'ratings'))
        const ratingsSnapshot = await getDocs(ratingsQuery)
        const ratingsData = ratingsSnapshot.docs.map(doc => doc.data().rating)
        if (ratingsData.length > 0) {
          const avg = ratingsData.reduce((sum, r) => sum + r, 0) / ratingsData.length
          setAverageRating(avg.toFixed(1))
          setTotalVoters(ratingsData.length)
        }
      } catch (error) {
        console.error('Error fetching feedback:', error)
      }
    }
    fetchFeedback()
  }, [])

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commenterName.trim() || !newComment.trim()) return

    try {
      await addDoc(collection(db, 'comments'), {
        name: commenterName,
        comment: newComment,
        timestamp: new Date()
      })
      setComments([
        {
          name: commenterName,
          comment: newComment,
          timestamp: new Date()
        },
        ...comments
      ])
      setNewComment('')
      setCommenterName('')
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  // Handle rating submission
  const handleRatingSubmit = async () => {
    if (rating === 0) return

    try {
      await addDoc(collection(db, 'ratings'), {
        rating,
        timestamp: new Date()
      })
      const ratingsQuery = query(collection(db, 'ratings'))
      const ratingsSnapshot = await getDocs(ratingsQuery)
      const ratingsData = ratingsSnapshot.docs.map(doc => doc.data().rating)
      const avg = ratingsData.reduce((sum, r) => sum + r, 0) / ratingsData.length
      setAverageRating(avg.toFixed(1))
      setTotalVoters(ratingsData.length)
      setRating(0)
    } catch (error) {
      console.error('Error adding rating:', error)
    }
  }

  // Handle chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput }),
      })
      const data = await response.json()
      setChatResponse(data.response)
      setChatInput('')
    } catch (error) {
      console.error('Error with AI:', error)
      setChatResponse('Sorry, something went wrong with the AI. Try again!')
    }
  }

  const portfolioItems = [
    {
      id: 1,
      title: 'E-commerce Website',
      period: 'Jan 2022 - Present',
      description: 'Developed a full-stack e-commerce platform with React, Next.js, and Node.js. Implemented payment gateway, product management, and user authentication.',
      details: 'Led a team of 3 developers to build a scalable e-commerce solution. Integrated Stripe for payments, implemented SEO best practices, and achieved 40% faster page loads through optimization.'
    },
    {
      id: 2,
      title: 'Mobile Banking App',
      period: 'Jun 2020 - Dec 2021',
      description: 'Created a cross-platform mobile banking application with React Native and Firebase.',
      details: 'Developed secure authentication flow, transaction history, and bill payment features. The app serves over 10,000 active users with 99.9% uptime.'
    },
    {
      id: 3,
      title: 'Portfolio Website',
      period: 'Mar 2019 - May 2020',
      description: 'Designed and developed a portfolio website for a local artist.',
      details: 'Created custom animations and interactive gallery. Implemented CMS integration allowing client to update content without developer assistance.'
    }
  ]

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Feedback & Rating', href: '#feedback' },
    { name: 'Contact', href: '#contact' },
    { name: 'Chatbot', href: '#chatbot' }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-pink-50 text-gray-800'}`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg ${darkMode ? 'bg-pink-200 text-gray-900' : 'bg-pink-600 text-white'}`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Navbar */}
      <nav className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-800' : 'bg-pink-100'} shadow-md`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <a href="#" className="text-2xl font-bold">
              <span className={`${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>My</span>CV
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${darkMode ? 'hover:bg-gray-700 hover:text-pink-300' : 'hover:bg-pink-200 hover:text-pink-700'}`}
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Mobile Nav Button */}
            <button
              className="md:hidden focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden ${darkMode ? 'bg-gray-800' : 'bg-pink-100'}`}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${darkMode ? 'hover:bg-gray-700 hover:text-pink-300' : 'hover:bg-pink-200 hover:text-pink-700'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section id="home" className="py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center"
          >
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Hi, I'm <span className={`${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>Nella Fathianti</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                Full Stack Developer
              </h2>
              <p className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                I build exceptional digital experiences with modern technologies.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#contact"
                  className={`px-6 py-3 rounded-lg font-medium ${darkMode ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'} text-white`}
                >
                  Contact Me
                </a>
                <a
                  href="#portfolio"
                  className={`px-6 py-3 rounded-lg font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-pink-100 hover:bg-pink-200'}`}
                >
                  View Work
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className={`w-64 h-64 md:w-80 md:h-80 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-pink-200'} overflow-hidden border-4 ${darkMode ? 'border-pink-400' : 'border-pink-500'}`}>
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <img
            src="/profile.jpeg" // Replace with your image filename (e.g., /profile.png if it's a PNG)
            alt="Jane Doe Profile"
            className="w-full h-full object-cover"
          />
                  </div>
                </div>
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className={`absolute -bottom-4 -left-4 w-16 h-16 rounded-full ${darkMode ? 'bg-pink-600' : 'bg-pink-400'} opacity-80`}
                ></motion.div>
                <motion.div
                  animate={{
                    rotate: [0, -15, 15, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${darkMode ? 'bg-pink-500' : 'bg-pink-300'} opacity-80`}
                ></motion.div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              About <span className={`${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>Me</span>
            </h2>
            <div className={`max-w-4xl mx-auto p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Personal Info</h3>
                  <ul className="space-y-3">
                    <li className="flex">
                      <span className={`w-28 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Name:</span>
                      <span>Nella Fathianti</span>
                    </li>
                    <li className="flex">
                      <span className={`w-28 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email:</span>
                      <span>nella@gmail.com</span>
                    </li>
                    <li className="flex">
                      <span className={`w-28 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Phone:</span>
                      <span>083737373</span>
                    </li>
                    <li className="flex">
                      <span className={`w-28 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Location:</span>
                      <span>      Sumedang, 12 Juli 2005
                            Manabaya, Kec. Cimanggung Kab. Sumedang</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Skills</h3>
                  <div className="space-y-4">
                    {['JavaScript', 'React', 'Node.js', 'Next.js', 'Tailwind CSS'].map((skill) => (
                      <div key={skill}>
                        <div className="flex justify-between mb-1">
                          <span>{skill}</span>
                          <span>90%</span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-pink-100'}`}>
                          <div
                            className={`h-full rounded-full ${darkMode ? 'bg-pink-500' : 'bg-pink-600'}`}
                            style={{ width: '90%' }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Bio</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Passionate full-stack developer with 5+ years of experience building web applications. Specialized in JavaScript technologies across the whole stack (React.js, Node.js, Express, MongoDB). Strong advocate for clean code, user experience, and agile methodologies.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              My <span className={`${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>Portfolio</span>
            </h2>
            
            <AnimatePresence>
              {selectedPortfolio ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`max-w-4xl mx-auto p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                >
                  <button
                    onClick={() => setSelectedPortfolio(null)}
                    className={`mb-4 flex items-center ${darkMode ? 'text-pink-300 hover:text-pink-200' : 'text-pink-600 hover:text-pink-800'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Portfolio
                  </button>
                  <h3 className="text-2xl font-bold mb-2">{selectedPortfolio.title}</h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedPortfolio.period}</p>
                  <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedPortfolio.details}</p>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-pink-100'}`}>
                    <h4 className="font-semibold mb-2">Key Achievements:</h4>
                    <ul className={`list-disc pl-5 space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <li>Increased user engagement by 45% through UI improvements</li>
                      <li>Reduced page load time by 60% with optimized assets</li>
                      <li>Implemented automated testing reducing bugs by 30%</li>
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="relative">
                    {/* Timeline line */}
                    <div className={`absolute left-4 md:left-1/2 h-full w-0.5 ${darkMode ? 'bg-gray-600' : 'bg-pink-200'}`}></div>
                    
                    {portfolioItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className={`mb-8 flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
                      >
                        <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg cursor-pointer hover:shadow-xl transition-shadow`} onClick={() => setSelectedPortfolio(item)}>
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.period}</p>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                            <button
                              className={`mt-4 inline-flex items-center ${darkMode ? 'text-pink-300 hover:text-pink-200' : 'text-pink-600 hover:text-pink-800'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPortfolio(item)
                              }}
                            >
                              View Details
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full flex items-center justify-center z-10">
                          <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${darkMode ? 'bg-pink-500' : 'bg-pink-600'}`}></div>
                        </div>
                        <div className="md:w-1/2"></div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Feedback Section */}
        <section id="feedback" className="py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Feedback & <span className={`${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>Rating</span>
            </h2>
            <div className={`max-w-4xl mx-auto p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              {/* Average Rating Display */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Rating: {averageRating} (from {totalVoters} voters)
                </p>
              </div>

              {/* Rating Submission */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Rate This Portfolio</h3>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRating(i + 1)}
                      className={`w-8 h-8 ${rating > i ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none`}
                    >
                      <svg
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRatingSubmit}
                  className={`px-6 py-2 rounded-lg font-medium ${darkMode ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'} text-white disabled:opacity-50`}
                  disabled={rating === 0}
                >
                  Submit Rating
                </button>
              </div>

              {/* Comment Submission */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Leave a Comment</h3>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="commenterName" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Name
                    </label>
                    <input
                      type="text"
                      id="commenterName"
                      value={commenterName}
                      onChange={(e) => setCommenterName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-pink-500' : 'focus:ring-pink-300'}`}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="comment" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Comment
                    </label>
                    <textarea
                      id="comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows="4"
                      className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-pink-500' : 'focus:ring-pink-300'}`}
                      placeholder="Your comment"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className={`px-6 py-3 rounded-lg font-medium ${darkMode ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'} text-white`}
                  >
                    Submit Comment
                  </button>
                </form>
              </div>

              {/* Comments Display */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Comments</h3>
                {comments.length === 0 ? (
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No comments yet.</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-pink-100'}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{comment.name}</h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{comment.comment}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Get In <span className={`${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>Touch</span>
            </h2>
            <div className={`max-w-4xl mx-auto p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-gray-700' : 'bg-pink-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Email</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>nella@gmail.com</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-gray-700' : 'bg-pink-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Phone</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>08333445656</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-gray-700' : 'bg-pink-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Location</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sumedang, 12 Juli 2005
                        Manabaya, Kec. Cimanggung Kab. Sumedang</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Send Me a Message</h3>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Name</label>
                      <input
                        type="text"
                        id="name"
                        className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-pink-500' : 'focus:ring-pink-300'}`}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email</label>
                      <input
                        type="email"
                        id="email"
                        className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-pink-500' : 'focus:ring-pink-300'}`}
                        placeholder="Your email"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Message</label>
                      <textarea
                        id="message"
                        rows="4"
                        className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-pink-500' : 'focus:ring-pink-300'}`}
                        placeholder="Your message"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className={`w-full px-6 py-3 rounded-lg font-medium ${darkMode ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'} text-white`}
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Chatbot Section */}
        <section id="chatbot" className="py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Chat with <span className={`${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>AI</span>
            </h2>
            <div className={`max-w-4xl mx-auto p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-xl font-semibold mb-4">Ask Me Anything</h3>
              <form onSubmit={handleChatSubmit} className="space-y-4">
                <div>
                  <label htmlFor="chatInput" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your Question
                  </label>
                  <textarea
                    id="chatInput"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    rows="4"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-pink-500' : 'focus:ring-pink-300'}`}
                    placeholder="Type your question here (e.g., 'Tell me about web development')"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-lg font-medium ${darkMode ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'} text-white`}
                >
                  Send
                </button>
              </form>
              {chatResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-pink-100'}`}
                >
                  <h4 className="font-semibold mb-2">AI Response:</h4>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{chatResponse}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <footer className={`py-6 ${darkMode ? 'bg-gray-800' : 'bg-pink-100'}`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © {new Date().getFullYear()} Nella Fathianti. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
