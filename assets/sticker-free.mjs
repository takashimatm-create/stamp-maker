// Local Canvas composition only. No fetch, model, login or image-generation API.
export const cropDefaults={x:50,y:42,size:58};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function cropRect(width,height,{x,y,size}){
 const side=Math.min(width,height)*clamp(Number(size),15,100)/100;
 return {x:clamp(width*Number(x)/100-side/2,0,width-side),y:clamp(height*Number(y)/100-side/2,0,height-side),w:side,h:side};
}
export function drawPortrait(ctx,image,crop,x,y,w,h){
 const r=cropRect(image.naturalWidth||image.width,image.naturalHeight||image.height,crop);
 ctx.save();ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);ctx.clip();ctx.drawImage(image,r.x,r.y,r.w,r.h,x,y,w,h);ctx.restore();
}
export function wrapText(ctx,text,maxWidth){const lines=[];let line='';for(const ch of text){if(line&&ctx.measureText(line+ch).width>maxWidth&&!/[！!？?。、，,.…」）]/.test(ch)){lines.push(line);line=ch;}else line+=ch;}if(line)lines.push(line);if(lines.length>1&&lines.at(-1).length<3){const previous=lines[lines.length-2],last=lines.pop(),cut=Math.ceil((previous.length+last.length)/2);lines[lines.length-1]=previous.slice(0,cut);lines.push(previous.slice(cut)+last);}return lines;}
export function drawFreeTile(ctx,image,crop,item,edition,index){
 const golf=edition.startsWith('golf'),dramatic=edition.endsWith('-jojo');
 const colors=dramatic?['#5b21b6','#007d70','#b45309','#a21caf']:golf?['#176b43','#1666aa','#b45309','#1e6990']:['#a32132','#145b9c','#b45309','#7341a0'];
 const color=colors[index%colors.length];ctx.save();ctx.clearRect(0,0,368,240);
 // White margins and every visible element remain within a fixed tile.
 ctx.fillStyle='#fff';ctx.fillRect(0,0,368,240);
 ctx.save();ctx.beginPath();ctx.rect(12,10,344,220);ctx.clip();
 if(dramatic){ctx.strokeStyle=color+'55';ctx.lineWidth=2;for(let n=0;n<40;n++){const a=n*Math.PI/20;ctx.beginPath();ctx.moveTo(184+Math.cos(a)*100,88+Math.sin(a)*70);ctx.lineTo(184+Math.cos(a)*270,88+Math.sin(a)*220);ctx.stroke();}}
 else{ctx.fillStyle=color+'14';ctx.beginPath();ctx.ellipse(184,86,132,72,0,0,Math.PI*2);ctx.fill();}
 ctx.restore();
 // Exact source photograph: crop, resize and alpha clip only, no repainting.
 ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(184,83,79,76,0,0,Math.PI*2);ctx.fill();
 drawPortrait(ctx,image,crop,110,12,148,144);
 ctx.strokeStyle=color;ctx.lineWidth=dramatic?4:2;ctx.beginPath();ctx.ellipse(184,84,74,72,0,0,Math.PI*2);ctx.stroke();
 let font=28,lines;do{ctx.font='900 '+font+'px sans-serif';lines=wrapText(ctx,item.text,324);if(lines.length*font*1.16<=66&&lines.every(line=>ctx.measureText(line).width<=328))break;font--;}while(font>12);
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
 const step=font*1.16,start=193-(lines.length-1)*step/2;
 lines.forEach((line,i)=>{const y=start+i*step;if(dramatic){ctx.strokeStyle='#172b4d';ctx.lineWidth=9;ctx.strokeText(line,185,y+2);}ctx.strokeStyle='#fff';ctx.lineWidth=dramatic?5:4;ctx.strokeText(line,184,y);ctx.fillStyle=color;ctx.fillText(line,184,y);});
 ctx.restore();
}
export function composeFreeSheet(image,crop,preset,edition,makeCanvas){
 const sheet=makeCanvas(1536,1024),ctx=sheet.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,1536,1024);
 preset.items.forEach((item,i)=>{const tile=makeCanvas(368,240);drawFreeTile(tile.getContext('2d'),image,crop,item,edition,i);ctx.drawImage(tile,(i%4)*384+8,Math.floor(i/4)*256+8);});return sheet;
}
