"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2570],{86619:function(e,n,t){t.d(n,{Z:function(){return a}});let a=(0,t(79095).Z)("wallet",[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]])},41217:function(e,n,t){var a=t(4753);let o=a.forwardRef(function(e,n){let{title:t,titleId:o,...l}=e;return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":o},l),t?a.createElement("title",{id:o},t):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"}))});n.Z=o},35460:function(e,n,t){t.d(n,{C:function(){return i}});var a=t(89418),o=t(43803),l=t(97849);let i=({children:e,color:n,isLoading:t,isPulsing:o,...l})=>(0,a.jsx)(r,{$color:n,$isLoading:t,$isPulsing:o,...l,children:e}),r=o.zo.span`
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem; /* 150% */
  border-radius: var(--privy-border-radius-xs);
  display: flex;
  align-items: center;
  ${e=>{let n,t;"green"===e.$color&&(n="var(--privy-color-success-dark)",t="var(--privy-color-success-light)"),"red"===e.$color&&(n="var(--privy-color-error)",t="var(--privy-color-error-light)"),"gray"===e.$color&&(n="var(--privy-color-foreground-2)",t="var(--privy-color-background-2)");let a=(0,o.F4)`
      from, to {
        background-color: ${t};
      }

      50% {
        background-color: rgba(${t}, 0.8);
      }
    `;return(0,o.iv)`
      color: ${n};
      background-color: ${t};
      ${e.$isPulsing&&(0,o.iv)`
        animation: ${a} 3s linear infinite;
      `};
    `}}

  ${l.L}
