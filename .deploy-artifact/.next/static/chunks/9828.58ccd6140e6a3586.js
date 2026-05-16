"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9828],{12859:function(e,r,i){i.d(r,{Z:function(){return n}});let n=(0,i(79095).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},60660:function(e,r,i){i.d(r,{Z:function(){return n}});let n=(0,i(79095).Z)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},74863:function(e,r,i){i.d(r,{Z:function(){return n}});let n=(0,i(79095).Z)("fingerprint-pattern",[["path",{d:"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",key:"1nerag"}],["path",{d:"M14 13.12c0 2.38 0 6.38-1 8.88",key:"o46ks0"}],["path",{d:"M17.29 21.02c.12-.6.43-2.3.5-3.02",key:"ptglia"}],["path",{d:"M2 12a10 10 0 0 1 18-6",key:"ydlgp0"}],["path",{d:"M2 16h.01",key:"1gqxmh"}],["path",{d:"M21.8 16c.2-2 .131-5.354 0-6",key:"drycrb"}],["path",{d:"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",key:"1tidbn"}],["path",{d:"M8.65 22c.21-.66.45-1.32.57-2",key:"13wd9y"}],["path",{d:"M9 6.8a6 6 0 0 1 9 5.2v2",key:"1fr1j5"}]])},41454:function(e,r,i){i.d(r,{Z:function(){return n}});let n=(0,i(79095).Z)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]])},49828:function(e,r,i){i.r(r),i.d(r,{DoubleIconWrapper:function(){return k},LinkButton:function(){return j},LinkPasskeyScreen:function(){return m},LinkPasskeyView:function(){return x},default:function(){return m}});var n=i(89418),t=i(60660),o=i(74863),a=i(41454),s=i(4753),l=i(43803),c=i(61318),d=i(41020),p=i(3010),h=i(9201),u=i(58610),g=i(35868);i(96257),i(78439),i(55982);let x=({passkeys:e,isLoading:r,errorReason:i,success:a,expanded:s,onLinkPasskey:l,onUnlinkPasskey:c,onExpand:d,onBack:p,onClose:h})=>(0,n.jsx)(g.S,a?{title:"Passkeys updated",icon:t.Z,iconVariant:"success",primaryCta:{label:"Done",onClick:h},onClose:h,watermark:!0}:s?{icon:o.Z,title:"Your passkeys",onBack:p,onClose:h,watermark:!0,children:(0,n.jsx)(f,{passkeys:e,expanded:s,onUnlink:c,onExpand:d})}:{icon:o.Z,title:"Set up passkey verification",subtitle:"Verify with passkey",primaryCta:{label:"Add new passkey",onClick:l,loading:r},onClose:h,watermark:!0,helpText:i||void 0,children:0===e.length?(0,n.jsx)(y,{}):(0,n.jsx)(v,{children:(0,n.jsx)(f,{passkeys:e,expanded:s,onUnlink:c,onExpand:d})})}),v=l.zo.div`
  margin-bottom: 12px;
