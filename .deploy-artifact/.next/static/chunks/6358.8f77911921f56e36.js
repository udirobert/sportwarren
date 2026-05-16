"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6358],{62259:function(r,e,i){i.d(e,{Z:function(){return o}});let o=(0,i(79095).Z)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]])},49111:function(r,e,i){var o=i(4753);let n=o.forwardRef(function(r,e){let{title:i,titleId:n,...t}=r;return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:e,"aria-labelledby":n},t),i?o.createElement("title",{id:n},i):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"}))});e.Z=n},35460:function(r,e,i){i.d(e,{C:function(){return a}});var o=i(89418),n=i(43803),t=i(97849);let a=({children:r,color:e,isLoading:i,isPulsing:n,...t})=>(0,o.jsx)(l,{$color:e,$isLoading:i,$isPulsing:n,...t,children:r}),l=n.zo.span`
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem; /* 150% */
  border-radius: var(--privy-border-radius-xs);
  display: flex;
  align-items: center;
  ${r=>{let e,i;"green"===r.$color&&(e="var(--privy-color-success-dark)",i="var(--privy-color-success-light)"),"red"===r.$color&&(e="var(--privy-color-error)",i="var(--privy-color-error-light)"),"gray"===r.$color&&(e="var(--privy-color-foreground-2)",i="var(--privy-color-background-2)");let o=(0,n.F4)`
      from, to {
        background-color: ${i};
      }

      50% {
        background-color: rgba(${i}, 0.8);
      }
    `;return(0,n.iv)`
      color: ${e};
      background-color: ${i};
      ${r.$isPulsing&&(0,n.iv)`
        animation: ${o} 3s linear infinite;
      `};
    `}}

  ${t.L}
`},75732:function(r,e,i){i.d(e,{C:function(){return f}});var o=i(89418),n=i(62259),t=i(4753),a=i(43803),l=i(64982),c=i(5430),d=i(3010),s=i(9201),p=i(61318),u=i(40099),g=i(13188),v=i(35460),h=i(49134),x=i(41815);let f=(0,t.forwardRef)((r,e)=>{let[i,a]=(0,t.useState)(r.defaultValue||""),[h,f]=(0,t.useState)(""),[w,k]=(0,t.useState)(!1),{authenticated:j}=(0,s.u)(),{initLoginWithEmail:z}=(0,d.u)(),{navigate:$,setModalData:S,currentScreen:E,data:C}=(0,s.a)(),{enabled:F,token:T}=(0,c.a)(),[L,A]=(0,t.useState)(!1),{accountType:N}=(0,p.r)(),I=(0,l.u)(),P=(0,u.D)(i)&&(I.disablePlusEmails&&i.includes("+")?(h||f("Please enter a valid email address without a '+'."),!1):(h&&f(""),!0)),B=w||!P,M=()=>{B||(S({login:C?.login,inlineError:void 0}),!F||T||j?(k(!0),z({email:i,captchaToken:T,disableSignup:C?.login?.disableSignup,withPrivyUi:!0}).then(()=>{$("AwaitingPasswordlessCodeScreen")}).catch(r=>{S({errorModalData:{error:r,previousScreen:E||"LandingScreen"}}),$("ErrorScreen")}).finally(()=>{k(!1)})):(S({captchaModalData:{callback:r=>z({email:i,captchaToken:r,withPrivyUi:!0}),userIntentRequired:!1,onSuccessNavigateTo:"AwaitingPasswordlessCodeScreen",onErrorNavigateTo:"ErrorScreen"}}),$("CaptchaScreen")))};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)(m,{children:[h&&(0,o.jsx)(x.E,{style:{display:"block",marginTop:"0.25rem",textAlign:"left"},children:h}),(0,o.jsxs)(y,{stacked:r.stacked,$error:!!h,children:[(0,o.jsx)(b,{children:(0,o.jsx)(n.Z,{})}),(0,o.jsx)("input",{ref:e,id:"email-input",className:"login-method-button",type:"email",placeholder:"your@email.com",onFocus:()=>A(!0),onChange:r=>a(r.target.value),onKeyUp:r=>{"Enter"===r.key&&M()},value:i,autoComplete:"email"}),"email"!==N||L?r.stacked?(0,o.jsx)("span",{}):(0,o.jsx)(g.E,{isSubmitting:w,onClick:M,disabled:B,children:"Submit"}):(0,o.jsx)(v.C,{color:"gray",children:"Recent"})]})]}),r.stacked?(0,o.jsx)(g.P,{loadingText:null,loading:w,disabled:B,onClick:M,style:{width:"100%"},children:"Submit"}):null]})}),m=h.I,y=h.a,b=(0,a.zo)(p.C)`
  display: inline-flex;
`},49134:function(r,e,i){i.d(e,{E:function(){return a},I:function(){return c},a:function(){return l}});var o=i(43803),n=i(41815);let t=o.zo.label`
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
      ${({$error:r})=>r?"var(--privy-color-error) !important":"var(--privy-color-foreground-4)"};
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
      border-color: ${({$error:r})=>r?"var(--privy-color-error) !important":"var(--privy-color-accent-light)"};
      box-shadow: ${({$error:r})=>r?"none":"0 0 0 1px var(--privy-color-accent-light)"};
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
`,a=(0,o.zo)(t)`
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
`,l=(0,o.zo)(t)`
  && > input {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    padding-right: ${r=>r.$stacked?"16px":"88px"};

    border: 1px solid
      ${({$error:r})=>r?"var(--privy-color-error) !important":"var(--privy-color-foreground-4)"};

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
`,c=o.zo.div`
  width: 100%;

  /* Add styling for the ErrorMessage within EmailInput */
  && > ${n.E} {
    display: block;
    text-align: left;
    padding-left: var(--privy-border-radius-md);
    padding-bottom: 5px;
  }
`},41815:function(r,e,i){i.d(e,{E:function(){return n}});var o=i(43803);let n=o.zo.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`},94923:function(r,e,i){i.d(e,{B:function(){return n},C:function(){return l},F:function(){return d},H:function(){return a},R:function(){return g},S:function(){return p},a:function(){return s},b:function(){return u},c:function(){return c},d:function(){return v},e:function(){return t}});var o=i(43803);let n=o.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,t=o.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,a=o.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,o.zo)(t)`
  padding: 20px 0;
`,c=(0,o.zo)(t)`
  gap: 16px;
`,d=o.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,s=o.zo.div`
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
`,u=o.zo.div`
  height: 16px;
`,g=o.zo.div`
  height: 12px;
`;o.zo.div`
  position: relative;
`;let v=o.zo.div`
  height: ${r=>r.height??"12"}px;
`;o.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},46358:function(r,e,i){i.r(e),i.d(e,{LinkEmailScreen:function(){return s},LinkEmailScreenView:function(){return d},default:function(){return s}});var o=i(89418),n=i(49111),t=i(75732),a=i(94923),l=i(64982),c=i(35868);i(4753),i(78439),i(55982),i(94936),i(21628),i(96257);let d=({title:r="Connect your email",subtitle:e="Add your email to your account"})=>(0,o.jsx)(c.S,{title:r,subtitle:e,icon:n.Z,watermark:!0,children:(0,o.jsx)(a.B,{children:(0,o.jsx)(t.C,{stacked:!0})})}),s={component:()=>{let r=(0,l.u)();return(0,o.jsx)(d,{subtitle:`Add your email to your ${r?.name} account`})}}},97849:function(r,e,i){i.d(e,{L:function(){return t}});var o=i(43803);let n=(0,o.F4)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,t=(0,o.iv)`
  ${r=>r.$isLoading?(0,o.iv)`
          width: 35%;
          animation: ${n} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},18532:function(r,e,i){i.d(e,{S:function(){return k}});var o=i(89418),n=i(4753),t=i(43803),a=i(61318),l=i(13188),c=i(99539);let d=t.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,s=t.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=t.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,u=(0,t.zo)(l.M)`
  margin: 0 -8px;
`,g=t.zo.div`
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
  ${({$colorScheme:r})=>"light"===r?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.06)) bottom;":"dark"===r?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.06)) bottom;":void 0}

  background-repeat: no-repeat;
  background-size:
    100% 32px,
    100% 16px;
  background-attachment: local, scroll;
