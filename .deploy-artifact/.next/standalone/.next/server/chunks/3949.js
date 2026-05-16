"use strict";exports.id=3949,exports.ids=[3949],exports.modules={96298:(e,r,i)=>{i.d(r,{Z:()=>o});let o=(0,i(5670).Z)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]])},98639:(e,r,i)=>{i.d(r,{Z:()=>t});var o=i(26510);let t=o.forwardRef(function({title:e,titleId:r,...i},t){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},i),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"}))})},66642:(e,r,i)=>{i.d(r,{E:()=>n,I:()=>d,a:()=>l});var o=i(96419),t=i(73993);let a=o.zo.label`
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
`},38198:(e,r,i)=>{i.d(r,{B:()=>t,C:()=>l,F:()=>s,H:()=>n,R:()=>u,S:()=>p,a:()=>c,b:()=>g,c:()=>d,d:()=>h,e:()=>a});var o=i(96419);let t=o.zo.div`
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
`;let h=o.zo.div`
  height: ${e=>e.height??"12"}px;
`;o.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},17846:(e,r,i)=>{i.d(r,{S:()=>j});var o=i(4913),t=i(26510),a=i(96419),n=i(13813),l=i(38102),d=i(90684);let s=a.zo.div`
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
`,h=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,x=a.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,v=a.zo.div`
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
`,b=a.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,y=a.zo.div`
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
`,j=({children:e,...r})=>(0,o.jsx)(s,{children:(0,o.jsx)(c,{...r,children:e})}),z=a.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,k=(0,a.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,E=a.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:e})=>e?(0,o.jsx)(z,{children:(0,o.jsx)(E,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:a,showBack:n,onBack:l,showInfo:d,onInfo:s,showClose:c,onClose:u,step:h,headerTitle:b,...y})=>(0,o.jsxs)(p,{...y,children:[(0,o.jsx)(g,{backFn:n?l:void 0,infoFn:d?s:void 0,onClose:c?u:void 0,title:b,closeable:c}),(i||t||e||r)&&(0,o.jsxs)(x,{children:[i||t?(0,o.jsx)(j.Icon,{icon:i,variant:t,loadingStatus:a}):null,!(!e&&!r)&&(0,o.jsxs)(v,{children:[e&&(0,o.jsx)(f,{children:e}),r&&(0,o.jsx)(m,{children:r})]})]}),h&&(0,o.jsx)(S,{step:h})]}),(j.Body=t.forwardRef(({children:e,...r},i)=>(0,o.jsx)(u,{ref:i,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,o.jsx)(h,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,o.jsx)($,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,o.jsx)(C,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,o.jsx)(A,{...r,children:e}),j.Watermark=()=>(0,o.jsx)(k,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,o.jsx)(y,"string"==typeof e?{children:(0,o.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,o.jsx)(w,{children:(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,o.jsx)(n.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,o.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,o.jsx)(b,{$variant:r,children:(0,o.jsx)(d.N,{size:"64px"})}):(0,o.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,o.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let $=a.zo.div`
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
`,A=a.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,i)=>{i.d(r,{S:()=>n});var o=i(4913),t=i(38102),a=i(17846);let n=({primaryCta:e,secondaryCta:r,helpText:i,footerText:n,watermark:l=!0,children:d,...s})=>{let c=e||r?(0,o.jsxs)(o.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,a=i.variant||"primary";return(0,o.jsx)(t.a,{...i,variant:a,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,a=i.variant||"secondary";return(0,o.jsx)(t.a,{...i,variant:a,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,o.jsxs)(a.S,{id:s.id,className:s.className,children:[(0,o.jsx)(a.S.Header,{...s}),d?(0,o.jsx)(a.S.Body,{children:d}):null,i||c||l?(0,o.jsxs)(a.S.Footer,{children:[i?(0,o.jsx)(a.S.HelpText,{children:i}):null,c?(0,o.jsx)(a.S.Actions,{children:c}):null,l?(0,o.jsx)(a.S.Watermark,{}):null]}):null,n?(0,o.jsx)(a.S.FooterText,{children:n}):null]})}},3949:(e,r,i)=>{i.r(r),i.d(r,{UpdateEmailScreen:()=>j,UpdateEmailScreenView:()=>w,default:()=>j});var o=i(4913),t=i(98639),a=i(38198),n=i(96298),l=i(26510),d=i(14348),s=i(45592),c=i(49171),p=i(55182),g=i(13813),u=i(22554),h=i(38102),x=i(66642),v=i(73993),f=i(77681);i(50470),i(36577),i(46898),i(42330),i(84440);let m=(0,l.forwardRef)((e,r)=>{let[i,t]=(0,l.useState)(""),[a,x]=(0,l.useState)(""),[f,m]=(0,l.useState)(!1),{authenticated:w,user:j}=(0,p.u)(),{initUpdateEmail:z}=(0,c.u)(),{navigate:k,setModalData:E,currentScreen:S}=(0,p.a)(),{enabled:$,token:C}=(0,s.a)(),A=(0,d.u)(),F=(0,u.D)(i)&&(A.disablePlusEmails&&i.includes("+")?(a||x("Please enter a valid email address without a '+'."),!1):(a&&x(""),!0)),T=f||!F,I=()=>{T||(!$||C||w?(async e=>{if(!j?.email)throw Error("User is required to have an email address to update it.");m(!0);try{await z({oldAddress:j.email.address,newAddress:i,captchaToken:e}),k("AwaitingPasswordlessCodeScreen")}catch(e){E({errorModalData:{error:e,previousScreen:S||"LandingScreen"}}),k("ErrorScreen")}m(!1)})(C):(E({captchaModalData:{callback:e=>{if(!j?.email)throw Error("User is required to have an email address to update it.");return z({oldAddress:j.email.address,newAddress:i,captchaToken:e})},userIntentRequired:!1,onSuccessNavigateTo:"AwaitingPasswordlessCodeScreen",onErrorNavigateTo:"ErrorScreen"}}),k("CaptchaScreen")))};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)(b,{children:[a&&(0,o.jsx)(v.E,{style:{marginTop:"0.25rem",textAlign:"left"},children:a}),(0,o.jsxs)(y,{$error:!!a,children:[(0,o.jsx)(g.C,{children:(0,o.jsx)(n.Z,{})}),(0,o.jsx)("input",{ref:r,id:"email-input",type:"email",placeholder:"your@email.com",onChange:e=>t(e.target.value),onKeyUp:e=>{"Enter"===e.key&&I()},value:i,autoComplete:"email"}),e.stacked?null:(0,o.jsx)(h.E,{isSubmitting:f,onClick:I,disabled:T,children:"Submit"})]})]}),e.stacked?(0,o.jsx)(h.P,{loadingText:null,loading:f,disabled:T,onClick:I,style:{width:"100%"},children:"Submit"}):null]})}),b=x.I,y=x.E,w=({title:e="Update your email",subtitle:r="Add the email address you'd like to use going forward. We'll send you a confirmation code"})=>(0,o.jsx)(f.S,{title:e,subtitle:r,icon:t.Z,watermark:!0,children:(0,o.jsx)(a.B,{children:(0,o.jsx)(m,{stacked:!0})})}),j={component:()=>(0,o.jsx)(w,{})}},90684:(e,r,i)=>{i.d(r,{N:()=>a});var o=i(4913),t=i(96419);let a=({size:e,centerIcon:r})=>(0,o.jsx)(n,{$size:e,children:(0,o.jsxs)(l,{children:[(0,o.jsx)(s,{}),(0,o.jsx)(c,{}),r?(0,o.jsx)(d,{children:r}):null]})}),n=t.zo.div`
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