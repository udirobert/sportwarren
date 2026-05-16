"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4151],{84978:function(e,r,t){var i=t(4753);let o=i.forwardRef(function(e,r){let{title:t,titleId:o,...n}=e;return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":o},n),t?i.createElement("title",{id:o},t):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"}))});r.Z=o},94923:function(e,r,t){t.d(r,{B:function(){return o},C:function(){return l},F:function(){return c},H:function(){return a},R:function(){return v},S:function(){return p},a:function(){return d},b:function(){return u},c:function(){return s},d:function(){return h},e:function(){return n}});var i=t(43803);let o=i.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,n=i.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,a=i.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,i.zo)(n)`
  padding: 20px 0;
`,s=(0,i.zo)(n)`
  gap: 16px;
`,c=i.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,d=i.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;i.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let p=i.zo.div`
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
`,u=i.zo.div`
  height: 16px;
`,v=i.zo.div`
  height: 12px;
`;i.zo.div`
  position: relative;
`;let h=i.zo.div`
  height: ${e=>e.height??"12"}px;
`;i.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},94151:function(e,r,t){t.r(r),t.d(r,{PasswordRecoveryScreen:function(){return h},default:function(){return h}});var i=t(89418),o=t(84978),n=t(4753),a=t(43803),l=t(9201),s=t(13188),c=t(94923),d=t(58438),p=t(5430),u=t(3010),v=t(18532);t(96257),t(78439),t(55982),t(94936),t(21628);let h={component:()=>{let[e,r]=(0,n.useState)(!0),{authenticated:t,user:a}=(0,l.u)(),{walletProxy:s,closePrivyModal:h,createAnalyticsEvent:m,client:y}=(0,u.u)(),{navigate:b,data:w,onUserCloseViaDialogOrKeybindRef:z}=(0,l.a)(),[j,k]=(0,n.useState)(void 0),[E,S]=(0,n.useState)(""),[C,$]=(0,n.useState)(!1),{entropyId:A,entropyIdVerifier:R,onCompleteNavigateTo:I,onSuccess:L,onFailure:M}=w.recoverWallet,F=(e="User exited before their wallet could be recovered")=>{h({shouldCallAuthOnSuccess:!1}),M("string"==typeof e?new u.m(e):e)};return z.current=F,(0,n.useEffect)(()=>{if(!t)return F("User must be authenticated and have a Privy wallet before it can be recovered")},[t]),(0,i.jsxs)(v.S,{children:[(0,i.jsx)(v.S.Header,{icon:o.Z,title:"Enter your password",subtitle:"Please provision your account on this new device. To continue, enter your recovery password.",showClose:!0,onClose:F}),(0,i.jsx)(v.S.Body,{children:(0,i.jsx)(g,{children:(0,i.jsxs)("div",{children:[(0,i.jsxs)(d.P,{children:[(0,i.jsx)(d.a,{type:e?"password":"text",onChange:e=>{var r;(r=e.target.value)&&k(r)},disabled:C,style:{paddingRight:"2.3rem"}}),(0,i.jsx)(d.I,{style:{right:"0.75rem"},children:e?(0,i.jsx)(d.H,{onClick:()=>r(!1)}):(0,i.jsx)(d.S,{onClick:()=>r(!0)})})]}),!!E&&(0,i.jsx)(f,{children:E})]})})}),(0,i.jsxs)(v.S.Footer,{children:[(0,i.jsx)(v.S.HelpText,{children:(0,i.jsxs)(c.S,{children:[(0,i.jsx)("h4",{children:"Why is this necessary?"}),(0,i.jsx)("p",{children:"You previously set a password for this wallet. This helps ensure only you can access it"})]})}),(0,i.jsx)(v.S.Actions,{children:(0,i.jsx)(x,{loading:C||!s,disabled:!j,onClick:async()=>{$(!0);let e=await y.getAccessToken(),r=(0,l.j)(a,A);if(!e||!r||null===j)return F("User must be authenticated and have a Privy wallet before it can be recovered");try{m({eventName:"embedded_wallet_recovery_started",payload:{walletAddress:r.address}}),await s?.recover({accessToken:e,entropyId:A,entropyIdVerifier:R,recoveryPassword:j}),S(""),I?b(I):h({shouldCallAuthOnSuccess:!1}),L?.(r),m({eventName:"embedded_wallet_recovery_completed",payload:{walletAddress:r.address}})}catch(e){(0,p.n)(e)?S("Invalid recovery password, please try again."):S("An error has occurred, please try again.")}finally{$(!1)}},$hideAnimations:!A&&C,children:"Recover your account"})}),(0,i.jsx)(v.S.Watermark,{})]})]})}},g=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`,f=a.zo.div`
  line-height: 20px;
  height: 20px;
  font-size: 13px;
  color: var(--privy-color-error);
  text-align: left;
  margin-top: 0.5rem;
`,x=(0,a.zo)(s.P)`
  ${({$hideAnimations:e})=>e&&(0,a.iv)`
      && {
        // Remove animations because the recoverWallet task on the iframe partially
        // blocks the renderer, so the animation stutters and doesn't look good
        transition: none;
      }
    `}
`},18532:function(e,r,t){t.d(r,{S:function(){return z}});var i=t(89418),o=t(4753),n=t(43803),a=t(61318),l=t(13188),s=t(99539);let c=n.zo.div`
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
`,u=(0,n.zo)(l.M)`
  margin: 0 -8px;
`,v=n.zo.div`
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
`,h=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,g=n.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,f=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,x=n.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,m=n.zo.p`
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
`,z=({children:e,...r})=>(0,i.jsx)(c,{children:(0,i.jsx)(d,{...r,children:e})}),j=n.zo.div`
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
`,E=n.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:e})=>e?(0,i.jsx)(j,{children:(0,i.jsx)(E,{pct:Math.min(100,e.current/e.total*100)})}):null;z.Header=({title:e,subtitle:r,icon:t,iconVariant:o,iconLoadingStatus:n,showBack:a,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:v,step:h,headerTitle:y,...b})=>(0,i.jsxs)(p,{...b,children:[(0,i.jsx)(u,{backFn:a?l:void 0,infoFn:s?c:void 0,onClose:d?v:void 0,title:y,closeable:d}),(t||o||e||r)&&(0,i.jsxs)(g,{children:[t||o?(0,i.jsx)(z.Icon,{icon:t,variant:o,loadingStatus:n}):null,!(!e&&!r)&&(0,i.jsxs)(f,{children:[e&&(0,i.jsx)(x,{children:e}),r&&(0,i.jsx)(m,{children:r})]})]}),h&&(0,i.jsx)(S,{step:h})]}),(z.Body=o.forwardRef(({children:e,...r},t)=>(0,i.jsx)(v,{ref:t,...r,children:e}))).displayName="Screen.Body",z.Footer=({children:e,...r})=>(0,i.jsx)(h,{id:"privy-content-footer-container",...r,children:e}),z.Actions=({children:e,...r})=>(0,i.jsx)(C,{...r,children:e}),z.HelpText=({children:e,...r})=>(0,i.jsx)($,{...r,children:e}),z.FooterText=({children:e,...r})=>(0,i.jsx)(A,{...r,children:e}),z.Watermark=()=>(0,i.jsx)(k,{}),z.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(b,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,i.jsx)(w,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(a.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(y,{$variant:r,children:(0,i.jsx)(s.N,{size:"64px"})}):(0,i.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let C=n.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,$=n.zo.div`
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
`,A=n.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},99539:function(e,r,t){t.d(r,{N:function(){return n}});var i=t(89418),o=t(43803);let n=({size:e,centerIcon:r})=>(0,i.jsx)(a,{$size:e,children:(0,i.jsxs)(l,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(s,{children:r}):null]})}),a=o.zo.div`
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
`},58438:function(e,r,t){t.d(r,{D:function(){return m},E:function(){return p},H:function(){return j},I:function(){return w},N:function(){return u},P:function(){return f},R:function(){return z},S:function(){return k},a:function(){return h},b:function(){return x},c:function(){return d},d:function(){return y},e:function(){return E},f:function(){return g},g:function(){return b}});var i=t(4753);let o=i.forwardRef(function(e,r){let{title:t,titleId:o,...n}=e;return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":o},n),t?i.createElement("title",{id:o},t):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"}))}),n=i.forwardRef(function(e,r){let{title:t,titleId:o,...n}=e;return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":o},n),t?i.createElement("title",{id:o},t):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"}),i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"}))}),a=i.forwardRef(function(e,r){let{title:t,titleId:o,...n}=e;return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":o},n),t?i.createElement("title",{id:o},t):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"}))});var l=t(43803),s=t(13188);let c=(0,l.iv)`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.008px;
  text-align: left;
  transition: color 0.1s ease-in;
