export function $(id){return document.getElementById(id)}
export function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
export function timeAgo(date){const d=new Date(date),s=Math.floor((Date.now()-d)/1000);if(s<60)return "just now";const m=Math.floor(s/60);if(m<60)return `${m}m ago`;const h=Math.floor(m/60);if(h<24)return `${h}h ago`;return `${Math.floor(h/24)}d ago`}
export function avatar(name="User"){return name.trim().charAt(0).toUpperCase()}
export function sampleUser(){return JSON.parse(localStorage.getItem("connecthub_user")||'{"fullName":"Demo User","username":"demo","bio":"Exploring ConnectHub 🚀","profileImage":""}') }
