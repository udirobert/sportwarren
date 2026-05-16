"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6845],{35460:function(e,r,n){n.d(r,{C:function(){return s}});var o=n(89418),t=n(43803),a=n(97849);let s=({children:e,color:r,isLoading:n,isPulsing:t,...a})=>(0,o.jsx)(i,{$color:r,$isLoading:n,$isPulsing:t,...a,children:e}),i=t.zo.span`
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem; /* 150% */
  border-radius: var(--privy-border-radius-xs);
  display: flex;
  align-items: center;
  ${e=>{let r,n;"green"===e.$color&&(r="var(--privy-color-success-dark)",n="var(--privy-color-success-light)"),"red"===e.$color&&(r="var(--privy-color-error)",n="var(--privy-color-error-light)"),"gray"===e.$color&&(r="var(--privy-color-foreground-2)",n="var(--privy-color-background-2)");let o=(0,t.F4)`
      from, to {
        background-color: ${n};
      }

      50% {
        background-color: rgba(${n}, 0.8);
      }
    `;return(0,t.iv)`
      color: ${r};
      background-color: ${n};
      ${e.$isPulsing&&(0,t.iv)`
        animation: ${o} 3s linear infinite;
      `};
    `}}

  ${a.L}
`},97849:function(e,r,n){n.d(r,{L:function(){return a}});var o=n(43803);let t=(0,o.F4)`
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
`},12804:function(e,r,n){n.r(r),n.d(r,{MfaAuthEnrollmentFlowScreen:function(){return m},default:function(){return m}});var o=n(89418),t=n(52223),a=n(84978),s=n(4753),i=n(13188),l=n(61318),c=n(64982),u=n(9201),d=n(83960),h=n(29713);n(78439),n(55982),n(96257),n(94936),n(21628),n(2892);let m={component:()=>{let{user:e,ready:r}=(0,u.u)(),{data:n,onUserCloseViaDialogOrKeybindRef:m}=(0,u.a)(),f=(0,c.u)(),[y,v]=(0,s.useState)(null),[g,p]=(0,s.useState)(null),[x,j]=(0,s.useState)(null),[k,b]=(0,s.useState)(!1),[M,w]=(0,s.useState)(!1),[$,C]=(0,s.useState)(),F=async()=>{$?S($):e?await E({user:e}):S(Error("Must be logged in to manage MFA")),setTimeout(()=>{v(null),p(null)},500)};if(m.current=F,!n?.mfaEnroll)throw Error("Missing modal data for MFA enrollment screen.");let{onFailure:S,onSuccess:E,onBack:A,mfaMethods:P,verify:R,generateTotpSecret:T,enrollTotp:L,unenrollTotp:B,enrollPasskey:I}=n.mfaEnroll,U=e?.mfaMethods.includes("sms"),_=e?.mfaMethods.includes("totp"),N=e?.mfaMethods.includes("passkey"),Z=!!e?.phone,z=e?.linkedAccounts.filter(e=>"passkey"===e.type).map(e=>e.credentialId)??[];function O(){v(null),p(null),C(void 0)}async function W(e=z){try{C(void 0),w(!0);let r=await I(e);return await E({user:r})}catch(e){C(e)}finally{w(!1),b(!1)}}if(!r||!e||!f)return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(i.M,{onClose:F,backFn:A},"header"),(0,o.jsx)(h.A,{children:(0,o.jsx)(d.M,{})}),(0,o.jsx)(h.C,{children:(0,o.jsx)(l.L,{})}),(0,o.jsx)(i.b,{})]});if("sms"===y)return null;if("totp"===y)return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(i.M,{backFn:O,onClose:F},"header"),(0,o.jsx)(h.I,{style:{marginBottom:"1.5rem"},children:(0,o.jsx)(t.Z,{})}),(0,o.jsx)(h.T,{children:"Remove authenticator app verification?"}),(0,o.jsxs)(h.S,{children:["MFA adds an extra layer of security to your ",f?.name," account. Make sure you have other methods to secure your account."]}),(0,o.jsx)(h.B,{children:(0,o.jsx)(i.P,{$warn:!0,onClick:async function(){try{C(void 0),w(!0);let e=await B();return await E({user:e})}catch(e){C(e)}finally{w(!1),v(null)}},loading:M,children:"Remove"})}),(0,o.jsx)(i.b,{})]});if("passkey"===y){let e=n.mfaEnroll.shouldUnlinkOnUnenrollMfa??!0;return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(i.M,{backFn:O,onClose:F},"header"),(0,o.jsx)(h.I,{style:{marginBottom:"1.5rem"},children:(0,o.jsx)(t.Z,{})}),(0,o.jsx)(h.T,{children:"Are you sure you want to remove this passkey?"}),(0,o.jsx)(h.S,{children:e?"Removing your passkey will remove as both a verification method and a login method.":"Removing your passkey will remove as a verification method."}),(0,o.jsx)(h.B,{children:(0,o.jsx)(i.P,{$warn:!0,onClick:async function(){try{C(void 0),w(!0);let e=await I([]);return await E({user:e})}catch(e){C(e)}finally{w(!1),v(null)}},loading:M,children:"Remove"})}),(0,o.jsx)(i.b,{})]})}return 0!==P.length||U||_||N?"sms"===g?null:"totp"===g&&x?(0,o.jsx)(d.E,{onClose:F,onReset:O,submitEnrollmentWithTotp:e=>(async function(e){try{C(void 0),w(!0);let r=await L(e);return await E({user:r})}catch(e){C(e)}finally{w(!1),v(null)}})(e.mfaCode),error:$,totpInfo:{...x,appName:f?.name||"Privy"}}):"passkey"===g?(0,o.jsx)(d.a,{onReset:O,onClose:F,submitEnrollmentWithPasskey:W}):(0,o.jsx)(d.b,{showIntro:!0,userMfaMethods:e.mfaMethods,appMfaMethods:f.mfa.methods,userHasAuthSms:Z,backFn:A,handleSelectMethod:async function(e){C(void 0);try{await R()}catch(e){return void C(e)}return"totp"===e?(p(e),j(null),void T().then(({totpSecret:e,totpAuthUrl:r})=>{j({authUrl:r,secret:e})}).catch(()=>{j(null),O()})):"passkey"===e&&1===z.length?await W():void p(e)},isTotpLoading:"totp"===g&&!x,isPasskeyLoading:k,error:$,onClose:F,setRemovingMfaMethod:async function(e){C(void 0);try{await R()}catch(e){return void C(e)}v(e)}}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(i.M,{onClose:F,backFn:A},"header"),(0,o.jsx)(h.I,{style:{marginBottom:"1.5rem"},children:(0,o.jsx)(a.Z,{})}),(0,o.jsx)(h.T,{children:"Add more security"}),(0,o.jsxs)(h.S,{children:[f?.name," does not have any verification methods enabled."]}),(0,o.jsx)(h.B,{children:(0,o.jsx)(i.P,{onClick:F,children:"Close"})}),(0,o.jsx)(i.b,{})]})}}}}]);