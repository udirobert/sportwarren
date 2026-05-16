"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4387],{40765:function(e,n,t){var i=t(4753);let a=i.forwardRef(function(e,n){let{title:t,titleId:a,...r}=e;return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":a},r),t?i.createElement("title",{id:a},t):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))});n.Z=a},41217:function(e,n,t){var i=t(4753);let a=i.forwardRef(function(e,n){let{title:t,titleId:a,...r}=e;return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":a},r),t?i.createElement("title",{id:a},t):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"}))});n.Z=a},71038:function(e,n,t){t.d(n,{Q:function(){return a}});var i=t(6347);function a(e){let n=e.filter(e=>!i.e.has(e.id));return i.B.concat(n)}},60115:function(e,n,t){t.d(n,{Cr:function(){return o},LH:function(){return s},R1:function(){return r}});var i=t(40778),a=t(1603);function r(e){return e?`${e.slice(0,5)}…${e.slice(-4)}`:""}function o({wei:e,precision:n=3}){return parseFloat((0,i.d)(e)).toFixed(n).replace(/0+$/,"").replace(/\.$/,"")}function s({amount:e,decimals:n}){return(0,a.b)(BigInt(e),n)}},44387:function(e,n,t){t.r(n),t.d(n,{FundSolWalletWithExternalSolanaWallet:function(){return eV},default:function(){return eV}});var i,a,r,o,s=t(89418),c=t(40765),l=t(4753),d=t(60115),u=t(13188),f=t(94923),g=t(31128),p=t(87718),h=t(23214),m=t(99539),v=t(39045),w=t(20053),y=t(64982),b=t(3010),A=t(9201),S=t(29077),x=t(60504),T=t(63071),E=t(20472),C=t(5683),j=t(58610),I=t(35245),P=t(78439),F=t(51291);let O=()=>{let{walletProxy:e,client:n}=(0,b.u)();return(0,l.useMemo)(()=>({signWithUserSigner:async({message:t,targetAppId:i})=>{if(!e)throw Error("Wallet proxy not initialized");let a=await n.getAccessToken();if(!a)throw Error("User must be authenticated");let{signature:r}=await e.signWithUserSigner({accessToken:a,message:t,targetAppId:i});return{signature:r}}}),[e,n])};var U=t(29183),W=t(8317),k=t(40099);let N=["solana:mainnet","solana:devnet","solana:testnet"];function M(e,n){if(!Object.prototype.hasOwnProperty.call(e,n))throw TypeError("attempted to use private field on non-instance");return e}var _=0,D="__private_"+_+++"__implementation";function L(e,n){if(!Object.prototype.hasOwnProperty.call(e,n))throw TypeError("attempted to use private field on non-instance");return e}var z=0;function B(e){return"__private_"+z+++"_"+e}var R=B("_address"),V=B("_publicKey"),$=B("_chains"),Q=B("_features"),H=B("_label"),Z=B("_icon");class J{get address(){return L(this,R)[R]}get publicKey(){return L(this,V)[V].slice()}get chains(){return L(this,$)[$].slice()}get features(){return L(this,Q)[Q].slice()}get label(){return L(this,H)[H]}get icon(){return L(this,Z)[Z]}constructor({address:e,publicKey:n,label:t,icon:i}){Object.defineProperty(this,R,{writable:!0,value:void 0}),Object.defineProperty(this,V,{writable:!0,value:void 0}),Object.defineProperty(this,$,{writable:!0,value:void 0}),Object.defineProperty(this,Q,{writable:!0,value:void 0}),Object.defineProperty(this,H,{writable:!0,value:void 0}),Object.defineProperty(this,Z,{writable:!0,value:void 0}),L(this,R)[R]=e,L(this,V)[V]=n,L(this,$)[$]=N,L(this,H)[H]=t,L(this,Z)[Z]=i,L(this,Q)[Q]=["solana:signAndSendTransaction","solana:signTransaction","solana:signMessage"],new.target===J&&Object.freeze(this)}}function G(e,n){if(!Object.prototype.hasOwnProperty.call(e,n))throw TypeError("attempted to use private field on non-instance");return e}var Y=0;function K(e){return"__private_"+Y+++"_"+e}var q=K("_listeners"),X=K("_version"),ee=K("_name"),en=K("_icon"),et=K("_injection"),ei=K("_isPrivyWallet"),ea=K("_accounts"),er=K("_on"),eo=K("_emit"),es=K("_off"),ec=K("_connected"),el=K("_connect"),ed=K("_disconnect"),eu=K("_signMessage"),ef=K("_signAndSendTransaction"),eg=K("_signTransaction");function ep(e,...n){G(this,q)[q][e]?.forEach(e=>e.apply(null,n))}function eh(e,n){G(this,q)[q][e]=G(this,q)[q][e]?.filter(e=>n!==e)}function em(){let{isHeadlessSigning:e,walletProxy:n,initializeWalletProxy:t,recoverEmbeddedWallet:i,openModal:a,privy:r,client:o}=(0,b.u)(),{user:s}=(0,j.u)(),{setModalData:c}=(0,A.a)(),{signWithUserSigner:l}=O();return{signMessage:({message:d,address:u,options:f})=>new Promise(async(g,p)=>{let h=(0,A.j)(s,u);if("privy"!==h?.walletClientType)return void p(new b.b("Wallet is not a Privy wallet",void 0,b.c.EMBEDDED_WALLET_NOT_FOUND));let{entropyId:m,entropyIdVerifier:v}=(0,I.b)(s,h),w=(0,A.b)(h),y=(0,U.b)(d).toString("base64");if(y.length<1)return void p(new b.b("Message must be a non-empty string",void 0,b.c.INVALID_MESSAGE));let S=async()=>{let e;if(!s)throw Error("User must be authenticated before signing with a Privy wallet");let a=await o.getAccessToken();if(!a)throw Error("User must be authenticated to use their embedded wallet.");let c=n??await t(15e3);if(!c)throw Error("Failed to initialize embedded wallet proxy.");if(!await i({address:h.address}))throw Error("Unable to connect to wallet");if(w){let n=await (0,E.f)(r,l,{chain_type:"solana",method:"signMessage",params:{message:y,encoding:"base64"},wallet_id:h.id});if(!n.data||!("signature"in n.data))throw Error("Failed to sign message");e=n.data.signature}else{let{response:n}=await c.rpc({accessToken:a,entropyId:m,entropyIdVerifier:v,chainType:"solana",hdWalletIndex:h.walletIndex??0,requesterAppId:f?.uiOptions?.requesterAppId,request:{method:"signMessage",params:{message:y}}});e=n.data.signature}return e};if(e({showWalletUIs:f?.uiOptions?.showWalletUIs}))try{let e=await S(),n=new Uint8Array((0,U.b)(e,"base64"));g({signature:n})}catch(e){p(e)}else c({signMessage:{method:"solana_signMessage",data:y,confirmAndSign:S,onSuccess:e=>{g({signature:new Uint8Array((0,U.b)(e,"base64"))})},onFailure:e=>{p(e)},uiOptions:f?.uiOptions??{}},connectWallet:{recoveryMethod:h.recoveryMethod,connectingWalletAddress:h.address,entropyId:m,entropyIdVerifier:v,isUnifiedWallet:w,onCompleteNavigateTo:"SignRequestScreen",onFailure:e=>{p(new b.b("Failed to connect to wallet",e,b.c.UNKNOWN_CONNECT_WALLET_ERROR))}}}),a("EmbeddedWalletConnectingScreen")})}}function ev(){let{isHeadlessSigning:e,openModal:n,privy:t}=(0,b.u)(),{setModalData:i}=(0,A.a)(),{signMessage:a}=em(),{signWithUserSigner:r}=O(),{user:o}=(0,j.u)();return{signTransaction:async({transaction:s,options:c,chain:l="solana:mainnet",address:d})=>{let u=(0,A.j)(o,d);if("privy"!==u?.walletClientType)throw new b.b("Wallet is not a Privy wallet",void 0,b.c.EMBEDDED_WALLET_NOT_FOUND);let f=(0,A.b)(u);async function g(e){let n,i;if(f){let n=await (0,E.f)(t,r,{chain_type:"solana",method:"signTransaction",params:{transaction:W.j.base64.fromBytes(e),encoding:"base64"},wallet_id:u.id});if(n.data&&"signed_transaction"in n.data)return{signedTransaction:new Uint8Array(W.j.base64.toBytes(n.data.signed_transaction))};throw Error("Failed to sign transaction")}let{signature:o}=await a({message:(0,U.a)(e),address:d,options:{...c,uiOptions:{...c?.uiOptions,showWalletUIs:!1}}});return{signedTransaction:(n=structuredClone((0,x.x7)().decode(e)),(i=(0,T.Lk)(d))in n.signatures&&(n.signatures[i]=o),new Uint8Array((0,x.Kt)().encode(n)))}}return e({showWalletUIs:c?.uiOptions?.showWalletUIs})?g(s):new Promise(async(e,t)=>{let{entropyId:a,entropyIdVerifier:r}=(0,I.b)(o,u);function d(e){return n=>{t(n instanceof b.b?n:new b.b("Failed to connect to wallet",n,e))}}let p={account:u,transaction:s,chain:l,signOnly:!0,uiOptions:c?.uiOptions||{},onConfirm:g,onSuccess:e,onFailure:d(b.c.TRANSACTION_FAILURE)};i({connectWallet:{recoveryMethod:u.recoveryMethod,connectingWalletAddress:u.address,entropyId:a,entropyIdVerifier:r,isUnifiedWallet:f,onCompleteNavigateTo:"StandardSignAndSendTransactionScreen",onFailure:d(b.c.UNKNOWN_CONNECT_WALLET_ERROR)},standardSignAndSendTransaction:p}),n("EmbeddedWalletConnectingScreen")})}}}let ew=new class extends P.Z{setImplementation(e){M(this,D)[D]=e}async signMessage(e){return M(this,D)[D].signMessage(e)}async signAndSendTransaction(e){return M(this,D)[D].signAndSendTransaction(e)}async signTransaction(e){return M(this,D)[D].signTransaction(e)}constructor(e){super(),Object.defineProperty(this,D,{writable:!0,value:void 0}),M(this,D)[D]=e}}({signTransaction:(0,b.l)("signTransaction was not injected"),signAndSendTransaction:(0,b.l)("signAndSendTransaction was not injected"),signMessage:(0,b.l)("signMessage was not injected")}),ey=new class{get version(){return G(this,X)[X]}get name(){return G(this,ee)[ee]}get icon(){return G(this,en)[en]}get chains(){return N.slice()}get features(){return{"standard:connect":{version:"1.0.0",connect:G(this,el)[el]},"standard:disconnect":{version:"1.0.0",disconnect:G(this,ed)[ed]},"standard:events":{version:"1.0.0",on:G(this,er)[er]},"solana:signAndSendTransaction":{version:"1.0.0",supportedTransactionVersions:["legacy",0],signAndSendTransaction:G(this,ef)[ef]},"solana:signTransaction":{version:"1.0.0",supportedTransactionVersions:["legacy",0],signTransaction:G(this,eg)[eg]},"solana:signMessage":{version:"1.0.0",signMessage:G(this,eu)[eu]},"privy:":{privy:{signMessage:G(this,et)[et].signMessage,signTransaction:G(this,et)[et].signTransaction,signAndSendTransaction:G(this,et)[et].signAndSendTransaction}}}}get accounts(){return G(this,ea)[ea].slice()}get isPrivyWallet(){return G(this,ei)[ei]}constructor({name:e,icon:n,version:t,injection:i,wallets:a}){Object.defineProperty(this,eo,{value:ep}),Object.defineProperty(this,es,{value:eh}),Object.defineProperty(this,q,{writable:!0,value:void 0}),Object.defineProperty(this,X,{writable:!0,value:void 0}),Object.defineProperty(this,ee,{writable:!0,value:void 0}),Object.defineProperty(this,en,{writable:!0,value:void 0}),Object.defineProperty(this,et,{writable:!0,value:void 0}),Object.defineProperty(this,ei,{writable:!0,value:void 0}),Object.defineProperty(this,ea,{writable:!0,value:void 0}),Object.defineProperty(this,er,{writable:!0,value:void 0}),Object.defineProperty(this,ec,{writable:!0,value:void 0}),Object.defineProperty(this,el,{writable:!0,value:void 0}),Object.defineProperty(this,ed,{writable:!0,value:void 0}),Object.defineProperty(this,eu,{writable:!0,value:void 0}),Object.defineProperty(this,ef,{writable:!0,value:void 0}),Object.defineProperty(this,eg,{writable:!0,value:void 0}),G(this,q)[q]={},G(this,er)[er]=(e,n)=>(G(this,q)[q][e]?.push(n)||(G(this,q)[q][e]=[n]),()=>G(this,es)[es](e,n)),G(this,ec)[ec]=e=>{null!=e&&(G(this,ea)[ea]=e.map(({address:e})=>new J({address:e,publicKey:F.Jq.decode(e)}))),G(this,eo)[eo]("change",{accounts:this.accounts})},G(this,el)[el]=async()=>(G(this,eo)[eo]("change",{accounts:this.accounts}),{accounts:this.accounts}),G(this,ed)[ed]=async()=>{G(this,eo)[eo]("change",{accounts:this.accounts})},G(this,eu)[eu]=async(...e)=>{let n=[];for(let{account:t,...i}of e){let{signature:e}=await G(this,et)[et].signMessage({...i,address:t.address});n.push({signedMessage:i.message,signature:e})}return n},G(this,ef)[ef]=async(...e)=>{let n=[];for(let t of e){let{signature:e}=await G(this,et)[et].signAndSendTransaction({...t,transaction:t.transaction,address:t.account.address,chain:t.chain||"solana:mainnet",options:t.options});n.push({signature:e})}return n},G(this,eg)[eg]=async(...e)=>{let n=[];for(let{transaction:t,account:i,options:a,chain:r}of e){let{signedTransaction:e}=await G(this,et)[et].signTransaction({transaction:t,address:i.address,chain:r||"solana:mainnet",options:a});n.push({signedTransaction:e})}return n},G(this,ee)[ee]=e,G(this,en)[en]=n,G(this,X)[X]=t,G(this,et)[et]=i,G(this,ea)[ea]=[],G(this,ei)[ei]=!0,i.on("accountChanged",G(this,ec)[ec],this),G(this,ec)[ec](a)}}({name:"Privy",version:"1.0.0",icon:"data:image/png;base64,AAABAAEAFBQAAAAAIABlAQAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAAUAAAAFAgGAAAAjYkdDQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAQVJREFUeJxiYMANZIC4E4ivAPFPIP4FxDeAuB+IlfDowwBMQFwJxF+B+D8O/AOI66Bq8QJGIF6ExyB0vAqImfEZmEeCYTDcgMswPiB+T4aB34FYApuBsWQYBsP52AycToGBK7EZuJECAw9jM3AVBQbuwWZgIwUGTsZmoDkFBnpiMxAEjpJh2FV8iVsbiD+TYBgoDVrgMgwGnID4HRGGgTKBGyHDYEAaiBdCSxh0g/5AU4Q8sYYhAzEgjoGmABBOgFo2eACowFABYn0oVgViAVINkQTiZUD8DIj/ATF6GILEXgLxCiCWIsZAbiAuBeKtQHwHiEHJ6C8UfwHie0C8E4jLoWpRAAAAAP//rcbhsQAAAAZJREFUAwBYFs3VKJ0cuQAAAABJRU5ErkJggg==",wallets:[],injection:ew});var eb=t(13404),eA=t(50472),eS=t(17007),ex=t(10572),eT=t(80806),eE=t(52826),eC=t(20561),ej=((i=ej||{})[i.Uninitialized=0]="Uninitialized",i[i.Initialized=1]="Initialized",i),eI=((a=eI||{})[a.Legacy=0]="Legacy",a[a.Current=1]="Current",a),eP=((r=eP||{})[r.Nonce=0]="Nonce",r),eF=((o=eF||{})[o.CreateAccount=0]="CreateAccount",o[o.Assign=1]="Assign",o[o.TransferSol=2]="TransferSol",o[o.CreateAccountWithSeed=3]="CreateAccountWithSeed",o[o.AdvanceNonceAccount=4]="AdvanceNonceAccount",o[o.WithdrawNonceAccount=5]="WithdrawNonceAccount",o[o.InitializeNonceAccount=6]="InitializeNonceAccount",o[o.AuthorizeNonceAccount=7]="AuthorizeNonceAccount",o[o.Allocate=8]="Allocate",o[o.AllocateWithSeed=9]="AllocateWithSeed",o[o.AssignWithSeed=10]="AssignWithSeed",o[o.TransferSolWithSeed=11]="TransferSolWithSeed",o[o.UpgradeNonceAccount=12]="UpgradeNonceAccount",o);function eO(e){return!!e&&"object"==typeof e&&"address"in e&&(0,ex.he)(e)}var eU=t(6772),eW=t(39028),ek=t(94615),eN=t(58541),eM=t(60096),e_=t(29707);function eD({rows:e}){return(0,s.jsx)(w.a,{children:e.filter(e=>!!e).map((e,n)=>null!=e.value||e.isLoading?(0,s.jsxs)(w.R,{children:[(0,s.jsx)(v.L,{children:e.label}),(0,s.jsx)(v.V,{$isLoading:e.isLoading,children:e.value})]},n):null)})}function eL(e){return BigInt(Math.floor(1e9*parseFloat(e)))}function ez(e){return+eB.format(parseFloat(e.toString())/1e9)}t(55982),t(96257);let eB=Intl.NumberFormat(void 0,{maximumFractionDigits:8});async function eR({tx:e,solanaClient:n,amount:t,asset:i,tokenPrice:a}){if(!e)return null;if("SOL"===i&&a){let i=eL(t),r=(0,eN.g)(i,a),o=await (0,U.f)({solanaClient:n,tx:e});return{amountInUsd:r,feeInUsd:a?(0,eN.g)(o,a):void 0,totalInUsd:(0,eN.g)(i+o,a)}}if("USDC"===i&&a){let i;let r="$"+t,o=await (0,U.f)({solanaClient:n,tx:e}),s=(i=parseFloat(o.toString())/eN.L*a)<.01?0:i;return{amountInUsd:r,feeInUsd:(0,eN.g)(o,a),totalInUsd:"$"+(parseFloat(t)+s).toFixed(2)}}if("SOL"===i){let i=eL(t),a=await (0,U.f)({solanaClient:n,tx:e});return{amountInSol:t+" SOL",feeInSol:ez(a)+" SOL",totalInSol:ez(i+a)+" SOL"}}return{amountInUsdc:t+" USDC",feeInSol:ez(await (0,U.f)({solanaClient:n,tx:e}))+" SOL"}}let eV={component:function(){let e=(0,y.u)(),{closePrivyModal:n,createAnalyticsEvent:t}=(0,b.u)(),{data:i,setModalData:a,navigate:r}=(0,A.a)(),{wallets:o}=function(){let{ready:e,wallets:n}=function(){let{client:e}=(0,b.u)(),{ready:n,wallet:t}=function(){let{ready:e}=(0,I.u)(),{user:n}=(0,j.u)(),{signMessage:t}=em(),{signTransaction:i}=ev(),{signAndSendTransaction:a}=function(){let e=(0,y.u)(),{isHeadlessSigning:n,openModal:t,privy:i}=(0,b.u)(),{setModalData:a}=(0,A.a)(),{signTransaction:r}=ev(),o=(0,U.u)(),{user:s}=(0,j.u)(),{signWithUserSigner:c}=O();return{signAndSendTransaction:async({transaction:l,address:d,chain:u="solana:mainnet",options:f})=>{let g=(0,A.j)(s,d);if("privy"!==g?.walletClientType)throw new b.b("Wallet is not a Privy wallet",void 0,b.c.EMBEDDED_WALLET_NOT_FOUND);let p=(0,A.b)(g);async function h(e){if(f?.sponsor)return await (async e=>{if(!p)throw new b.b("Sponsoring transactions is only supported for wallets on the TEE stack",b.c.INVALID_DATA);let n=await (0,E.f)(i,c,{chain_type:"solana",method:"signAndSendTransaction",sponsor:!0,params:{transaction:(0,U.b)(e).toString("base64"),encoding:"base64"},caip2:`solana:${(await o(u).rpc.getGenesisHash().send()).substring(0,32)}`,wallet_id:g.id});if(n.data&&"hash"in n.data)return{signature:F.Jq.decode(n.data.hash)};throw Error("Failed to sign and send transaction")})(e);let{signedTransaction:n}=await r({transaction:e,address:d,chain:u,options:{...f,uiOptions:{...f?.uiOptions,showWalletUIs:!1}}}),{signature:t}=await o(u).sendAndConfirmTransaction(n);return{signature:t}}return n({showWalletUIs:f?.uiOptions?.showWalletUIs})?h(l):new Promise(async(n,i)=>{let r,o,{entropyId:c,entropyIdVerifier:m}=(0,I.b)(s,g);function v(e){return n=>{i(n instanceof b.b?n:new b.b("Failed to connect to wallet",n,e))}}let w={account:g,transaction:l,chain:u,signOnly:!1,uiOptions:f?.uiOptions||{},onConfirm:h,onSuccess:n,onFailure:v(b.c.TRANSACTION_FAILURE),isSponsored:!!f?.sponsor},y={recoveryMethod:g.recoveryMethod,connectingWalletAddress:g.address,entropyId:c,entropyIdVerifier:m,isUnifiedWallet:p,onCompleteNavigateTo:"StandardSignAndSendTransactionScreen",onFailure:v(b.c.UNKNOWN_CONNECT_WALLET_ERROR)};e.fundingConfig&&(r=(0,k.y)({address:d,appConfig:e,methodScreen:"FundingMethodSelectionScreen",fundWalletConfig:{...f,asset:"native-currency",chain:u},externalSolanaFundingScreen:"FundSolWalletWithExternalSolanaWallet"}),o={amount:e.fundingConfig.defaultRecommendedAmount,asset:"SOL",chain:u,destinationAddress:d,afterSuccessScreen:"StandardSignAndSendTransactionScreen",sourceWalletData:void 0}),a({connectWallet:y,standardSignAndSendTransaction:w,funding:r,solanaFundingData:o}),t("EmbeddedWalletConnectingScreen")})}}}(),r=(0,l.useMemo)(()=>{let e=[...(0,A.m)(n).sort((e,n)=>(e.walletIndex??0)-(n.walletIndex??0))],t=(0,A.h)(n);return t.length?[...e,...t]:e},[n]),o=(0,l.useMemo)(()=>({signMessage:async({message:e,address:n,options:i})=>await t({message:e,address:n,options:i}),signTransaction:async({transaction:e,address:n,chain:t,options:a})=>await i({transaction:e,address:n,chain:t,options:a}),async signAndSendTransaction({transaction:e,address:n,chain:t,options:i}){let{signature:r}=await a({transaction:e,address:n,chain:t,options:i});return{signature:r}}}),[t,i,a]);return(0,l.useEffect)(()=>{ew?.setImplementation(o)},[o]),(0,l.useEffect)(()=>{var n;!e||(n=ey.accounts).length===r.length&&n.every((e,n)=>e.address===r[n]?.address)||ew?.emit("accountChanged",r)},[e,r]),{ready:e,wallet:ey}}(),[i,a]=(0,l.useState)([]),[r,o]=(0,l.useState)([]);return(0,l.useEffect)(()=>{let e=[t,...i.filter(e=>"solana"===e.chainType&&!!e.wallet.features).map(e=>e.wallet)];o(e);let n=i.flatMap(n=>{let t=()=>o([...e]);return n.on("walletsUpdated",t),{connector:n,off:t}}),a=e.map(n=>n.features["standard:events"]?.on("change",()=>{o([...e])}));return()=>{a.forEach(e=>e?.()),n.forEach(({connector:e,off:n})=>e.off("walletsUpdated",n))}},[i]),(0,l.useEffect)(()=>{a(e.connectors?.walletConnectors.filter(e=>"solana"===e.chainType)??[]);let n=()=>{a(e.connectors?.walletConnectors.filter(e=>"solana"===e.chainType)??[])};return e.connectors?.on("connectorInitialized",n),()=>{e.connectors?.off("connectorInitialized",n)}},[n,e.connectors]),{ready:n,wallets:r}}();return{ready:e,wallets:(0,l.useMemo)(()=>n.flatMap(e=>e.accounts.map(n=>new C.O({wallet:e,account:n}))),[n])}}(),[v,w]=(0,l.useState)("preparing"),[T,P]=(0,l.useState)(),[W,N]=(0,l.useState)(),[M,_]=(0,l.useState)();if(!i?.solanaFundingData)throw Error("Funding config is missing");if(!i.solanaFundingData.sourceWalletData)throw Error("Funding config is missing source wallet data");let{amount:D,asset:L,chain:z,sourceWalletData:B,destinationAddress:R,afterSuccessScreen:V}=i.solanaFundingData,$=o.find(e=>e.address===B.address&&(0,k.I)(B.walletClientType)===(0,k.I)(e.standardWallet.name)),Q=(0,U.u)()(z),{tokenPrice:H,isTokenPriceLoading:Z}=(0,eb.u)("solana");return(0,l.useEffect)(()=>{if("preparing"!==v||Z||!$)return;let e="SOL"===L?eL(D):BigInt(Math.floor(1e6*parseFloat(D)));N({amount:("SOL"===L&&H?(0,eN.g)(e,H):D)??D}),("SOL"===L?async function({solanaClient:e,source:n,destination:t,amountInLamports:i}){let{value:a}=await e.rpc.getLatestBlockhash().send(),r={address:n},o=(0,eU.z)((0,eW.fy)({version:0}),e=>(0,ex.Qg)(r,e),e=>(0,eW.bV)(a,e),e=>(0,eW.d3)(function(e,n){let t={source:{value:e.source??null,isWritable:!0},destination:{value:e.destination??null,isWritable:!0}},i={...e},a=e=>{if(!e.value)return;let n=e.isWritable?eS.g4.WRITABLE:eS.g4.READONLY;return Object.freeze({address:function(e){if(!e)throw Error("Expected a Address.");return"object"==typeof e&&"address"in e?e.address:Array.isArray(e)?e[0]:e}(e.value),role:eO(e.value)?(0,eS.$k)(n):n,...eO(e.value)?{signer:e.value}:{}})};return Object.freeze({accounts:[a(t.source),a(t.destination)],data:(0,eT.Nz)((0,eE.Q5)([["discriminator",(0,eC.Nf)()],["amount",(0,eC.bP)()]]),e=>({...e,discriminator:2})).encode(i),programAddress:(void 0)??"11111111111111111111111111111111"})}({amount:i,source:r,destination:t}),e),e=>(0,x.qy)(e));return new Uint8Array((0,x.Kt)().encode(o))}({solanaClient:Q,source:$.address,destination:R,amountInLamports:e}):async function({solanaClient:e,source:n,destination:t,amountInBaseUnits:i}){let a=(0,eM.g)(e.chain),{value:r}=await e.rpc.getLatestBlockhash().send(),o={address:n},[s]=await (0,ek.BQD)({mint:a,owner:n,tokenProgram:eN.T}),[c]=await (0,ek.BQD)({mint:a,owner:t,tokenProgram:eN.T}),[l,d]=await Promise.all([e.rpc.getAccountInfo(s,{commitment:"confirmed",encoding:"jsonParsed"}).send().catch(()=>null),e.rpc.getAccountInfo(c,{commitment:"confirmed",encoding:"jsonParsed"}).send().catch(()=>null)]);if(!l?.value)throw Error(`Source token account does not exist for address: ${n}`);let u=(0,ek.mo_)({payer:o,ata:c,owner:t,mint:a}),f=(0,eU.z)((0,eW.fy)({version:0}),e=>(0,ex.Qg)(o,e),e=>(0,eW.bV)(r,e),e=>d?.value?e:(0,eW.d3)(u,e),e=>(0,eW.d3)((0,ek.y3x)({source:s,destination:c,authority:o,amount:i}),e),e=>(0,x.qy)(e));return new Uint8Array((0,x.Kt)().encode(f))}({solanaClient:Q,source:$.address,destination:R,amountInBaseUnits:e})).then(P).catch(e=>{w("error"),_(e)})},[v,D,L,z,$,R,Z,H]),(0,l.useEffect)(()=>{"preparing"===v&&T&&eR({tx:T,solanaClient:Q,amount:D,asset:L,tokenPrice:H}).then(e=>{w("loaded"),N({amount:e?.amountInUsd??e?.amountInUsdc??e?.amountInSol??D,fee:e?.feeInUsd??e?.feeInSol,total:e?.totalInUsd??e?.totalInSol})}).catch(e=>{w("error"),_(e)})},[T,D,L,v,H]),(0,l.useEffect)(()=>{"error"===v&&M&&(a({errorModalData:{error:M,previousScreen:"FundSolWalletWithExternalSolanaWallet"},solanaFundingData:i.solanaFundingData}),r("ErrorScreen",!1))},[v,r]),(0,l.useEffect)(()=>{if("success"!==v)return;let e=setTimeout(V?()=>r(V):n,y.t);return()=>clearTimeout(e)},[v]),(0,s.jsxs)(s.Fragment,"success"===v?{children:[(0,s.jsx)(p.t,{}),(0,s.jsx)(f.b,{}),(0,s.jsxs)(f.c,{children:[(0,s.jsx)(c.Z,{color:"var(--privy-color-success)",width:"64px",height:"64px"}),(0,s.jsx)(g.C,{title:"Success!",description:`You’ve successfully added ${D} ${L} to your ${e.name} wallet. It may take a minute before the funds are available to use.`})]}),(0,s.jsx)(f.R,{}),(0,s.jsx)(u.B,{})]}:"preparing"===v||"loaded"===v||"sending"===v?{children:[(0,s.jsx)(p.t,{}),(0,s.jsx)(f.e,{style:{marginTop:"16px"},children:(0,s.jsx)(h.I,{icon:$?.standardWallet.icon,name:$?.standardWallet.name})}),(0,s.jsx)(g.C,{style:{marginTop:"8px",marginBottom:"12px"},title:"sending"===v&&$?`Confirming with ${$.standardWallet.name}`:"Confirm transaction"}),(0,s.jsx)(eD,{rows:[{label:"Source",value:(0,d.R1)(B.address)},{label:"Destination",value:(0,d.R1)(R)},{label:"Network",value:(0,e_.g)(z)},{label:"Amount",value:W?.amount,isLoading:"preparing"===v},{label:"Estimated fee",value:W?.fee,isLoading:"preparing"===v},{label:"Total",value:W?.total,isLoading:"preparing"===v}]}),(0,s.jsx)(u.P,{style:{marginTop:"1rem"},loading:"preparing"===v||"sending"===v,onClick:function(){"loaded"===v&&T&&$&&(w("sending"),(async function({transaction:e,chain:n,sourceWallet:t,solanaClient:i}){var a;let{hasFunds:r}=await (0,U.s)({solanaClient:i,tx:e});if(!r)throw new b.b(`Wallet ${(0,d.R1)(t.address)} does not have enough funds.`,void 0,b.c.INSUFFICIENT_BALANCE);let o=(a=(await t.signAndSendTransaction({transaction:e,chain:n}).catch(e=>{throw new b.b("Transaction was rejected by the user",e,b.c.TRANSACTION_FAILURE)})).signature,(0,S._V)().decode(a));return await (0,U.w)({rpcSubscriptions:i.rpcSubscriptions,signature:o,timeout:2e4}),o})({solanaClient:Q,transaction:T,chain:z,sourceWallet:$}).then(e=>{w("success"),t({eventName:eA.O,payload:{provider:"external",status:"success",txHash:e,address:$.address,value:D,chainType:"solana",clusterName:z,token:L,destinationAddress:R,destinationValue:D,destinationChainType:"solana",destinationClusterName:z,destinationToken:L}})}).catch(e=>{w("error"),_(e)}))},children:"Confirm"}),(0,s.jsx)(u.B,{})]}:{children:[(0,s.jsx)(p.t,{}),(0,s.jsx)(m.N,{}),(0,s.jsx)("div",{style:{marginTop:"1rem"}}),(0,s.jsx)(u.B,{})]})}}},87718:function(e,n,t){t.d(n,{t:function(){return o}});var i=t(89418),a=t(9201),r=t(13188);function o({title:e}){let{currentScreen:n,navigateBack:t,navigate:o,data:s,setModalData:c}=(0,a.a)();return(0,i.jsx)(r.M,{title:e,backFn:"ManualTransferScreen"===n?t:n===s?.funding?.methodScreen?s.funding.comingFromSendTransactionScreen?()=>o("SendTransactionScreen"):void 0:s?.funding?.methodScreen?()=>{let e=s.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),c({funding:e,solanaFundingData:s?.solanaFundingData}),o(e.methodScreen)}:void 0})}},23214:function(e,n,t){t.d(n,{I:function(){return r}});var i=t(89418),a=t(41217);let r=({icon:e,name:n})=>"string"==typeof e?(0,i.jsx)("img",{alt:`${n||"wallet"} logo`,src:e,style:{height:24,width:24,borderRadius:4}}):void 0===e?(0,i.jsx)(a.Z,{style:{height:24,width:24}}):e?(0,i.jsx)(e,{style:{height:24,width:24}}):null},94923:function(e,n,t){t.d(n,{B:function(){return a},C:function(){return s},F:function(){return l},H:function(){return o},R:function(){return g},S:function(){return u},a:function(){return d},b:function(){return f},c:function(){return c},d:function(){return p},e:function(){return r}});var i=t(43803);let a=i.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,r=i.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,o=i.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,s=(0,i.zo)(r)`
  padding: 20px 0;
`,c=(0,i.zo)(r)`
  gap: 16px;
`,l=i.zo.div`
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
`;let u=i.zo.div`
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
`,f=i.zo.div`
  height: 16px;
`,g=i.zo.div`
  height: 12px;
`;i.zo.div`
  position: relative;
`;let p=i.zo.div`
  height: ${e=>e.height??"12"}px;
`;i.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},97849:function(e,n,t){t.d(n,{L:function(){return r}});var i=t(43803);let a=(0,i.F4)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,r=(0,i.iv)`
  ${e=>e.$isLoading?(0,i.iv)`
          width: 35%;
          animation: ${a} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},20053:function(e,n,t){t.d(n,{R:function(){return r},a:function(){return a}});var i=t(43803);let a=i.zo.span`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
`,r=i.zo.span`
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 0.5rem;
`},31128:function(e,n,t){t.d(n,{C:function(){return o},S:function(){return r}});var i=t(89418),a=t(43803);let r=({title:e,description:n,children:t,...a})=>(0,i.jsx)(s,{...a,children:(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("h3",{children:e}),"string"==typeof n?(0,i.jsx)("p",{children:n}):n,t]})});(0,a.zo)(r)`
  margin-bottom: 24px;
`;let o=({title:e,description:n,icon:t,children:a,...r})=>(0,i.jsxs)(c,{...r,children:[t||null,(0,i.jsx)("h3",{children:e}),n&&"string"==typeof n?(0,i.jsx)("p",{children:n}):n,a]}),s=a.zo.div`
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
`,c=(0,a.zo)(s)`
  align-items: center;
  text-align: center;
  gap: 16px;

  h3 {
    margin-bottom: 24px;
  }
`},39045:function(e,n,t){t.d(n,{L:function(){return r},V:function(){return s},a:function(){return o}});var i=t(43803),a=t(97849);let r=i.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */
`,o=(0,i.zo)(r)`
  color: var(--privy-color-accent);
`,s=i.zo.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.375rem; /* 157.143% */
  word-break: break-all;
  text-align: right;

  ${a.L}
`},50472:function(e,n,t){t.d(n,{O:function(){return i}});let i="sdk_fiat_on_ramp_completed_with_status"},29707:function(e,n,t){t.d(n,{g:function(){return i}});function i(e){switch(e){case"solana:mainnet":return"Solana";case"solana:devnet":return"Devnet";case"solana:testnet":return"Testnet"}}},58541:function(e,n,t){t.d(n,{A:function(){return s},D:function(){return d},J:function(){return l},L:function(){return i},R:function(){return c},S:function(){return a},T:function(){return r},a:function(){return o},g:function(){return u}});let i=1e9,a="11111111111111111111111111111111",r="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",o="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",s="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",c=["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C","CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"],l=["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],d={"solana:mainnet":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:{symbol:"USDC",decimals:6,address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:{symbol:"USDT",decimals:6,address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:devnet":{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":{symbol:"USDC",decimals:6,address:"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"},EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS:{symbol:"USDT",decimals:6,address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:testnet":{}};function u(e,n){let t=parseFloat(e.toString())/i,a=f.format(n*t);return"$0.00"===a?"<$0.01":a}let f=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2})},60096:function(e,n,t){t.d(n,{g:function(){return a}});var i=t(58541);function a(e){let[n]=Object.entries(i.D[e]).find(([e,n])=>"USDC"===n.symbol)??[];return n}},99539:function(e,n,t){t.d(n,{N:function(){return r}});var i=t(89418),a=t(43803);let r=({size:e,centerIcon:n})=>(0,i.jsx)(o,{$size:e,children:(0,i.jsxs)(s,{children:[(0,i.jsx)(l,{}),(0,i.jsx)(d,{}),n?(0,i.jsx)(c,{children:n}):null]})}),o=a.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=a.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,c=a.zo.div`
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
`,l=a.zo.div`
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
`,d=a.zo.div`
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
`},80483:function(e,n,t){t.d(n,{u:function(){return r}});var i=t(4753),a=t(3010);let r=({enabled:e=!0}={})=>{let{showFiatPrices:n,getUsdPriceForSol:t}=(0,a.u)(),[r,o]=(0,i.useState)(!0),[s,c]=(0,i.useState)(void 0),[l,d]=(0,i.useState)(void 0);return(0,i.useEffect)(()=>{(async()=>{if(n&&e)try{o(!0);let e=await t();e?d(e):c(Error("Unable to fetch SOL price"))}catch(e){c(e)}finally{o(!1)}else o(!1)})()},[]),{solPrice:l,isSolPriceLoading:r,solPriceError:s}}},13404:function(e,n,t){t.d(n,{u:function(){return c}});var i=t(4753),a=t(71038),r=t(64982),o=t(3010),s=t(80483);function c(e){let{tokenPrice:n,isTokenPriceLoading:t,tokenPriceError:c}=(e=>{let{showFiatPrices:n,getUsdTokenPrice:t,chains:s}=(0,o.u)(),[c,l]=(0,i.useState)(!0),[d,u]=(0,i.useState)(void 0),[f,g]=(0,i.useState)(void 0);return(0,i.useEffect)(()=>{e||=r.s;let i=(0,a.Q)(s).find(n=>n.id===Number(e));(async()=>{if(n){if(!i)return l(!1),void u(Error(`Unable to fetch token price on chain id ${e}`));try{l(!0);let e=await t(i);e?g(e):u(Error(`Unable to fetch token price on chain id ${i.id}`))}catch(e){u(e)}finally{l(!1)}}else l(!1)})()},[e]),{tokenPrice:f,isTokenPriceLoading:c,tokenPriceError:d}})("solana"===e?-1:e),{solPrice:l,isSolPriceLoading:d,solPriceError:u}=(0,s.u)({enabled:"solana"===e});return"solana"===e?{tokenPrice:l,isTokenPriceLoading:d,tokenPriceError:u}:{tokenPrice:n,isTokenPriceLoading:t,tokenPriceError:c}}},29183:function(e,n,t){t.d(n,{a:function(){return u},b:function(){return p},f:function(){return f},s:function(){return g},u:function(){return m},w:function(){return h}});var i=t(60504),a=t(29077),r=t(4753),o=t(64982),s=t(98401),c=t(3010),l=t(95115).Buffer;let d=Symbol("default-solana-rpcs-plugin");function u(e){return new Uint8Array((0,i.x7)().decode(e).messageBytes)}async function f({solanaClient:e,tx:n}){let t=(0,a.TJ)().decode(u(n)),{value:i}=await e.rpc.getFeeForMessage(t).send();return i??0n}async function g({solanaClient:e,tx:n,replaceRecentBlockhash:t}){let{value:i}=await e.rpc.simulateTransaction((0,a.TJ)().decode(n),{commitment:"confirmed",encoding:"base64",sigVerify:!1,replaceRecentBlockhash:t}).send();if("BlockhashNotFound"===i.err&&t)throw Error("Simulation failed: Blockhash not found");return"BlockhashNotFound"===i.err?await g({solanaClient:e,tx:n,replaceRecentBlockhash:!0}):{logs:i.logs??[],error:i.err,hasError:!!i.err,hasFunds:i.logs?.every(e=>!/insufficient funds/gi.test(e)&&!/insufficient lamports/gi.test(e))??!0}}let p=(...e)=>{if(void 0===l)throw new c.b("Buffer is not defined.",void 0,c.c.BUFFER_NOT_DEFINED);return l.from(...e)};async function h({rpcSubscriptions:e,signature:n,timeout:t}){let i=new AbortController,a=await e.signatureNotifications(n,{commitment:"confirmed"}).subscribe({abortSignal:i.signal}),r=await Promise.race([new Promise(e=>{setTimeout(()=>{i.abort(),e(Error("Transaction confirmation timed out"))},t)}),new Promise(async e=>{for await(let n of a){if(i.abort(),n.value.err)return e(Error("Transaction confirmation failed"));e(void 0)}})]);if(r instanceof Error)throw r}function m(){let e=(0,o.u)(),n=(0,s.u)(),t=(0,r.useMemo)(()=>{let t=n(d),i=t?.getDefaultRpcs({appId:e.id});return Object.fromEntries(["solana:mainnet","solana:devnet","solana:testnet"].map(n=>{let t=e.solanaRpcs[n]??i?.[n]??null;return[n,t?function({rpc:e,rpcSubscriptions:n,chain:t,blockExplorerUrl:i}){let r=function({rpc:e,rpcSubscriptions:n}){return async t=>new Promise(async(i,r)=>{try{let r=await e.sendTransaction(p(t).toString("base64"),{preflightCommitment:"confirmed",encoding:"base64"}).send();await h({rpcSubscriptions:n,signature:r,timeout:1e4}),i({signature:new Uint8Array((0,a.Un)().encode(r))})}catch(e){r(e)}})}({rpc:e,rpcSubscriptions:n});return{rpc:e,rpcSubscriptions:n,chain:t,blockExplorerUrl:i,sendAndConfirmTransaction:r}}({chain:n,rpc:t.rpc,rpcSubscriptions:t.rpcSubscriptions,blockExplorerUrl:t.blockExplorerUrl??`https://explorer.solana.com?cluster=${n.replace("solana:","")}`}):null]}))},[e.solanaRpcs,e.id,n]);return(0,r.useCallback)(e=>{if(!t[e])throw Error(`No RPC configuration found for chain ${e}`);return t[e]},[t])}}}]);