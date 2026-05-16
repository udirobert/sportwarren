"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1365],{71038:function(n,e,t){t.d(e,{Q:function(){return i}});var r=t(6347);function i(n){let e=n.filter(n=>!r.e.has(n.id));return r.B.concat(e)}},87718:function(n,e,t){t.d(e,{t:function(){return a}});var r=t(89418),i=t(9201),o=t(13188);function a({title:n}){let{currentScreen:e,navigateBack:t,navigate:a,data:c,setModalData:u}=(0,i.a)();return(0,r.jsx)(o.M,{title:n,backFn:"ManualTransferScreen"===e?t:e===c?.funding?.methodScreen?c.funding.comingFromSendTransactionScreen?()=>a("SendTransactionScreen"):void 0:c?.funding?.methodScreen?()=>{let n=c.funding;n.usingDefaultFundingMethod&&(n.usingDefaultFundingMethod=!1),u({funding:n,solanaFundingData:c?.solanaFundingData}),a(n.methodScreen)}:void 0})}},41365:function(n,e,t){t.r(e),t.d(e,{FundingAmountEditScreen:function(){return g},default:function(){return g}});var r=t(89418),i=t(4753),o=t(13188),a=t(94923),c=t(87718),u=t(99539),d=t(73764),l=t(9201),s=t(13404),f=t(34644),p=t(51166);t(96257),t(78439),t(55982);let g={component:()=>{let{data:n,setModalData:e}=(0,l.a)(),t=n?.funding,g="solana"===t.chainType,x=(0,i.useRef)(null),{tokenPrice:h}=(0,s.u)(g?"solana":t.chain.id),v=g?void 0:t,m=!(!v?.erc20Address||v?.erc20ContractInfo),y=g?t.isUSDC?"USDC":"SOL":t.erc20Address?t.erc20ContractInfo?.symbol:t.chain.nativeCurrency.symbol||"ETH",z=parseFloat(t.amount),b=!isNaN(z)&&z>0,k=h?(0,f.c)(t.amount,h):void 0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(c.t,{}),(0,r.jsx)(d.T,{children:"Confirm or edit amount"}),(0,r.jsxs)(a.F,{style:{marginTop:"32px"},children:[(0,r.jsx)(p.F,{children:m?(0,r.jsx)(u.N,{size:"50px"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(p.a,{onClick:()=>x.current?.focus(),children:[(0,r.jsx)(p.h,{ref:x,value:t.amount,onChange:r=>{let i=r.target.value;/^[0-9.]*$/.test(i)&&i.split(".").length-1<=1&&e({...n,funding:{...t,amount:i},solanaFundingData:n?.solanaFundingData?{...n.solanaFundingData,amount:i}:void 0})}}),(0,r.jsx)(p.c,{children:y})]}),!v?.erc20Address&&!(g&&t.isUSDC)&&(0,r.jsx)(p.d,{children:k&&b?`${k} USD`:""})]})}),(0,r.jsx)(o.c,{style:{marginTop:"1rem"},disabled:!b,onClick:t.onContinueWithExternalWallet,children:"Continue"})]}),(0,r.jsx)(o.B,{})]})}}},94923:function(n,e,t){t.d(e,{B:function(){return i},C:function(){return c},F:function(){return d},H:function(){return a},R:function(){return p},S:function(){return s},a:function(){return l},b:function(){return f},c:function(){return u},d:function(){return g},e:function(){return o}});var r=t(43803);let i=r.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,o=r.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,a=r.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,c=(0,r.zo)(o)`
  padding: 20px 0;
`,u=(0,r.zo)(o)`
  gap: 16px;
`,d=r.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,l=r.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;r.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let s=r.zo.div`
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
`,f=r.zo.div`
  height: 16px;
`,p=r.zo.div`
  height: 12px;
`;r.zo.div`
  position: relative;
`;let g=r.zo.div`
  height: ${n=>n.height??"12"}px;
`;r.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},73764:function(n,e,t){t.d(e,{T:function(){return i}});var r=t(43803);let i=r.zo.span`
  color: var(--privy-color-foreground);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.875rem; /* 166.667% */
  text-align: center;
