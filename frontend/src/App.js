import React from 'react';
import ParrainageApp from './components/ParrainageApp';
import { Toaster } from 'react-hot-toast';
import './App.css';

const App = () => {
    return (
        <div className="App">
            <ParrainageApp />
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#333',
                        color: '#fff',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }
                }}
            />
        </div>
    );
};

export default App;
