---
layout: default
title: Example MediaSync
demojs : exp_mediasync
---

- [MediaSync Background](background_mediasync.html) 
- [MediaSync API](api_mediasync.html)
- [MediaSync Example](exp_mediasync.html)

Synchronization and control of two video elements using timing object. Both videos produce audio independently. Listening to the audio is likely the best way to detect synchronization errors.

#### Demo

<div id="demo" style="height:50px">
  <p id='buttons'>
    <button id='tostart'>Reset</button>
    <button id='pause'>Pause</button>
    <b><button id='forward'>Play</button></b>
    <button id='skipforward'>Skip 5 Ahead</button>
    <button id='skipbackward'>Skip 5 Back </button>   
  </p>
 
</div>
<p>
  <b><span id='position'></span></b>
</p>


**Player 1**
<p>
  <video id="player1" style="height:200px">
      <source src="http://mcorp.no/res/bigbuckbunny.webm" type="video/webm" />
      <source src="http://mcorp.no/res/bigbuckbunny.m4v" type="video/mp4" />
  </video>
</p>
**Player 2**
<p>
  <video id="player2" style="height:200px">
      <source src="http://mcorp.no/res/bigbuckbunny.webm" type="video/webm" />
      <source src="http://mcorp.no/res/bigbuckbunny.m4v" type="video/mp4" />
  </video>
</p>


#### JavaScript

```javascript
// timing object
var to = new TIMINGSRC.TimingObject({range:[0,100]});

// set up video sync
var sync1 = new TIMINGSRC.MediaSync(document.getElementById('player1'), to);

// set up video sync
var sync2 = new TIMINGSRC.MediaSync(document.getElementById('player2'), to);
```    
