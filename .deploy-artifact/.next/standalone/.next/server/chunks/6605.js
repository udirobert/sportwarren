"use strict";exports.id=6605,exports.ids=[6605],exports.modules={14284:(e,r,i)=>{i.d(r,{C:()=>s});var t=i(4913),o=i(26510),n=i(96419);let a=({style:e,color:r,...i})=>(0,t.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:r||"currentColor",style:{height:"1.5rem",width:"1.5rem",...e},...i,children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M4.5 12.75l6 6 9-13.5"})}),l=({color:e,...r})=>(0,t.jsx)("svg",{version:"1.1",id:"Layer_1",xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",x:"0px",y:"0px",viewBox:"0 0 115.77 122.88",xmlSpace:"preserve",...r,children:(0,t.jsx)("g",{children:(0,t.jsx)("path",{fill:e||"currentColor",className:"st0",d:"M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"})})}),s=e=>{let[r,i]=(0,o.useState)(!1);return(0,t.jsxs)(c,{color:e.color,onClick:()=>{i(!0),navigator.clipboard.writeText(e.text),setTimeout(()=>i(!1),1500)},$justCopied:r,children:[r?(0,t.jsx)(a,{style:{height:"14px",width:"14px"},strokeWidth:"2"}):(0,t.jsx)(l,{style:{height:"14px",width:"14px"}}),r?"Copied":"Copy"," ",e.itemName?e.itemName:"to Clipboard"]})},c=n.zo.button`
  display: flex;
  align-items: center;
  gap: 6px;

  && {
    margin: 8px 2px;
    font-size: 14px;
    color: ${e=>e.$justCopied?"var(--privy-color-foreground)":e.color||"var(--privy-color-foreground-3)"};
    font-weight: ${e=>e.$justCopied?"medium":"normal"};
    transition: color 350ms ease;

    :focus,
    :active {
      background-color: transparent;
      border: none;
      outline: none;
      box-shadow: none;
    }

    :hover {
      color: ${e=>e.$justCopied?"var(--privy-color-foreground)":"var(--privy-color-foreground-2)"};
    }

    :active {
      color: 'var(--privy-color-foreground)';
      font-weight: medium;
    }

    @media (max-width: 440px) {
      margin: 12px 2px;
    }
  }

  svg {
    width: 14px;
    height: 14px;
  }
`},61726:(e,r,i)=>{i.d(r,{D:()=>s,M:()=>a});var t=i(4913),o=i(96419);let n=({data:e})=>{let r=e=>"object"==typeof e&&null!==e?(0,t.jsx)(l,{children:Object.entries(e).map(([e,i])=>(0,t.jsxs)("li",{children:[(0,t.jsxs)("strong",{children:[e,":"]})," ",r(i)]},e))}):(0,t.jsx)("span",{children:String(e)});return(0,t.jsx)("div",{children:r(e)})},a=o.zo.div`
  margin-top: 1.5rem;
  background-color: var(--privy-color-background-2);
  border-radius: var(--privy-border-radius-md);
  padding: 12px;
  text-align: left;
  max-height: 310px;
  overflow: scroll;
  white-space: pre-wrap;
  width: 100%;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--privy-color-foreground);
  line-height: 1.5;

  // hide the scrollbars
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`,l=o.zo.ul`
  margin-left: 12px !important;
  white-space: nowrap;

  &:first-child {
    margin-left: 0 !important;
  }

  strong {
    font-weight: 500 !important;
  }
`,s=({data:e,className:r})=>(0,t.jsx)(a,{className:r,children:(0,t.jsx)(n,{data:e})})},38198:(e,r,i)=>{i.d(r,{B:()=>o,C:()=>l,F:()=>c,H:()=>a,R:()=>g,S:()=>p,a:()=>d,b:()=>h,c:()=>s,d:()=>x,e:()=>n});var t=i(96419);let o=t.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,n=t.zo.div`
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
`,l=(0,t.zo)(n)`
  padding: 20px 0;
`,s=(0,t.zo)(n)`
  gap: 16px;
`,c=t.zo.div`
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
`;let p=t.zo.div`
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
`,h=t.zo.div`
  height: 16px;
`,g=t.zo.div`
  height: 12px;
`;t.zo.div`
  position: relative;
`;let x=t.zo.div`
  height: ${e=>e.height??"12"}px;
`;t.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},17846:(e,r,i)=>{i.d(r,{S:()=>j});var t=i(4913),o=i(26510),n=i(96419),a=i(13813),l=i(38102),s=i(90684);let c=n.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=n.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,n.zo)(l.M)`
  margin: 0 -8px;
`,g=n.zo.div`
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
`,x=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=n.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,u=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,m=n.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,f=n.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,y=n.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=n.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=n.zo.div`
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
`,j=({children:e,...r})=>(0,t.jsx)(c,{children:(0,t.jsx)(d,{...r,children:e})}),z=n.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,k=(0,n.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,S=n.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,t.jsx)(z,{children:(0,t.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:i,iconVariant:o,iconLoadingStatus:n,showBack:a,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:g,step:x,headerTitle:y,...b})=>(0,t.jsxs)(p,{...b,children:[(0,t.jsx)(h,{backFn:a?l:void 0,infoFn:s?c:void 0,onClose:d?g:void 0,title:y,closeable:d}),(i||o||e||r)&&(0,t.jsxs)(v,{children:[i||o?(0,t.jsx)(j.Icon,{icon:i,variant:o,loadingStatus:n}):null,!(!e&&!r)&&(0,t.jsxs)(u,{children:[e&&(0,t.jsx)(m,{children:e}),r&&(0,t.jsx)(f,{children:r})]})]}),x&&(0,t.jsx)(C,{step:x})]}),(j.Body=o.forwardRef(({children:e,...r},i)=>(0,t.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,t.jsx)(x,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,t.jsx)(E,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,t.jsx)(T,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,t.jsx)($,{...r,children:e}),j.Watermark=()=>(0,t.jsx)(k,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(b,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,t.jsx)(w,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(y,{$variant:r,children:(0,t.jsx)(s.N,{size:"64px"})}):(0,t.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=n.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,T=n.zo.div`
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
`,$=n.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,i)=>{i.d(r,{S:()=>a});var t=i(4913),o=i(38102),n=i(17846);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,n=i.variant||"primary";return(0,t.jsx)(o.a,{...i,variant:n,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,n=i.variant||"secondary";return(0,t.jsx)(o.a,{...i,variant:n,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,t.jsx)(n.S.Header,{...c}),s?(0,t.jsx)(n.S.Body,{children:s}):null,i||d||l?(0,t.jsxs)(n.S.Footer,{children:[i?(0,t.jsx)(n.S.HelpText,{children:i}):null,d?(0,t.jsx)(n.S.Actions,{children:d}):null,l?(0,t.jsx)(n.S.Watermark,{}):null]}):null,a?(0,t.jsx)(n.S.FooterText,{children:a}):null]})}},96605:(e,r,i)=>{i.r(r),i.d(r,{SignRequestScreen:()=>k,SignRequestView:()=>z,default:()=>k});var t=i(4913),o=i(63152);let n=(0,i(5670).Z)("square-pen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]]);var a=i(26510),l=i(96419),s=i(6258),c=i(79782),d=i(80202),p=i(14284),h=i(38198),g=i(61726),x=i(22554),v=i(14348),u=i(49171),m=i(55182),f=i(77681);i(36577),i(50470),i(46898);let y=l.zo.img`
  && {
    height: ${e=>"sm"===e.size?"65px":"140px"};
    width: ${e=>"sm"===e.size?"65px":"140px"};
    border-radius: 16px;
    margin-bottom: 12px;
  }
`,b=e=>{if(!(0,s.v)(e))return e;try{let r=(0,c.rR)(e);return r.includes("�")?e:r}catch{return e}},w=e=>{try{let r=o.US.decode(e),i=(new TextDecoder).decode(r);return i.includes("�")?e:i}catch{return e}},j=e=>{let{types:r,primaryType:i,...o}=e.typedData;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(E,{data:o}),(0,t.jsx)(p.C,{text:JSON.stringify(e.typedData,null,2),itemName:"full payload to clipboard"})," "]})},z=({method:e,messageData:r,copy:i,iconUrl:o,isLoading:a,success:l,walletProxyIsLoading:s,errorMessage:c,isCancellable:d,onSign:p,onCancel:g,onClose:x})=>(0,t.jsx)(f.S,{title:i.title,subtitle:i.description,showClose:!0,onClose:x,icon:n,iconVariant:"subtle",helpText:c?(0,t.jsx)(C,{children:c}):void 0,primaryCta:{label:i.buttonText,onClick:p,disabled:a||l||s,loading:a},secondaryCta:d?{label:"Not now",onClick:g,disabled:a||l||s}:void 0,watermark:!0,children:(0,t.jsxs)(h.a,{children:[o?(0,t.jsx)(y,{style:{alignSelf:"center"},size:"sm",src:o,alt:"app image"}):null,(0,t.jsxs)(S,{children:["personal_sign"===e&&(0,t.jsx)(T,{children:b(r)}),"eth_signTypedData_v4"===e&&(0,t.jsx)(j,{typedData:r}),"solana_signMessage"===e&&(0,t.jsx)(T,{children:w(r)})]})]})}),k={component:()=>{let{authenticated:e}=(0,m.u)(),{initializeWalletProxy:r,closePrivyModal:i}=(0,u.u)(),{navigate:o,data:n,onUserCloseViaDialogOrKeybindRef:l}=(0,m.a)(),[s,c]=(0,a.useState)(!0),[p,h]=(0,a.useState)(""),[g,f]=(0,a.useState)(),[y,b]=(0,a.useState)(null),[w,j]=(0,a.useState)(!1);(0,a.useEffect)(()=>{e||o("LandingScreen")},[e]),(0,a.useEffect)(()=>{r(v.W).then(e=>{c(!1),e||(h("An error has occurred, please try again."),f(new x.P(new x.H(p,d.M_.E32603_DEFAULT_INTERNAL_ERROR.eipCode))))})},[]);let{method:k,data:S,confirmAndSign:C,onSuccess:E,onFailure:T,uiOptions:$}=n.signMessage,R={title:$?.title||"Sign message",description:$?.description||"Signing this message will not cost you any fees.",buttonText:$?.buttonText||"Sign and continue"},F=e=>{e?E(e):T(g||new x.P(new x.H("The user rejected the request.",d.M_.E4001_USER_REJECTED_REQUEST.eipCode))),i({shouldCallAuthOnSuccess:!1}),setTimeout(()=>{b(null),h(""),f(void 0)},200)};return l.current=()=>{F(y)},(0,t.jsx)(z,{method:k,messageData:S,copy:R,iconUrl:$?.iconUrl&&"string"==typeof $.iconUrl?$.iconUrl:void 0,isLoading:w,success:null!==y,walletProxyIsLoading:s,errorMessage:p,isCancellable:$?.isCancellable,onSign:async()=>{j(!0),h("");try{let e=await C();b(e),j(!1),setTimeout(()=>{F(e)},v.q)}catch(e){console.error(e),h("An error has occurred, please try again."),f(new x.P(new x.H(p,d.M_.E32603_DEFAULT_INTERNAL_ERROR.eipCode))),j(!1)}},onCancel:()=>F(null),onClose:()=>F(y)})}},S=l.zo.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,C=l.zo.p`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-error-dark);
    font-size: 14px;
    line-height: 22px;
  }
`,E=(0,l.zo)(g.D)`
  margin-top: 0;
`,T=(0,l.zo)(g.M)`
  margin-top: 0;
`},90684:(e,r,i)=>{i.d(r,{N:()=>n});var t=i(4913),o=i(96419);let n=({size:e,centerIcon:r})=>(0,t.jsx)(a,{$size:e,children:(0,t.jsxs)(l,{children:[(0,t.jsx)(c,{}),(0,t.jsx)(d,{}),r?(0,t.jsx)(s,{children:r}):null]})}),a=o.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=o.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=o.zo.div`
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
`,c=o.zo.div`
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
`,d=o.zo.div`
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