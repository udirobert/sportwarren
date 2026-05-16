"use strict";exports.id=6922,exports.ids=[6922],exports.modules={32354:(e,r,t)=>{t.d(r,{Z:()=>o});let o=(0,t(5670).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},1544:(e,r,t)=>{t.d(r,{Z:()=>o});let o=(0,t(5670).Z)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},94749:(e,r,t)=>{t.d(r,{Z:()=>o});let o=(0,t(5670).Z)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},60840:(e,r,t)=>{t.d(r,{Z:()=>o});let o=(0,t(5670).Z)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},58003:(e,r,t)=>{t.d(r,{Z:()=>o});let o=(0,t(5670).Z)("user-check",[["path",{d:"m16 11 2 2 4-4",key:"9rsbq5"}],["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]])},31386:(e,r,t)=>{t.d(r,{C:()=>p,a:()=>h});var o=t(4913),i=t(32354),s=t(60840),n=t(26510),a=t(96419);let l=a.zo.button`
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`,c=a.zo.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--privy-color-foreground-2);
`,d=(0,a.zo)(i.Z)`
  color: var(--privy-color-icon-success);
  flex-shrink: 0;
`,u=(0,a.zo)(s.Z)`
  color: var(--privy-color-icon-muted);
  flex-shrink: 0;
`;function p({children:e,iconOnly:r,value:t,hideCopyIcon:i,...s}){let[a,p]=(0,n.useState)(!1);return(0,o.jsxs)(l,{...s,onClick:()=>{navigator.clipboard.writeText(t||("string"==typeof e?e:"")).catch(console.error),p(!0),setTimeout(()=>p(!1),1500)},children:[e," ",a?(0,o.jsxs)(c,{children:[(0,o.jsx)(d,{})," ",!r&&"Copied"]}):!i&&(0,o.jsx)(u,{})]})}let h=({value:e,includeChildren:r,children:t,...i})=>{let[s,a]=(0,n.useState)(!1),p=()=>{navigator.clipboard.writeText(e).catch(console.error),a(!0),setTimeout(()=>a(!1),1500)};return(0,o.jsxs)(o.Fragment,{children:[r?(0,o.jsx)(l,{...i,onClick:p,children:t}):(0,o.jsx)(o.Fragment,{children:t}),(0,o.jsx)(l,{...i,onClick:p,children:s?(0,o.jsx)(c,{children:(0,o.jsx)(d,{})}):(0,o.jsx)(u,{})})]})}},46922:(e,r,t)=>{t.r(r),t.d(r,{FundWithBankDepositScreen:()=>$,default:()=>$});var o=t(4913),i=t(26510),s=t(66780),n=t(55182),a=t(84292),l=t(46898),c=t(96419),d=t(31386),u=t(45592),p=t(77681),h=t(94749);let g=(0,t(5670).Z)("hourglass",[["path",{d:"M5 22h14",key:"ehvnwv"}],["path",{d:"M5 2h14",key:"pdyrp9"}],["path",{d:"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22",key:"1d314k"}],["path",{d:"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2",key:"1vvvr6"}]]);var m=t(58003),f=t(32354),v=t(71771);t(50470),t(36577),t(42330),t(84440);let y=e=>{try{return e.location.origin}catch{return}},x=({data:e,onClose:r})=>(0,o.jsx)(p.S,{showClose:!0,onClose:r,title:"Initiate bank transfer",subtitle:"Use the details below to complete a bank transfer from your bank.",primaryCta:{label:"Done",onClick:r},watermark:!1,footerText:"Exchange rates and fees are set when you authorize and determine the amount you receive. You'll see the applicable rates and fees for your transaction separately",children:(0,o.jsx)(b,{children:(u.G[e.deposit_instructions.asset]||[]).map(([r,t],i)=>{let s=e.deposit_instructions[r];if(!s||Array.isArray(s))return null;let n="asset"===r?s.toUpperCase():s,a=n.length>100?`${n.slice(0,9)}...${n.slice(-9)}`:n;return(0,o.jsxs)(w,{children:[(0,o.jsx)(k,{children:t}),(0,o.jsx)(d.a,{value:n,includeChildren:l.tq,children:(0,o.jsx)(j,{children:a})})]},i)})})}),b=c.zo.ol`
  border-color: var(--privy-color-border-default);
  border-width: 1px;
  border-radius: var(--privy-border-radius-mdlg);
  border-style: solid;
  display: flex;
  flex-direction: column;

  && {
    padding: 0 1rem;
  }
`,w=c.zo.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;

  &:not(:first-of-type) {
    border-top: 1px solid var(--privy-color-border-default);
  }

  & > {
    :nth-child(1) {
      flex-basis: 30%;
    }

    :nth-child(2) {
      flex-basis: 60%;
    }
  }
`,k=c.zo.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-variant-numeric: lining-nums proportional-nums;
  font-feature-settings: 'calt' off;

  /* text-xs/font-regular */
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.125rem; /* 150% */

  text-align: left;
  flex-shrink: 0;
`,j=c.zo.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-feature-settings: 'calt' off;

  /* text-sm/font-medium */
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.375rem; /* 157.143% */

  text-align: right;
  word-break: break-all;
`,C=({onClose:e})=>(0,o.jsx)(p.S,{showClose:!0,onClose:e,icon:h.Z,iconVariant:"error",title:"Something went wrong",subtitle:"We couldn't complete account setup. This isn't caused by anything you did.",primaryCta:{label:"Close",onClick:e},watermark:!0}),z=({onClose:e,reason:r})=>{let t=r?r.charAt(0).toLowerCase()+r.slice(1):void 0;return(0,o.jsx)(p.S,{showClose:!0,onClose:e,icon:h.Z,iconVariant:"error",title:"Identity verification failed",subtitle:t?`We can't complete identity verification because ${t}. Please try again or contact support for assistance.`:"We couldn't verify your identity. Please try again or contact support for assistance.",primaryCta:{label:"Close",onClick:e},watermark:!0})},S=({onClose:e,email:r})=>(0,o.jsx)(p.S,{showClose:!0,onClose:e,icon:g,title:"Identity verification in progress",subtitle:"We're waiting for Persona to approve your identity verification. This usually takes a few minutes, but may take up to 24 hours.",primaryCta:{label:"Done",onClick:e},watermark:!0,children:(0,o.jsxs)(v.I,{theme:"light",children:["You'll receive an email at ",r," once approved with instructions for completing your deposit."]})}),A=({onClose:e,onAcceptTerms:r,isLoading:t})=>(0,o.jsx)(p.S,{showClose:!0,onClose:e,icon:m.Z,title:"Verify your identity to continue",subtitle:"Finish verification with Persona — it takes just a few minutes and requires a government ID.",helpText:(0,o.jsxs)(o.Fragment,{children:['This app uses Bridge to securely connect accounts and move funds. By clicking "Accept," you agree to Bridge\'s'," ",(0,o.jsx)("a",{href:"https://www.bridge.xyz/legal",target:"_blank",rel:"noopener noreferrer",children:"Terms of Service"})," ","and"," ",(0,o.jsx)("a",{href:"https://www.bridge.xyz/legal/row-privacy-policy/bridge-building-limited",target:"_blank",rel:"noopener noreferrer",children:"Privacy Policy"}),"."]}),primaryCta:{label:"Accept and continue",onClick:r,loading:t},watermark:!0}),E=({onClose:e})=>(0,o.jsx)(p.S,{showClose:!0,onClose:e,icon:f.Z,iconVariant:"success",title:"Identity verified successfully",subtitle:"We've successfully verified your identity. Now initiate a bank transfer to view instructions.",primaryCta:{label:"Initiate bank transfer",onClick:()=>{},loading:!0},watermark:!0}),T=({opts:e,onClose:r,onEditSourceAsset:t,onSelectAmount:i,isLoading:s})=>(0,o.jsxs)(p.S,{showClose:!0,onClose:r,headerTitle:`Buy ${e.destination.asset.toLocaleUpperCase()}`,primaryCta:{label:"Continue",onClick:i,loading:s},watermark:!0,children:[(0,o.jsx)(a.A,{currency:e.source.selectedAsset,inputMode:"decimal",autoFocus:!0}),(0,o.jsx)(a.C,{selectedAsset:e.source.selectedAsset,onEditSourceAsset:t})]}),F=({onClose:e,onAcceptTerms:r,onSelectAmount:t,onSelectSource:i,onEditSourceAsset:s,opts:n,state:l,email:c,isLoading:d})=>"select-amount"===l.status?(0,o.jsx)(T,{onClose:e,onSelectAmount:t,onEditSourceAsset:s,opts:n,isLoading:d}):"select-source-asset"===l.status?(0,o.jsx)(a.S,{onSelectSource:i,opts:n,isLoading:d}):"kyc-prompt"===l.status?(0,o.jsx)(A,{onClose:e,onAcceptTerms:r,opts:n,isLoading:d}):"kyc-incomplete"===l.status?(0,o.jsx)(S,{onClose:e,email:c}):"kyc-success"===l.status?(0,o.jsx)(E,{onClose:e}):"kyc-error"===l.status?(0,o.jsx)(z,{onClose:e,reason:l.reason}):"account-details"===l.status?(0,o.jsx)(x,{onClose:e,data:l.data}):"create-customer-error"===l.status||"get-customer-error"===l.status?(0,o.jsx)(C,{onClose:e}):null,$={component:()=>{let{user:e}=(0,n.u)(),r=(0,n.a)().data;if(!r?.FundWithBankDepositScreen)throw Error("Missing data");let{onSuccess:t,onFailure:l,opts:c,createOrUpdateCustomer:d,getCustomer:u,getOrCreateVirtualAccount:p}=r.FundWithBankDepositScreen,[h,g]=(0,i.useState)(c),[m,f]=(0,i.useState)({status:"select-amount"}),[v,x]=(0,i.useState)(null),[b,w]=(0,i.useState)(!1),k=(0,i.useRef)(null),j=(0,i.useCallback)(async()=>{let e;w(!0),x(null);try{e=await u({kycRedirectUrl:window.location.origin})}catch(e){if(!e||"object"!=typeof e||!("status"in e)||404!==e.status)return f({status:"get-customer-error"}),x(e),void w(!1)}if(!e)try{e=await d({hasAcceptedTerms:!1,kycRedirectUrl:window.location.origin})}catch(e){return f({status:"create-customer-error"}),x(e),void w(!1)}if(!e)return f({status:"create-customer-error"}),x(Error("Unable to create customer")),void w(!1);if("not_started"===e.status&&e.kyc_url)return f({status:"kyc-prompt",kycUrl:e.kyc_url}),void w(!1);if("not_started"===e.status)return f({status:"get-customer-error"}),x(Error("Unexpected user state")),void w(!1);if("rejected"===e.status)return f({status:"kyc-error",reason:e.rejection_reasons?.[0]?.reason}),x(Error("User KYC rejected.")),void w(!1);if("incomplete"===e.status)return f({status:"kyc-incomplete"}),void w(!1);if("active"!==e.status)return f({status:"get-customer-error"}),x(Error("Unexpected user state")),void w(!1);e.status;try{let e=await p({destination:h.destination,provider:h.provider,source:{asset:h.source.selectedAsset}});f({status:"account-details",data:e})}catch(e){return f({status:"create-customer-error"}),x(e),void w(!1)}},[h]),C=(0,i.useCallback)(async()=>{if(x(null),w(!0),"kyc-prompt"!==m.status)return x(Error("Unexpected state")),void w(!1);let e=(0,s.X)({location:m.kycUrl});if(await d({hasAcceptedTerms:!0}),!e)return x(Error("Unable to begin kyc flow.")),w(!1),void f({status:"create-customer-error"});k.current=new AbortController;let r=await (async(e,r)=>{let t=await (0,a.p)({operation:async()=>({done:y(e)===window.location.origin,closed:e.closed}),until:({done:e,closed:r})=>e||r,delay:0,interval:500,attempts:360,signal:r});return"aborted"===t.status?(e.close(),{status:"aborted"}):"max_attempts"===t.status?{status:"timeout"}:t.result.done?(e.close(),{status:"redirected"}):{status:"closed"}})(e,k.current.signal);if("aborted"===r.status)return;if("closed"===r.status)return void w(!1);r.status;let t=await (0,a.p)({operation:()=>u({}),until:e=>"active"===e.status||"rejected"===e.status,delay:0,interval:2e3,attempts:60,signal:k.current.signal});if("aborted"!==t.status){if("max_attempts"===t.status)return f({status:"kyc-incomplete"}),void w(!1);if(t.status,"rejected"===t.result.status)return f({status:"kyc-error",reason:t.result.rejection_reasons?.[0]?.reason}),x(Error("User KYC rejected.")),void w(!1);if("active"!==t.result.status)return f({status:"kyc-incomplete"}),void w(!1);e.closed||e.close(),t.result.status;try{f({status:"kyc-success"});let e=await p({destination:h.destination,provider:h.provider,source:{asset:h.source.selectedAsset}});f({status:"account-details",data:e})}catch(e){f({status:"create-customer-error"}),x(e)}finally{w(!1)}}},[f,x,w,d,p,m,h,k]),z=(0,i.useCallback)(e=>{f({status:"select-amount"}),g({...h,source:{...h.source,selectedAsset:e}})},[f,g]),S=(0,i.useCallback)(()=>{f({status:"select-source-asset"})},[f]);return(0,o.jsx)(F,{onClose:(0,i.useCallback)(async()=>{k.current?.abort(),v?l(v):await t()},[v,k]),opts:h,state:m,isLoading:b,email:e.email.address,onAcceptTerms:C,onSelectAmount:j,onSelectSource:z,onEditSourceAsset:S})}}},71771:(e,r,t)=>{t.d(r,{I:()=>a});var o=t(4913),i=t(26510);let s=i.forwardRef(function({title:e,titleId:r,...t},o){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:o,"aria-labelledby":r},t),e?i.createElement("title",{id:r},e):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"}))});var n=t(96419);let a=({children:e,theme:r})=>(0,o.jsxs)(l,{$theme:r,children:[(0,o.jsx)(s,{width:"20px",height:"20px",color:"var(--privy-color-icon-muted)",strokeWidth:1.5,style:{flexShrink:0}}),(0,o.jsx)(c,{$theme:r,children:e})]}),l=n.zo.div`
  display: flex;
  gap: 0.75rem;
  background-color: var(--privy-color-background-2);
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
`,c=n.zo.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  flex: 1;
  text-align: left;

  /* text-sm/font-regular */
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */
`},17846:(e,r,t)=>{t.d(r,{S:()=>k});var o=t(4913),i=t(26510),s=t(96419),n=t(13813),a=t(38102),l=t(90684);let c=s.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=s.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,u=s.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,p=(0,s.zo)(a.M)`
  margin: 0 -8px;
`,h=s.zo.div`
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
`,g=s.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,m=s.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,f=s.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,v=s.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,y=s.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,x=s.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=s.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=s.zo.div`
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
`,k=({children:e,...r})=>(0,o.jsx)(c,{children:(0,o.jsx)(d,{...r,children:e})}),j=s.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,C=(0,s.zo)(a.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,z=s.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:e})=>e?(0,o.jsx)(j,{children:(0,o.jsx)(z,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:t,iconVariant:i,iconLoadingStatus:s,showBack:n,onBack:a,showInfo:l,onInfo:c,showClose:d,onClose:h,step:g,headerTitle:x,...b})=>(0,o.jsxs)(u,{...b,children:[(0,o.jsx)(p,{backFn:n?a:void 0,infoFn:l?c:void 0,onClose:d?h:void 0,title:x,closeable:d}),(t||i||e||r)&&(0,o.jsxs)(m,{children:[t||i?(0,o.jsx)(k.Icon,{icon:t,variant:i,loadingStatus:s}):null,!(!e&&!r)&&(0,o.jsxs)(f,{children:[e&&(0,o.jsx)(v,{children:e}),r&&(0,o.jsx)(y,{children:r})]})]}),g&&(0,o.jsx)(S,{step:g})]}),(k.Body=i.forwardRef(({children:e,...r},t)=>(0,o.jsx)(h,{ref:t,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,o.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,o.jsx)(A,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,o.jsx)(E,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,o.jsx)(T,{...r,children:e}),k.Watermark=()=>(0,o.jsx)(C,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,o.jsx)(b,"string"==typeof e?{children:(0,o.jsx)("img",{src:e,alt:""})}:i.isValidElement(e)?{children:e}:{children:i.createElement(e)}):"loading"===r?e?(0,o.jsx)(w,{children:(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,o.jsx)(n.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,o.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):i.isValidElement(e)?i.cloneElement(e,{style:{width:"38px",height:"38px"}}):i.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,o.jsx)(x,{$variant:r,children:(0,o.jsx)(l.N,{size:"64px"})}):(0,o.jsx)(x,{$variant:r,children:e&&("string"==typeof e?(0,o.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):i.isValidElement(e)?e:i.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let A=s.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,E=s.zo.div`
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
`,T=s.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,t)=>{t.d(r,{S:()=>n});var o=t(4913),i=t(38102),s=t(17846);let n=({primaryCta:e,secondaryCta:r,helpText:t,footerText:n,watermark:a=!0,children:l,...c})=>{let d=e||r?(0,o.jsxs)(o.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,s=t.variant||"primary";return(0,o.jsx)(i.a,{...t,variant:s,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,s=t.variant||"secondary";return(0,o.jsx)(i.a,{...t,variant:s,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,o.jsxs)(s.S,{id:c.id,className:c.className,children:[(0,o.jsx)(s.S.Header,{...c}),l?(0,o.jsx)(s.S.Body,{children:l}):null,t||d||a?(0,o.jsxs)(s.S.Footer,{children:[t?(0,o.jsx)(s.S.HelpText,{children:t}):null,d?(0,o.jsx)(s.S.Actions,{children:d}):null,a?(0,o.jsx)(s.S.Watermark,{}):null]}):null,n?(0,o.jsx)(s.S.FooterText,{children:n}):null]})}},84292:(e,r,t)=>{t.d(r,{A:()=>u,C:()=>p,S:()=>x,p:()=>d});var o=t(22554),i=t(4913),s=t(1544),n=t(26510),a=t(96419),l=t(45592),c=t(77681);let d=async({operation:e,until:r,delay:t,interval:i,attempts:s,signal:n})=>{let a,l,c=0;for(;c<s;){if(n?.aborted)return{status:"aborted",result:a,attempts:c,error:l};c++;try{if(l=void 0,a=await e(),r(a))return{status:"success",result:a,attempts:c};c<s&&await (0,o.m)(i)}catch(e){e instanceof Error&&(l=e),c<s&&await (0,o.m)(i)}}return{status:"max_attempts",result:a,attempts:c,error:l}},u=({currency:e="usd",value:r,onChange:t,inputMode:o="decimal",autoFocus:s})=>{let[a,c]=(0,n.useState)("0"),d=(0,n.useRef)(null),u=r??a,p=l.H[e]?.symbol??"$",m=(0,n.useCallback)(e=>{let r=e.target.value,o=(r=r.replace(/[^\d.]/g,"")).split(".");o.length>2&&(r=o[0]+"."+o.slice(1).join("")),2===o.length&&o[1].length>2&&(r=`${o[0]}.${o[1].slice(0,2)}`),r.length>1&&"0"===r[0]&&"."!==r[1]&&(r=r.slice(1)),(""===r||"."===r)&&(r="0"),t?t(r):c(r)},[t]),f=(0,n.useCallback)(e=>{!(["Delete","Backspace","Tab","Escape","Enter",".","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key)||(e.ctrlKey||e.metaKey)&&["a","c","v","x"].includes(e.key.toLowerCase()))&&(e.key>="0"&&e.key<="9"||e.preventDefault())},[]),v=(0,n.useMemo)(()=>(u.includes("."),u),[u]);return(0,i.jsxs)(h,{onClick:()=>d.current?.focus(),children:[(0,i.jsx)(g,{children:p}),v,(0,i.jsx)("input",{ref:d,type:"text",inputMode:o,value:v,onChange:m,onKeyDown:f,autoFocus:s,placeholder:"0",style:{width:1,height:"1rem",opacity:0,alignSelf:"center",fontSize:"1rem"}}),(0,i.jsx)(g,{style:{opacity:0},children:p})]})},p=({selectedAsset:e,onEditSourceAsset:r})=>{let{icon:t}=l.H[e];return(0,i.jsxs)(m,{onClick:r,children:[(0,i.jsx)(f,{children:t}),(0,i.jsx)(v,{children:e.toLocaleUpperCase()}),(0,i.jsx)(y,{children:(0,i.jsx)(s.Z,{})})]})},h=a.zo.span`
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
`,m=a.zo.button`
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
`,f=a.zo.div`
  svg {
    width: 1rem;
    height: 1rem;
    border-radius: var(--privy-border-radius-full);
    overflow: hidden;
    border: solid 0.1px var(--privy-color-border-default);
  }
`,v=a.zo.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-feature-settings: 'calt' off;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.375rem;
`,y=a.zo.div`
  color: var(--privy-color-foreground);

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`,x=({opts:e,isLoading:r,onSelectSource:t})=>(0,i.jsx)(c.S,{showClose:!1,showBack:!0,onBack:()=>t(e.source.selectedAsset),title:"Select currency",children:(0,i.jsx)(b,{children:e.source.assets.map(e=>{let{icon:o,name:s}=l.H[e];return(0,i.jsx)(w,{onClick:()=>t(e),disabled:r,children:(0,i.jsxs)(k,{children:[(0,i.jsx)(j,{children:o}),(0,i.jsxs)(C,{children:[(0,i.jsx)(z,{children:s}),(0,i.jsx)(S,{children:e.toLocaleUpperCase()})]})]})},e)})})}),b=a.zo.div`
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
`,k=a.zo.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
`,j=a.zo.div`
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
`,z=a.zo.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
`,S=a.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.125rem;
`},90684:(e,r,t)=>{t.d(r,{N:()=>s});var o=t(4913),i=t(96419);let s=({size:e,centerIcon:r})=>(0,o.jsx)(n,{$size:e,children:(0,o.jsxs)(a,{children:[(0,o.jsx)(c,{}),(0,o.jsx)(d,{}),r?(0,o.jsx)(l,{children:r}):null]})}),n=i.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,a=i.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=i.zo.div`
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
`,c=i.zo.div`
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
`,d=i.zo.div`
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
`}};