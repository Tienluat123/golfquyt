import './App.css'
import GolfAnalyzer from './GolfAnalyzer'; // <--- Phải có dòng này thì mới hiểu "máy phân tích" là gì

function App() {
  return (
    <div className="container">
      
      {/* Header - Logo Quả Quýt */}
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🍊</span>
          <span className="logo-text">Quả Quýt Team</span>
        </div>
        <p className="tagline">Golf AI Analyzer</p>
      </header>

      {/* Main - Nơi đặt máy phân tích */}
      <main>
        <GolfAnalyzer />  {/* <--- Phải có thẻ này thì cái khung Upload mới hiện ra */}
      </main>

    </div>
  )
}

export default App
