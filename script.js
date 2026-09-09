const input=document.getElementById('textInput');
const words=document.getElementById('wordCount');
const chars=document.getElementById('charCount');
const result=document.getElementById('result');
const error=document.getElementById('error');

function updateCount(){
 const text=input.value.trim();
 words.textContent=(text ? text.split(/\s+/).length : 0)+' words';
 chars.textContent=input.value.length+' characters';
}
input.addEventListener('input',updateCount);
document.getElementById('clearBtn').onclick=()=>{input.value='';updateCount();result.classList.add('hidden');};

function level(n, invert=false){
 const x=invert?100-n:n;
 return x>=70?'High':x>=40?'Medium':'Low';
}
function setMetric(id,n,invert=false){
 document.getElementById(id).style.width=n+'%';
 document.getElementById(id+'Val').textContent=level(n,invert);
}
function analyze(text){
 const sentences=text.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
 const wordList=text.toLowerCase().match(/[\p{L}\p{N}']+/gu)||[];
 const unique=new Set(wordList).size;
 const avg=sentences.length?wordList.length/sentences.length:0;
 const lengths=sentences.map(s=>(s.match(/[\p{L}\p{N}']+/gu)||[]).length);
 const variance=lengths.length?lengths.reduce((a,n)=>a+(n-avg)**2,0)/lengths.length:0;
 const variation=Math.min(100,Math.round((unique/Math.max(1,wordList.length))*150));
 const consistency=Math.max(0,Math.min(100,Math.round(90-Math.sqrt(variance)*8)));
 const frequency={};wordList.forEach(w=>frequency[w]=(frequency[w]||0)+1);
 const repeated=Object.values(frequency).filter(n=>n>2).reduce((a,n)=>a+n-2,0);
 const repetition=Math.min(100,Math.round(repeated/Math.max(1,wordList.length)*250));
 let score=Math.round(consistency*.42+(100-variation)*.28+repetition*.18+(Math.min(100,avg*4))*0.12);
 score=Math.max(5,Math.min(95,score));
 return {score,consistency,variation,repetition,predictability:Math.round(score*.85)};
}
document.getElementById('analyzeBtn').onclick=()=>{
 const text=input.value.trim();
 if(text.split(/\s+/).filter(Boolean).length<20){error.textContent='Please enter at least 20 words for an estimate.';return;}
 error.textContent='';
 const data=analyze(text);
 result.classList.remove('hidden');
 const ring=document.getElementById('scoreRing');
 const score=document.getElementById('score');
 score.textContent='0%';
 ring.style.background='conic-gradient(var(--purple) 0deg,rgba(255,255,255,.07) 0deg)';
 requestAnimationFrame(()=>setTimeout(()=>{
  let current=0; const timer=setInterval(()=>{
   current+=Math.ceil(data.score/35);
   if(current>=data.score){current=data.score;clearInterval(timer);}
   score.textContent=current+'%';
   ring.style.background=`conic-gradient(var(--purple) ${current*3.6}deg, rgba(255,255,255,.07) 0deg)`;
  },25);
 },50));
 const verdict=document.getElementById('verdict'), resultText=document.getElementById('resultText');
 if(data.score>=70){verdict.textContent='Likely AI-generated';resultText.textContent='The text shows relatively consistent and predictable patterns.';}
 else if(data.score>=40){verdict.textContent='Mixed signals';resultText.textContent='The text contains a mixture of more and less predictable writing patterns.';}
 else{verdict.textContent='Likely human-written';resultText.textContent='The text shows more variation in its writing patterns.';}
 setTimeout(()=>{setMetric('consistency',data.consistency);setMetric('vocabulary',data.variation,true);setMetric('repetition',data.repetition);setMetric('predictability',data.predictability);},120);
 result.scrollIntoView({behavior:'smooth',block:'nearest'});
};
