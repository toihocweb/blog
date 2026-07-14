import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BlogLayout from './pages/BlogLayout';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="docs-theme">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<BlogLayout />} />
          <Route path="/post/:id" element={<BlogLayout />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
