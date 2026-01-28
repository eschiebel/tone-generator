(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const u of r.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&i(u)}).observe(document,{childList:!0,subtree:!0});function o(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=o(n);fetch(n.href,r)}})();class L{ctx=null;oscillator=null;gain=null;get isPlaying(){return this.oscillator!==null}ensureContext(){if(this.ctx)return this.ctx;const t=window.AudioContext||window.webkitAudioContext;return this.ctx=new t,this.ctx}async start(t){const o=this.ensureContext();o.state==="suspended"&&await o.resume(),this.stop();const i=o.createOscillator();i.type=t.waveform,i.frequency.value=t.frequencyHz;const n=o.createGain();n.gain.value=Math.max(0,Math.min(1,t.volume)),i.connect(n),n.connect(o.destination),i.start(),this.oscillator=i,this.gain=n}update(t){if(!(!this.ctx||!this.oscillator||!this.gain)&&(t.waveform&&(this.oscillator.type=t.waveform),typeof t.frequencyHz=="number"&&Number.isFinite(t.frequencyHz)&&this.oscillator.frequency.setValueAtTime(t.frequencyHz,this.ctx.currentTime),typeof t.volume=="number"&&Number.isFinite(t.volume))){const o=Math.max(0,Math.min(1,t.volume));this.gain.gain.setValueAtTime(o,this.ctx.currentTime)}}stop(){if(this.oscillator){try{this.oscillator.stop()}catch{}try{this.oscillator.disconnect()}catch{}}if(this.gain)try{this.gain.disconnect()}catch{}this.oscillator=null,this.gain=null}}const b=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],N={C:0,"C#":1,DB:1,D:2,"D#":3,EB:3,E:4,F:5,"F#":6,GB:6,G:7,"G#":8,AB:8,A:9,"A#":10,BB:10,B:11};function S(e,t=440){const o=e.trim(),i=/^(?<letter>[A-Ga-g])(?<accidental>[#bB]?)(?<octave>-?\d+)$/.exec(o);if(!i?.groups)throw new Error("Invalid note format. Examples: C3, F#4, Bb2");const n=i.groups.letter.toUpperCase(),r=i.groups.accidental,u=r==="b"?"B":r,p=Number.parseInt(i.groups.octave,10);if(!Number.isFinite(p))throw new Error("Invalid octave");const A=`${n}${u}`.toUpperCase(),m=N[A];if(m===void 0)throw new Error("Invalid note name");const y=(p+1)*12+m,F=t*2**((y-69)/12);return{canonical:`${b[m]}${p}`,midi:y,frequencyHz:F}}function C(e,t){return`${e}${t}`}const T=document.querySelector("#app");if(!T)throw new Error("Missing #app element");const a=new L;function M(e){return e>=100?e.toFixed(1):e>=10?e.toFixed(2):e.toFixed(3)}const q=3;T.innerHTML=`
  <main class="page">
    <header class="header">
      <div class="title">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Sine wave icon"
        >
          <path
            d="M2 12
               C4 6, 8 6, 10 12
               C12 18, 16 18, 18 12
               C20 6, 24 6, 26 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <h1 class="title">Tone Generator</h1>
      </div>
        <p class="subtitle">Choose a note (e.g. C3) and play it.</p>
    </header>

    <section class="panel" aria-label="Tone controls">
      <div>
        <label class="field">
          <span class="label">Note</span>
          <div class="note-row">
            <select id="noteName" class="control" aria-label="Note name"></select>
            <select id="octave" class="control" aria-label="Octave"></select>
            <input id="noteText" class="control" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Note text" />
          </div>
          <span class="hint">Accepted: C3, F#4, Bb2</span>
        </label>
      </div>

      <div class="actions">
        <button id="play-toggle" type="button" class="primary">Play</button>
        <div class="readout" role="status" aria-live="polite">
          <div><span class="readout-label">Frequency</span> <span id="freq">—</span></div>
        </div>
      </div>

      <div id="error" class="error" role="alert" aria-live="assertive"></div>
    </section>
  </main>
`;function c(e,t){const o=document.querySelector(e);if(!o||!t(o))throw new Error(`Missing required element: ${e}`);return o}const l=c("#noteName",e=>e instanceof HTMLSelectElement),d=c("#octave",e=>e instanceof HTMLSelectElement),f=c("#noteText",e=>e instanceof HTMLInputElement),h=c("#play-toggle",e=>e instanceof HTMLButtonElement),g=c("#freq",e=>e instanceof HTMLSpanElement),E=c("#error",e=>e instanceof HTMLDivElement),z=Array.from({length:9},(e,t)=>t),B={"C#":"Db","D#":"Eb","F#":"Gb","G#":"Ab","A#":"Bb"};for(const e of b){const t=document.createElement("option");t.value=e;const o=B[e];t.textContent=o?`${e} / ${o}`:e,l.appendChild(t)}for(const e of z){const t=document.createElement("option");t.value=String(e),t.textContent=String(e),d.appendChild(t)}l.value="C";d.value=String(q);f.value=C(l.value,q);function x(e){E.textContent=e,E.style.display=e?"block":"none"}function w(e){if(!e){g.textContent="—";return}g.textContent=`${M(e.frequencyHz)} Hz`}function v(){h.textContent=a.isPlaying?"Stop":"Play"}function s(){try{const e=S(f.value);return x(""),w(e),e}catch(e){const t=e instanceof Error?e.message:"Invalid note";return x(t),w(null),null}}function H(){const e=Number.parseInt(d.value,10);f.value=C(l.value,e),s()}function O(){const e=s();if(!e)return;const t=/^(?<name>[A-G]#?)(?<octave>-?\d+)$/.exec(e.canonical);t?.groups&&(l.value=t.groups.name,d.value=t.groups.octave)}l.addEventListener("change",()=>{if(H(),a.isPlaying){const e=s();e&&a.update({frequencyHz:e.frequencyHz})}});d.addEventListener("change",()=>{if(H(),a.isPlaying){const e=s();e&&a.update({frequencyHz:e.frequencyHz})}});f.addEventListener("input",()=>{if(O(),a.isPlaying){const e=s();e&&a.update({frequencyHz:e.frequencyHz})}});h.addEventListener("click",async()=>{if(a.isPlaying){a.stop(),v();return}const e=s();e&&(await a.start({frequencyHz:e.frequencyHz,waveform:"sine",volume:1}),v())});window.addEventListener("keydown",e=>{e.key===" "&&(e.preventDefault(),h.click())});v();s();
