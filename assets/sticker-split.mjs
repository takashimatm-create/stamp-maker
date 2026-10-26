// Detect actual white gutters. Never silently fall back to equal quarters.
export function analyzeSheet({data,width,height}){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<400||height<200||data.length!==width*height*4)throw Error('一覧画像の寸法を確認してください。');
 const ink=new Uint8Array(width*height);
 // Ignore only nearly-white antialiasing/watercolour haze (all channels >=240).
 for(let p=0;p<ink.length;p++){const j=p*4;ink[p]=data[j+3]>20&&Math.min(data[j],data[j+1],data[j+2])<240?1:0;}
 function cuts(axis,lo,hi,only=null){const size=axis==='x'?width:height,quarter=size/4,result=[0];for(let n=1;n<4;n++){
   if(only&&!only.includes(n)){result.push(Math.round(n*quarter));continue;}
   const nominal=n*quarter,start=Math.ceil(nominal-quarter*.22),end=Math.floor(nominal+quarter*.22),runs=[];let begin=null;
   for(let a=start;a<=end+1;a++){let occupied=a>end; if(!occupied)for(let b=lo;b<hi;b++)if(ink[axis==='x'?b*width+a:a*width+b]){occupied=true;break;}
    if(!occupied&&begin===null)begin=a;if(occupied&&begin!==null){if(a-begin>=3)runs.push({start:begin,end:a});begin=null;}}
   if(!runs.length)return null;
   const best=runs.map(r=>({...r,center:(r.start+r.end)/2,score:Math.abs((r.start+r.end)/2-nominal)-Math.min(r.end-r.start,quarter*.12)*.65})).sort((a,b)=>a.score-b.score)[0];result.push(Math.round(best.center));
  }result.push(size);return result;}
 const rects=[],columns=[],rows=[],coverage=new Uint8Array(width*height);
 // Rows can have different heights in each column; columns can vary by row.
 // Estimate columns on the central part of each row, then verify the entire
 // detected cell perimeter and every non-white source pixel below.
 for(let row=0;row<4;row++){const cols=cuts('x',Math.round((row+.12)*height/4),Math.round((row+.88)*height/4));if(!cols)return {ok:false,reason:(row+1)+'段目の左右のコマの間に、安全に分けられる白い余白がありません。'};columns.push(cols);
  for(let col=0;col<4;col++){const ys=cuts('y',cols[col],cols[col+1],[row,row+1]);if(!ys)return {ok:false,reason:(row*4+col+1)+'番の上下に、絵や文字を横切らない白い余白を見つけられませんでした。'};rows.push(ys);const x=cols[col],y=ys[row],w=cols[col+1]-x,h=ys[row+1]-y;let left=x+w,top=y+h,right=-1,bottom=-1;
   for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(ink[yy*width+xx]){coverage[yy*width+xx]++;left=Math.min(left,xx);right=Math.max(right,xx);top=Math.min(top,yy);bottom=Math.max(bottom,yy);}
   if(right<left)return {ok:false,reason:(row*4+col+1)+'番が空白です。16コマすべてがある画像を選んでください。'};
   // A source already clipped at the outside edge cannot be repaired by splitting.
   if(left===0||top===0||right===width-1||bottom===height-1)return {ok:false,reason:(row*4+col+1)+'番の絵や文字が一覧画像の外端に触れています。切れていないか元の画像を確認してください。'};
   if(left<=x||right>=x+w-1||top<=y||bottom>=y+h-1)return {ok:false,reason:(row*4+col+1)+'番の分割線に絵や文字が触れています。切れない境界を確定できませんでした。'};
   const pad=4,l=Math.max(x,left-pad),t=Math.max(y,top-pad),r=Math.min(x+w,right+pad+1),b=Math.min(y+h,bottom+pad+1);
   rects.push({x:l,y:t,w:r-l,h:b-t,cell:{x,y,w,h}});
  }
 }
 for(let p=0;p<ink.length;p++)if(ink[p]&&coverage[p]!==1)return {ok:false,reason:'隣のコマと重なる部分、または分割から外れる文字・絵が見つかりました。安全な分割を確定できません。'};
 return {ok:true,rows,columns,rects};
}
export function drawTile(image,rect,canvas,w,h){canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);const k=Math.min((w-24)/rect.w,(h-24)/rect.h);ctx.drawImage(image,rect.x,rect.y,rect.w,rect.h,(w-rect.w*k)/2,(h-rect.h*k)/2,rect.w*k,rect.h*k);
 // Remove only white connected to the outside. Keep enclosed white clothes,
 // eyes and lettering, plus a two-pixel white contour around the artwork.
 const pixels=ctx.getImageData(0,0,w,h),d=pixels.data,seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
 const add=p=>{if(p<0||p>=w*h||seen[p])return;const j=p*4;if(Math.min(d[j],d[j+1],d[j+2])<248)return;seen[p]=1;queue[tail++]=p;};
 for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
 while(head<tail){const p=queue[head++],x=p%w;if(x>0)add(p-1);if(x<w-1)add(p+1);add(p-w);add(p+w);}
 for(let p=0;p<w*h;p++)if(seen[p]){const x=p%w,y=Math.floor(p/w);let edge=false;for(let yy=Math.max(0,y-2);yy<=Math.min(h-1,y+2)&&!edge;yy++)for(let xx=Math.max(0,x-2);xx<=Math.min(w-1,x+2);xx++)if(!seen[yy*w+xx]){edge=true;break;}if(!edge)d[p*4+3]=0;}
 ctx.putImageData(pixels,0,0);return canvas;}
