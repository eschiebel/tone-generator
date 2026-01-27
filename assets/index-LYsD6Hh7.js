(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const u of a.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&i(u)}).observe(document,{childList:!0,subtree:!0});function o(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=o(n);fetch(n.href,a)}})();class S{ctx=null;oscillator=null;gain=null;get isPlaying(){return this.oscillator!==null}ensureContext(){if(this.ctx)return this.ctx;const t=window.AudioContext||window.webkitAudioContext;return this.ctx=new t,this.ctx}async start(t){const o=this.ensureContext();o.state==="suspended"&&await o.resume(),this.stop();const i=o.createOscillator();i.type=t.waveform,i.frequency.value=t.frequencyHz;const n=o.createGain();n.gain.value=Math.max(0,Math.min(1,t.volume)),i.connect(n),n.connect(o.destination),i.start(),this.oscillator=i,this.gain=n}update(t){if(!(!this.ctx||!this.oscillator||!this.gain)&&(t.waveform&&(this.oscillator.type=t.waveform),typeof t.frequencyHz=="number"&&Number.isFinite(t.frequencyHz)&&this.oscillator.frequency.setValueAtTime(t.frequencyHz,this.ctx.currentTime),typeof t.volume=="number"&&Number.isFinite(t.volume))){const o=Math.max(0,Math.min(1,t.volume));this.gain.gain.setValueAtTime(o,this.ctx.currentTime)}}stop(){if(this.oscillator){try{this.oscillator.stop()}catch{}try{this.oscillator.disconnect()}catch{}}if(this.gain)try{this.gain.disconnect()}catch{}this.oscillator=null,this.gain=null}}const w=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],z={C:0,"C#":1,DB:1,D:2,"D#":3,EB:3,E:4,F:5,"F#":6,GB:6,G:7,"G#":8,AB:8,A:9,"A#":10,BB:10,B:11};function B(e,t=440){const o=e.trim(),i=/^(?<letter>[A-Ga-g])(?<accidental>[#bB]?)(?<octave>-?\d+)$/.exec(o);if(!i?.groups)throw new Error("Invalid note format. Examples: C3, F#4, Bb2");const n=i.groups.letter.toUpperCase(),a=i.groups.accidental,u=a==="b"?"B":a,m=Number.parseInt(i.groups.octave,10);if(!Number.isFinite(m))throw new Error("Invalid octave");const N=`${n}${u}`.toUpperCase(),v=z[N];if(v===void 0)throw new Error("Invalid note name");const y=(m+1)*12+v,A=t*2**((y-69)/12);return{canonical:`${w[v]}${m}`,midi:y,frequencyHz:A}}function C(e,t){return`${e}${t}`}const L=document.querySelector("#app");if(!L)throw new Error("Missing #app element");const s=new S;function h(e,t,o){return Math.max(t,Math.min(o,e))}function O(e){return e>=100?e.toFixed(1):e>=10?e.toFixed(2):e.toFixed(3)}const H=3;L.innerHTML=`
  <main class="page">
    <header class="header">
      <h1 class="title">Tone Generator</h1>
      <p class="subtitle">Choose a note (e.g. C3) and play it using your browser’s native audio APIs.</p>
    </header>

    <section class="panel" aria-label="Tone controls">
      <div class="grid">
        <label class="field">
          <span class="label">Note</span>
          <div class="note-row">
            <select id="noteName" class="control" aria-label="Note name"></select>
            <select id="octave" class="control" aria-label="Octave"></select>
            <input id="noteText" class="control" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Note text" />
          </div>
          <span class="hint">Accepted: C3, F#4, Bb2</span>
        </label>

        <label class="field">
          <span class="label">Volume</span>
          <input id="volume" class="control" type="range" min="0" max="1" step="0.01" />
          <span id="volumeLabel" class="hint"></span>
        </label>
      </div>

      <div class="actions">
        <button id="play" type="button" class="primary">Play</button>
        <button id="stop" type="button">Stop</button>
        <div class="readout" role="status" aria-live="polite">
          <div><span class="readout-label">Frequency</span> <span id="freq">—</span></div>
          <div><span class="readout-label">MIDI</span> <span id="midi">—</span></div>
        </div>
      </div>

      <div id="error" class="error" role="alert" aria-live="assertive"></div>
    </section>
  </main>
`;function r(e,t){const o=document.querySelector(e);if(!o||!t(o))throw new Error(`Missing required element: ${e}`);return o}const l=r("#noteName",e=>e instanceof HTMLSelectElement),f=r("#octave",e=>e instanceof HTMLSelectElement),p=r("#noteText",e=>e instanceof HTMLInputElement),d=r("#volume",e=>e instanceof HTMLInputElement),I=r("#volumeLabel",e=>e instanceof HTMLSpanElement),q=r("#play",e=>e instanceof HTMLButtonElement),P=r("#stop",e=>e instanceof HTMLButtonElement),g=r("#freq",e=>e instanceof HTMLSpanElement),E=r("#midi",e=>e instanceof HTMLSpanElement),b=r("#error",e=>e instanceof HTMLDivElement),$=Array.from({length:9},(e,t)=>t);for(const e of w){const t=document.createElement("option");t.value=e,t.textContent=e,l.appendChild(t)}for(const e of $){const t=document.createElement("option");t.value=String(e),t.textContent=String(e),f.appendChild(t)}l.value="C";f.value=String(H);p.value=C(l.value,H);d.value="0.8";function x(e){b.textContent=e,b.style.display=e?"block":"none"}function T(e){if(!e){g.textContent="—",E.textContent="—";return}g.textContent=`${O(e.frequencyHz)} Hz`,E.textContent=String(e.midi)}function M(){const e=h(Number.parseFloat(d.value),0,1);I.textContent=`${Math.round(e*100)}%`}function c(){try{const e=B(p.value);return x(""),T(e),e}catch(e){const t=e instanceof Error?e.message:"Invalid note";return x(t),T(null),null}}function F(){const e=Number.parseInt(f.value,10);p.value=C(l.value,e),c()}function D(){const e=c();if(!e)return;const t=/^(?<name>[A-G]#?)(?<octave>-?\d+)$/.exec(e.canonical);t?.groups&&(l.value=t.groups.name,f.value=t.groups.octave)}l.addEventListener("change",()=>{if(F(),s.isPlaying){const e=c();e&&s.update({frequencyHz:e.frequencyHz})}});f.addEventListener("change",()=>{if(F(),s.isPlaying){const e=c();e&&s.update({frequencyHz:e.frequencyHz})}});p.addEventListener("input",()=>{if(D(),s.isPlaying){const e=c();e&&s.update({frequencyHz:e.frequencyHz})}});d.addEventListener("input",()=>{M(),s.isPlaying&&s.update({volume:h(Number.parseFloat(d.value),0,1)})});q.addEventListener("click",async()=>{const e=c();e&&await s.start({frequencyHz:e.frequencyHz,waveform:"sine",volume:h(Number.parseFloat(d.value),0,1)})});P.addEventListener("click",()=>{s.stop()});window.addEventListener("keydown",e=>{e.key===" "&&(e.preventDefault(),s.isPlaying?s.stop():q.click())});M();c();
