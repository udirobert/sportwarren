"use strict";exports.id=8721,exports.ids=[8721],exports.modules={96298:(e,r,i)=>{i.d(r,{Z:()=>o});let o=(0,i(5670).Z)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]])},98639:(e,r,i)=>{i.d(r,{Z:()=>t});var o=i(26510);let t=o.forwardRef(function({title:e,titleId:r,...i},t){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},i),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"}))})},26550:(e,r,i)=>{i.d(r,{C:()=>n});var o=i(4913),t=i(96419),a=i(66461);let n=({children:e,color:r,isLoading:i,isPulsing:t,...a})=>(0,o.jsx)(l,{$color:r,$isLoading:i,$isPulsing:t,...a,children:e}),l=t.zo.span`
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem; /* 150% */
  border-radius: var(--privy-border-radius-xs);
  display: flex;
  align-items: center;
  ${e=>{let r,i;"green"===e.$color&&(r="var(--privy-color-success-dark)",i="var(--privy-color-success-light)"),"red"===e.$color&&(r="var(--privy-color-error)",i="var(--privy-color-error-light)"),"gray"===e.$color&&(r="var(--privy-color-foreground-2)",i="var(--privy-color-background-2)");let o=(0,t.F4)`
      from, to {
        background-color: ${i};
      }

      50% {
        background-color: rgba(${i}, 0.8);
      }
    `;return(0,t.iv)`
      color: ${r};
      background-color: ${i};
      ${e.$isPulsing&&(0,t.iv)`
        animation: ${o} 3s linear infinite;
      `};
    `}}

  ${a.L}
`},74719:(e,r,i)=>{i.d(r,{C:()=>f});var o=i(4913),t=i(96298),a=i(26510),n=i(96419),l=i(14348),d=i(45592),s=i(49171),c=i(55182),p=i(13813),g=i(22554),u=i(38102),v=i(26550),h=i(66642),x=i(73993);let f=(0,a.forwardRef)((e,r)=>{let[i,n]=(0,a.useState)(e.defaultValue||""),[h,f]=(0,a.useState)(""),[w,k]=(0,a.useState)(!1),{authenticated:j}=(0,c.u)(),{initLoginWithEmail:z}=(0,s.u)(),{navigate:$,setModalData:S,currentScreen:E,data:C}=(0,c.a)(),{enabled:F,token:T}=(0,d.a)(),[L,A]=(0,a.useState)(!1),{accountType:I}=(0,p.r)(),P=(0,l.u)(),B=(0,g.D)(i)&&(P.disablePlusEmails&&i.includes("+")?(h||f("Please enter a valid email address without a '+'."),!1):(h&&f(""),!0)),M=w||!B,N=()=>{M||(S({login:C?.login,inlineError:void 0}),!F||T||j?(k(!0),z({email:i,captchaToken:T,disableSignup:C?.login?.disableSignup,withPrivyUi:!0}).then(()=>{$("AwaitingPasswordlessCodeScreen")}).catch(e=>{S({errorModalData:{error:e,previousScreen:E||"LandingScreen"}}),$("ErrorScreen")}).finally(()=>{k(!1)})):(S({captchaModalData:{callback:e=>z({email:i,captchaToken:e,withPrivyUi:!0}),userIntentRequired:!1,onSuccessNavigateTo:"AwaitingPasswordlessCodeScreen",onErrorNavigateTo:"ErrorScreen"}}),$("CaptchaScreen")))};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)(m,{children:[h&&(0,o.jsx)(x.E,{style:{display:"block",marginTop:"0.25rem",textAlign:"left"},children:h}),(0,o.jsxs)(y,{stacked:e.stacked,$error:!!h,children:[(0,o.jsx)(b,{children:(0,o.jsx)(t.Z,{})}),(0,o.jsx)("input",{ref:r,id:"email-input",className:"login-method-button",type:"email",placeholder:"your@email.com",onFocus:()=>A(!0),onChange:e=>n(e.target.value),onKeyUp:e=>{"Enter"===e.key&&N()},value:i,autoComplete:"email"}),"email"!==I||L?e.stacked?(0,o.jsx)("span",{}):(0,o.jsx)(u.E,{isSubmitting:w,onClick:N,disabled:M,children:"Submit"}):(0,o.jsx)(v.C,{color:"gray",children:"Recent"})]})]}),e.stacked?(0,o.jsx)(u.P,{loadingText:null,loading:w,disabled:M,onClick:N,style:{width:"100%"},children:"Submit"}):null]})}),m=h.I,y=h.a,b=(0,n.zo)(p.C)`
  display: inline-flex;
`},66642:(e,r,i)=>{i.d(r,{E:()=>n,I:()=>d,a:()=>l});var o=i(96419),t=i(73993);let a=o.zo.label`
  display: block;
  position: relative;
  width: 100%;
  height: 56px;

  && > :first-child {
    position: absolute;
    left: 0.75em;
    top: 50%;
    transform: translate(0, -50%);
  }

  && > input {
    font-size: 16px;
    line-height: 24px;
    color: var(--privy-color-foreground);

    padding: 12px 88px 12px 52px;
    flex-grow: 1;
    background: var(--privy-color-background);
    border: 1px solid
      ${({$error:e})=>e?"var(--privy-color-error) !important":"var(--privy-color-foreground-4)"};
    border-radius: var(--privy-border-radius-md);
    width: 100%;
    height: 100%;

    /* Tablet and Up */
    @media (min-width: 441px) {
      font-size: 14px;
      padding-right: 78px;
    }

    :focus {
      outline: none;
      border-color: ${({$error:e})=>e?"var(--privy-color-error) !important":"var(--privy-color-accent-light)"};
      box-shadow: ${({$error:e})=>e?"none":"0 0 0 1px var(--privy-color-accent-light)"};
    }

    :autofill,
    :-webkit-autofill {
      background: var(--privy-color-background);
    }

    && > input::placeholder {
      color: var(--privy-color-foreground-3);
    }
    &:disabled {
      opacity: 0.4; /* Make it visually appear disabled */
      cursor: not-allowed; /* Change cursor to not-allowed */
    }
    &:disabled,
    &:disabled:hover,
    &:disabled > span {
      color: var(--privy-color-foreground-3); /* Change text color to grey */
    }
  }

  && > button:last-child {
    right: 0px;
    line-height: 24px;
    padding: 13px 17px;
    :focus {
      outline: none;
    }
    &:disabled {
      opacity: 0.4; /* Make it visually appear disabled */
      cursor: not-allowed; /* Change cursor to not-allowed */
    }
    &:disabled,
    &:disabled:hover,
    &:disabled > span {
      color: var(--privy-color-foreground-3); /* Change text color to grey */
    }
  }
`,n=(0,o.zo)(a)`
  background-color: var(--privy-color-background);
  transition: background-color 200ms ease;

  && > button {
    right: 0;
    line-height: 24px;
    position: absolute;
    padding: 13px 17px;
    background-color: #090;

    :focus {
      outline: none;
      border-color: var(--privy-color-accent);
    }
  }
`,l=(0,o.zo)(a)`
  && > input {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    padding-right: ${e=>e.$stacked?"16px":"88px"};

    border: 1px solid
      ${({$error:e})=>e?"var(--privy-color-error) !important":"var(--privy-color-foreground-4)"};

    && > input::placeholder {
      color: var(--privy-color-foreground-3);
    }
  }

  && > :last-child {
    right: 16px;
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
  }

  && > button:last-child {
    right: 0px;
    line-height: 24px;
    padding: 13px 17px;

    :focus {
      outline: none;
    }
  }
`,d=o.zo.div`
  width: 100%;

  /* Add styling for the ErrorMessage within EmailInput */
  && > ${t.E} {
    display: block;
    text-align: left;
    padding-left: var(--privy-border-radius-md);
    padding-bottom: 5px;
  }
`},73993:(e,r,i)=>{i.d(r,{E:()=>t});var o=i(96419);let t=o.zo.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`},38198:(e,r,i)=>{i.d(r,{B:()=>t,C:()=>l,F:()=>s,H:()=>n,R:()=>u,S:()=>p,a:()=>c,b:()=>g,c:()=>d,d:()=>v,e:()=>a});var o=i(96419);let t=o.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,a=o.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,n=o.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,o.zo)(a)`
  padding: 20px 0;
`,d=(0,o.zo)(a)`
  gap: 16px;
`,s=o.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,c=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;o.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let p=o.zo.div`
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
`,g=o.zo.div`
  height: 16px;
`,u=o.zo.div`
  height: 12px;
`;o.zo.div`
  position: relative;
`;let v=o.zo.div`
  height: ${e=>e.height??"12"}px;
`;o.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},50306:(e,r,i)=>{i.r(r),i.d(r,{LinkEmailScreen:()=>c,LinkEmailScreenView:()=>s,default:()=>c});var o=i(4913),t=i(98639),a=i(74719),n=i(38198),l=i(14348),d=i(77681);i(26510),i(36577),i(46898),i(42330),i(84440),i(50470);let s=({title:e="Connect your email",subtitle:r="Add your email to your account"})=>(0,o.jsx)(d.S,{title:e,subtitle:r,icon:t.Z,watermark:!0,children:(0,o.jsx)(n.B,{children:(0,o.jsx)(a.C,{stacked:!0})})}),c={component:()=>{let e=(0,l.u)();return(0,o.jsx)(s,{subtitle:`Add your email to your ${e?.name} account`})}}},66461:(e,r,i)=>{i.d(r,{L:()=>a});var o=i(96419);let t=(0,o.F4)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,a=(0,o.iv)`
  ${e=>e.$isLoading?(0,o.iv)`
          width: 35%;
          animation: ${t} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},17846:(e,r,i)=>{i.d(r,{S:()=>k});var o=i(4913),t=i(26510),a=i(96419),n=i(13813),l=i(38102),d=i(90684);let s=a.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,c=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=a.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,g=(0,a.zo)(l.M)`
  margin: 0 -8px;
`,u=a.zo.div`
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
`,v=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,h=a.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,x=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=a.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,m=a.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,y=a.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=a.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=a.zo.div`
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
`,k=({children:e,...r})=>(0,o.jsx)(s,{children:(0,o.jsx)(c,{...r,children:e})}),j=a.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,z=(0,a.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,$=a.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:e})=>e?(0,o.jsx)(j,{children:(0,o.jsx)($,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:a,showBack:n,onBack:l,showInfo:d,onInfo:s,showClose:c,onClose:u,step:v,headerTitle:y,...b})=>(0,o.jsxs)(p,{...b,children:[(0,o.jsx)(g,{backFn:n?l:void 0,infoFn:d?s:void 0,onClose:c?u:void 0,title:y,closeable:c}),(i||t||e||r)&&(0,o.jsxs)(h,{children:[i||t?(0,o.jsx)(k.Icon,{icon:i,variant:t,loadingStatus:a}):null,!(!e&&!r)&&(0,o.jsxs)(x,{children:[e&&(0,o.jsx)(f,{children:e}),r&&(0,o.jsx)(m,{children:r})]})]}),v&&(0,o.jsx)(S,{step:v})]}),(k.Body=t.forwardRef(({children:e,...r},i)=>(0,o.jsx)(u,{ref:i,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,o.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,o.jsx)(E,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,o.jsx)(C,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,o.jsx)(F,{...r,children:e}),k.Watermark=()=>(0,o.jsx)(z,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,o.jsx)(b,"string"==typeof e?{children:(0,o.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,o.jsx)(w,{children:(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,o.jsx)(n.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,o.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,o.jsx)(y,{$variant:r,children:(0,o.jsx)(d.N,{size:"64px"})}):(0,o.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,o.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=a.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,C=a.zo.div`
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
`,F=a.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,i)=>{i.d(r,{S:()=>n});var o=i(4913),t=i(38102),a=i(17846);let n=({primaryCta:e,secondaryCta:r,helpText:i,footerText:n,watermark:l=!0,children:d,...s})=>{let c=e||r?(0,o.jsxs)(o.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,a=i.variant||"primary";return(0,o.jsx)(t.a,{...i,variant:a,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,a=i.variant||"secondary";return(0,o.jsx)(t.a,{...i,variant:a,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,o.jsxs)(a.S,{id:s.id,className:s.className,children:[(0,o.jsx)(a.S.Header,{...s}),d?(0,o.jsx)(a.S.Body,{children:d}):null,i||c||l?(0,o.jsxs)(a.S.Footer,{children:[i?(0,o.jsx)(a.S.HelpText,{children:i}):null,c?(0,o.jsx)(a.S.Actions,{children:c}):null,l?(0,o.jsx)(a.S.Watermark,{}):null]}):null,n?(0,o.jsx)(a.S.FooterText,{children:n}):null]})}},90684:(e,r,i)=>{i.d(r,{N:()=>a});var o=i(4913),t=i(96419);let a=({size:e,centerIcon:r})=>(0,o.jsx)(n,{$size:e,children:(0,o.jsxs)(l,{children:[(0,o.jsx)(s,{}),(0,o.jsx)(c,{}),r?(0,o.jsx)(d,{children:r}):null]})}),n=t.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=t.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,d=t.zo.div`
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
`,s=t.zo.div`
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
`,c=t.zo.div`
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