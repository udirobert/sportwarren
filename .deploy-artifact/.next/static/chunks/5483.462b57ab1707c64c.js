"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5483],{15812:function(e,t,n){var r=n(4753);let i=r.forwardRef(function(e,t){let{title:n,titleId:i,...o}=e;return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":i},o),n?r.createElement("title",{id:i},n):null,r.createElement("path",{fillRule:"evenodd",d:"M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z",clipRule:"evenodd"}))});t.Z=i},15989:function(e,t,n){var r=n(4753);let i=r.forwardRef(function(e,t){let{title:n,titleId:i,...o}=e;return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":i},o),n?r.createElement("title",{id:i},n):null,r.createElement("path",{fillRule:"evenodd",d:"M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z",clipRule:"evenodd"}))});t.Z=i},15483:function(e,t,n){n.r(t),n.d(t,{CoinbaseOnrampStatusScreen:function(){return m},default:function(){return m}});var r=n(89418),i=n(15812),o=n(15989),a=n(4753),l=n(43803),s=n(13188),c=n(94923),d=n(61318),u=n(3010),f=n(9201),g=n(50472),p=n(5430);n(96257),n(78439),n(55982),n(94936),n(21628);let m={component:()=>{let{data:e,setModalData:t,navigate:n,navigateBack:i}=(0,f.a)(),{closePrivyModal:o,createAnalyticsEvent:l,client:c}=(0,u.u)(),[d,p]=(0,a.useState)("pending-in-flow"),m=(0,a.useRef)(0),v={...e?.funding,showAlternateFundingMethod:!0};v.usingDefaultFundingMethod&&(v.usingDefaultFundingMethod=!1);let{partnerUserId:x,popup:y}=e?.coinbaseOnrampStatus??{};return(0,a.useEffect)(()=>{if("pending-in-flow"===d||"pending-after-flow"===d){let r=setInterval(async()=>{if(x)try{let{status:r}=await c.getCoinbaseOnRampStatus({partnerUserId:x});if("success"===r)return void p("success");if("failure"===r)throw Error("There was an error completing Coinbase Onramp flow.");if(m.current>=3)return t({funding:v,solanaFundingData:e?.solanaFundingData}),void n("FundingMethodSelectionScreen");y?.closed&&(m.current=m.current+1,p("pending-after-flow"))}catch(r){console.error(r),p("error"),l({eventName:g.O,payload:{status:"failure",provider:"coinbase-onramp",error:r.message}}),t({funding:{...v,errorMessage:"Something went wrong adding funds. Please try again or use another method."},solanaFundingData:e?.solanaFundingData}),n("FundingMethodSelectionScreen")}},1500);return()=>clearInterval(r)}},[x,y,d]),(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(s.M,{title:"Fund account",backFn:()=>{t({funding:v,solanaFundingData:e?.solanaFundingData}),i()}},"header"),(0,r.jsx)(h,{status:d,onClickCta:o}),(0,r.jsx)(s.B,{})]})}},h=({status:e,onClickCta:t})=>{let{title:n,body:i,cta:o}=(0,a.useMemo)(()=>(e=>{switch(e){case"success":return{title:"You've funded your account!",body:"It may take a few minutes for the assets to appear.",cta:"Continue"};case"pending-after-flow":return{title:"In Progress",body:"Almost done. Retrieving transaction status from Coinbase",cta:""};case"error":case"pending-in-flow":return{title:"In Progress",body:"Go back to Coinbase Onramp to finish funding your account.",cta:""}}})(e),[e]);return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(y,{children:[(0,r.jsx)(v,{isSucccess:"success"===e}),(0,r.jsxs)(c.a,{children:[(0,r.jsx)("h3",{children:n}),(0,r.jsx)(x,{children:i})]})]}),o&&(0,r.jsx)(s.P,{onClick:t,children:o})]})},v=({isSucccess:e})=>{if(!e){let e="var(--privy-color-foreground-4)";return(0,r.jsxs)("div",{style:{position:"relative"},children:[(0,r.jsx)(d.L,{color:e,style:{position:"absolute"}}),(0,r.jsx)(d.O,{color:e}),(0,r.jsx)(p.F,{style:{position:"absolute",width:"2.8rem",height:"2.8rem",top:"1.2rem",left:"1.2rem"}})]})}let t=e?o.Z:()=>(0,r.jsx)(i.Z,{width:"3rem",height:"3rem",style:{backgroundColor:"var(--privy-color-foreground-4)",color:"var(--privy-color-background)",borderRadius:"100%",padding:"0.5rem",margin:"0.5rem"}}),n=e?"var(--privy-color-success)":"var(--privy-color-foreground-4)";return(0,r.jsx)("div",{style:{borderColor:n,display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"100%",borderWidth:2,padding:"0.5rem",marginBottom:"0.5rem"},children:t&&(0,r.jsx)(t,{width:"4rem",height:"4rem",color:n})})},x=l.zo.p`
  font-size: 1rem;
  color: var(--privy-color-foreground-3);
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,y=l.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 1.75rem;
  margin-right: 1.75rem;
  padding: 2rem 0;
`},94923:function(e,t,n){n.d(t,{B:function(){return i},C:function(){return l},F:function(){return c},H:function(){return a},R:function(){return g},S:function(){return u},a:function(){return d},b:function(){return f},c:function(){return s},d:function(){return p},e:function(){return o}});var r=n(43803);let i=r.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,o=r.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,a=r.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,r.zo)(o)`
  padding: 20px 0;
`,s=(0,r.zo)(o)`
  gap: 16px;
`,c=r.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,d=r.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;r.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let u=r.zo.div`
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
`,f=r.zo.div`
  height: 16px;
`,g=r.zo.div`
  height: 12px;
`;r.zo.div`
  position: relative;
`;let p=r.zo.div`
  height: ${e=>e.height??"12"}px;
`;r.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},50472:function(e,t,n){n.d(t,{O:function(){return r}});let r="sdk_fiat_on_ramp_completed_with_status"}}]);