`},34644:function(n,e,t){t.d(e,{a:function(){return d},b:function(){return p},c:function(){return u},g:function(){return l},p:function(){return s},s:function(){return f}});var r=t(40778),i=t(3010),o=t(40099);let a=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2}),c=n=>a.format(n),u=(n,e)=>{let t=c(e*parseFloat(n));return"$0.00"!==t?t:"<$0.01"},d=(n,e)=>{let t=c(e*parseFloat((0,r.d)(n)));return"$0.00"===t?"<$0.01":t},l=(n,e,t=6,r=!1)=>`${s(n,t,r)} ${e}`,s=(n,e=6,t=!1)=>{let i=parseFloat((0,r.d)(n)).toFixed(e).replace(/0+$/,"").replace(/\.$/,"");return t?i:`${"0"===i?"<0.001":i}`},f=n=>n.reduce((n,e)=>n+e,0n),p=(n,e)=>{let{chains:t}=(0,i.u)(),r=`https://etherscan.io/address/${e}`,a=`${(0,o.G)(n,t)}/address/${e}`;if(!a)return r;try{new URL(a)}catch{return r}return a}},51166:function(n,e,t){t.d(e,{F:function(){return u},I:function(){return c},a:function(){return d},b:function(){return l},c:function(){return f},d:function(){return p},e:function(){return a},f:function(){return x},g:function(){return h},h:function(){return s}});var r=t(43803),i=t(13188),o=t(49828);let a=r.zo.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  padding-bottom: 24px;
`,c=r.zo.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    border-radius: var(--privy-border-radius-sm);
  }
`,u=r.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`,d=r.zo.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 0 16px;
  border-width: 1px !important;
  border-radius: 12px;
  cursor: text;

  &:focus-within {
    border-color: var(--privy-color-accent);
  }
`;r.zo.div`
  font-size: 42px !important;
`;let l=r.zo.input`
  background-color: var(--privy-color-background);
  width: 100%;

  &:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  && {
    font-size: 26px;
  }
`,s=(0,r.zo)(l)`
  && {
    font-size: 42px;
  }
`;r.zo.button`
  cursor: pointer;
  padding-left: 4px;
`;let f=r.zo.div`
  font-size: 18px;
`,p=r.zo.div`
  font-size: 12px;
  color: var(--privy-color-foreground-3);
  // we need this container to maintain a static height if there's no content
  height: 20px;
`;r.zo.div`
  display: flex;
  flex-direction: row;
  line-height: 22px;
  font-size: 16px;
  text-align: center;
  svg {
    margin-right: 6px;
    margin: auto;
  }
`,(0,r.zo)(o.LinkButton)`
  margin-top: 16px;
`;let g=(0,r.F4)`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;(0,r.zo)(i.d)`
  border-radius: var(--privy-border-radius-md) !important;
  animation: ${g} 0.3s ease-in-out;
`;let x=r.zo.div``,h=r.zo.a`
  && {
    color: var(--privy-color-accent);
  }

  cursor: pointer;
`},80483:function(n,e,t){t.d(e,{u:function(){return o}});var r=t(4753),i=t(3010);let o=({enabled:n=!0}={})=>{let{showFiatPrices:e,getUsdPriceForSol:t}=(0,i.u)(),[o,a]=(0,r.useState)(!0),[c,u]=(0,r.useState)(void 0),[d,l]=(0,r.useState)(void 0);return(0,r.useEffect)(()=>{(async()=>{if(e&&n)try{a(!0);let n=await t();n?l(n):u(Error("Unable to fetch SOL price"))}catch(n){u(n)}finally{a(!1)}else a(!1)})()},[]),{solPrice:d,isSolPriceLoading:o,solPriceError:c}}},13404:function(n,e,t){t.d(e,{u:function(){return u}});var r=t(4753),i=t(71038),o=t(64982),a=t(3010),c=t(80483);function u(n){let{tokenPrice:e,isTokenPriceLoading:t,tokenPriceError:u}=(n=>{let{showFiatPrices:e,getUsdTokenPrice:t,chains:c}=(0,a.u)(),[u,d]=(0,r.useState)(!0),[l,s]=(0,r.useState)(void 0),[f,p]=(0,r.useState)(void 0);return(0,r.useEffect)(()=>{n||=o.s;let r=(0,i.Q)(c).find(e=>e.id===Number(n));(async()=>{if(e){if(!r)return d(!1),void s(Error(`Unable to fetch token price on chain id ${n}`));try{d(!0);let n=await t(r);n?p(n):s(Error(`Unable to fetch token price on chain id ${r.id}`))}catch(n){s(n)}finally{d(!1)}}else d(!1)})()},[n]),{tokenPrice:f,isTokenPriceLoading:u,tokenPriceError:l}})("solana"===n?-1:n),{solPrice:d,isSolPriceLoading:l,solPriceError:s}=(0,c.u)({enabled:"solana"===n});return"solana"===n?{tokenPrice:d,isTokenPriceLoading:l,tokenPriceError:s}:{tokenPrice:e,isTokenPriceLoading:t,tokenPriceError:u}}}}]);