`,f=({passkeys:e,expanded:r,onUnlink:i,onExpand:t})=>{let[o,l]=(0,s.useState)([]),d=r?e.length:2;return(0,n.jsxs)("div",{children:[(0,n.jsx)(z,{children:"Your passkeys"}),(0,n.jsxs)(w,{children:[e.slice(0,d).map(e=>(0,n.jsxs)(S,{children:[(0,n.jsxs)("div",{children:[(0,n.jsx)(E,{children:e.authenticatorName?e.createdWithBrowser?`${e.authenticatorName} on ${e.createdWithBrowser}`:e.authenticatorName:e.createdWithBrowser?e.createdWithOs?`${e.createdWithBrowser} on ${e.createdWithOs}`:`${e.createdWithBrowser}`:"Unknown device"}),(0,n.jsxs)(C,{children:["Last used:"," ",(e.latestVerifiedAt??e.firstVerifiedAt)?.toLocaleString()??"N/A"]})]}),(0,n.jsx)($,{disabled:o.includes(e.credentialId),onClick:()=>(async e=>{l(r=>r.concat([e])),await i(e),l(r=>r.filter(r=>r!==e))})(e.credentialId),children:o.includes(e.credentialId)?(0,n.jsx)(c.B,{}):(0,n.jsx)(a.Z,{size:16})})]},e.credentialId)),e.length>2&&!r&&(0,n.jsx)(j,{onClick:t,children:"View all"})]})]})},y=()=>(0,n.jsxs)(d.T,{style:{color:"var(--privy-color-foreground)"},children:[(0,n.jsx)(d.a,{children:"Verify with Touch ID, Face ID, PIN, or hardware key"}),(0,n.jsx)(d.a,{children:"Takes seconds to set up and use"}),(0,n.jsx)(d.a,{children:"Use your passkey to verify transactions and login to your account"})]}),m={component:()=>{let{user:e}=(0,h.u)(),{unlink:r}=(0,u.y)(),{linkWithPasskey:i,closePrivyModal:t}=(0,p.u)(),o=e?.linkedAccounts.filter(e=>"passkey"===e.type),[a,l]=(0,s.useState)(!1),[c,d]=(0,s.useState)(""),[g,v]=(0,s.useState)(!1),[f,y]=(0,s.useState)(!1);return(0,s.useEffect)(()=>{0===o.length&&y(!1)},[o.length]),(0,n.jsx)(x,{passkeys:o,isLoading:a,errorReason:c,success:g,expanded:f,onLinkPasskey:()=>{l(!0),i().then(()=>v(!0)).catch(e=>{if(e instanceof p.g){if(e.privyErrorCode===p.c.CANNOT_LINK_MORE_OF_TYPE)return void d("Cannot link more passkeys to account.");if(e.privyErrorCode===p.c.PASSKEY_NOT_ALLOWED)return void d("Passkey request timed out or rejected by user.")}d("Unknown error occurred.")}).finally(()=>{l(!1)})},onUnlinkPasskey:async e=>(l(!0),await r({credentialId:e}).then(()=>v(!0)).catch(e=>{e instanceof p.g&&e.privyErrorCode===p.c.MISSING_MFA_CREDENTIALS?d("Cannot unlink a passkey enrolled in MFA"):d("Unknown error occurred.")}).finally(()=>{l(!1)})),onExpand:()=>y(!0),onBack:()=>y(!1),onClose:()=>t()})}},k=l.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 90px;
  border-radius: 50%;
  svg + svg {
    margin-left: 12px;
  }
  > svg {
    z-index: 2;
    color: var(--privy-color-accent) !important;
    stroke: var(--privy-color-accent) !important;
    fill: var(--privy-color-accent) !important;
  }
`,b=(0,l.iv)`
  && {
    width: 100%;
    font-size: 0.875rem;
    line-height: 1rem;

    /* Tablet and Up */
    @media (min-width: 440px) {
      font-size: 14px;
    }

    display: flex;
    gap: 12px;
    justify-content: center;

    padding: 6px 8px;
    background-color: var(--privy-color-background);
    transition: background-color 200ms ease;
    color: var(--privy-color-accent) !important;

    :focus {
      outline: none;
      box-shadow: none;
    }
  }
`,j=l.zo.button`
  ${b}
`,w=l.zo.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.8rem;
  padding: 0.5rem 0rem 0rem;
  flex-grow: 1;
  width: 100%;
`,z=l.zo.div`
  line-height: 20px;
  height: 20px;
  font-size: 1em;
  font-weight: 450;
  display: flex;
  justify-content: flex-beginning;
  width: 100%;
`,E=l.zo.div`
  font-size: 1em;
  line-height: 1.3em;
  font-weight: 500;
  color: var(--privy-color-foreground-2);
  padding: 0.2em 0;
`,C=l.zo.div`
  font-size: 0.875rem;
  line-height: 1rem;
  color: #64668b;
  padding: 0.2em 0;
