import React from 'react'
import { createRoot } from 'react-dom/client'
import AppRouter from '@routes/app-router'


const App: React.FC = () => <AppRouter />

const root = createRoot(document.getElementById('root')) // createRoot(container!) if you use TypeScript
root.render(<App />)

