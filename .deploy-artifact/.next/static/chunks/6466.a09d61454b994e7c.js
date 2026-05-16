"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6466],{12859:function(e,n,r){r.d(n,{Z:function(){return t}});let t=(0,r(79095).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},68610:function(e,n,r){r.d(n,{Z:function(){return t}});let t=(0,r(79095).Z)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},60115:function(e,n,r){r.d(n,{Cr:function(){return a},LH:function(){return c},R1:function(){return i}});var t=r(40778),o=r(1603);function i(e){return e?`${e.slice(0,5)}…${e.slice(-4)}`:""}function a({wei:e,precision:n=3}){return parseFloat((0,t.d)(e)).toFixed(n).replace(/0+$/,"").replace(/\.$/,"")}function c({amount:e,decimals:n}){return(0,o.b)(BigInt(e),n)}},22073:function(e,n,r){r.d(n,{A:function(){return d}});var t=r(89418),o=r(12859),i=r(68610),a=r(4753),c=r(43803),l=r(40099),s=r(13188);let d=({address:e,showCopyIcon:n,url:r,className:c})=>{let[d,p]=(0,a.useState)(!1);function h(n){n.stopPropagation(),navigator.clipboard.writeText(e).then(()=>p(!0)).catch(console.error)}return(0,a.useEffect)(()=>{if(d){let e=setTimeout(()=>p(!1),3e3);return()=>clearTimeout(e)}},[d]),(0,t.jsxs)(u,r?{children:[(0,t.jsx)(g,{title:e,className:c,href:`${r}/address/${e}`,target:"_blank",children:(0,l.w)(e)}),n&&(0,t.jsx)(s.S,{onClick:h,size:"sm",style:{gap:"0.375rem"},children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(o.Z,{size:16})]}:{children:["Copy",(0,t.jsx)(i.Z,{size:16})]})})]}:{children:[(0,t.jsx)(f,{title:e,className:c,children:(0,l.w)(e)}),n&&(0,t.jsx)(s.S,{onClick:h,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(o.Z,{size:14})]}:{children:["Copy",(0,t.jsx)(i.Z,{size:14})]})})]})},u=c.zo.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,f=c.zo.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,g=c.zo.a`
  font-size: 14px;
  color: var(--privy-color-foreground);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`},41815:function(e,n,r){r.d(n,{E:function(){return o}});var t=r(43803);let o=t.zo.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`},87718:function(e,n,r){r.d(n,{t:function(){return a}});var t=r(89418),o=r(9201),i=r(13188);function a({title:e}){let{currentScreen:n,navigateBack:r,navigate:a,data:c,setModalData:l}=(0,o.a)();return(0,t.jsx)(i.M,{title:e,backFn:"ManualTransferScreen"===n?r:n===c?.funding?.methodScreen?c.funding.comingFromSendTransactionScreen?()=>a("SendTransactionScreen"):void 0:c?.funding?.methodScreen?()=>{let e=c.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),l({funding:e,solanaFundingData:c?.solanaFundingData}),a(e.methodScreen)}:void 0})}},4537:function(e,n,r){r.d(n,{I:function(){return c}});var t=r(89418),o=r(4753);let i=o.forwardRef(function(e,n){let{title:r,titleId:t,...i}=e;return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":t},i),r?o.createElement("title",{id:t},r):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"}))});var a=r(43803);let c=({children:e,theme:n})=>(0,t.jsxs)(l,{$theme:n,children:[(0,t.jsx)(i,{width:"20px",height:"20px",color:"var(--privy-color-icon-muted)",strokeWidth:1.5,style:{flexShrink:0}}),(0,t.jsx)(s,{$theme:n,children:e})]}),l=a.zo.div`
  display: flex;
  gap: 0.75rem;
  background-color: var(--privy-color-background-2);
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
`,s=a.zo.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  flex: 1;
  text-align: left;

  /* text-sm/font-regular */
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */
`},24974:function(e,n,r){r.d(n,{L:function(){return o}});var t=r(43803);let o=t.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
`},94923:function(e,n,r){r.d(n,{B:function(){return o},C:function(){return c},F:function(){return s},H:function(){return a},R:function(){return g},S:function(){return u},a:function(){return d},b:function(){return f},c:function(){return l},d:function(){return p},e:function(){return i}});var t=r(43803);let o=t.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,i=t.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,a=t.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,c=(0,t.zo)(i)`
  padding: 20px 0;
`,l=(0,t.zo)(i)`
  gap: 16px;
`,s=t.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,d=t.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;t.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let u=t.zo.div`
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
`,f=t.zo.div`
  height: 16px;
`,g=t.zo.div`
  height: 12px;
`;t.zo.div`
  position: relative;
`;let p=t.zo.div`
  height: ${e=>e.height??"12"}px;
`;t.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},26466:function(e,n,r){r.r(n),r.d(n,{ManualTransferScreen:function(){return k},default:function(){return k}});var t=r(89418),o=r(4753),i=r(1603),a=r(60115),c=r(13188),l=r(94923),s=r(79478),d=r(87718),u=r(4537),f=r(34693),g=r(73764),p=r(90116),h=r(64982),m=r(61318),x=r(3010),v=r(9201),y=r(30484),C=r(35245),b=r(50472),S=r(5430),z=r(29707),w=r(60096),j=r(63821),$=r(82225),F=r(40099);r(2892),r(96257),r(55982),r(78439),r(94936),r(21628);let k={component:()=>{let{wallets:e}=(0,C.u)(),{connectors:n}=(0,x.u)(),r=n.filter(m.c).flatMap(e=>e.wallets),{data:k,setModalData:D,navigate:M,lastScreen:E}=(0,v.a)(),{rpcConfig:B,appId:A,createAnalyticsEvent:L,closePrivyModal:P}=(0,x.u)(),I=(0,h.u)(),[N,U]=(0,o.useState)(void 0),[Z,H]=(0,o.useState)(!1),O=k?.funding,{reloadBalance:V}=(0,y.u)({rpcConfig:B,appId:A,address:"ethereum"===O.chainType?O.address:void 0,chain:"ethereum"===O.chainType?O.chain:void 0}),q="solana"===O.chainType,G=q?O.isUSDC?"USDC":"SOL":O.erc20Address?O.erc20ContractInfo?.symbol:O.chain.nativeCurrency.symbol,J=q?r.find(({address:e})=>e===O.address):e.find(({address:e})=>(0,F.w)(e)===(0,F.w)(O.address));if(!O)return D({errorModalData:{error:Error("Couldn't find funding config"),previousScreen:E||"FundingMethodSelectionScreen"},funding:k?.funding,solanaFundingData:k?.solanaFundingData,sendTransaction:k?.sendTransaction}),M("ErrorScreen"),(0,t.jsx)(t.Fragment,{});(0,o.useEffect)(()=>{let e=q?async function(){if("solana"!==O.chainType)return;let e=I.solanaRpcs[O.chain];e?(O.isUSDC?async function({rpc:e,address:n,mintAddress:r}){let t=await e.getTokenAccountsByOwner(n,{mint:r},{encoding:"jsonParsed",commitment:"confirmed"}).send(),o=t.value[0]?.account;return o?BigInt(o.data.parsed.info.tokenAmount.amount):0n}({rpc:e.rpc,address:O.address,mintAddress:(0,w.g)(O.chain)}):(0,S.r)({rpc:e.rpc,address:O.address})).then(e=>{let n=BigInt(e);N&&n>N&&(H(!0),L({eventName:b.O,payload:{provider:"manual",status:"success",chainType:"solana",address:J?.address,value:O.isUSDC?(0,i.b)(n-N,6):(0,i.b)(n-N,9),token:O.isUSDC?"USDC":"SOL"}})),U(n)}):console.warn("Unable to load solana rpc, skipping balance")}:async function(){"ethereum"===O.chainType&&(async()=>{if(!O.erc20Address)return await V()??BigInt(0);{let{balance:e}=await (0,$.g)({chain:O.chain,address:O.address,erc20Address:O.erc20Address,rpcConfig:B,appId:A});return e}})().then(e=>{N&&e>N&&(H(!0),L({eventName:b.O,payload:{provider:"manual",status:"success",chainType:"ethereum",address:J?.address,chainId:O.chain.id,value:(0,i.b)(e-N,O.erc20ContractInfo?.decimals??18),token:O.erc20ContractInfo?.symbol??O.erc20Address??"ETH"}})),U(e)}).catch(()=>U(void 0))},n=setInterval(e,2e3);return e(),()=>clearInterval(n)},[N]);let R=(0,o.useMemo)(()=>null==N?"":O.isUSDC?(0,a.LH)({amount:N,decimals:6}):q?(0,j.g)(N,3,!0,!0):null!=O.erc20ContractInfo?.decimals?(0,a.LH)({amount:N,decimals:O.erc20ContractInfo.decimals}):(0,a.Cr)({wei:N}),[N,q,O]),Q="ethereum"===O.chainType?O.chain.name:(0,z.g)(O.chain),W=(0,o.useMemo)(()=>""===O.uiConfig?.receiveFundsTitle?null:(0,t.jsx)(g.T,{children:O.uiConfig?.receiveFundsTitle??`Receive ${O.amount} ${G??""}`.trim()}),[O.uiConfig?.receiveFundsTitle,O.amount,G]),Y=(0,o.useMemo)(()=>""===O.uiConfig?.receiveFundsSubtitle?null:(0,t.jsx)(f.S,{children:O.uiConfig?.receiveFundsSubtitle??`Scan this code or copy your wallet address to receive funds on ${Q}.`}),[O.uiConfig?.receiveFundsSubtitle,Q]),_="solana"===O.chainType&&O.isUSDC&&(0,w.g)(O.chain)?`?spl-token=${(0,w.g)(O.chain)}`:"";return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(d.t,{}),W,Y,(0,t.jsxs)(l.F,{style:{gap:"1rem",margin:W||Y?"1rem 0":"0"},children:[(0,t.jsx)(s.Q,{url:`${O.chainType}:${O.address}${_}`,size:200,squareLogoElement:T}),(0,t.jsxs)(u.I,{theme:I.appearance.palette.colorScheme,children:["Make sure to send funds on ",Q,"."]}),(0,t.jsx)(p.W,{title:"Your wallet",errMsg:void 0,showCopyButton:!0,balance:`${R} ${G}`,address:O.address}),Z&&(0,t.jsx)(c.P,{onClick:()=>P({shouldCallAuthOnSuccess:!1,isSuccess:!0}),children:"Continue"})]}),(0,t.jsx)(c.B,{})]})}},T=({...e})=>(0,t.jsx)(S.w,{color:"black",...e})},79478:function(e,n,r){r.d(n,{Q:function(){return v}});var t=r(89418),o=r(2892),i=r(4753),a=r(43803),c=r(64982),l=r(40099);let s=()=>(0,t.jsx)("svg",{width:"200",height:"200",viewBox:"-77 -77 200 200",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{height:"28px",width:"28px"},children:(0,t.jsx)("rect",{width:"50",height:"50",fill:"black",rx:10,ry:10})}),d=(e,n,r,t,o)=>{for(let i=n;i<n+t;i++)for(let n=r;n<r+o;n++){let r=e?.[n];r&&r[i]&&(r[i]=0)}return e},u=(e,n)=>{let r=o.create(e,{errorCorrectionLevel:n}).modules,t=(0,l.E)(Array.from(r.data),r.size);return t=d(t,0,0,7,7),t=d(t,t.length-7,0,7,7),d(t,0,t.length-7,7,7)},f=({x:e,y:n,cellSize:r,bgColor:o,fgColor:i})=>(0,t.jsx)(t.Fragment,{children:[0,1,2].map(a=>(0,t.jsx)("circle",{r:r*(7-2*a)/2,cx:e+7*r/2,cy:n+7*r/2,fill:a%2!=0?o:i},`finder-${e}-${n}-${a}`))}),g=({cellSize:e,matrixSize:n,bgColor:r,fgColor:o})=>(0,t.jsx)(t.Fragment,{children:[[0,0],[(n-7)*e,0],[0,(n-7)*e]].map(([n,i])=>(0,t.jsx)(f,{x:n,y:i,cellSize:e,bgColor:r,fgColor:o},`finder-${n}-${i}`))}),p=({matrix:e,cellSize:n,color:r})=>(0,t.jsx)(t.Fragment,{children:e.map((e,o)=>e.map((e,a)=>e?(0,t.jsx)("rect",{height:n-.4,width:n-.4,x:o*n+.1*n,y:a*n+.1*n,rx:.5*n,ry:.5*n,fill:r},`cell-${o}-${a}`):(0,t.jsx)(i.Fragment,{},`circle-${o}-${a}`)))}),h=({cellSize:e,matrixSize:n,element:r,sizePercentage:o,bgColor:i})=>{if(!r)return(0,t.jsx)(t.Fragment,{});let a=n*(o||.14),c=Math.floor(n/2-a/2),l=Math.floor(n/2+a/2);(l-c)%2!=n%2&&(l+=1);let s=(l-c)*e,d=s-.2*s,u=c*e;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:c*e,y:c*e,width:s,height:s,fill:i}),(0,t.jsx)(r,{x:u+.1*s,y:u+.1*s,height:d,width:d})]})},m=e=>{let n=e.outputSize,r=u(e.url,e.errorCorrectionLevel),o=n/r.length,i=(0,l.F)(2*o,{min:.025*n,max:.036*n});return(0,t.jsxs)("svg",{height:e.outputSize,width:e.outputSize,viewBox:`0 0 ${e.outputSize} ${e.outputSize}`,style:{height:"100%",width:"100%",padding:`${i}px`},children:[(0,t.jsx)(p,{matrix:r,cellSize:o,color:e.fgColor}),(0,t.jsx)(g,{cellSize:o,matrixSize:r.length,fgColor:e.fgColor,bgColor:e.bgColor}),(0,t.jsx)(h,{cellSize:o,element:e.logo?.element,bgColor:e.bgColor,matrixSize:r.length})]})},x=a.zo.div.attrs({className:"ph-no-capture"})`
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
`,v=e=>{let{appearance:n}=(0,c.u)(),r=e.bgColor||"#FFFFFF",o=e.fgColor||"#000000",i=e.size||160,a="dark"===n.palette.colorScheme?r:o;return(0,t.jsx)(x,{$size:i,$bgColor:r,$fgColor:o,$borderColor:a,children:(0,t.jsx)(m,{url:e.url,logo:{element:e.squareLogoElement??s},outputSize:i,bgColor:r,fgColor:o,errorCorrectionLevel:e.errorCorrectionLevel||"Q"})})}},34693:function(e,n,r){r.d(n,{S:function(){return o}});var t=r(43803);let o=t.zo.span`
  margin-top: 4px;
  color: var(--privy-color-foreground);
  text-align: center;

  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */

  && a {
    color: var(--privy-color-accent);
  }
`},73764:function(e,n,r){r.d(n,{T:function(){return o}});var t=r(43803);let o=t.zo.span`
  color: var(--privy-color-foreground);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.875rem; /* 166.667% */
  text-align: center;
`},90116:function(e,n,r){r.d(n,{W:function(){return C}});var t=r(89418),o=r(12859),i=r(68610),a=r(4753),c=r(43803),l=r(13188),s=r(41815),d=r(24974),u=r(22073),f=r(78236);let g=(0,c.zo)(f.B)`
  && {
    padding: 0.75rem;
    height: 56px;
  }
`,p=c.zo.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`,h=c.zo.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`,m=c.zo.div`
  font-size: 12px;
  line-height: 1rem;
  color: var(--privy-color-foreground-3);
`,x=(0,c.zo)(d.L)`
  text-align: left;
  margin-bottom: 0.5rem;
`,v=(0,c.zo)(s.E)`
  margin-top: 0.25rem;
`,y=(0,c.zo)(l.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`,C=({errMsg:e,balance:n,address:r,className:c,title:l,showCopyButton:s=!1})=>{let[d,f]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{if(d){let e=setTimeout(()=>f(!1),3e3);return()=>clearTimeout(e)}},[d]),(0,t.jsxs)("div",{children:[l&&(0,t.jsx)(x,{children:l}),(0,t.jsx)(g,{className:c,$state:e?"error":void 0,children:(0,t.jsxs)(p,{children:[(0,t.jsxs)(h,{children:[(0,t.jsx)(u.A,{address:r,showCopyIcon:!1}),void 0!==n&&(0,t.jsx)(m,{children:n})]}),s&&(0,t.jsx)(y,{onClick:function(e){e.stopPropagation(),navigator.clipboard.writeText(r).then(()=>f(!0)).catch(console.error)},size:"sm",children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(o.Z,{size:14})]}:{children:["Copy",(0,t.jsx)(i.Z,{size:14})]})})]})}),e&&(0,t.jsx)(v,{children:e})]})}},50472:function(e,n,r){r.d(n,{O:function(){return t}});let t="sdk_fiat_on_ramp_completed_with_status"},29707:function(e,n,r){r.d(n,{g:function(){return t}});function t(e){switch(e){case"solana:mainnet":return"Solana";case"solana:devnet":return"Devnet";case"solana:testnet":return"Testnet"}}},82225:function(e,n,r){r.d(n,{g:function(){return a}});var t=r(84266),o=r(78211),i=r(35245);let a=async({chain:e,address:n,appId:r,rpcConfig:a,erc20Address:l})=>{let s=(0,t.v)({chain:e,transport:(0,o.d)((0,i.i)(e,a,r))});return{balance:await s.readContract({address:l,abi:c,functionName:"balanceOf",args:[n]}).catch(()=>0n),chain:e}},c=[{constant:!0,inputs:[{name:"_owner",type:"address"}],name:"balanceOf",outputs:[{name:"balance",type:"uint256"}],payable:!1,stateMutability:"view",type:"function"}]},58541:function(e,n,r){r.d(n,{A:function(){return c},D:function(){return d},J:function(){return s},L:function(){return t},R:function(){return l},S:function(){return o},T:function(){return i},a:function(){return a},g:function(){return u}});let t=1e9,o="11111111111111111111111111111111",i="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",a="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",c="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",l=["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C","CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"],s=["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],d={"solana:mainnet":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:{symbol:"USDC",decimals:6,address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:{symbol:"USDT",decimals:6,address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:devnet":{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":{symbol:"USDC",decimals:6,address:"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"},EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS:{symbol:"USDT",decimals:6,address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:testnet":{}};function u(e,n){let r=parseFloat(e.toString())/t,o=f.format(n*r);return"$0.00"===o?"<$0.01":o}let f=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2})},60096:function(e,n,r){r.d(n,{g:function(){return o}});var t=r(58541);function o(e){let[n]=Object.entries(t.D[e]).find(([e,n])=>"USDC"===n.symbol)??[];return n}},78236:function(e,n,r){r.d(n,{B:function(){return i},a:function(){return o}});var t=r(43803);let o=(0,t.iv)`
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
`,i=t.zo.div`
  ${o}
`},63821:function(e,n,r){r.d(n,{a:function(){return i},g:function(){return o}});var t=r(58541);function o(e,n=6,r=!1,t=!1){let o=(parseFloat(e.toString())/1e9).toFixed(n).replace(/0+$/,"").replace(/\.$/,""),i=t?"":" SOL";return r?`${o}${i}`:`${"0"===o?"<0.001":o}${i}`}function i({amount:e,fee:n,tokenPrice:r,isUsdc:i}){let a=BigInt(Math.floor(parseFloat(e)*10**(i?6:9))),c=i?a:a+n;return{fundingAmountInBaseUnit:a,fundingAmountInUsd:r?(0,t.g)(a,r):void 0,totalPriceInUsd:r?(0,t.g)(c,r):void 0,totalPriceInNativeCurrency:o(c),feePriceInNativeCurrency:o(n),feePriceInUsd:r?(0,t.g)(n,r):void 0}}},30484:function(e,n,r){r.d(n,{u:function(){return l}});var t=r(4753),o=r(84266),i=r(78211),a=r(35245),c=r(3010);function l({rpcConfig:e,appId:n,address:r,chain:l}){let{chains:s}=(0,c.u)(),[d,u]=(0,t.useState)(0n),[f,g]=(0,t.useState)(!1),p=(0,t.useMemo)(()=>{let r=l||s[0];if(r)return(0,o.v)({chain:l,transport:(0,i.d)((0,a.i)(r,e,n))})},[l,e,n]),h=(0,t.useCallback)(async()=>{if(!r||!p)return;g(!0);let e=await p.getBalance({address:r}).catch(console.error);return e?(u(e),g(!1),e):void 0},[p,r,u]);return(0,t.useEffect)(()=>{h().catch(console.error)},[]),{balance:d,isLoading:f,reloadBalance:h}}}}]);