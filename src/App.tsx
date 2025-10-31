// import { Routes, Route } from 'react-router-dom';
// // import { registerUser } from "./api";
// import Layout from './components/Layout';
// import Home from './pages/Home';
// import About from './pages/About';
// import Gallery from './pages/Gallery';
// import Registration from './pages/Registration';
// import Payment from './pages/Payment';
// import Members from './pages/Members';
// import Success from './pages/Success';
// import Cancel from './pages/Cancel';

// function App() {
//   return (
//     <Layout>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/gallery" element={<Gallery />} />
//         <Route path="/registration" element={<Registration />} />
//         <Route path="/payment" element={<Payment />} />
//         <Route path="/members" element={<Members />} />
//         <Route path="/success" element={<Success />} />
//         <Route path="/cancel" element={<Cancel />} />
//       </Routes>
//     </Layout>
//   );
// }

// export default App;

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Registration from './pages/Registration';
import Members from './pages/Members';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import News from "./pages/news";


function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/members" element={<Members />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />

        <Route path="/news" element={<News />} />

      </Routes>
    </Layout>
  );
}

export default App;

