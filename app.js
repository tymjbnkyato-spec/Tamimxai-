const statusEl = document.getElementById('status');
const chatLog = document.getElementById('chatLog');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let active = false;

function sayStatus(text){ statusEl.textContent = text; }
function addMessage(who, text){
  const p = document.createElement('p');
  p.textContent = `${who}: ${text}`;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
}
function speak(text){
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'bn-BD';
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}
async function askAI(message){
  try {
    sayStatus('Thinking...');
    const response = await fetch('/api/chat', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Server error');
    addMessage('Tamim X AI', data.reply);
    speak(data.reply);
    sayStatus('Tap to talk');
  } catch (err) {
    const msg = err.message.includes('API key') 
      ? 'এখনো API Key যোগ করা হয়নি। সার্ভারের .env ফাইলে API Key বসালে আমি উত্তর দিতে পারব।'
      : 'সংযোগ করা যাচ্ছে না। সার্ভার চালু আছে কি না দেখো।';
    addMessage('System', msg);
    speak(msg);
    sayStatus('Tap to talk');
  }
}
function startListening(){
  if (!SpeechRecognition) {
    const msg = 'এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়। Chrome দিয়ে HTTPS বা localhost-এ খোলো।';
    addMessage('System', msg); speak(msg); return;
  }
  if (active) return;
  recognition = new SpeechRecognition();
  recognition.lang = 'bn-BD';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onstart = () => { active = true; sayStatus('Listening...'); };
  recognition.onresult = async (event) => {
    const text = event.results[0][0].transcript;
    addMessage('You', text);
    await askAI(text);
  };
  recognition.onerror = (event) => {
    sayStatus('Tap to talk');
    if (event.error !== 'no-speech' && event.error !== 'aborted') addMessage('System', 'Microphone error: ' + event.error);
  };
  recognition.onend = () => { active = false; if (statusEl.textContent === 'Listening...') sayStatus('Tap to talk'); };
  recognition.start();
}
function endVoice(){
  if (recognition && active) recognition.stop();
  active = false;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  sayStatus('Call ended');
}
document.getElementById('mainMic').addEventListener('click', startListening);
document.getElementById('mainMic').addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') startListening(); });
document.getElementById('talkBtn').addEventListener('click', startListening);
document.getElementById('endBtn').addEventListener('click', endVoice);
document.getElementById('galleryBtn').addEventListener('click', () => {
  addMessage('System', 'Gallery ফিচারটি পরে যুক্ত করা যাবে।');
});
document.getElementById('clock').textContent = new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
