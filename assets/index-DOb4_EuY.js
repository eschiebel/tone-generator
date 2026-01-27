(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const u of a.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&r(u)}).observe(document,{childList:!0,subtree:!0});function o(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(n){if(n.ep)return;n.ep=!0;const a=o(n);fetch(n.href,a)}})();class S{ctx=null;oscillator=null;gain=null;get isPlaying(){return this.oscillator!==null}ensureContext(){if(this.ctx)return this.ctx;const t=window.AudioContext||window.webkitAudioContext;return this.ctx=new t,this.ctx}async start(t){const o=this.ensureContext();o.state==="suspended"&&await o.resume(),this.stop();const r=o.createOscillator();r.type=t.waveform,r.frequency.value=t.frequencyHz;const n=o.createGain();n.gain.value=Math.max(0,Math.min(1,t.volume)),r.connect(n),n.connect(o.destination),r.start(),this.oscillator=r,this.gain=n}update(t){if(!(!this.ctx||!this.oscillator||!this.gain)&&(t.waveform&&(this.oscillator.type=t.waveform),typeof t.frequencyHz=="number"&&Number.isFinite(t.frequencyHz)&&this.oscillator.frequency.setValueAtTime(t.frequencyHz,this.ctx.currentTime),typeof t.volume=="number"&&Number.isFinite(t.volume))){const o=Math.max(0,Math.min(1,t.volume));this.gain.gain.setValueAtTime(o,this.ctx.currentTime)}}stop(){if(this.oscillator){try{this.oscillator.stop()}catch{}try{this.oscillator.disconnect()}catch{}}if(this.gain)try{this.gain.disconnect()}catch{}this.oscillator=null,this.gain=null}}const C=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],z={C:0,"C#":1,DB:1,D:2,"D#":3,EB:3,E:4,F:5,"F#":6,GB:6,G:7,"G#":8,AB:8,A:9,"A#":10,BB:10,B:11};function P(e,t=440){const o=e.trim(),r=/^(?<letter>[A-Ga-g])(?<accidental>[#bB]?)(?<octave>-?\d+)$/.exec(o);if(!r?.groups)throw new Error("Invalid note format. Examples: C3, F#4, Bb2");const n=r.groups.letter.toUpperCase(),a=r.groups.accidental,u=a==="b"?"B":a,p=Number.parseInt(r.groups.octave,10);if(!Number.isFinite(p))throw new Error("Invalid octave");const M=`${n}${u}`.toUpperCase(),v=z[M];if(v===void 0)throw new Error("Invalid note name");const E=(p+1)*12+v,A=t*2**((E-69)/12);return{canonical:`${C[v]}${p}`,midi:E,frequencyHz:A}}function q(e,t){return`${e}${t}`}const L=document.querySelector("#app");if(!L)throw new Error("Missing #app element");const i=new S;function h(e,t,o){return Math.max(t,Math.min(o,e))}function B(e){return e>=100?e.toFixed(1):e>=10?e.toFixed(2):e.toFixed(3)}const H=3;L.innerHTML=`
  <main class="page">
    <header class="header">
      <h1 class="title">Tone Generator</h1>
      <p class="subtitle">Choose a note (e.g. C3) and play it.</p>
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
        <button id="play-toggle" type="button" class="primary">Play</button>
        <div class="readout" role="status" aria-live="polite">
          <div><span class="readout-label">Frequency</span> <span id="freq">—</span></div>
        </div>
      </div>

      <div id="error" class="error" role="alert" aria-live="assertive"></div>
    </section>
  </main>
`;function s(e,t){const o=document.querySelector(e);if(!o||!t(o))throw new Error(`Missing required element: ${e}`);return o}const l=s("#noteName",e=>e instanceof HTMLSelectElement),f=s("#octave",e=>e instanceof HTMLSelectElement),m=s("#noteText",e=>e instanceof HTMLInputElement),d=s("#volume",e=>e instanceof HTMLInputElement),O=s("#volumeLabel",e=>e instanceof HTMLSpanElement),g=s("#play-toggle",e=>e instanceof HTMLButtonElement),b=s("#freq",e=>e instanceof HTMLSpanElement),x=s("#error",e=>e instanceof HTMLDivElement),$=Array.from({length:9},(e,t)=>t);for(const e of C){const t=document.createElement("option");t.value=e,t.textContent=e,l.appendChild(t)}for(const e of $){const t=document.createElement("option");t.value=String(e),t.textContent=String(e),f.appendChild(t)}l.value="C";f.value=String(H);m.value=q(l.value,H);d.value="0.8";function w(e){x.textContent=e,x.style.display=e?"block":"none"}function T(e){if(!e){b.textContent="—";return}b.textContent=`${B(e.frequencyHz)} Hz`}function y(){g.textContent=i.isPlaying?"Stop":"Play"}function F(){const e=h(Number.parseFloat(d.value),0,1);O.textContent=`${Math.round(e*100)}%`}function c(){try{const e=P(m.value);return w(""),T(e),e}catch(e){const t=e instanceof Error?e.message:"Invalid note";return w(t),T(null),null}}function N(){const e=Number.parseInt(f.value,10);m.value=q(l.value,e),c()}function I(){const e=c();if(!e)return;const t=/^(?<name>[A-G]#?)(?<octave>-?\d+)$/.exec(e.canonical);t?.groups&&(l.value=t.groups.name,f.value=t.groups.octave)}l.addEventListener("change",()=>{if(N(),i.isPlaying){const e=c();e&&i.update({frequencyHz:e.frequencyHz})}});f.addEventListener("change",()=>{if(N(),i.isPlaying){const e=c();e&&i.update({frequencyHz:e.frequencyHz})}});m.addEventListener("input",()=>{if(I(),i.isPlaying){const e=c();e&&i.update({frequencyHz:e.frequencyHz})}});d.addEventListener("input",()=>{F(),i.isPlaying&&i.update({volume:h(Number.parseFloat(d.value),0,1)})});g.addEventListener("click",async()=>{if(i.isPlaying){i.stop(),y();return}const e=c();e&&(await i.start({frequencyHz:e.frequencyHz,waveform:"sine",volume:h(Number.parseFloat(d.value),0,1)}),y())});window.addEventListener("keydown",e=>{e.key===" "&&(e.preventDefault(),g.click())});y();F();c();
