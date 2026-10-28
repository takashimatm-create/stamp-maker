// Keep the review checkbox tied to an actually rendered set of 16 previews.
export function actionState({busy=false,sharing=false,reading=false,hasResult=false,previewReady=false,splitOK=false,reviewed=false,named=false}){
 const locked=busy||sharing,ready=hasResult&&previewReady&&splitOK;
 return {locked,generateDisabled:locked||reading,reviewDisabled:locked||!ready,zipDisabled:locked||!ready||!reviewed,shareDisabled:locked||!ready||!reviewed||!named,sheetDisabled:locked||!hasResult,manualDisabled:locked||!hasResult};
}
export function manualSheetRects(width,height,cuts){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<400||height<200)throw Error('一覧画像の寸法を確認してください。');
 const values=axis=>{const p=cuts?.[axis];if(!Array.isArray(p)||p.length!==3||p.some(v=>!Number.isFinite(v)||v<=0||v>=100)||p.some((v,i)=>i&&v-p[i-1]<2))throw Error('分割位置は左から右・上から下の順に、2%以上離して指定してください。');return [0,...p.map(v=>Math.round((axis==='x'?width:height)*v/100)),axis==='x'?width:height];};
 const xs=values('x'),ys=values('y'),rects=[];
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){const cell={x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]};rects.push({...cell,cell:{...cell}});}
 return {ok:true,mode:'manual',rects};
}
