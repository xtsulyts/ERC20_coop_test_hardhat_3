
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from "./pages/HomePages"


function App() {

  return (
    <Router
        future={{
    v7_startTransition: true,
  }}>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
      </Routes>
    </Router>
  )
}

export default App