(function(){
  const key='menslab-progress-v3';
  const previousKey='menslab-progress-v2';
  const checks=[...document.querySelectorAll('[data-week-days] input')];
  const note=document.querySelector('[data-week-note]');
  const next=document.querySelector('[data-week-next]');
  const status=document.querySelector('[data-week-status]');
  function read(){try{const value=JSON.parse(localStorage.getItem(key)||localStorage.getItem(previousKey)||'{}');return value&&typeof value==='object'?value:{}}catch(_){return{}}}
  let state=read();
  if(!Array.isArray(state.checks))state.checks=new Array(7).fill(false);
  state.checks=new Array(7).fill(false).map((_,index)=>state.checks[index]===true);
  if(!Array.isArray(state.completedWeeks))state.completedWeeks=[];
  if(!state.drafts||typeof state.drafts!=='object')state.drafts={};
  if(typeof state.drafts.nextIntention!=='string')state.drafts.nextIntention='';
  if(typeof state.note!=='string')state.note='';
  function save(){try{localStorage.setItem(key,JSON.stringify(state));localStorage.removeItem(previousKey);return true}catch(_){return false}}
  function render(){const done=state.checks.filter(Boolean).length;checks.forEach((input,index)=>{input.checked=state.checks[index]});document.querySelector('[data-week-score]').textContent=`${done}/7`;document.querySelector('[data-week-bar]').style.width=`${done/7*100}%`;note.value=state.note;next.value=state.drafts.nextIntention}
  checks.forEach((input,index)=>input.addEventListener('change',()=>{state.checks[index]=input.checked;save();render()}));
  note.addEventListener('input',()=>{state.note=note.value.slice(0,280);save();status.textContent='Automatisch lokaal bewaard.'});
  next.addEventListener('input',()=>{state.drafts.nextIntention=next.value.slice(0,160);save();status.textContent='Automatisch lokaal bewaard.'});
  document.querySelector('[data-save-week]').addEventListener('click',()=>{state.note=note.value.trim();state.drafts.nextIntention=next.value.trim();status.textContent=save()?'Deze stand staat in Mijn spoor.':'Bewaren lukt niet in deze browser.'});
  document.querySelector('[data-archive-week]').addEventListener('click',()=>{const movements=state.checks.map((value,index)=>value?index:-1).filter(index=>index>=0);if(!movements.length){status.textContent='Probeer eerst minstens één beweging.';return}state.completedWeeks.unshift({completedAt:new Date().toISOString(),note:note.value.trim().slice(0,280),carryForward:next.value.trim().slice(0,160),movements});state.checks=new Array(7).fill(false);state.note='';state.drafts.nextIntention='';status.textContent=save()?'Deze week staat nu in Mijn spoor.':'Bewaren lukt niet in deze browser.';render()});
  document.querySelector('[data-reset-week]').addEventListener('click',()=>{if(!confirm('Wil je alleen de actieve week wissen? Eerder afgeronde weken blijven bewaard.'))return;state.checks=new Array(7).fill(false);state.note='';state.drafts.nextIntention='';save();render();status.textContent='De actieve week is leeggemaakt.'});
  render();
}());
