"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6288],{30897:function(e,r,t){var o=t(4753);let n=o.forwardRef(function(e,r){let{title:t,titleId:n,...i}=e;return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":n},i),t?o.createElement("title",{id:n},t):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))});r.Z=n},81868:function(e,r,t){var o=t(4753);let n=o.forwardRef(function(e,r){let{title:t,titleId:n,...i}=e;return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":n},i),t?o.createElement("title",{id:n},t):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"}))});r.Z=n},26288:function(e,r,t){t.r(r),t.d(r,{SetAutomaticRecoveryScreen:function(){return g},default:function(){return g}});var o=t(89418),n=t(30897),i=t(81868),l=t(4753),a=t(9201),s=t(13188),c=t(43803),d=t(34693),u=t(73764),f=t(64982),h=t(3010),y=t(61318);t(96257),t(78439),t(55982);let v=c.zo.div`
  && {
    border-width: 4px;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  aspect-ratio: 1;
  border-style: solid;
  border-color: ${e=>e.$color??"var(--privy-color-accent)"};
  border-radius: 50%;
`,g={component:()=>{let{user:e}=(0,a.u)(),{client:r,walletProxy:t,refreshSessionAndUser:c,closePrivyModal:g}=(0,h.u)(),w=(0,a.a)(),{entropyId:m,entropyIdVerifier:p}=w.data?.recoverWallet??{},[x,j]=(0,l.useState)(!1),[b,k]=(0,l.useState)(null),[S,E]=(0,l.useState)(null);function C(){if(!x){if(S)return w.data?.setWalletPassword?.onFailure(S),void g();if(!b)return w.data?.setWalletPassword?.onFailure(Error("User exited set recovery flow")),void g()}}return w.onUserCloseViaDialogOrKeybindRef.current=C,(0,o.jsxs)(o.Fragment,S?{children:[(0,o.jsx)(s.M,{onClose:C},"header"),(0,o.jsx)(v,{$color:"var(--privy-color-error)",style:{alignSelf:"center"},children:(0,o.jsx)(n.Z,{height:38,width:38,stroke:"var(--privy-color-error)"})}),(0,o.jsx)(u.T,{style:{marginTop:"0.5rem"},children:"Something went wrong"}),(0,o.jsx)(y.G,{style:{minHeight:"2rem"}}),(0,o.jsx)(s.c,{onClick:()=>E(null),children:"Try again"}),(0,o.jsx)(s.B,{})]}:{children:[(0,o.jsx)(s.M,{onClose:C},"header"),(0,o.jsx)(i.Z,{style:{width:"3rem",height:"3rem",alignSelf:"center"}}),(0,o.jsx)(u.T,{style:{marginTop:"0.5rem"},children:"Automatically secure your account"}),(0,o.jsx)(d.S,{style:{marginTop:"1rem"},children:"When you log into a new device, you’ll only need to authenticate to access your account. Never get logged out if you forget your password."}),(0,o.jsx)(y.G,{style:{minHeight:"2rem"}}),(0,o.jsx)(s.c,{loading:x,disabled:!(!x&&!b),onClick:()=>(async function(){j(!0);try{let o=await r.getAccessToken(),n=(0,a.j)(e,m);if(!o||!t||!n)return;if(!(await t.setRecovery({accessToken:o,entropyId:m,entropyIdVerifier:p,existingRecoveryMethod:n.recoveryMethod,recoveryMethod:"privy"})).entropyId)throw Error("Unable to set recovery on wallet");let i=await c();if(!i)throw Error("Unable to set recovery on wallet");let l=(0,a.j)(i,n.address);if(!l)throw Error("Unabled to set recovery on wallet");k(!!i),setTimeout(()=>{w.data?.setWalletPassword?.onSuccess(l),g()},f.q)}catch(e){E(e)}finally{j(!1)}})(),children:b?"Success":"Confirm"}),(0,o.jsx)(s.B,{})]})}}},34693:function(e,r,t){t.d(r,{S:function(){return n}});var o=t(43803);let n=o.zo.span`
  margin-top: 4px;
  color: var(--privy-color-foreground);
  text-align: center;

  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */

  && a {
    color: var(--privy-color-accent);
  }
`},73764:function(e,r,t){t.d(r,{T:function(){return n}});var o=t(43803);let n=o.zo.span`
  color: var(--privy-color-foreground);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.875rem; /* 166.667% */
  text-align: center;
`}}]);