`,v=t.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,h=t.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,x=t.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=t.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,m=t.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,y=t.zo.div`
  background: ${({$variant:r})=>{switch(r){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=t.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=t.zo.div`
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
`,k=({children:r,...e})=>(0,o.jsx)(d,{children:(0,o.jsx)(s,{...e,children:r})}),j=t.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,z=(0,t.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,$=t.zo.div`
  height: 100%;
  width: ${({pct:r})=>r}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:r})=>r?(0,o.jsx)(j,{children:(0,o.jsx)($,{pct:Math.min(100,r.current/r.total*100)})}):null;k.Header=({title:r,subtitle:e,icon:i,iconVariant:n,iconLoadingStatus:t,showBack:a,onBack:l,showInfo:c,onInfo:d,showClose:s,onClose:g,step:v,headerTitle:y,...b})=>(0,o.jsxs)(p,{...b,children:[(0,o.jsx)(u,{backFn:a?l:void 0,infoFn:c?d:void 0,onClose:s?g:void 0,title:y,closeable:s}),(i||n||r||e)&&(0,o.jsxs)(h,{children:[i||n?(0,o.jsx)(k.Icon,{icon:i,variant:n,loadingStatus:t}):null,!(!r&&!e)&&(0,o.jsxs)(x,{children:[r&&(0,o.jsx)(f,{children:r}),e&&(0,o.jsx)(m,{children:e})]})]}),v&&(0,o.jsx)(S,{step:v})]}),(k.Body=n.forwardRef(({children:r,...e},i)=>(0,o.jsx)(g,{ref:i,...e,children:r}))).displayName="Screen.Body",k.Footer=({children:r,...e})=>(0,o.jsx)(v,{id:"privy-content-footer-container",...e,children:r}),k.Actions=({children:r,...e})=>(0,o.jsx)(E,{...e,children:r}),k.HelpText=({children:r,...e})=>(0,o.jsx)(C,{...e,children:r}),k.FooterText=({children:r,...e})=>(0,o.jsx)(F,{...e,children:r}),k.Watermark=()=>(0,o.jsx)(z,{}),k.Icon=({icon:r,variant:e="subtle",loadingStatus:i})=>"logo"===e&&r?(0,o.jsx)(b,"string"==typeof r?{children:(0,o.jsx)("img",{src:r,alt:""})}:n.isValidElement(r)?{children:r}:{children:n.createElement(r)}):"loading"===e?r?(0,o.jsx)(w,{children:(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,o.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof r?(0,o.jsx)("span",{style:{background:`url('${r}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(r)?n.cloneElement(r,{style:{width:"38px",height:"38px"}}):n.createElement(r,{style:{width:"38px",height:"38px"}})]})}):(0,o.jsx)(y,{$variant:e,children:(0,o.jsx)(c.N,{size:"64px"})}):(0,o.jsx)(y,{$variant:e,children:r&&("string"==typeof r?(0,o.jsx)("img",{src:r,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(r)?r:n.createElement(r,{width:32,height:32,stroke:(()=>{switch(e){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=t.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,C=t.zo.div`
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
`,F=t.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},35868:function(r,e,i){i.d(e,{S:function(){return a}});var o=i(89418),n=i(13188),t=i(18532);let a=({primaryCta:r,secondaryCta:e,helpText:i,footerText:a,watermark:l=!0,children:c,...d})=>{let s=r||e?(0,o.jsxs)(o.Fragment,{children:[r&&(()=>{let{label:e,...i}=r,t=i.variant||"primary";return(0,o.jsx)(n.a,{...i,variant:t,style:{width:"100%",...i.style},children:e})})(),e&&(()=>{let{label:r,...i}=e,t=i.variant||"secondary";return(0,o.jsx)(n.a,{...i,variant:t,style:{width:"100%",...i.style},children:r})})()]}):null;return(0,o.jsxs)(t.S,{id:d.id,className:d.className,children:[(0,o.jsx)(t.S.Header,{...d}),c?(0,o.jsx)(t.S.Body,{children:c}):null,i||s||l?(0,o.jsxs)(t.S.Footer,{children:[i?(0,o.jsx)(t.S.HelpText,{children:i}):null,s?(0,o.jsx)(t.S.Actions,{children:s}):null,l?(0,o.jsx)(t.S.Watermark,{}):null]}):null,a?(0,o.jsx)(t.S.FooterText,{children:a}):null]})}},99539:function(r,e,i){i.d(e,{N:function(){return t}});var o=i(89418),n=i(43803);let t=({size:r,centerIcon:e})=>(0,o.jsx)(a,{$size:r,children:(0,o.jsxs)(l,{children:[(0,o.jsx)(d,{}),(0,o.jsx)(s,{}),e?(0,o.jsx)(c,{children:e}):null]})}),a=n.zo.div`
  --spinner-size: ${r=>r.$size?r.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=n.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,c=n.zo.div`
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
`,d=n.zo.div`
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
`,s=n.zo.div`
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