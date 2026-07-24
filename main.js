/* ---------- hero field: zonal-mean zonal wind, contoured ----------
   MODE 'lat-lev'  : latitude-height section. Amplitude is Gaussian in
                     latitude (equatorial confinement); bands descend
                     in height as time runs.
   MODE 'time-lev' : the classic time-height section, bands sloping
                     downward to the right.
   KZ = vertical wavenumber, LEVELS = contour steps,
   PHI0 = meridional half-width in degrees.                          */
(function(){
  var cv = document.getElementById('qbo');
  if(!cv) return;
  var ctx = cv.getContext('2d');
  var W = 420, H = 240;
  cv.width = W; cv.height = H;

  var MODE   = 'lat-lev';
  var KZ = 11, LEVELS = 5, ZC = 0.62, ZW = 0.30;
  var LATMAX = 55, PHI0 = 13;
  var KX = 30;

  var base = [16,23,36], warm = [176,58,46], cool = [46,111,167];

  var zAmp = new Float32Array(H), zPhase = new Float32Array(H);
  for(var j=0;j<H;j++){
    var z = (H-1-j)/H;
    zAmp[j]   = Math.exp(-Math.pow((z-ZC)/ZW,2));
    zPhase[j] = z*KZ;
  }
  var xAmp = new Float32Array(W), xPhase = new Float32Array(W);
  for(var i=0;i<W;i++){
    if(MODE === 'lat-lev'){
      var lat = (i/W*2-1)*LATMAX;
      xAmp[i] = Math.exp(-Math.pow(lat/PHI0,2));
      xPhase[i] = 0;
    } else {
      xAmp[i] = 1;
      xPhase[i] = (i/W)*KX;
    }
  }

  var img = ctx.createImageData(W,H), d = img.data;
  for(var p=3;p<d.length;p+=4) d[p] = 255;

  function draw(t){
    for(var j=0;j<H;j++){
      var za = zAmp[j], zp = zPhase[j], row = j*W;
      for(var i=0;i<W;i++){
        var v = Math.sin(xPhase[i] + zp + t) * za * xAmp[i];
        var q = Math.round(v*LEVELS)/LEVELS;
        var m = Math.min(Math.abs(q),1), tgt = q>0 ? warm : cool;
        var p = (row+i)*4;
        d[p]   = base[0] + (tgt[0]-base[0])*m;
        d[p+1] = base[1] + (tgt[1]-base[1])*m;
        d[p+2] = base[2] + (tgt[2]-base[2])*m;
      }
    }
    ctx.putImageData(img,0,0);
  }

  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ draw(0); return; }

  var t = 0, last = 0;
  (function loop(now){
    requestAnimationFrame(loop);
    if(now - last < 50) return;
    last = now; t += 0.02; draw(t);
  })(0);
})();

/* ---------- reveal on scroll ---------- */
(function(){
  var els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    for(var k=0;k<els.length;k++) els[k].classList.add('in');
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  },{threshold:.12, rootMargin:'0px 0px -8% 0px'});

  Array.prototype.forEach.call(els, function(el){
    var sibs = Array.prototype.filter.call(el.parentElement.children, function(n){
      return n.classList.contains('reveal');
    });
    el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 55 + 'ms';
    io.observe(el);
  });

  // safety net: if anything above fails, never leave content hidden
  setTimeout(function(){
    Array.prototype.forEach.call(els, function(el){ el.classList.add('in'); });
  }, 3000);
})();

/* ---------- nav: hairline on scroll + active section ---------- */
(function(){
  var nav = document.getElementById('nav');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav ul a'));
  var targets = links.map(function(a){ return document.querySelector(a.getAttribute('href')); })
                     .filter(Boolean);

  function onScroll(){
    nav.classList.toggle('stuck', window.scrollY > 8);
    var current = null;
    targets.forEach(function(sec){
      if(sec.getBoundingClientRect().top <= 140) current = sec.id;
    });
    links.forEach(function(a){
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
