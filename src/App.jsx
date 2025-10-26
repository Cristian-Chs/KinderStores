import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import SplitText from "./components/SplitText";

function App() {
  const [count, setCount] = useState(0)

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  return (
    <div className="App">
      <SplitText
        text="Hello, Cristian"
        className="text-2xl font-semibold text-center"
        delay={100}
        duration={0.6}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 10 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0.1}
        rootMargin="100px"
        textAlign="center"
        onLetterAnimationComplete={handleAnimationComplete}
      />
    </div>
  );
}

export default App;
