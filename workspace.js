'use strict';
// Only this script should be included on workspace.html (not the older script.js).
const KEYS = {tasks:'workspace.tasks.v1',notes:'workspace.notes.v1'};
const read = (key,fallback) => {try { const val=localStorage.getItem(key);return val===null?fallback:JSON.parse(val); } catch {return fallback;} };
const $ = id=>document.getElementById(id);
const state = {tasks:read(KEYS.tasks,[]),notes:localStorage.getItem(KEYS.notes)||'', duration:25*60, remaining:25*60, running:false, endAt:0, interval:null};
if (!Array.isArray(state.tasks)) state.tasks=[];
$('today-date').textContent = new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date());

function saveTasks(){localStorage.setItem(KEYS.tasks,JSON.stringify(state.tasks));}
function renderTasks(){
  const list=$('task-list'); list.replaceChildren();
  const remaining=state.tasks.filter(t=>!t.done).length;
  $('task-count').textContent=`${remaining} left`;
  $('task-progress').textContent=state.tasks.length?`${state.tasks.length-remaining} of ${state.tasks.length} completed`:'';
  $('tasks-empty').hidden=state.tasks.length>0;
  $('clear-completed').disabled=!state.tasks.some(t=>t.done);
  for(const task of state.tasks){
    const li=document.createElement('li');if(task.done)li.className='task-done';
    const check=document.createElement('input');check.type='checkbox';check.className='task-check';check.checked=task.done;check.setAttribute('aria-label',`Mark ${task.text} ${task.done?'incomplete':'complete'}`);
    check.addEventListener('change',()=>{task.done=check.checked;saveTasks();renderTasks();});
    const label=document.createElement('span');label.className='task-name';label.textContent=task.text;
    const del=document.createElement('button');del.type='button';del.className='delete-task';del.textContent='×';del.setAttribute('aria-label',`Remove ${task.text}`);
    del.addEventListener('click',()=>{state.tasks=state.tasks.filter(t=>t.id!==task.id);saveTasks();renderTasks();});
    li.append(check,label,del);list.append(li);
  }
}
$('task-form').addEventListener('submit',e=>{
  e.preventDefault();const input=$('task-input');const text=input.value.trim();if(!text)return;
  state.tasks.push({id:crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`,text,done:false});
  input.value='';saveTasks();renderTasks();input.focus();
});
$('clear-completed').addEventListener('click',()=>{state.tasks=state.tasks.filter(t=>!t.done);saveTasks();renderTasks();});
renderTasks();

$('brain-dump-input').value=state.notes;
$('brain-dump-input').addEventListener('input',e=>{
  try {localStorage.setItem(KEYS.notes,e.target.value);$('save-status').textContent='';}
  catch {$('save-status').textContent='Could not save';}
});
$('clear-notes').addEventListener('click',()=>{
  if(!$('brain-dump-input').value)return;
  if(!confirm('Clear all your notes?'))return;
  $('brain-dump-input').value='';localStorage.removeItem(KEYS.notes);$('save-status').textContent='Notes cleared';
});

function stopTimer(){if(state.interval!==null){clearInterval(state.interval);state.interval=null;}state.running=false;}
function renderTimer(){
  const m=Math.floor(state.remaining/60),s=state.remaining%60;
  $('timer-display').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  $('timer-circle').style.setProperty('--progress',`${100*(1-state.remaining/state.duration)}%`);
  $('timer-status').textContent=state.running?'In progress':state.remaining===0?'Finished':state.remaining===state.duration?'Ready':'Paused';
  $('timer-caption').textContent=state.remaining===0?'Session complete. Nice work!':state.running?'':'';
  $('start-timer').disabled=state.running;
  $('stop-timer').disabled=!state.running;
  $('start-timer').textContent=state.remaining===0?'Start again':state.remaining===state.duration?'Start focus':'Resume';
}
function tick(){
  state.remaining=Math.max(0,Math.ceil((state.endAt-Date.now())/1000));
  if(state.remaining===0){stopTimer();document.title='Time is up! | Workspace';}
  renderTimer();
}
$('start-timer').addEventListener('click',()=>{
  if(state.remaining===0)state.remaining=state.duration;
  if(state.running)return;
  state.endAt=Date.now()+state.remaining*1000;state.running=true;
  state.interval=setInterval(tick,250);document.title='Workspace | Focus & Flow';renderTimer();
});
$('stop-timer').addEventListener('click',()=>{if(!state.running)return;tick();stopTimer();renderTimer();});
$('reset-timer').addEventListener('click',()=>{stopTimer();state.remaining=state.duration;document.title='Workspace | Focus & Flow';renderTimer();});
document.querySelectorAll('.mode').forEach(btn=>btn.addEventListener('click',()=>{
  stopTimer();state.duration=Number(btn.dataset.minutes)*60;state.remaining=state.duration;
  document.querySelectorAll('.mode').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  document.title='Workspace | Focus & Flow';renderTimer();
}));
renderTimer();
