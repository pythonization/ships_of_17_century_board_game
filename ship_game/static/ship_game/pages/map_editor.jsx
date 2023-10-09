import React from 'react'
import ReactDOM from 'react-dom/client'

import Editor from '../components/editor/editor.jsx'

ReactDOM.createRoot(
    document.getElementById('map_root')
).render(
    <React.StrictMode>
        <Editor />
    </React.StrictMode>,
)