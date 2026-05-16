"use strict";exports.id=710,exports.ids=[710],exports.modules={32354:(e,r,t)=>{t.d(r,{Z:()=>n});let n=(0,t(5670).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},60840:(e,r,t)=>{t.d(r,{Z:()=>n});let n=(0,t(5670).Z)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},56370:(e,r,t)=>{t.d(r,{Cr:()=>a,LH:()=>l,R1:()=>i});var n=t(10),o=t(91299);function i(e){return e?`${e.slice(0,5)}…${e.slice(-4)}`:""}function a({wei:e,precision:r=3}){return parseFloat((0,n.d)(e)).toFixed(r).replace(/0+$/,"").replace(/\.$/,"")}function l({amount:e,decimals:r}){return(0,o.b)(BigInt(e),r)}},62709:(e,r,t)=>{t.d(r,{A:()=>c});var n=t(4913),o=t(32354),i=t(60840),a=t(26510),l=t(96419),s=t(22554),d=t(38102);let c=({address:e,showCopyIcon:r,url:t,className:l})=>{let[c,h]=(0,a.useState)(!1);function f(r){r.stopPropagation(),navigator.clipboard.writeText(e).then(()=>h(!0)).catch(console.error)}return(0,a.useEffect)(()=>{if(c){let e=setTimeout(()=>h(!1),3e3);return()=>clearTimeout(e)}},[c]),(0,n.jsxs)(u,t?{children:[(0,n.jsx)(p,{title:e,className:l,href:`${t}/address/${e}`,target:"_blank",children:(0,s.w)(e)}),r&&(0,n.jsx)(d.S,{onClick:f,size:"sm",style:{gap:"0.375rem"},children:(0,n.jsxs)(n.Fragment,c?{children:["Copied",(0,n.jsx)(o.Z,{size:16})]}:{children:["Copy",(0,n.jsx)(i.Z,{size:16})]})})]}:{children:[(0,n.jsx)(g,{title:e,className:l,children:(0,s.w)(e)}),r&&(0,n.jsx)(d.S,{onClick:f,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:(0,n.jsxs)(n.Fragment,c?{children:["Copied",(0,n.jsx)(o.Z,{size:14})]}:{children:["Copy",(0,n.jsx)(i.Z,{size:14})]})})]})},u=l.zo.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,g=l.zo.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,p=l.zo.a`
  font-size: 14px;
  color: var(--privy-color-foreground);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`},73993:(e,r,t)=>{t.d(r,{E:()=>o});var n=t(96419);let o=n.zo.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`},42365:(e,r,t)=>{t.d(r,{t:()=>a});var n=t(4913),o=t(55182),i=t(38102);function a({title:e}){let{currentScreen:r,navigateBack:t,navigate:a,data:l,setModalData:s}=(0,o.a)();return(0,n.jsx)(i.M,{title:e,backFn:"ManualTransferScreen"===r?t:r===l?.funding?.methodScreen?l.funding.comingFromSendTransactionScreen?()=>a("SendTransactionScreen"):void 0:l?.funding?.methodScreen?()=>{let e=l.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),s({funding:e,solanaFundingData:l?.solanaFundingData}),a(e.methodScreen)}:void 0})}},71771:(e,r,t)=>{t.d(r,{I:()=>l});var n=t(4913),o=t(26510);let i=o.forwardRef(function({title:e,titleId:r,...t},n){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},t),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"}))});var a=t(96419);let l=({children:e,theme:r})=>(0,n.jsxs)(s,{$theme:r,children:[(0,n.jsx)(i,{width:"20px",height:"20px",color:"var(--privy-color-icon-muted)",strokeWidth:1.5,style:{flexShrink:0}}),(0,n.jsx)(d,{$theme:r,children:e})]}),s=a.zo.div`
  display: flex;
  gap: 0.75rem;
  background-color: var(--privy-color-background-2);
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
`,d=a.zo.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  flex: 1;
  text-align: left;

  /* text-sm/font-regular */
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */
`},59169:(e,r,t)=>{t.d(r,{L:()=>o});var n=t(96419);let o=n.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
`},38198:(e,r,t)=>{t.d(r,{B:()=>o,C:()=>l,F:()=>d,H:()=>a,R:()=>p,S:()=>u,a:()=>c,b:()=>g,c:()=>s,d:()=>h,e:()=>i});var n=t(96419);let o=n.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,i=n.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,a=n.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,n.zo)(i)`
  padding: 20px 0;
`,s=(0,n.zo)(i)`
  gap: 16px;
`,d=n.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,c=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;n.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let u=n.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  gap: 8px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
  width: 100%;
  background: var(--privy-color-background-2);
  border-radius: var(--privy-border-radius-md);
  && h4 {
    color: var(--privy-color-foreground-3);
    font-size: 14px;
    text-decoration: underline;
    font-weight: medium;
  }
  && p {
    color: var(--privy-color-foreground-3);
    font-size: 14px;
  }
`,g=n.zo.div`
  height: 16px;
`,p=n.zo.div`
  height: 12px;
`;n.zo.div`
  position: relative;
`;let h=n.zo.div`
  height: ${e=>e.height??"12"}px;
`;n.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},40710:(e,r,t)=>{t.r(r),t.d(r,{ManualTransferScreen:()=>k,default:()=>k});var n=t(4913),o=t(26510),i=t(91299),a=t(56370),l=t(38102),s=t(38198),d=t(60546),c=t(42365),u=t(71771),g=t(83059),p=t(59759),h=t(18034),f=t(14348),m=t(13813),x=t(49171),v=t(55182),y=t(92270),C=t(2207),b=t(26844),S=t(45592),z=t(81033),w=t(58103),j=t(77013),$=t(27251),F=t(22554);t(36535),t(50470),t(46898),t(36577),t(42330),t(84440);let k={component:()=>{let{wallets:e}=(0,C.u)(),{connectors:r}=(0,x.u)(),t=r.filter(m.c).flatMap(e=>e.wallets),{data:k,setModalData:D,navigate:M,lastScreen:B}=(0,v.a)(),{rpcConfig:E,appId:A,createAnalyticsEvent:L,closePrivyModal:P}=(0,x.u)(),I=(0,f.u)(),[U,N]=(0,o.useState)(void 0),[Z,H]=(0,o.useState)(!1),O=k?.funding,{reloadBalance:V}=(0,y.u)({rpcConfig:E,appId:A,address:"ethereum"===O.chainType?O.address:void 0,chain:"ethereum"===O.chainType?O.chain:void 0}),q="solana"===O.chainType,G=q?O.isUSDC?"USDC":"SOL":O.erc20Address?O.erc20ContractInfo?.symbol:O.chain.nativeCurrency.symbol,J=q?t.find(({address:e})=>e===O.address):e.find(({address:e})=>(0,F.w)(e)===(0,F.w)(O.address));if(!O)return D({errorModalData:{error:Error("Couldn't find funding config"),previousScreen:B||"FundingMethodSelectionScreen"},funding:k?.funding,solanaFundingData:k?.solanaFundingData,sendTransaction:k?.sendTransaction}),M("ErrorScreen"),(0,n.jsx)(n.Fragment,{});(0,o.useEffect)(()=>{let e=q?async function(){if("solana"!==O.chainType)return;let e=I.solanaRpcs[O.chain];e?(O.isUSDC?async function({rpc:e,address:r,mintAddress:t}){let n=await e.getTokenAccountsByOwner(r,{mint:t},{encoding:"jsonParsed",commitment:"confirmed"}).send(),o=n.value[0]?.account;return o?BigInt(o.data.parsed.info.tokenAmount.amount):0n}({rpc:e.rpc,address:O.address,mintAddress:(0,w.g)(O.chain)}):(0,S.r)({rpc:e.rpc,address:O.address})).then(e=>{let r=BigInt(e);U&&r>U&&(H(!0),L({eventName:b.O,payload:{provider:"manual",status:"success",chainType:"solana",address:J?.address,value:O.isUSDC?(0,i.b)(r-U,6):(0,i.b)(r-U,9),token:O.isUSDC?"USDC":"SOL"}})),N(r)}):console.warn("Unable to load solana rpc, skipping balance")}:async function(){"ethereum"===O.chainType&&(async()=>{if(!O.erc20Address)return await V()??BigInt(0);{let{balance:e}=await (0,$.g)({chain:O.chain,address:O.address,erc20Address:O.erc20Address,rpcConfig:E,appId:A});return e}})().then(e=>{U&&e>U&&(H(!0),L({eventName:b.O,payload:{provider:"manual",status:"success",chainType:"ethereum",address:J?.address,chainId:O.chain.id,value:(0,i.b)(e-U,O.erc20ContractInfo?.decimals??18),token:O.erc20ContractInfo?.symbol??O.erc20Address??"ETH"}})),N(e)}).catch(()=>N(void 0))},r=setInterval(e,2e3);return e(),()=>clearInterval(r)},[U]);let R=(0,o.useMemo)(()=>null==U?"":O.isUSDC?(0,a.LH)({amount:U,decimals:6}):q?(0,j.g)(U,3,!0,!0):null!=O.erc20ContractInfo?.decimals?(0,a.LH)({amount:U,decimals:O.erc20ContractInfo.decimals}):(0,a.Cr)({wei:U}),[U,q,O]),Q="ethereum"===O.chainType?O.chain.name:(0,z.g)(O.chain),W=(0,o.useMemo)(()=>""===O.uiConfig?.receiveFundsTitle?null:(0,n.jsx)(p.T,{children:O.uiConfig?.receiveFundsTitle??`Receive ${O.amount} ${G??""}`.trim()}),[O.uiConfig?.receiveFundsTitle,O.amount,G]),Y=(0,o.useMemo)(()=>""===O.uiConfig?.receiveFundsSubtitle?null:(0,n.jsx)(g.S,{children:O.uiConfig?.receiveFundsSubtitle??`Scan this code or copy your wallet address to receive funds on ${Q}.`}),[O.uiConfig?.receiveFundsSubtitle,Q]),K="solana"===O.chainType&&O.isUSDC&&(0,w.g)(O.chain)?`?spl-token=${(0,w.g)(O.chain)}`:"";return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(c.t,{}),W,Y,(0,n.jsxs)(s.F,{style:{gap:"1rem",margin:W||Y?"1rem 0":"0"},children:[(0,n.jsx)(d.Q,{url:`${O.chainType}:${O.address}${K}`,size:200,squareLogoElement:T}),(0,n.jsxs)(u.I,{theme:I.appearance.palette.colorScheme,children:["Make sure to send funds on ",Q,"."]}),(0,n.jsx)(h.W,{title:"Your wallet",errMsg:void 0,showCopyButton:!0,balance:`${R} ${G}`,address:O.address}),Z&&(0,n.jsx)(l.P,{onClick:()=>P({shouldCallAuthOnSuccess:!1,isSuccess:!0}),children:"Continue"})]}),(0,n.jsx)(l.B,{})]})}},T=({...e})=>(0,n.jsx)(S.w,{color:"black",...e})},60546:(e,r,t)=>{t.d(r,{Q:()=>v});var n=t(4913),o=t(36535),i=t(26510),a=t(96419),l=t(14348),s=t(22554);let d=()=>(0,n.jsx)("svg",{width:"200",height:"200",viewBox:"-77 -77 200 200",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{height:"28px",width:"28px"},children:(0,n.jsx)("rect",{width:"50",height:"50",fill:"black",rx:10,ry:10})}),c=(e,r,t,n,o)=>{for(let i=r;i<r+n;i++)for(let r=t;r<t+o;r++){let t=e?.[r];t&&t[i]&&(t[i]=0)}return e},u=(e,r)=>{let t=o.create(e,{errorCorrectionLevel:r}).modules,n=(0,s.E)(Array.from(t.data),t.size);return n=c(n,0,0,7,7),n=c(n,n.length-7,0,7,7),c(n,0,n.length-7,7,7)},g=({x:e,y:r,cellSize:t,bgColor:o,fgColor:i})=>(0,n.jsx)(n.Fragment,{children:[0,1,2].map(a=>(0,n.jsx)("circle",{r:t*(7-2*a)/2,cx:e+7*t/2,cy:r+7*t/2,fill:a%2!=0?o:i},`finder-${e}-${r}-${a}`))}),p=({cellSize:e,matrixSize:r,bgColor:t,fgColor:o})=>(0,n.jsx)(n.Fragment,{children:[[0,0],[(r-7)*e,0],[0,(r-7)*e]].map(([r,i])=>(0,n.jsx)(g,{x:r,y:i,cellSize:e,bgColor:t,fgColor:o},`finder-${r}-${i}`))}),h=({matrix:e,cellSize:r,color:t})=>(0,n.jsx)(n.Fragment,{children:e.map((e,o)=>e.map((e,a)=>e?(0,n.jsx)("rect",{height:r-.4,width:r-.4,x:o*r+.1*r,y:a*r+.1*r,rx:.5*r,ry:.5*r,fill:t},`cell-${o}-${a}`):(0,n.jsx)(i.Fragment,{},`circle-${o}-${a}`)))}),f=({cellSize:e,matrixSize:r,element:t,sizePercentage:o,bgColor:i})=>{if(!t)return(0,n.jsx)(n.Fragment,{});let a=r*(o||.14),l=Math.floor(r/2-a/2),s=Math.floor(r/2+a/2);(s-l)%2!=r%2&&(s+=1);let d=(s-l)*e,c=d-.2*d,u=l*e;return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("rect",{x:l*e,y:l*e,width:d,height:d,fill:i}),(0,n.jsx)(t,{x:u+.1*d,y:u+.1*d,height:c,width:c})]})},m=e=>{let r=e.outputSize,t=u(e.url,e.errorCorrectionLevel),o=r/t.length,i=(0,s.F)(2*o,{min:.025*r,max:.036*r});return(0,n.jsxs)("svg",{height:e.outputSize,width:e.outputSize,viewBox:`0 0 ${e.outputSize} ${e.outputSize}`,style:{height:"100%",width:"100%",padding:`${i}px`},children:[(0,n.jsx)(h,{matrix:t,cellSize:o,color:e.fgColor}),(0,n.jsx)(p,{cellSize:o,matrixSize:t.length,fgColor:e.fgColor,bgColor:e.bgColor}),(0,n.jsx)(f,{cellSize:o,element:e.logo?.element,bgColor:e.bgColor,matrixSize:t.length})]})},x=a.zo.div.attrs({className:"ph-no-capture"})`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${e=>`${e.$size}px`};
  width: ${e=>`${e.$size}px`};
  margin: auto;
  background-color: ${e=>e.$bgColor};

  && {
    border-width: 2px;
    border-color: ${e=>e.$borderColor};
    border-radius: var(--privy-border-radius-md);
  }
`,v=e=>{let{appearance:r}=(0,l.u)(),t=e.bgColor||"#FFFFFF",o=e.fgColor||"#000000",i=e.size||160,a="dark"===r.palette.colorScheme?t:o;return(0,n.jsx)(x,{$size:i,$bgColor:t,$fgColor:o,$borderColor:a,children:(0,n.jsx)(m,{url:e.url,logo:{element:e.squareLogoElement??d},outputSize:i,bgColor:t,fgColor:o,errorCorrectionLevel:e.errorCorrectionLevel||"Q"})})}},83059:(e,r,t)=>{t.d(r,{S:()=>o});var n=t(96419);let o=n.zo.span`
  margin-top: 4px;
  color: var(--privy-color-foreground);
  text-align: center;

  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */

  && a {
    color: var(--privy-color-accent);
  }
`},59759:(e,r,t)=>{t.d(r,{T:()=>o});var n=t(96419);let o=n.zo.span`
  color: var(--privy-color-foreground);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.875rem; /* 166.667% */
  text-align: center;
`},18034:(e,r,t)=>{t.d(r,{W:()=>C});var n=t(4913),o=t(32354),i=t(60840),a=t(26510),l=t(96419),s=t(38102),d=t(73993),c=t(59169),u=t(62709),g=t(55276);let p=(0,l.zo)(g.B)`
  && {
    padding: 0.75rem;
    height: 56px;
  }
`,h=l.zo.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`,f=l.zo.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`,m=l.zo.div`
  font-size: 12px;
  line-height: 1rem;
  color: var(--privy-color-foreground-3);
`,x=(0,l.zo)(c.L)`
  text-align: left;
  margin-bottom: 0.5rem;
`,v=(0,l.zo)(d.E)`
  margin-top: 0.25rem;
`,y=(0,l.zo)(s.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`,C=({errMsg:e,balance:r,address:t,className:l,title:s,showCopyButton:d=!1})=>{let[c,g]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{if(c){let e=setTimeout(()=>g(!1),3e3);return()=>clearTimeout(e)}},[c]),(0,n.jsxs)("div",{children:[s&&(0,n.jsx)(x,{children:s}),(0,n.jsx)(p,{className:l,$state:e?"error":void 0,children:(0,n.jsxs)(h,{children:[(0,n.jsxs)(f,{children:[(0,n.jsx)(u.A,{address:t,showCopyIcon:!1}),void 0!==r&&(0,n.jsx)(m,{children:r})]}),d&&(0,n.jsx)(y,{onClick:function(e){e.stopPropagation(),navigator.clipboard.writeText(t).then(()=>g(!0)).catch(console.error)},size:"sm",children:(0,n.jsxs)(n.Fragment,c?{children:["Copied",(0,n.jsx)(o.Z,{size:14})]}:{children:["Copy",(0,n.jsx)(i.Z,{size:14})]})})]})}),e&&(0,n.jsx)(v,{children:e})]})}},26844:(e,r,t)=>{t.d(r,{O:()=>n});let n="sdk_fiat_on_ramp_completed_with_status"},81033:(e,r,t)=>{t.d(r,{g:()=>n});function n(e){switch(e){case"solana:mainnet":return"Solana";case"solana:devnet":return"Devnet";case"solana:testnet":return"Testnet"}}},27251:(e,r,t)=>{t.d(r,{g:()=>a});var n=t(65655),o=t(96467),i=t(2207);let a=async({chain:e,address:r,appId:t,rpcConfig:a,erc20Address:s})=>{let d=(0,n.v)({chain:e,transport:(0,o.d)((0,i.i)(e,a,t))});return{balance:await d.readContract({address:s,abi:l,functionName:"balanceOf",args:[r]}).catch(()=>0n),chain:e}},l=[{constant:!0,inputs:[{name:"_owner",type:"address"}],name:"balanceOf",outputs:[{name:"balance",type:"uint256"}],payable:!1,stateMutability:"view",type:"function"}]},24689:(e,r,t)=>{t.d(r,{A:()=>l,D:()=>c,J:()=>d,L:()=>n,R:()=>s,S:()=>o,T:()=>i,a:()=>a,g:()=>u});let n=1e9,o="11111111111111111111111111111111",i="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",a="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",l="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",s=["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C","CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"],d=["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],c={"solana:mainnet":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:{symbol:"USDC",decimals:6,address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:{symbol:"USDT",decimals:6,address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:devnet":{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":{symbol:"USDC",decimals:6,address:"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"},EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS:{symbol:"USDT",decimals:6,address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:testnet":{}};function u(e,r){let t=parseFloat(e.toString())/n,o=g.format(r*t);return"$0.00"===o?"<$0.01":o}let g=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2})},58103:(e,r,t)=>{t.d(r,{g:()=>o});var n=t(24689);function o(e){let[r]=Object.entries(n.D[e]).find(([e,r])=>"USDC"===r.symbol)??[];return r}},55276:(e,r,t)=>{t.d(r,{B:()=>i,a:()=>o});var n=t(96419);let o=(0,n.iv)`
  && {
    border-width: 1px;
    padding: 0.5rem 1rem;
  }

  width: 100%;
  text-align: left;
  border: solid 1px var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${e=>"error"===e.$state?"\n        border-color: var(--privy-color-error);\n        background: var(--privy-color-error-bg);\n      ":""}
`,i=n.zo.div`
  ${o}
`},77013:(e,r,t)=>{t.d(r,{a:()=>i,g:()=>o});var n=t(24689);function o(e,r=6,t=!1,n=!1){let o=(parseFloat(e.toString())/1e9).toFixed(r).replace(/0+$/,"").replace(/\.$/,""),i=n?"":" SOL";return t?`${o}${i}`:`${"0"===o?"<0.001":o}${i}`}function i({amount:e,fee:r,tokenPrice:t,isUsdc:i}){let a=BigInt(Math.floor(parseFloat(e)*10**(i?6:9))),l=i?a:a+r;return{fundingAmountInBaseUnit:a,fundingAmountInUsd:t?(0,n.g)(a,t):void 0,totalPriceInUsd:t?(0,n.g)(l,t):void 0,totalPriceInNativeCurrency:o(l),feePriceInNativeCurrency:o(r),feePriceInUsd:t?(0,n.g)(r,t):void 0}}},92270:(e,r,t)=>{t.d(r,{u:()=>s});var n=t(26510),o=t(65655),i=t(96467),a=t(2207),l=t(49171);function s({rpcConfig:e,appId:r,address:t,chain:s}){let{chains:d}=(0,l.u)(),[c,u]=(0,n.useState)(0n),[g,p]=(0,n.useState)(!1),h=(0,n.useMemo)(()=>{let t=s||d[0];if(t)return(0,o.v)({chain:s,transport:(0,i.d)((0,a.i)(t,e,r))})},[s,e,r]),f=(0,n.useCallback)(async()=>{if(!t||!h)return;p(!0);let e=await h.getBalance({address:t}).catch(console.error);return e?(u(e),p(!1),e):void 0},[h,t,u]);return(0,n.useEffect)(()=>{f().catch(console.error)},[]),{balance:c,isLoading:g,reloadBalance:f}}}};