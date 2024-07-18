import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import HomePage from './pages/home/HomePage.jsx';
import NotificationPage from './pages/notification/NotificationPage.jsx';
import SignUpPage from './pages/auth/signup/SignUpPage.jsx';
import LoginPage from './pages/auth/login/LoginPage.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import RightPanel from './components/common/RightPanel.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';
import './App.css';


function App() {
	const { data: authUser, isLoading, isError } = useQuery({
	  queryKey: ['authUser'],
	  queryFn: async () => {
		const res = await fetch('/api/auth/me');
		
		const data = await res.json();
		if(data.error) return null;
		if (!res.ok) throw new Error(data.error);
		return data.user;
	  },
	  retry : false,
	},
	);
  
	if (isLoading) {
	  return (
		<div className='h-screen flex justify-center items-center'>
		  <LoadingSpinner size='lg' />
		</div>
	  );
	}
  
	return (
	  <div className='flex max-w-6xl mx-auto'>
		{authUser && <Sidebar />}
		<Routes>
		  <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to="/login"/>} />
		  <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login"/>} />
		  <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login'/>} />
		  <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/"/>} />
		  <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/"/>} />
		</Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
