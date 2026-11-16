import React from 'react';
import {createRoot} from 'react-dom/client';
import {Design} from './preview';
import App from './App';
import './styles.css';
const q=new URLSearchParams(location.search);if(q.get('theme')==='dark')document.documentElement.dataset.theme='dark';
createRoot(document.getElementById('root')!).render(q.has('view')?<Design view={q.get('view')||'gallery'}/>:<App/>);
