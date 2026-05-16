"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5894],{12859:function(e,t,r){r.d(t,{Z:function(){return o}});let o=(0,r(79095).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},78194:function(e,t,r){r.d(t,{Z:function(){return o}});let o=(0,r(79095).Z)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},45675:function(e,t,r){r.d(t,{Z:function(){return o}});let o=(0,r(79095).Z)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]])},78125:function(e,t,r){r.d(t,{Z:function(){return o}});let o=(0,r(79095).Z)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},80352:function(e,t,r){r.d(t,{Z:function(){return o}});let o=(0,r(79095).Z)("credit-card",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]])},40128:function(e,t,r){r.d(t,{Z:function(){return o}});let o=(0,r(79095).Z)("smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]])},86619:function(e,t,r){r.d(t,{Z:function(){return o}});let o=(0,r(79095).Z)("wallet",[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]])},95894:function(e,t,r){r.r(t),r.d(t,{FiatOnrampScreen:function(){return ee},default:function(){return ee}});var o=r(89418),n=r(9201),i=r(5430),s=r(79389),a=r(38229),l=r(35868),c=r(78125),d=r(12859),u=r(80352),p=r(40128),h=r(79095);let g=(0,h.Z)("building",[["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M12 6h.01",key:"1vi96p"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M16 6h.01",key:"1x0f13"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M8 6h.01",key:"1dz90k"}],["path",{d:"M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",key:"cabbwy"}],["rect",{x:"4",y:"2",width:"16",height:"20",rx:"2",key:"1uxh74"}]]);var v=r(86619),m=r(15708),f=r(45675);let x=(0,h.Z)("landmark",[["path",{d:"M10 18v-7",key:"wt116b"}],["path",{d:"M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z",key:"1m329m"}],["path",{d:"M14 18v-7",key:"vav6t3"}],["path",{d:"M18 18v-7",key:"aexdmj"}],["path",{d:"M3 22h18",key:"8prr45"}],["path",{d:"M6 18v-7",key:"1ivflk"}]]);var y=r(43803),b=r(64390);r(4753),r(96257),r(78439),r(55982),r(94936),r(21628);let[w,j]=((e,t=750)=>{let r;return[(...o)=>{r&&clearTimeout(r),r=setTimeout(()=>{e(...o)},t)},()=>{r&&clearTimeout(r)}]})(async(e,t)=>{(0,i.I)({isLoading:!0});try{let{getQuotes:r}=(0,i.J)(),o=await r({source:{asset:t.source.selectedAsset.toUpperCase(),amount:e},destination:{asset:t.destination.asset.toUpperCase(),chain:t.destination.chain,address:t.destination.address},environment:t.environment}),n=o.quotes??[],s=o.provider_errors,a=(0,i.K)(n,e);(0,i.I)({localQuotes:n,localSelectedQuote:n[0]??null,isLoading:!1,quotesWarning:a,quotesErrors:s??null})}catch{(0,i.I)({localQuotes:[],localSelectedQuote:null,quotesWarning:"provider_errors",quotesErrors:null})}}),z=e=>{(0,i.I)({amount:e});let{opts:t}=(0,i.J)();w(e,t)},C=async()=>{let{error:e,state:t,onFailure:r,onSuccess:o}=(0,i.J)();j(),e?r(e):"provider-success"===t.status?await o({status:"confirmed"}):"provider-confirming"===t.status?await o({status:"submitted"}):r(Error("User exited flow"))},k=async()=>{let e,t=(0,i.L)();if(!t)return;let r=(0,s.X)();if(!r)return void(0,i.I)({state:{status:"provider-error"},error:Error("Unable to open payment window")});(0,i.I)({isLoading:!0});let{opts:o,amount:n,getProviderUrl:l,getStatus:c,controller:d}=(0,i.J)(),u=()=>{try{r.closed||r.close()}catch{}};d.current=new AbortController;try{let i=await l({source:{asset:o.source.selectedAsset.toUpperCase(),amount:n||"0"},destination:{asset:o.destination.asset.toUpperCase(),chain:o.destination.chain,address:o.destination.address},provider:t.provider,sub_provider:t.sub_provider??void 0,payment_method:t.payment_method,redirect_url:window.location.origin});r.location.href=i.url,e=i.session_id}catch(e){return u(),void(0,i.I)({state:{status:"provider-error"},isLoading:!1,error:Error("Unable to start payment session")})}(0,i.I)({isLoading:!1}),(0,i.I)({state:{status:"provider-confirming"}});let p=await (0,a.p)({operation:()=>c({session_id:e,provider:t.provider}),until:e=>"completed"===e.status||"failed"===e.status||"cancelled"===e.status,delay:0,interval:2e3,attempts:60,signal:d.current.signal});if("aborted"!==p.status){if("max_attempts"===p.status)return u(),p.error?(console.error(p.error),void(0,i.I)({state:{status:"select-amount"},isLoading:!1,error:Error("Unable to check payment status. Please try again.")})):void(0,i.I)({state:{status:"provider-error"},error:Error("Could not confirm payment status yet.")});"completed"===p.result?.status?(u(),(0,i.I)({state:{status:"provider-success"}})):(u(),(0,i.I)({state:{status:"provider-error"},error:Error(`Transaction ${p.result?.status??"failed"}`)}))}},A=()=>{let e=(0,i.M)();e&&e.length>0&&(0,i.I)({state:{status:"select-payment-method",quotes:e}})},E=()=>{(0,i.I)({state:{status:"select-source-asset"}})},S=()=>{(0,i.I)({error:null,state:{status:"select-amount"}})},M=e=>{(0,i.I)({localSelectedQuote:e,state:{status:"select-amount"}})},P=e=>{let{opts:t,amount:r}=(0,i.J)(),o={...t,source:{...t.source,selectedAsset:e}};(0,i.I)({opts:o,state:{status:"select-amount"}}),w(r,o)},_=({onClose:e})=>(0,o.jsx)(l.S,{showClose:!0,onClose:e,iconVariant:"loading",title:"Processing transaction",subtitle:"Your purchase is in progress. You can leave this screen — we’ll notify you when it’s complete.",primaryCta:{label:"Done",onClick:e},watermark:!0}),I=({onClose:e,onRetry:t})=>(0,o.jsx)(l.S,{showClose:!0,onClose:e,icon:c.Z,iconVariant:"error",title:"Something went wrong",subtitle:"We couldn't complete your transaction. Please try again.",primaryCta:{label:"Try again",onClick:t},secondaryCta:{label:"Close",onClick:e},watermark:!0}),L=({onClose:e})=>(0,o.jsx)(l.S,{showClose:!0,onClose:e,icon:d.Z,iconVariant:"success",title:"Transaction confirmed",subtitle:"Your purchase is processing. Funds should arrive in your wallet within a few minutes.",primaryCta:{label:"Done",onClick:e},watermark:!0}),q={CREDIT_DEBIT_CARD:"card",APPLE_PAY:"Apple Pay",GOOGLE_PAY:"Google Pay",BANK_TRANSFER:"bank deposit",ACH:"bank deposit",SEPA:"bank deposit",PIX:"PIX"},F={CREDIT_DEBIT_CARD:(0,o.jsx)(u.Z,{size:14}),APPLE_PAY:(0,o.jsx)(p.Z,{size:14}),GOOGLE_PAY:(0,o.jsx)(p.Z,{size:14}),BANK_TRANSFER:(0,o.jsx)(g,{size:14}),ACH:(0,o.jsx)(g,{size:14}),SEPA:(0,o.jsx)(g,{size:14}),PIX:(0,o.jsx)(v.Z,{size:14})},T=e=>F[e]??(0,o.jsx)(u.Z,{size:14}),Z=({opts:e,onClose:t,onEditSourceAsset:r,onEditPaymentMethod:n,onContinue:i,onAmountChange:s,amount:c,selectedQuote:d,quotesWarning:u,quotesErrors:p,quotesCount:h,isLoading:g})=>{var v;return(0,o.jsxs)(l.S,{showClose:!0,onClose:t,headerTitle:`Buy ${e.destination.asset.toLocaleUpperCase()}`,primaryCta:{label:"Continue",onClick:i,loading:g,disabled:!d},helpText:u?(0,o.jsxs)(R,{children:[(0,o.jsx)(m.Z,{size:16,strokeWidth:2}),(0,o.jsx)(B,{children:(0,o.jsxs)(o.Fragment,"amount_too_low"===u?{children:[(0,o.jsx)(H,{children:"Amount too low"}),(0,o.jsx)($,{children:"Please choose a higher amount to continue."})]}:{children:[(0,o.jsx)(H,{children:"Unable to get quotes"}),(0,o.jsx)($,{children:p?.[0]?.error??"Something went wrong. Please try again."})]})})]}):d&&h>1?(0,o.jsxs)(D,{onClick:n,children:[T(d.payment_method),(0,o.jsxs)("span",{children:["Pay with ",q[v=d.payment_method]??v.replace(/_/g," ").toLowerCase().replace(/^\w/,e=>e.toUpperCase())]}),(0,o.jsx)(f.Z,{size:14})]}):null,watermark:!0,children:[(0,o.jsx)(a.A,{currency:e.source.selectedAsset,value:c,onChange:s,inputMode:"decimal",autoFocus:!0}),(0,o.jsx)(a.C,{selectedAsset:e.source.selectedAsset,onEditSourceAsset:r})]})},R=y.zo.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--privy-color-warn-bg, #fffbbb);
  border: 1px solid var(--privy-color-border-warning, #facd63);
  overflow: clip;
  width: 100%;

  svg {
    flex-shrink: 0;
    color: var(--privy-color-icon-warning, #facd63);
  }
`,B=y.zo.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
  font-size: 0.75rem;
  line-height: 1.125rem;
  color: var(--privy-color-foreground);
  font-feature-settings:
    'calt' 0,
    'kern' 0;
  text-align: left;
`,H=y.zo.span`
  font-weight: 600;
`,$=y.zo.span`
  font-weight: 400;
`,D=y.zo.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;

  && {
    padding: 0;
    color: var(--privy-color-accent);
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1.375rem;
  }
`,N={CREDIT_DEBIT_CARD:"Credit / debit card",APPLE_PAY:"Apple Pay",GOOGLE_PAY:"Google Pay",BANK_TRANSFER:"Bank transfer",ACH:"ACH",SEPA:"SEPA",PIX:"PIX"},U={CREDIT_DEBIT_CARD:(0,o.jsx)(u.Z,{size:20}),APPLE_PAY:(0,o.jsx)(b.A,{width:20,height:20}),GOOGLE_PAY:(0,o.jsx)(b.G,{width:20,height:20}),BANK_TRANSFER:(0,o.jsx)(x,{size:20}),ACH:(0,o.jsx)(x,{size:20}),SEPA:(0,o.jsx)(x,{size:20}),PIX:(0,o.jsx)(x,{size:20})},Q=e=>U[e]??(0,o.jsx)(u.Z,{size:20}),V=({onClose:e,onSelectPaymentMethod:t,quotes:r,isLoading:n})=>(0,o.jsx)(l.S,{showClose:!0,onClose:e,title:"Select payment method",subtitle:"Choose how you'd like to pay",watermark:!0,children:(0,o.jsx)(G,{children:r.map((e,r)=>{var i;return(0,o.jsx)(W,{onClick:()=>t(e),disabled:n,children:(0,o.jsxs)(Y,{children:[(0,o.jsx)(O,{children:Q(e.payment_method)}),(0,o.jsx)(K,{children:(0,o.jsx)(X,{children:N[i=e.payment_method]??i.replace(/_/g," ").toLowerCase().replace(/^\w/,e=>e.toUpperCase())})})]})},`${e.provider}-${e.payment_method}-${r}`)})})}),G=y.zo.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`,W=y.zo.button`
  border-color: var(--privy-color-border-default);
  border-width: 1px;
  border-radius: var(--privy-border-radius-md);
  border-style: solid;
  display: flex;

  && {
    padding: 1rem 1rem;
  }
`,Y=y.zo.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
`,O=y.zo.div`
  color: var(--privy-color-foreground-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,K=y.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  flex: 1;
`,X=y.zo.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25rem;
`,J=({onClose:e,onContinue:t,onAmountChange:r,onSelectSource:n,onEditSourceAsset:i,onEditPaymentMethod:s,onSelectPaymentMethod:l,onRetry:c,opts:d,state:u,amount:p,selectedQuote:h,quotesWarning:g,quotesErrors:v,quotesCount:m,isLoading:f})=>"select-amount"===u.status?(0,o.jsx)(Z,{onClose:e,onContinue:t,onAmountChange:r,onEditSourceAsset:i,onEditPaymentMethod:s,opts:d,amount:p,selectedQuote:h,quotesWarning:g,quotesErrors:v,quotesCount:m,isLoading:f}):"select-source-asset"===u.status?(0,o.jsx)(a.S,{onSelectSource:n,opts:d,isLoading:f}):"select-payment-method"===u.status?(0,o.jsx)(V,{onClose:e,onSelectPaymentMethod:l,quotes:u.quotes,isLoading:f}):"provider-confirming"===u.status?(0,o.jsx)(_,{onClose:e}):"provider-error"===u.status?(0,o.jsx)(I,{onClose:e,onRetry:c}):"provider-success"===u.status?(0,o.jsx)(L,{onClose:e}):null,ee={component:()=>{let{onUserCloseViaDialogOrKeybindRef:e}=(0,n.a)(),t=(0,i.N)();if(!t)return null;let{opts:r,state:s,isLoading:a,amount:l,quotesWarning:c,quotesErrors:d,localQuotes:u,localSelectedQuote:p,initialQuotes:h,initialSelectedQuote:g}=t;return e.current=C,(0,o.jsx)(J,{onClose:C,opts:r,state:s,isLoading:a,amount:l,selectedQuote:p??g,quotesWarning:c,quotesErrors:d,quotesCount:(u??h)?.length??0,onAmountChange:z,onContinue:k,onSelectSource:P,onEditSourceAsset:E,onEditPaymentMethod:A,onSelectPaymentMethod:M,onRetry:S})}}},64390:function(e,t,r){r.d(t,{A:function(){return n},G:function(){return i}});var o=r(89418);let n=e=>(0,o.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 210.2",xmlSpace:"preserve",...e,children:(0,o.jsx)("path",{d:"M93.6,27.1C87.6,34.2,78,39.8,68.4,39c-1.2-9.6,3.5-19.8,9-26.1c6-7.3,16.5-12.5,25-12.9  C103.4,10,99.5,19.8,93.6,27.1 M102.3,40.9c-13.9-0.8-25.8,7.9-32.4,7.9c-6.7,0-16.8-7.5-27.8-7.3c-14.3,0.2-27.6,8.3-34.9,21.2  c-15,25.8-3.9,64,10.6,85c7.1,10.4,15.6,21.8,26.8,21.4c10.6-0.4,14.8-6.9,27.6-6.9c12.9,0,16.6,6.9,27.8,6.7  c11.6-0.2,18.9-10.4,26-20.8c8.1-11.8,11.4-23.3,11.6-23.9c-0.2-0.2-22.4-8.7-22.6-34.3c-0.2-21.4,17.5-31.6,18.3-32.2  C123.3,42.9,107.7,41.3,102.3,40.9 M182.6,11.9v155.9h24.2v-53.3h33.5c30.6,0,52.1-21,52.1-51.4c0-30.4-21.1-51.2-51.3-51.2H182.6z   M206.8,32.3h27.9c21,0,33,11.2,33,30.9c0,19.7-12,31-33.1,31h-27.8V32.3z M336.6,169c15.2,0,29.3-7.7,35.7-19.9h0.5v18.7h22.4V90.2  c0-22.5-18-37-45.7-37c-25.7,0-44.7,14.7-45.4,34.9h21.8c1.8-9.6,10.7-15.9,22.9-15.9c14.8,0,23.1,6.9,23.1,19.6v8.6l-30.2,1.8  c-28.1,1.7-43.3,13.2-43.3,33.2C298.4,155.6,314.1,169,336.6,169z M343.1,150.5c-12.9,0-21.1-6.2-21.1-15.7c0-9.8,7.9-15.5,23-16.4  l26.9-1.7v8.8C371.9,140.1,359.5,150.5,343.1,150.5z M425.1,210.2c23.6,0,34.7-9,44.4-36.3L512,54.7h-24.6l-28.5,92.1h-0.5  l-28.5-92.1h-25.3l41,113.5l-2.2,6.9c-3.7,11.7-9.7,16.2-20.4,16.2c-1.9,0-5.6-0.2-7.1-0.4v18.7C417.3,210,423.3,210.2,425.1,210.2z"})}),i=e=>(0,o.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 80 38.1",xmlSpace:"preserve",...e,children:[(0,o.jsx)("path",{style:{fill:"#5F6368"},d:"M37.8,19.7V29h-3V6h7.8c1.9,0,3.7,0.7,5.1,2c1.4,1.2,2.1,3,2.1,4.9c0,1.9-0.7,3.6-2.1,4.9c-1.4,1.3-3.1,2-5.1,2  L37.8,19.7L37.8,19.7z M37.8,8.8v8h5c1.1,0,2.2-0.4,2.9-1.2c1.6-1.5,1.6-4,0.1-5.5c0,0-0.1-0.1-0.1-0.1c-0.8-0.8-1.8-1.3-2.9-1.2  L37.8,8.8L37.8,8.8z"}),(0,o.jsx)("path",{style:{fill:"#5F6368"},d:"M56.7,12.8c2.2,0,3.9,0.6,5.2,1.8s1.9,2.8,1.9,4.8V29H61v-2.2h-0.1c-1.2,1.8-2.9,2.7-4.9,2.7  c-1.7,0-3.2-0.5-4.4-1.5c-1.1-1-1.8-2.4-1.8-3.9c0-1.6,0.6-2.9,1.8-3.9c1.2-1,2.9-1.4,4.9-1.4c1.8,0,3.2,0.3,4.3,1v-0.7  c0-1-0.4-2-1.2-2.6c-0.8-0.7-1.8-1.1-2.9-1.1c-1.7,0-3,0.7-3.9,2.1l-2.6-1.6C51.8,13.8,53.9,12.8,56.7,12.8z M52.9,24.2  c0,0.8,0.4,1.5,1,1.9c0.7,0.5,1.5,0.8,2.3,0.8c1.2,0,2.4-0.5,3.3-1.4c1-0.9,1.5-2,1.5-3.2c-0.9-0.7-2.2-1.1-3.9-1.1  c-1.2,0-2.2,0.3-3,0.9C53.3,22.6,52.9,23.3,52.9,24.2z"}),(0,o.jsx)("path",{style:{fill:"#5F6368"},d:"M80,13.3l-9.9,22.7h-3l3.7-7.9l-6.5-14.7h3.2l4.7,11.3h0.1l4.6-11.3H80z"}),(0,o.jsx)("path",{style:{fill:"#4285F4"},d:"M25.9,17.7c0-0.9-0.1-1.8-0.2-2.7H13.2v5.1h7.1c-0.3,1.6-1.2,3.1-2.6,4v3.3H22C24.5,25.1,25.9,21.7,25.9,17.7z"}),(0,o.jsx)("path",{style:{fill:"#34A853"},d:"M13.2,30.6c3.6,0,6.6-1.2,8.8-3.2l-4.3-3.3c-1.2,0.8-2.7,1.3-4.5,1.3c-3.4,0-6.4-2.3-7.4-5.5H1.4v3.4  C3.7,27.8,8.2,30.6,13.2,30.6z"}),(0,o.jsx)("path",{style:{fill:"#FBBC04"},d:"M5.8,19.9c-0.6-1.6-0.6-3.4,0-5.1v-3.4H1.4c-1.9,3.7-1.9,8.1,0,11.9L5.8,19.9z"}),(0,o.jsx)("path",{style:{fill:"#EA4335"},d:"M13.2,9.4c1.9,0,3.7,0.7,5.1,2l0,0l3.8-3.8c-2.4-2.2-5.6-3.5-8.8-3.4c-5,0-9.6,2.8-11.8,7.3l4.4,3.4  C6.8,11.7,9.8,9.4,13.2,9.4z"})]})},18532:function(e,t,r){r.d(t,{S:function(){return j}});var o=r(89418),n=r(4753),i=r(43803),s=r(61318),a=r(13188),l=r(99539);let c=i.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=i.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,u=i.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,p=(0,i.zo)(a.M)`
  margin: 0 -8px;
`,h=i.zo.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;

  /* Enable scrolling */
  overflow-y: auto;

  /* Hide scrollbar but keep functionality when scrollable */
  /* Add padding for focus outline space, offset with negative margin */
  padding: 3px;
  margin: -3px;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-gutter: stable both-edges;
  scrollbar-width: none;
  -ms-overflow-style: none;

  /* Gradient effect for scroll indication */
  ${({$colorScheme:e})=>"light"===e?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.06)) bottom;":"dark"===e?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.06)) bottom;":void 0}

  background-repeat: no-repeat;
  background-size:
    100% 32px,
    100% 16px;
  background-attachment: local, scroll;