`},87718:function(e,n,t){t.d(n,{t:function(){return i}});var a=t(89418),o=t(9201),l=t(13188);function i({title:e}){let{currentScreen:n,navigateBack:t,navigate:i,data:r,setModalData:c}=(0,o.a)();return(0,a.jsx)(l.M,{title:e,backFn:"ManualTransferScreen"===n?t:n===r?.funding?.methodScreen?r.funding.comingFromSendTransactionScreen?()=>i("SendTransactionScreen"):void 0:r?.funding?.methodScreen?()=>{let e=r.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),c({funding:e,solanaFundingData:r?.solanaFundingData}),i(e.methodScreen)}:void 0})}},23214:function(e,n,t){t.d(n,{I:function(){return l}});var a=t(89418),o=t(41217);let l=({icon:e,name:n})=>"string"==typeof e?(0,a.jsx)("img",{alt:`${n||"wallet"} logo`,src:e,style:{height:24,width:24,borderRadius:4}}):void 0===e?(0,a.jsx)(o.Z,{style:{height:24,width:24}}):e?(0,a.jsx)(e,{style:{height:24,width:24}}):null},97849:function(e,n,t){t.d(n,{L:function(){return l}});var a=t(43803);let o=(0,a.F4)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,l=(0,a.iv)`
  ${e=>e.$isLoading?(0,a.iv)`
          width: 35%;
          animation: ${o} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},31128:function(e,n,t){t.d(n,{C:function(){return i},S:function(){return l}});var a=t(89418),o=t(43803);let l=({title:e,description:n,children:t,...o})=>(0,a.jsx)(r,{...o,children:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("h3",{children:e}),"string"==typeof n?(0,a.jsx)("p",{children:n}):n,t]})});(0,o.zo)(l)`
  margin-bottom: 24px;
`;let i=({title:e,description:n,icon:t,children:o,...l})=>(0,a.jsxs)(c,{...l,children:[t||null,(0,a.jsx)("h3",{children:e}),n&&"string"==typeof n?(0,a.jsx)("p",{children:n}):n,o]}),r=o.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  gap: 8px;
  width: 100%;
  margin-bottom: 24px;

  && h3 {
    font-size: 17px;
    color: var(--privy-color-foreground);
  }

  /* Sugar assuming children are paragraphs. Otherwise, handling styling on your own */
  && p {
    color: var(--privy-color-foreground-2);
    font-size: 14px;
  }
`,c=(0,o.zo)(r)`
  align-items: center;
  text-align: center;
  gap: 16px;

  h3 {
    margin-bottom: 24px;
  }
`},34693:function(e,n,t){t.d(n,{S:function(){return o}});var a=t(43803);let o=a.zo.span`
  margin-top: 4px;
  color: var(--privy-color-foreground);
  text-align: center;

  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */

  && a {
    color: var(--privy-color-accent);
  }
`},22570:function(e,n,t){t.r(n),t.d(n,{TransferFromWalletScreen:function(){return W},default:function(){return W}});var a=t(89418),o=t(4753),l=t(13188),i=t(31128),r=t(87718),c=t(35460),s=t(34693),d=t(64982),p=t(61318),u=t(3010),h=t(9201),y=t(35245),f=t(69774),g=t(5430),w=t(55982),m=t(43803),x=t(23214),v=t(40099),T=t(51166);t(96257),t(78439),t(94936),t(21628);let C=({provider:e,displayName:n,logo:t,connectOnly:o,connector:l})=>{let i,{navigate:r,setModalData:c}=(0,h.a)(),{connectWallet:s}=(0,u.u)(),d=(0,p.r)(),y=(0,p.z)(e),f="wallet_connect_v2"===l.connectorType?e:l.walletClientType,m=window.matchMedia("(display-mode: standalone)").matches,T=(0,p.k)({connectorType:l.connectorType,walletClientType:f});i=T&&T.chainTypes.includes(l.chainType)?()=>{T.isInstalled||"solana"===l.chainType&&"isInstalled"in l&&l.isInstalled?(s(l,f),r(o?"ConnectOnlyStatusScreen":"ConnectionStatusScreen")):w.tq?(c({installWalletModalData:{walletConfig:T,chainType:l.chainType,connectOnly:o}}),r("WalletInterstitialScreen")):(c({installWalletModalData:{walletConfig:T,chainType:l.chainType,connectOnly:o}}),r("InstallWalletScreen"))}:"coinbase_wallet"!==l.connectorType||"eoaOnly"!==l.coinbaseWalletConfig.preference?.options||!w.tq||m||(0,v.z)()?()=>{(!(0,g.x)(window.navigator.userAgent)||event?.isTrusted)&&(s(l,f),o?"wallet_connect_v2"===l.connectorType?(c(e=>({...e,externalConnectWallet:{...e?.externalConnectWallet,preSelectedWalletId:"wallet_connect_qr"}})),r("ConnectOnlyLandingScreen")):r("ConnectOnlyStatusScreen"):r("ConnectionStatusScreen"))}:()=>{window.location.href=`https://go.cb-w.com/dapp?cb_url=${encodeURI(window.location.href)}`};let C=n||y?.metadata?.shortName||y?.name||l.walletClientType;return(0,a.jsxs)(j,{onClick:i,children:[(0,a.jsx)(x.I,{icon:t||y?.image_url?.md,name:C}),(0,a.jsx)("span",{children:C}),(0,a.jsxs)(_,{id:"chip-container",children:[d?.walletClientType===f&&d?.chainType===l.chainType?(0,a.jsx)(b,{color:"gray",children:"Recent"}):(0,a.jsx)("span",{id:"connect-text",children:"Connect"}),"solana"===l.chainType&&(0,a.jsx)(b,{color:"gray",children:"Solana"})]})]})},j=(0,m.zo)(p.A)`
  /* Wallet name text color */
  > span {
    color: var(--privy-color-foreground);
  }

  /* Show "Connect" on hover */
  > #chip-container > #connect-text {
    font-weight: 500;
    color: var(--privy-color-accent);
    opacity: 0;
    transition: opacity 0.1s ease-out;
  }

  :hover > #chip-container > #connect-text {
    opacity: 1;
  }

  @media (max-width: 440px) {
    > #chip-container > #connect-text {
      display: none;
    }
  }
`,b=(0,m.zo)(c.C)`
  margin-left: auto;
`,_=m.zo.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: auto;
`,$=["coinbase_wallet","base_account"],S=["metamask","okx_wallet","rainbow","uniswap","bybit_wallet","ronin_wallet","haha_wallet","uniswap_extension","zerion","rabby_wallet","cryptocom","binance","kraken_wallet"],k=["safe"],z=["phantom","backpack","solflare","jupiter","universal_profile"],W={component:()=>{let e,{connectors:n}=(0,u.u)(),{setModalData:t,data:c,navigate:w}=(0,h.a)(),m=(0,d.u)(),{wallets:x}=(0,y.u)(),v=n.filter(p.c).flatMap(e=>e.wallets),[T,j]=(0,o.useState)("default"),b="solana"===c?.funding?.chainType,_=!!c?.funding?.crossChainBridgingEnabled;e="ethereum"===c?.funding?.chainType?c.funding.erc20Address&&!c.funding.isUSDC?"ethereum-only":_&&!c.funding.chain.testnet?"ethereum-and-solana":"ethereum-only":_&&!c.funding?.isUSDC?"ethereum-and-solana":"solana-only";let W=x.filter(e=>"privy"!==e.walletClientType),D=W.map(e=>e.walletClientType),O=v.filter(e=>"privy"!==e.walletClientType),M=O.map(e=>e.walletClientType),E=[],B={...c.funding};B.usingDefaultFundingMethod&&(B.usingDefaultFundingMethod=!1);let A=({wallet:e,walletChainType:n})=>{t({...c,funding:{...B,connectedWallet:e,onContinueWithExternalWallet:()=>w(I({destChainType:b?"solana":"ethereum",sourceChainType:n}))},solanaFundingData:c?.solanaFundingData?{...c.solanaFundingData,sourceWalletData:{address:e.address,walletClientType:e.walletClientType}}:void 0}),w("FundingAmountEditScreen")};"solana-only"!==e&&E.push(...W.map((e,n)=>(0,a.jsx)(F,{onClick:()=>A({wallet:e,walletChainType:"ethereum"}),icon:e.meta.icon,name:e.meta.name,chainType:e.type},n))),"ethereum-only"!==e&&E.push(...O.map((e,n)=>(0,a.jsx)(F,{onClick:()=>A({wallet:e,walletChainType:"solana"}),icon:e.meta.icon,name:e.meta.name,chainType:e.type},n))),E.push(...(({walletList:e,walletChainType:n,connectors:t,connectOnly:o,ignore:l,walletConnectEnabled:i,forceWallet:r})=>{let c=[],s=[],d=[],p=t.filter(e=>"ethereum-only"===n?"ethereum"===e.chainType:"solana-only"!==n||"solana"===e.chainType),u=p.find(e=>"wallet_connect_v2"===e.connectorType);for(let[t,h]of(r?[r.wallet]:e).entries()){if("detected_ethereum_wallets"===h)for(let[e,n]of p.filter(({chainType:e,connectorType:n,walletClientType:t})=>"solana"!==e&&("uniswap_wallet_extension"===t||"uniswap_extension"===t?!l.includes("uniswap"):"crypto.com_wallet_extension"===t||"crypto.com_onchain"===t?!l.includes("cryptocom"):"injected"===n&&!l.includes(t))).entries()){let{walletClientType:l,walletBranding:i,chainType:r}=n;("unknown"===l?s:c).push((0,a.jsx)(C,{connectOnly:o,provider:l,logo:i.icon,displayName:i.name,connector:n},`${t}-${h}-${l}-${r}-${e}`))}if("detected_solana_wallets"===h)for(let[e,i]of p.filter(({chainType:e,walletClientType:t})=>{if("solana"===e)return"ethereum-only"!==n&&!l.includes(t)}).entries()){let{walletClientType:n,walletBranding:l,chainType:r}=i;("unknown"===n?s:c).push((0,a.jsx)(C,{connectOnly:o,provider:n,logo:l.icon,displayName:l.name,connector:i},`${t}-${h}-${n}-${r}-${e}`))}if(z.includes(h)){let e=p.find(e=>"injected"===e.connectorType&&e.walletClientType===h||e.connectorType===h);if(e&&c.push((0,a.jsx)(C,{connectOnly:o,provider:h,connector:e},`${t}-${h}`)),"solana-only"===n||"ethereum-and-solana"===n){let e=p.find(({chainType:e,walletClientType:n})=>"solana"===e&&n===h);e&&c.push((0,a.jsx)(C,{connectOnly:o,provider:h,connector:e},`${h}-solana`))}}else if(S.includes(h)){let e=p.find(e=>"uniswap"===h?"uniswap_wallet_extension"===e.walletClientType||"uniswap_extension"===e.walletClientType:"cryptocom"===h?"crypto.com_wallet_extension"===e.walletClientType||"crypto.com_onchain"===e.walletClientType:"injected"===e.connectorType&&e.walletClientType===h);if(i&&!e&&(e=u),e&&c.push((0,a.jsx)(C,{connectOnly:o,provider:h,connector:e,logo:"injected"===e.connectorType?e.walletBranding.icon:void 0,displayName:"injected"===e.connectorType?e.walletBranding.name:void 0},`${t}-${h}`)),"solana-only"===n||"ethereum-and-solana"===n){let e=p.find(({chainType:e,walletClientType:n})=>"solana"===e&&n===h);e&&c.push((0,a.jsx)(C,{connectOnly:o,provider:h,connector:e},`${h}-solana`))}}else if($.includes(h)){let e=p.find(({connectorType:e})=>e===h);e&&c.push((0,a.jsx)(C,{connectOnly:o,provider:h,connector:e,displayName:"coinbase_wallet"===e.walletClientType?"Coinbase":"Base",logo:"coinbase_wallet"===e.walletClientType?g.y:g.z},`${t}-${h}`))}else if(k.includes(h))u&&d.push((0,a.jsx)(C,{connectOnly:o,provider:h,connector:u},`${t}-${h}`));else if("wallet_connect"===h)u&&d.push((0,a.jsx)(C,{connectOnly:o,provider:h,connector:u,logo:u.walletBranding.icon,displayName:"WalletConnect"},`${t}-${h}`));else if(h===r?.wallet){let n="ethereum"===r.chainType&&e.includes("detected_ethereum_wallets"),l="solana"===r.chainType&&e.includes("detected_solana_wallets");if(n||l){let e=p.find(({walletClientType:e})=>e===h);e&&c.push((0,a.jsx)(C,{connectOnly:o,provider:h,displayName:e.walletBranding?.name,logo:e.walletBranding?.icon,connector:e},`${t}-${h}`))}}}return[...s,...c,...d]})({walletList:m.appearance.walletList.filter(e=>!W.some(n=>n.walletClientType===e)&&!O.some(n=>n.walletClientType===e)),walletChainType:e,connectors:n,connectOnly:!0,ignore:[...m.appearance.walletList,...D,...M],walletConnectEnabled:m.externalWallets.walletConnect.enabled}));let L=(0,a.jsx)(f.W,{text:"More wallets",onClick:()=>j("overflow")}),I=({sourceChainType:e,destChainType:n})=>"ethereum"===e&&"solana"===n?"AwaitingEvmToSolBridgingScreen":"ethereum"===e&&"ethereum"===n?"AwaitingExternalEthereumTransferScreen":"solana"===e&&"ethereum"===n?"AwaitingSolToEvmBridgingScreen":B.externalSolanaFundingScreen;return(0,o.useEffect)(()=>{t({...c,externalConnectWallet:{onCompleteNavigateTo:({address:e,walletClientType:n,walletChainType:a})=>{let o=a??"ethereum",l="ethereum"===o?W.find(t=>t.address===e&&t.walletClientType===n):O.find(t=>t.address===e&&t.walletClientType===n);return t({...c,funding:{...B,connectedWallet:l,onContinueWithExternalWallet:()=>{w(I({destChainType:b?"solana":"ethereum",sourceChainType:o}))}},solanaFundingData:c?.solanaFundingData?{...c.solanaFundingData,sourceWalletData:{address:e||"",walletClientType:n||""}}:void 0}),"FundingAmountEditScreen"}}})},[]),(0,a.jsxs)(a.Fragment,"overflow"===T?{children:[(0,a.jsx)(l.M,{backFn:()=>j("default")},"header"),(0,a.jsxs)(p.Q,{children:[(0,a.jsx)(s.S,{style:{color:"var(--privy-color-foreground-3)",textAlign:"left"},children:"More wallets"}),E]}),(0,a.jsx)(l.B,{})]}:{children:[(0,a.jsx)(r.t,{}),(0,a.jsx)(i.C,{title:"Transfer from wallet",description:"Connect a wallet to deposit funds or send funds manually to your wallet address."}),(0,a.jsxs)(p.Q,{children:[E.length>4?E.slice(0,3):E,E.length>4&&L]}),(0,a.jsx)(l.B,{})]})}},F=({onClick:e,icon:n,name:t,chainType:o})=>(0,a.jsxs)(p.A,{onClick:e,children:[(0,a.jsx)(T.I,{style:{width:20},children:(0,a.jsx)("img",{src:n})}),t,(0,a.jsx)(c.C,{color:"gray",style:{marginLeft:"auto"},children:"Connected"}),"solana"===o&&(0,a.jsx)(c.C,{color:"gray",children:"Solana"})]})},69774:function(e,n,t){t.d(n,{W:function(){return i}});var a=t(89418),o=t(86619),l=t(61318);let i=({onClick:e,text:n})=>(0,a.jsxs)(l.A,{onClick:e,children:[(0,a.jsx)(l.C,{children:(0,a.jsx)(o.Z,{})}),(0,a.jsx)(l.G,{children:n})]})},51166:function(e,n,t){t.d(n,{F:function(){return c},I:function(){return r},a:function(){return s},b:function(){return d},c:function(){return u},d:function(){return h},e:function(){return i},f:function(){return f},g:function(){return g},h:function(){return p}});var a=t(43803),o=t(13188),l=t(49828);let i=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  padding-bottom: 24px;
`,r=a.zo.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    border-radius: var(--privy-border-radius-sm);
  }
