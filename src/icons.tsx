import {useId} from 'react';
export function Icon({name='shield',small=false}:{name?:string;small?:boolean}) {
const id=useId().replaceAll(':',''); const paint='url(#'+id+')'; const colors=name==='check'?['#5de2a5','#12b875']:name==='clock'?['#ffd17b','#ff922e']:name==='alert'?['#ff99ac','#f14b69']:name==='gear'?['#bec7df','#7a85a9']:['#74bcff','#5850ff']; const paths:Record<string,React.ReactNode>={
shield:<><path d="M48 9 77 21v24c0 20-15 33-29 41C34 78 19 65 19 45V21Z" fill={paint} stroke="#b4d5ff" strokeWidth="2"/><path d="m34 46 10 10 20-22" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/></>,
mail:<><rect x="12" y="25" width="72" height="51" rx="10" fill={paint} stroke="#bddaff" strokeWidth="2"/><path d="m14 29 30 25q4 4 8 0l30-25" fill="#edf4ff" stroke="#b4cfff" strokeWidth="2"/><path d="m14 73 23-21m45 21L59 52" fill="none" stroke="#9bc7ff" strokeWidth="2"/></>,
check:<><circle cx="48" cy="48" r="35" fill={paint} stroke="#39cd98" strokeWidth="2"/><path d="m31 48 12 12 24-27" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/></>,
clock:<><circle cx="48" cy="48" r="34" fill={paint}/><circle cx="48" cy="48" r="27" fill="none" stroke="white" strokeWidth="3"/><path d="M48 29v21l14 8" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"/></>,
alert:<><circle cx="48" cy="48" r="35" fill={paint}/><path d="M48 27v27" stroke="white" strokeWidth="7" strokeLinecap="round"/><circle cx="48" cy="67" r="4" fill="white"/></>,
gear:<><path d="m39 12 18 0 3 11 10 6 11-2 9 16-8 8-1 11 5 10-15 10-10-6-12 1-8 8-16-9 2-12-6-10-10-4V32l11-4 7-8Z" transform="translate(1 0) scale(.95)" fill={paint} stroke="#c3c9dc" strokeWidth="2"/><circle cx="48" cy="48" r="13" fill="var(--surface,white)"/></>,
loader:<><circle cx="48" cy="48" r="31" fill="none" stroke="#d8dfff" strokeWidth="8"/><path d="M48 17a31 31 0 0 1 31 31" fill="none" stroke={paint} strokeWidth="8" strokeLinecap="round"/></>,
plane:<path d="m12 44 70-28-14 65-23-19-13 13 3-23 33-24-42 20Z" fill="white"/>
};
return <svg className={`${small?'icon-small':'hero-icon'} ${name==='loader'?'spin':''}`} viewBox="0 0 96 96" aria-hidden="true"><defs><linearGradient id={id} x1="0" y1="0" x2=".9" y2="1" gradientUnits="objectBoundingBox"><stop stopColor={colors[0]}/><stop offset="1" stopColor={colors[1]}/></linearGradient></defs>{paths[name]||paths.shield}</svg>
}