`,d=l.zo.span`
  ${c}
  transition: color 0.1s ease-in;
  color: ${({error:e})=>e?"var(--privy-color-error)":"var(--privy-color-foreground-3)"};
  text-transform: ${({error:e})=>e?"":"capitalize"};

  &[aria-hidden='true'] {
    visibility: hidden;
  }
`,p=l.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
`,u=(0,l.zo)(s.P)`
  ${({$hideAnimations:e})=>e&&(0,l.iv)`
      && {
        transition: none;
      }
    `}
`,v=(0,l.iv)`
  && {
    width: 100%;
    border-width: 1px;
    border-radius: var(--privy-border-radius-md);
    border-color: var(--privy-color-foreground-3);
    background: var(--privy-color-background);
    color: var(--privy-color-foreground);

    padding: 12px;
    font-size: 16px;
    font-style: normal;
    font-weight: 300;
    line-height: 22px; /* 137.5% */
  }
`,h=l.zo.input`
  ${v}

  &::placeholder {
    color: var(--privy-color-foreground-3);
    font-style: italic;
    font-size: 14px;
  }

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,g=l.zo.div`
  ${v}
`,f=l.zo.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: ${({centered:e})=>e?"center":"space-between"};
`,x=l.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 32px 0;
  gap: 4px;

  & h3 {
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: 24px;
  }

  & p {
    max-width: 300px;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
`,m=l.zo.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 1rem;
`,y=l.zo.div`
  display: flex;
  text-align: left;
  align-items: center;

  gap: 8px;
  max-width: 300px;

  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.008px;

  margin: 0 8px;
  color: var(--privy-color-foreground-2);

  > :first-child {
    min-width: 24px;
  }
`;l.zo.div`
  height: var(--privy-height-modal-full);

  @media (max-width: 440px) {
    height: var(--privy-height-modal-compact);
  }
`;let b=(0,l.zo)(s.a)`
  display: flex;
  flex: 1;
  gap: 4px;
  justify-content: center;

  && {
    background: var(--privy-color-background);
    border-radius: var(--privy-border-radius-md);
    border-color: var(--privy-color-foreground-3);
    border-width: 1px;
  }
`,w=l.zo.div`
  position: absolute;
  right: 0.5rem;

  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`,z=(0,l.zo)(o)`
  height: 1.25rem;
  width: 1.25rem;
  stroke: var(--privy-color-accent);
  cursor: pointer;

  :active {
    stroke: var(--privy-color-accent-light);
  }
`,j=(0,l.zo)(a)`
  height: 1.25rem;
  width: 1.25rem;
  stroke: var(--privy-color-accent);
  cursor: pointer;

  :active {
    stroke: var(--privy-color-accent-light);
  }
`,k=(0,l.zo)(n)`
  height: 1.25rem;
  width: 1.25rem;
  stroke: var(--privy-color-accent);
  cursor: pointer;

  :active {
    stroke: var(--privy-color-accent-light);
  }
`,E=l.zo.progress`
  height: 4px;
  width: 100%;
  margin: 8px 0;

  /* border-radius: 9999px; */
  ::-webkit-progress-bar {
    border-radius: 8px;
    background: var(--privy-color-foreground-4);
  }

  ::-webkit-progress-value {
    border-radius: 8px;
    transition: all 0.1s ease-out;
    background: ${({label:e})=>("Strong"===e?"#78dca6":"Medium"===e&&"var(--privy-color-warn)")||"var(--privy-color-error)"};
  }
`}}]);