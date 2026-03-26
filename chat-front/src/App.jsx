import { useEffect } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import RoomsPage from './Pages/RoomsPage';
import ChatPage from './Pages/ChatPage';
import NavBar from './Components/NavBar';
import { chatStore } from './Store/chatStore';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './Store/ThemeStore';

function App() {
  const { username, setUsername, connectSocket } = chatStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let storedName = username;
    if (!storedName) {
      storedName = window.localStorage.getItem('chat_username');
    }

    if (!storedName) {
      const inputName = window.prompt('Enter your username to join the chat');
      if (inputName && inputName.trim()) {
        setUsername(inputName.trim());
        window.localStorage.setItem('chat_username', inputName.trim());
        storedName = inputName.trim();
      } else {
        navigate('/');
      }
    }

    if (storedName) {
      setUsername(storedName);
      connectSocket();
    }
  }, [username, setUsername, connectSocket, navigate]);

  return (
    <>
      <NavBar />
      <div className="pt-16">
        <Routes>
          <Route path='/' element={<RoomsPage />} />
          <Route path='/rooms/:roomId' element={<ChatPage />} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
}

export default App;