`,c=a.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`,s=a.zo.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 0 16px;
  border-width: 1px !important;
  border-radius: 12px;
  cursor: text;

  &:focus-within {
    border-color: var(--privy-color-accent);
  }
`;a.zo.div`
  font-size: 42px !important;
`;let d=a.zo.input`
  background-color: var(--privy-color-background);
  width: 100%;

  &:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  && {
    font-size: 26px;
  }
`,p=(0,a.zo)(d)`
  && {
    font-size: 42px;
  }
`;a.zo.button`
  cursor: pointer;
  padding-left: 4px;
`;let u=a.zo.div`
  font-size: 18px;
`,h=a.zo.div`
  font-size: 12px;
  color: var(--privy-color-foreground-3);
  // we need this container to maintain a static height if there's no content
  height: 20px;
`;a.zo.div`
  display: flex;
  flex-direction: row;
  line-height: 22px;
  font-size: 16px;
  text-align: center;
  svg {
    margin-right: 6px;
    margin: auto;
  }
`,(0,a.zo)(l.LinkButton)`
  margin-top: 16px;
`;let y=(0,a.F4)`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;(0,a.zo)(o.d)`
  border-radius: var(--privy-border-radius-md) !important;
  animation: ${y} 0.3s ease-in-out;
`;let f=a.zo.div``,g=a.zo.a`
  && {
    color: var(--privy-color-accent);
  }

  cursor: pointer;
`}}]);