`,S=l.zo.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1em;
  gap: 10px;
  font-size: 0.875rem;
  line-height: 1rem;
  text-align: left;
  border-radius: 8px;
  border: 1px solid #e2e3f0 !important;
  width: 100%;
  height: 5em;
`,M=(0,l.iv)`
  :focus,
  :hover,
  :active {
    outline: none;
  }
  display: flex;
  width: 2em;
  height: 2em;
  justify-content: center;
  align-items: center;
  svg {
    color: var(--privy-color-error);
  }
  svg:hover {
    color: var(--privy-color-foreground-3);
  }
`,$=l.zo.button`
  ${M}
`},18532:function(e,r,i){i.d(r,{S:function(){return j}});var n=i(89418),t=i(4753),o=i(43803),a=i(61318),s=i(13188),l=i(99539);let c=o.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=o.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,o.zo)(s.M)`
  margin: 0 -8px;
`,u=o.zo.div`
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
`,g=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,x=o.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,v=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=o.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,y=o.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,m=o.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,k=o.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,b=o.zo.div`
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
`,j=({children:e,...r})=>(0,n.jsx)(c,{children:(0,n.jsx)(d,{...r,children:e})}),w=o.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,z=(0,o.zo)(s.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,E=o.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,n.jsx)(w,{children:(0,n.jsx)(E,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:o,showBack:a,onBack:s,showInfo:l,onInfo:c,showClose:d,onClose:u,step:g,headerTitle:m,...k})=>(0,n.jsxs)(p,{...k,children:[(0,n.jsx)(h,{backFn:a?s:void 0,infoFn:l?c:void 0,onClose:d?u:void 0,title:m,closeable:d}),(i||t||e||r)&&(0,n.jsxs)(x,{children:[i||t?(0,n.jsx)(j.Icon,{icon:i,variant:t,loadingStatus:o}):null,!(!e&&!r)&&(0,n.jsxs)(v,{children:[e&&(0,n.jsx)(f,{children:e}),r&&(0,n.jsx)(y,{children:r})]})]}),g&&(0,n.jsx)(C,{step:g})]}),(j.Body=t.forwardRef(({children:e,...r},i)=>(0,n.jsx)(u,{ref:i,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,n.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,n.jsx)(S,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,n.jsx)(M,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,n.jsx)($,{...r,children:e}),j.Watermark=()=>(0,n.jsx)(z,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,n.jsx)(k,"string"==typeof e?{children:(0,n.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,n.jsx)(b,{children:(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,n.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,n.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,n.jsx)(m,{$variant:r,children:(0,n.jsx)(l.N,{size:"64px"})}):(0,n.jsx)(m,{$variant:r,children:e&&("string"==typeof e?(0,n.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let S=o.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,M=o.zo.div`
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
`,$=o.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},35868:function(e,r,i){i.d(r,{S:function(){return a}});var n=i(89418),t=i(13188),o=i(18532);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:s=!0,children:l,...c})=>{let d=e||r?(0,n.jsxs)(n.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,o=i.variant||"primary";return(0,n.jsx)(t.a,{...i,variant:o,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,o=i.variant||"secondary";return(0,n.jsx)(t.a,{...i,variant:o,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,n.jsxs)(o.S,{id:c.id,className:c.className,children:[(0,n.jsx)(o.S.Header,{...c}),l?(0,n.jsx)(o.S.Body,{children:l}):null,i||d||s?(0,n.jsxs)(o.S.Footer,{children:[i?(0,n.jsx)(o.S.HelpText,{children:i}):null,d?(0,n.jsx)(o.S.Actions,{children:d}):null,s?(0,n.jsx)(o.S.Watermark,{}):null]}):null,a?(0,n.jsx)(o.S.FooterText,{children:a}):null]})}},41020:function(e,r,i){i.d(r,{T:function(){return l},a:function(){return c}});var n=i(89418),t=i(12859),o=i(7410),a=i(4753),s=i(43803);let l=s.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px; /* 10px gap between items */
  padding-left: 8px; /* 8px indentation container */
`;s.zo.div`
  &&& {
    margin-left: 6px; /* Center the line under the checkbox (12px/2) */
    border-left: 2px solid var(--privy-color-foreground-4);
    height: 10px; /* 10px H padding between paragraphs */
    margin-top: 0;
    margin-bottom: 0;
  }
`;let c=({children:e,variant:r="default",icon:i})=>{let s=()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}};return(0,n.jsxs)(p,{children:[(0,n.jsx)(d,{$variant:r,"data-variant":r,children:(()=>{if(i)return a.isValidElement(i)?a.cloneElement(i,{stroke:s(),strokeWidth:2}):i;switch(r){case"success":default:return(0,n.jsx)(t.Z,{size:12,stroke:s(),strokeWidth:3});case"error":return(0,n.jsx)(o.Z,{size:12,stroke:s(),strokeWidth:3})}})()}),e]})},d=s.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";default:return"var(--privy-color-background-2)"}}};
  flex-shrink: 0;
`,p=s.zo.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start; /* Align all elements to the top */
  text-align: left;
  gap: 8px;

  && {
    a {
      color: var(--privy-color-accent);
    }
  }
`},99539:function(e,r,i){i.d(r,{N:function(){return o}});var n=i(89418),t=i(43803);let o=({size:e,centerIcon:r})=>(0,n.jsx)(a,{$size:e,children:(0,n.jsxs)(s,{children:[(0,n.jsx)(c,{}),(0,n.jsx)(d,{}),r?(0,n.jsx)(l,{children:r}):null]})}),a=t.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=t.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=t.zo.div`
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
`,c=t.zo.div`
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
`,d=t.zo.div`
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