`,g=i.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=i.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,m=i.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=i.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,x=i.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,y=i.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=i.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=i.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 82px;

  > div {
    position: relative;
  }

  > div > :first-child {
    position: relative;
  }

  > div > :last-child {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`,j=({children:e,...t})=>(0,o.jsx)(c,{children:(0,o.jsx)(d,{...t,children:e})}),z=i.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,C=(0,i.zo)(a.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,k=i.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,A=({step:e})=>e?(0,o.jsx)(z,{children:(0,o.jsx)(k,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:t,icon:r,iconVariant:n,iconLoadingStatus:i,showBack:s,onBack:a,showInfo:l,onInfo:c,showClose:d,onClose:h,step:g,headerTitle:y,...b})=>(0,o.jsxs)(u,{...b,children:[(0,o.jsx)(p,{backFn:s?a:void 0,infoFn:l?c:void 0,onClose:d?h:void 0,title:y,closeable:d}),(r||n||e||t)&&(0,o.jsxs)(v,{children:[r||n?(0,o.jsx)(j.Icon,{icon:r,variant:n,loadingStatus:i}):null,!(!e&&!t)&&(0,o.jsxs)(m,{children:[e&&(0,o.jsx)(f,{children:e}),t&&(0,o.jsx)(x,{children:t})]})]}),g&&(0,o.jsx)(A,{step:g})]}),(j.Body=n.forwardRef(({children:e,...t},r)=>(0,o.jsx)(h,{ref:r,...t,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...t})=>(0,o.jsx)(g,{id:"privy-content-footer-container",...t,children:e}),j.Actions=({children:e,...t})=>(0,o.jsx)(E,{...t,children:e}),j.HelpText=({children:e,...t})=>(0,o.jsx)(S,{...t,children:e}),j.FooterText=({children:e,...t})=>(0,o.jsx)(M,{...t,children:e}),j.Watermark=()=>(0,o.jsx)(C,{}),j.Icon=({icon:e,variant:t="subtle",loadingStatus:r})=>"logo"===t&&e?(0,o.jsx)(b,"string"==typeof e?{children:(0,o.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===t?e?(0,o.jsx)(w,{children:(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,o.jsx)(s.N,{success:r?.success,fail:r?.fail}),"string"==typeof e?(0,o.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,o.jsx)(y,{$variant:t,children:(0,o.jsx)(l.N,{size:"64px"})}):(0,o.jsx)(y,{$variant:t,children:e&&("string"==typeof e?(0,o.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(t){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=i.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,S=i.zo.div`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 13px;
    line-height: 20px;

    & a {
      text-decoration: underline;
    }
  }
`,M=i.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},35868:function(e,t,r){r.d(t,{S:function(){return s}});var o=r(89418),n=r(13188),i=r(18532);let s=({primaryCta:e,secondaryCta:t,helpText:r,footerText:s,watermark:a=!0,children:l,...c})=>{let d=e||t?(0,o.jsxs)(o.Fragment,{children:[e&&(()=>{let{label:t,...r}=e,i=r.variant||"primary";return(0,o.jsx)(n.a,{...r,variant:i,style:{width:"100%",...r.style},children:t})})(),t&&(()=>{let{label:e,...r}=t,i=r.variant||"secondary";return(0,o.jsx)(n.a,{...r,variant:i,style:{width:"100%",...r.style},children:e})})()]}):null;return(0,o.jsxs)(i.S,{id:c.id,className:c.className,children:[(0,o.jsx)(i.S.Header,{...c}),l?(0,o.jsx)(i.S.Body,{children:l}):null,r||d||a?(0,o.jsxs)(i.S.Footer,{children:[r?(0,o.jsx)(i.S.HelpText,{children:r}):null,d?(0,o.jsx)(i.S.Actions,{children:d}):null,a?(0,o.jsx)(i.S.Watermark,{}):null]}):null,s?(0,o.jsx)(i.S.FooterText,{children:s}):null]})}},38229:function(e,t,r){r.d(t,{A:function(){return u},C:function(){return p},S:function(){return y},p:function(){return d}});var o=r(40099),n=r(89418),i=r(78194),s=r(4753),a=r(43803),l=r(5430),c=r(35868);let d=async({operation:e,until:t,delay:r,interval:n,attempts:i,signal:s})=>{let a,l,c=0;for(;c<i;){if(s?.aborted)return{status:"aborted",result:a,attempts:c,error:l};c++;try{if(l=void 0,a=await e(),t(a))return{status:"success",result:a,attempts:c};c<i&&await (0,o.m)(n)}catch(e){e instanceof Error&&(l=e),c<i&&await (0,o.m)(n)}}return{status:"max_attempts",result:a,attempts:c,error:l}},u=({currency:e="usd",value:t,onChange:r,inputMode:o="decimal",autoFocus:i})=>{let[a,c]=(0,s.useState)("0"),d=(0,s.useRef)(null),u=t??a,p=l.H[e]?.symbol??"$",v=(0,s.useCallback)(e=>{let t=e.target.value,o=(t=t.replace(/[^\d.]/g,"")).split(".");o.length>2&&(t=o[0]+"."+o.slice(1).join("")),2===o.length&&o[1].length>2&&(t=`${o[0]}.${o[1].slice(0,2)}`),t.length>1&&"0"===t[0]&&"."!==t[1]&&(t=t.slice(1)),(""===t||"."===t)&&(t="0"),r?r(t):c(t)},[r]),m=(0,s.useCallback)(e=>{!(["Delete","Backspace","Tab","Escape","Enter",".","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key)||(e.ctrlKey||e.metaKey)&&["a","c","v","x"].includes(e.key.toLowerCase()))&&(e.key>="0"&&e.key<="9"||e.preventDefault())},[]),f=(0,s.useMemo)(()=>(u.includes("."),u),[u]);return(0,n.jsxs)(h,{onClick:()=>d.current?.focus(),children:[(0,n.jsx)(g,{children:p}),f,(0,n.jsx)("input",{ref:d,type:"text",inputMode:o,value:f,onChange:v,onKeyDown:m,autoFocus:i,placeholder:"0",style:{width:1,height:"1rem",opacity:0,alignSelf:"center",fontSize:"1rem"}}),(0,n.jsx)(g,{style:{opacity:0},children:p})]})},p=({selectedAsset:e,onEditSourceAsset:t})=>{let{icon:r}=l.H[e];return(0,n.jsxs)(v,{onClick:t,children:[(0,n.jsx)(m,{children:r}),(0,n.jsx)(f,{children:e.toLocaleUpperCase()}),(0,n.jsx)(x,{children:(0,n.jsx)(i.Z,{})})]})},h=a.zo.span`
  background-color: var(--privy-color-background);
  width: 100%;
  text-align: center;
  border: none;
  font-kerning: none;
  font-feature-settings: 'calt' off;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  cursor: pointer;

  &:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  && {
    color: var(--privy-color-foreground);
    font-size: 3.75rem;
    font-style: normal;
    font-weight: 600;
    line-height: 5.375rem;
  }
`,g=a.zo.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-feature-settings: 'calt' off;
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;
  line-height: 1.5rem;
  margin-top: 0.75rem;
`,v=a.zo.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: auto;
  gap: 0.5rem;
  border: 1px solid var(--privy-color-border-default);
  border-radius: var(--privy-border-radius-full);

  && {
    margin: auto;
    padding: 0.5rem 1rem;
  }
`,m=a.zo.div`
  svg {
    width: 1rem;
    height: 1rem;
    border-radius: var(--privy-border-radius-full);
    overflow: hidden;
    border: solid 0.1px var(--privy-color-border-default);
  }
`,f=a.zo.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-feature-settings: 'calt' off;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.375rem;
`,x=a.zo.div`
  color: var(--privy-color-foreground);

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`,y=({opts:e,isLoading:t,onSelectSource:r})=>(0,n.jsx)(c.S,{showClose:!1,showBack:!0,onBack:()=>r(e.source.selectedAsset),title:"Select currency",children:(0,n.jsx)(b,{children:e.source.assets.map(e=>{let{icon:o,name:i}=l.H[e];return(0,n.jsx)(w,{onClick:()=>r(e),disabled:t,children:(0,n.jsxs)(j,{children:[(0,n.jsx)(z,{children:o}),(0,n.jsxs)(C,{children:[(0,n.jsx)(k,{children:i}),(0,n.jsx)(A,{children:e.toLocaleUpperCase()})]})]})},e)})})}),b=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-height: 20.875rem;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`,w=a.zo.button`
  border-color: var(--privy-color-border-default);
  border-width: 1px;
  border-radius: var(--privy-border-radius-mdlg);
  border-style: solid;
  display: flex;

  && {
    padding: 0.75rem 1rem;
  }
`,j=a.zo.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
`,z=a.zo.div`
  svg {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--privy-border-radius-full);
    overflow: hidden;
    border: solid 0.1px var(--privy-color-border-default);
  }
`,C=a.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
`,k=a.zo.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
`,A=a.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.125rem;
`},99539:function(e,t,r){r.d(t,{N:function(){return i}});var o=r(89418),n=r(43803);let i=({size:e,centerIcon:t})=>(0,o.jsx)(s,{$size:e,children:(0,o.jsxs)(a,{children:[(0,o.jsx)(c,{}),(0,o.jsx)(d,{}),t?(0,o.jsx)(l,{children:t}):null]})}),s=n.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,a=n.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=n.zo.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  svg,
  img {
    width: calc(var(--spinner-size) * 0.4);
    height: calc(var(--spinner-size) * 0.4);
    border-radius: var(--privy-border-radius-full);
  }
`,c=n.zo.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,d=n.zo.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);
  animation: spin 1200ms linear infinite;

  && {
    border: 4px solid;
    border-color: var(--privy-color-icon-subtle) transparent transparent transparent;
    border-radius: 50%;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`}}]);