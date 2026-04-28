import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import SubmissionFormPage from './pages/SubmissionFormPage'
import SubmissionViewPage from './pages/SubmissionViewPage'
import ContestFormPage from './pages/ContestFormPage'
import ContestViewPage from './pages/ContestViewPage'
import NotFoundPage from './pages/NotFoundPage'
import DevPage from './pages/DevPage'

function App() {
  return (
    <div className='min-h-screen bg-gray-900 text-white flex flex-col'>
      <Header />
      <main className='mx-auto w-3/4 max-w-6xl px-4 py-6 flex-1'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/contests/:contestId/submit' element={<SubmissionFormPage />} />
          <Route path='/submissions/:submissionId' element={<SubmissionViewPage />} />
          <Route path='/contests/new' element={<ContestFormPage />} />
          <Route path="/contests/:contestId" element={<ContestViewPage />} />
          <Route path='/dev' element={<DevPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App