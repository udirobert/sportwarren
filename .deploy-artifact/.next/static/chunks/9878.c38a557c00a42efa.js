"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9878],{12859:function(e,t,n){n.d(t,{Z:function(){return i}});let i=(0,n(79095).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},68610:function(e,t,n){n.d(t,{Z:function(){return i}});let i=(0,n(79095).Z)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},49878:function(e,t,n){n.d(t,{b:function(){return R},c:function(){return V},i:function(){return H},u:function(){return P}});var i=n(89418),l=n(4753);let o=l.forwardRef(function(e,t){let{title:n,titleId:i,...o}=e;return l.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":i},o),n?l.createElement("title",{id:i},n):null,l.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"}))});var r=n(48935);function s(e,t,n){let i,l=n.initialDeps??[],o=!0;function r(){var r,s,a;let c,d;n.key&&(null==(r=n.debug)?void 0:r.call(n))&&(c=Date.now());let h=e();if(!(h.length!==l.length||h.some((e,t)=>l[t]!==e)))return i;if(l=h,n.key&&(null==(s=n.debug)?void 0:s.call(n))&&(d=Date.now()),i=t(...h),n.key&&(null==(a=n.debug)?void 0:a.call(n))){let e=Math.round((Date.now()-c)*100)/100,t=Math.round((Date.now()-d)*100)/100,i=t/16,l=(e,t)=>{for(e=String(e);e.length<t;)e=" "+e;return e};console.info(`%c⏱ ${l(t,5)} /${l(e,5)} ms`,`
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0,Math.min(120-120*i,120))}deg 100% 31%);`,null==n?void 0:n.key)}return(null==n?void 0:n.onChange)&&!(o&&n.skipInitialOnChange)&&n.onChange(i),o=!1,i}return r.updateDeps=e=>{l=e},r}function a(e,t){if(void 0!==e)return e;throw Error(`Unexpected undefined${t?`: ${t}`:""}`)}let c=(e,t)=>1.01>Math.abs(e-t),d=(e,t,n)=>{let i;return function(...l){e.clearTimeout(i),i=e.setTimeout(()=>t.apply(this,l),n)}},h=e=>{let{offsetWidth:t,offsetHeight:n}=e;return{width:t,height:n}},u=e=>e,g=e=>{let t=Math.max(e.startIndex-e.overscan,0),n=Math.min(e.endIndex+e.overscan,e.count-1),i=[];for(let e=t;e<=n;e++)i.push(e);return i},p=(e,t)=>{let n=e.scrollElement;if(!n)return;let i=e.targetWindow;if(!i)return;let l=e=>{let{width:n,height:i}=e;t({width:Math.round(n),height:Math.round(i)})};if(l(h(n)),!i.ResizeObserver)return()=>{};let o=new i.ResizeObserver(t=>{let i=()=>{let e=t[0];if(null==e?void 0:e.borderBoxSize){let t=e.borderBoxSize[0];if(t){l({width:t.inlineSize,height:t.blockSize});return}}l(h(n))};e.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(i):i()});return o.observe(n,{box:"border-box"}),()=>{o.unobserve(n)}},m={passive:!0},f="undefined"==typeof window||"onscrollend"in window,v=(e,t)=>{let n=e.scrollElement;if(!n)return;let i=e.targetWindow;if(!i)return;let l=0,o=e.options.useScrollendEvent&&f?()=>void 0:d(i,()=>{t(l,!1)},e.options.isScrollingResetDelay),r=i=>()=>{let{horizontal:r,isRtl:s}=e.options;l=r?n.scrollLeft*(s&&-1||1):n.scrollTop,o(),t(l,i)},s=r(!0),a=r(!1);n.addEventListener("scroll",s,m);let c=e.options.useScrollendEvent&&f;return c&&n.addEventListener("scrollend",a,m),()=>{n.removeEventListener("scroll",s),c&&n.removeEventListener("scrollend",a)}},x=(e,t,n)=>{if(null==t?void 0:t.borderBoxSize){let e=t.borderBoxSize[0];if(e)return Math.round(e[n.options.horizontal?"inlineSize":"blockSize"])}return e[n.options.horizontal?"offsetWidth":"offsetHeight"]},w=(e,{adjustments:t=0,behavior:n},i)=>{var l,o;null==(o=null==(l=i.scrollElement)?void 0:l.scrollTo)||o.call(l,{[i.options.horizontal?"left":"top"]:e+t,behavior:n})};class y{constructor(e){this.unsubs=[],this.scrollElement=null,this.targetWindow=null,this.isScrolling=!1,this.scrollState=null,this.measurementsCache=[],this.itemSizeCache=new Map,this.laneAssignments=new Map,this.pendingMeasuredCacheIndexes=[],this.prevLanes=void 0,this.lanesChangedFlag=!1,this.lanesSettling=!1,this.scrollRect=null,this.scrollOffset=null,this.scrollDirection=null,this.scrollAdjustments=0,this.elementsCache=new Map,this.now=()=>{var e,t,n;return(null==(n=null==(t=null==(e=this.targetWindow)?void 0:e.performance)?void 0:t.now)?void 0:n.call(t))??Date.now()},this.observer=(()=>{let e=null,t=()=>e||(this.targetWindow&&this.targetWindow.ResizeObserver?e=new this.targetWindow.ResizeObserver(e=>{e.forEach(e=>{let t=()=>{let t=e.target,n=this.indexFromElement(t);if(!t.isConnected){this.observer.unobserve(t);return}this.shouldMeasureDuringScroll(n)&&this.resizeItem(n,this.options.measureElement(t,e,this))};this.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(t):t()})}):null);return{disconnect:()=>{var n;null==(n=t())||n.disconnect(),e=null},observe:e=>{var n;return null==(n=t())?void 0:n.observe(e,{box:"border-box"})},unobserve:e=>{var n;return null==(n=t())?void 0:n.unobserve(e)}}})(),this.range=null,this.setOptions=e=>{Object.entries(e).forEach(([t,n])=>{void 0===n&&delete e[t]}),this.options={debug:!1,initialOffset:0,overscan:1,paddingStart:0,paddingEnd:0,scrollPaddingStart:0,scrollPaddingEnd:0,horizontal:!1,getItemKey:u,rangeExtractor:g,onChange:()=>{},measureElement:x,initialRect:{width:0,height:0},scrollMargin:0,gap:0,indexAttribute:"data-index",initialMeasurementsCache:[],lanes:1,isScrollingResetDelay:150,enabled:!0,isRtl:!1,useScrollendEvent:!1,useAnimationFrameWithResizeObserver:!1,laneAssignmentMode:"estimate",...e}},this.notify=e=>{var t,n;null==(n=(t=this.options).onChange)||n.call(t,this,e)},this.maybeNotify=s(()=>(this.calculateRange(),[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]),e=>{this.notify(e)},{key:!1,debug:()=>this.options.debug,initialDeps:[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]}),this.cleanup=()=>{this.unsubs.filter(Boolean).forEach(e=>e()),this.unsubs=[],this.observer.disconnect(),null!=this.rafId&&this.targetWindow&&(this.targetWindow.cancelAnimationFrame(this.rafId),this.rafId=null),this.scrollState=null,this.scrollElement=null,this.targetWindow=null},this._didMount=()=>()=>{this.cleanup()},this._willUpdate=()=>{var e;let t=this.options.enabled?this.options.getScrollElement():null;if(this.scrollElement!==t){if(this.cleanup(),!t){this.maybeNotify();return}this.scrollElement=t,this.scrollElement&&"ownerDocument"in this.scrollElement?this.targetWindow=this.scrollElement.ownerDocument.defaultView:this.targetWindow=(null==(e=this.scrollElement)?void 0:e.window)??null,this.elementsCache.forEach(e=>{this.observer.observe(e)}),this.unsubs.push(this.options.observeElementRect(this,e=>{this.scrollRect=e,this.maybeNotify()})),this.unsubs.push(this.options.observeElementOffset(this,(e,t)=>{this.scrollAdjustments=0,this.scrollDirection=t?this.getScrollOffset()<e?"forward":"backward":null,this.scrollOffset=e,this.isScrolling=t,this.scrollState&&this.scheduleScrollReconcile(),this.maybeNotify()})),this._scrollToOffset(this.getScrollOffset(),{adjustments:void 0,behavior:void 0})}},this.rafId=null,this.getSize=()=>this.options.enabled?(this.scrollRect=this.scrollRect??this.options.initialRect,this.scrollRect[this.options.horizontal?"width":"height"]):(this.scrollRect=null,0),this.getScrollOffset=()=>this.options.enabled?(this.scrollOffset=this.scrollOffset??("function"==typeof this.options.initialOffset?this.options.initialOffset():this.options.initialOffset),this.scrollOffset):(this.scrollOffset=null,0),this.getFurthestMeasurement=(e,t)=>{let n=new Map,i=new Map;for(let l=t-1;l>=0;l--){let t=e[l];if(n.has(t.lane))continue;let o=i.get(t.lane);if(null==o||t.end>o.end?i.set(t.lane,t):t.end<o.end&&n.set(t.lane,!0),n.size===this.options.lanes)break}return i.size===this.options.lanes?Array.from(i.values()).sort((e,t)=>e.end===t.end?e.index-t.index:e.end-t.end)[0]:void 0},this.getMeasurementOptions=s(()=>[this.options.count,this.options.paddingStart,this.options.scrollMargin,this.options.getItemKey,this.options.enabled,this.options.lanes,this.options.laneAssignmentMode],(e,t,n,i,l,o,r)=>(void 0!==this.prevLanes&&this.prevLanes!==o&&(this.lanesChangedFlag=!0),this.prevLanes=o,this.pendingMeasuredCacheIndexes=[],{count:e,paddingStart:t,scrollMargin:n,getItemKey:i,enabled:l,lanes:o,laneAssignmentMode:r}),{key:!1}),this.getMeasurements=s(()=>[this.getMeasurementOptions(),this.itemSizeCache],({count:e,paddingStart:t,scrollMargin:n,getItemKey:i,enabled:l,lanes:o,laneAssignmentMode:r},s)=>{if(!l)return this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),[];if(this.laneAssignments.size>e)for(let t of this.laneAssignments.keys())t>=e&&this.laneAssignments.delete(t);this.lanesChangedFlag&&(this.lanesChangedFlag=!1,this.lanesSettling=!0,this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),this.pendingMeasuredCacheIndexes=[]),0!==this.measurementsCache.length||this.lanesSettling||(this.measurementsCache=this.options.initialMeasurementsCache,this.measurementsCache.forEach(e=>{this.itemSizeCache.set(e.key,e.size)}));let a=this.lanesSettling?0:this.pendingMeasuredCacheIndexes.length>0?Math.min(...this.pendingMeasuredCacheIndexes):0;this.pendingMeasuredCacheIndexes=[],this.lanesSettling&&this.measurementsCache.length===e&&(this.lanesSettling=!1);let c=this.measurementsCache.slice(0,a),d=Array(o).fill(void 0);for(let e=0;e<a;e++){let t=c[e];t&&(d[t.lane]=e)}for(let l=a;l<e;l++){let e,o;let a=i(l),h=this.laneAssignments.get(l),u="estimate"===r||s.has(a);if(void 0!==h&&this.options.lanes>1){let i=d[e=h],l=void 0!==i?c[i]:void 0;o=l?l.end+this.options.gap:t+n}else{let i=1===this.options.lanes?c[l-1]:this.getFurthestMeasurement(c,l);o=i?i.end+this.options.gap:t+n,e=i?i.lane:l%this.options.lanes,this.options.lanes>1&&u&&this.laneAssignments.set(l,e)}let g=s.get(a),p="number"==typeof g?g:this.options.estimateSize(l),m=o+p;c[l]={index:l,start:o,size:p,end:m,key:a,lane:e},d[e]=l}return this.measurementsCache=c,c},{key:!1,debug:()=>this.options.debug}),this.calculateRange=s(()=>[this.getMeasurements(),this.getSize(),this.getScrollOffset(),this.options.lanes],(e,t,n,i)=>this.range=e.length>0&&t>0?function({measurements:e,outerSize:t,scrollOffset:n,lanes:i}){let l=e.length-1;if(e.length<=i)return{startIndex:0,endIndex:l};let o=b(0,l,t=>e[t].start,n),r=o;if(1===i)for(;r<l&&e[r].end<n+t;)r++;else if(i>1){let s=Array(i).fill(0);for(;r<l&&s.some(e=>e<n+t);){let t=e[r];s[t.lane]=t.end,r++}let a=Array(i).fill(n+t);for(;o>=0&&a.some(e=>e>=n);){let t=e[o];a[t.lane]=t.start,o--}o=Math.max(0,o-o%i),r=Math.min(l,r+(i-1-r%i))}return{startIndex:o,endIndex:r}}({measurements:e,outerSize:t,scrollOffset:n,lanes:i}):null,{key:!1,debug:()=>this.options.debug}),this.getVirtualIndexes=s(()=>{let e=null,t=null,n=this.calculateRange();return n&&(e=n.startIndex,t=n.endIndex),this.maybeNotify.updateDeps([this.isScrolling,e,t]),[this.options.rangeExtractor,this.options.overscan,this.options.count,e,t]},(e,t,n,i,l)=>null===i||null===l?[]:e({startIndex:i,endIndex:l,overscan:t,count:n}),{key:!1,debug:()=>this.options.debug}),this.indexFromElement=e=>{let t=this.options.indexAttribute,n=e.getAttribute(t);return n?parseInt(n,10):(console.warn(`Missing attribute name '${t}={index}' on measured element.`),-1)},this.shouldMeasureDuringScroll=e=>{var t;if(!this.scrollState||"smooth"!==this.scrollState.behavior)return!0;let n=this.scrollState.index??(null==(t=this.getVirtualItemForOffset(this.scrollState.lastTargetOffset))?void 0:t.index);if(void 0!==n&&this.range){let t=Math.max(this.options.overscan,Math.ceil((this.range.endIndex-this.range.startIndex)/2)),i=Math.min(this.options.count-1,n+t);return e>=Math.max(0,n-t)&&e<=i}return!0},this.measureElement=e=>{if(!e){this.elementsCache.forEach((e,t)=>{e.isConnected||(this.observer.unobserve(e),this.elementsCache.delete(t))});return}let t=this.indexFromElement(e),n=this.options.getItemKey(t),i=this.elementsCache.get(n);i!==e&&(i&&this.observer.unobserve(i),this.observer.observe(e),this.elementsCache.set(n,e)),(!this.isScrolling||this.scrollState)&&this.shouldMeasureDuringScroll(t)&&this.resizeItem(t,this.options.measureElement(e,void 0,this))},this.resizeItem=(e,t)=>{var n;let i=this.measurementsCache[e];if(!i)return;let l=t-(this.itemSizeCache.get(i.key)??i.size);0!==l&&((null==(n=this.scrollState)?void 0:n.behavior)!=="smooth"&&(void 0!==this.shouldAdjustScrollPositionOnItemSizeChange?this.shouldAdjustScrollPositionOnItemSizeChange(i,l,this):i.start<this.getScrollOffset()+this.scrollAdjustments)&&this._scrollToOffset(this.getScrollOffset(),{adjustments:this.scrollAdjustments+=l,behavior:void 0}),this.pendingMeasuredCacheIndexes.push(i.index),this.itemSizeCache=new Map(this.itemSizeCache.set(i.key,t)),this.notify(!1))},this.getVirtualItems=s(()=>[this.getVirtualIndexes(),this.getMeasurements()],(e,t)=>{let n=[];for(let i=0,l=e.length;i<l;i++){let l=t[e[i]];n.push(l)}return n},{key:!1,debug:()=>this.options.debug}),this.getVirtualItemForOffset=e=>{let t=this.getMeasurements();if(0!==t.length)return a(t[b(0,t.length-1,e=>a(t[e]).start,e)])},this.getMaxScrollOffset=()=>{if(!this.scrollElement)return 0;if("scrollHeight"in this.scrollElement)return this.options.horizontal?this.scrollElement.scrollWidth-this.scrollElement.clientWidth:this.scrollElement.scrollHeight-this.scrollElement.clientHeight;{let e=this.scrollElement.document.documentElement;return this.options.horizontal?e.scrollWidth-this.scrollElement.innerWidth:e.scrollHeight-this.scrollElement.innerHeight}},this.getOffsetForAlignment=(e,t,n=0)=>{if(!this.scrollElement)return 0;let i=this.getSize(),l=this.getScrollOffset();return"auto"===t&&(t=e>=l+i?"end":"start"),"center"===t?e+=(n-i)/2:"end"===t&&(e-=i),Math.max(Math.min(this.getMaxScrollOffset(),e),0)},this.getOffsetForIndex=(e,t="auto")=>{e=Math.max(0,Math.min(e,this.options.count-1));let n=this.getSize(),i=this.getScrollOffset(),l=this.measurementsCache[e];if(!l)return;if("auto"===t){if(l.end>=i+n-this.options.scrollPaddingEnd)t="end";else{if(!(l.start<=i+this.options.scrollPaddingStart))return[i,t];t="start"}}if("end"===t&&e===this.options.count-1)return[this.getMaxScrollOffset(),t];let o="end"===t?l.end+this.options.scrollPaddingEnd:l.start-this.options.scrollPaddingStart;return[this.getOffsetForAlignment(o,t,l.size),t]},this.scrollToOffset=(e,{align:t="start",behavior:n="auto"}={})=>{let i=this.getOffsetForAlignment(e,t),l=this.now();this.scrollState={index:null,align:t,behavior:n,startedAt:l,lastTargetOffset:i,stableFrames:0},this._scrollToOffset(i,{adjustments:void 0,behavior:n}),this.scheduleScrollReconcile()},this.scrollToIndex=(e,{align:t="auto",behavior:n="auto"}={})=>{e=Math.max(0,Math.min(e,this.options.count-1));let i=this.getOffsetForIndex(e,t);if(!i)return;let[l,o]=i,r=this.now();this.scrollState={index:e,align:o,behavior:n,startedAt:r,lastTargetOffset:l,stableFrames:0},this._scrollToOffset(l,{adjustments:void 0,behavior:n}),this.scheduleScrollReconcile()},this.scrollBy=(e,{behavior:t="auto"}={})=>{let n=this.getScrollOffset()+e,i=this.now();this.scrollState={index:null,align:"start",behavior:t,startedAt:i,lastTargetOffset:n,stableFrames:0},this._scrollToOffset(n,{adjustments:void 0,behavior:t}),this.scheduleScrollReconcile()},this.getTotalSize=()=>{var e;let t;let n=this.getMeasurements();if(0===n.length)t=this.options.paddingStart;else if(1===this.options.lanes)t=(null==(e=n[n.length-1])?void 0:e.end)??0;else{let e=Array(this.options.lanes).fill(null),i=n.length-1;for(;i>=0&&e.some(e=>null===e);){let t=n[i];null===e[t.lane]&&(e[t.lane]=t.end),i--}t=Math.max(...e.filter(e=>null!==e))}return Math.max(t-this.options.scrollMargin+this.options.paddingEnd,0)},this._scrollToOffset=(e,{adjustments:t,behavior:n})=>{this.options.scrollToFn(e,{behavior:n,adjustments:t},this)},this.measure=()=>{this.itemSizeCache=new Map,this.laneAssignments=new Map,this.notify(!1)},this.setOptions(e)}scheduleScrollReconcile(){if(!this.targetWindow){this.scrollState=null;return}null==this.rafId&&(this.rafId=this.targetWindow.requestAnimationFrame(()=>{this.rafId=null,this.reconcileScroll()}))}reconcileScroll(){if(!this.scrollState||!this.scrollElement)return;if(this.now()-this.scrollState.startedAt>5e3){this.scrollState=null;return}let e=null!=this.scrollState.index?this.getOffsetForIndex(this.scrollState.index,this.scrollState.align):void 0,t=e?e[0]:this.scrollState.lastTargetOffset,n=t!==this.scrollState.lastTargetOffset;if(!n&&c(t,this.getScrollOffset())){if(this.scrollState.stableFrames++,this.scrollState.stableFrames>=1){this.scrollState=null;return}}else this.scrollState.stableFrames=0,n&&(this.scrollState.lastTargetOffset=t,this.scrollState.behavior="auto",this._scrollToOffset(t,{adjustments:void 0,behavior:"auto"}));this.scheduleScrollReconcile()}}let b=(e,t,n,i)=>{for(;e<=t;){let l=(e+t)/2|0,o=n(l);if(o<i)e=l+1;else{if(!(o>i))return l;t=l-1}}return e>0?e-1:0},z="undefined"!=typeof document?l.useLayoutEffect:l.useEffect;var S=n(55982),C=n(43803),j=n(13188),k=n(45328),W=n(86717),T=n(79478),E=n(49134),$=n(64982),M=n(77532),A=n(61318),L=n(40099),O=n(3010),_=n(23304),F=n(18532);let I={phantom:{mobile:{native:"phantom://",universal:"https://phantom.app/ul/"}},solflare:{mobile:{native:void 0,universal:"https://solflare.com/ul/v1/"}},metamask:{image_url:{sm:A.M,md:A.M}}};class R{static normalize(e){return e.replace(/[-_]wallet$/,"").replace(/[-_]extension$/,"").toLowerCase()}isEth(e){return e.chains.some(e=>e.includes("eip155:"))}isSol(e){return e.chains.some(e=>e.includes("solana:"))}inAllowList(e,t){if(!this.normalizedAllowList||0===this.normalizedAllowList.length||"listing"===t&&this.includeWalletConnect)return!0;let n=R.normalize(e);return this.normalizedAllowList.some(e=>n===R.normalize(e))}inDenyList(e,t){return"listing"===t&&"rabby"===e||"agw"===R.normalize(e)}chainMatches(e){return"ethereum-only"===this.chainFilter?"ethereum"===e:"solana-only"!==this.chainFilter||"solana"===e}getAllowListKey(e,t,n,i){let l=R.normalize(e);for(let e of this.normalizedAllowList||[])if(l===R.normalize(e))return e;if("connector"===t){if(("injected"===n||"solana_adapter"===n)&&"ethereum"===i&&this.detectedEth)return"detected_ethereum_wallets";if(("injected"===n||"solana_adapter"===n)&&"solana"===i&&this.detectedSol)return"detected_solana_wallets"}if("listing"===t&&this.includeWalletConnect)return"wallet_connect"}connectorOk(e){return!!("null"!==e.connectorType&&"walletconnect_solana"!==e.walletBranding.id&&this.chainMatches(e.chainType)&&(this.inAllowList(e.walletClientType,"connector")||("injected"===e.connectorType||"solana_adapter"===e.connectorType)&&("ethereum"===e.chainType&&this.detectedEth||"solana"===e.chainType&&this.detectedSol)))}listingOk(e){if(e.slug.includes("coinbase"))return!1;if("ethereum-only"===this.chainFilter){if(!this.isEth(e))return!1}else if("solana-only"===this.chainFilter&&!this.isSol(e))return!1;return!(!this.inAllowList(e.slug,"listing")||this.inDenyList(e.slug,"listing"))}getWallets(e,t){let n=new Map,i=e=>{let t=n.get(e.id);if(t){t.chainType!==e.chainType&&(t.chainType="multi");let n=new Set(t.chains);e.chains.forEach(e=>n.add(e)),t.chains=Array.from(n),!t.icon&&e.icon&&(t.icon=e.icon),!t.url&&e.url&&(t.url=e.url),!t.listing&&e.listing&&(t.listing=e.listing),!t.allowListKey&&e.allowListKey&&(t.allowListKey=e.allowListKey)}else n.set(e.id,e)};e.filter(e=>this.connectorOk(e)).forEach(e=>{let t=R.normalize(e.walletClientType);i({id:t,label:e.walletBranding?.name??t,source:"connector",connector:e,chainType:e.chainType,icon:e.walletBranding?.icon,url:void 0,chains:["ethereum"===e.chainType?"eip155":"solana"],allowListKey:this.getAllowListKey(e.walletClientType,"connector",e.connectorType,e.chainType)})});let l=e.find(e=>"wallet_connect_v2"===e.connectorType),o=e.find(e=>"walletconnect_solana"===e.walletBranding.id);t.filter(e=>this.listingOk(e)).forEach(t=>{let n=[...t.chains].filter(e=>e.includes("eip155:")||e.includes("solana:"));if(e.some(e=>R.normalize(e.walletClientType)===R.normalize(t.slug)&&"ethereum"===e.chainType&&"null"!==e.connectorType)||l||t.mobile.native||t.mobile.universal||A.m[t.slug]?.chainTypes.includes("ethereum")||(n=n.filter(e=>!e.includes("eip155:"))),e.some(e=>R.normalize(e.walletClientType)===R.normalize(t.slug)&&"solana"===e.chainType&&"null"!==e.connectorType)||o||t.mobile.native||t.mobile.universal||A.m[t.slug]?.chainTypes.includes("solana")||(n=n.filter(e=>!e.includes("solana:"))),!n.length)return;let r=R.normalize(t.slug),s=I[t.slug],a=s?.image_url?.sm||t.image_url?.sm;n.some(e=>e.includes("eip155:"))&&i({id:r,label:t.name||r,source:"listing",listing:t,chainType:"ethereum",icon:a,url:t.homepage,chains:n,allowListKey:this.getAllowListKey(t.slug,"listing")}),n.some(e=>e.includes("solana:"))&&i({id:r,label:t.name||r,source:"listing",listing:t,chainType:"solana",icon:a,url:t.homepage,chains:n,allowListKey:this.getAllowListKey(t.slug,"listing")})}),this.includeWalletConnectQr&&l&&i({id:"wallet_connect_qr",label:"WalletConnect",source:"connector",connector:l,chainType:"ethereum",icon:L.W,url:void 0,chains:["eip155"],allowListKey:"wallet_connect_qr"}),this.includeWalletConnectQrSolana&&o&&i({id:"wallet_connect_qr_solana",label:"WalletConnect",source:"connector",connector:o,chainType:"solana",icon:L.W,url:void 0,chains:["solana"],allowListKey:"wallet_connect_qr_solana"});let r=Array.from(n.values());r.forEach(e=>{let t=I[e.listing?.slug||e.id];t?.image_url?.sm&&(e.icon=t.image_url.sm)});let s=new Map;return this.normalizedAllowList?.forEach((e,t)=>{s.set(R.normalize(e),t)}),{wallets:r.slice().sort((e,t)=>{if(e.allowListKey&&t.allowListKey){let n=this.normalizedAllowList?.findIndex(t=>R.normalize(t)===R.normalize(e.allowListKey))??-1,i=this.normalizedAllowList?.findIndex(e=>R.normalize(e)===R.normalize(t.allowListKey))??-1;if(n!==i&&n>=0&&i>=0)return n-i}if(e.allowListKey&&!t.allowListKey)return -1;if(!e.allowListKey&&t.allowListKey)return 1;let n=R.normalize(e.id),i=R.normalize(t.id);"binance-defi"===n?n="binance":"universalprofiles"===n?n="universal_profile":"cryptocom-defi"===n?n="cryptocom":"bitkeep"===n&&(n="bitget_wallet"),"binance-defi"===i?i="binance":"universalprofiles"===i?i="universal_profile":"cryptocom-defi"===i?i="cryptocom":"bitkeep"===i&&(i="bitget_wallet");let l=s.has(n),o=s.has(i);return l&&o?s.get(n)-s.get(i):l?-1:o?1:"connector"===e.source&&"listing"===t.source?-1:"listing"===e.source&&"connector"===t.source?1:e.label.toLowerCase().localeCompare(t.label.toLowerCase())}),walletCount:r.length}}constructor(e,t){if(this.chainFilter=e,t&&t.length>0){if(this.normalizedAllowList=t.map(String),this.normalizedAllowList.includes("binance")){let e=this.normalizedAllowList.indexOf("binance");this.normalizedAllowList.splice(e+1,0,"binance-defi-wallet")}if(this.normalizedAllowList.includes("bitget_wallet")){let e=this.normalizedAllowList.indexOf("bitget_wallet");this.normalizedAllowList.splice(e+1,0,"bitkeep")}}this.detectedEth=this.normalizedAllowList?.includes("detected_ethereum_wallets")??!1,this.detectedSol=this.normalizedAllowList?.includes("detected_solana_wallets")??!1,this.includeWalletConnect=this.normalizedAllowList?.includes("wallet_connect")??!1,this.includeWalletConnectQr=this.normalizedAllowList?.includes("wallet_connect_qr")??!1,this.includeWalletConnectQrSolana=this.normalizedAllowList?.includes("wallet_connect_qr_solana")??!1}}var N=e=>(0,i.jsxs)("svg",{viewBox:"0 0 32 32",xmlns:"http://www.w3.org/2000/svg",...e,children:[(0,i.jsx)("path",{d:"m0 0h32v32h-32z",fill:"#5469d4"}),(0,i.jsx)("path",{d:"m15.997 5.333-.143.486v14.106l.143.143 6.548-3.87z",fill:"#c2ccf4"}),(0,i.jsx)("path",{d:"m15.996 5.333-6.548 10.865 6.548 3.87z",fill:"#fff"}),(0,i.jsx)("path",{d:"m15.997 21.306-.08.098v5.025l.08.236 6.552-9.227z",fill:"#c2ccf4"}),(0,i.jsx)("path",{d:"m15.996 26.665v-5.36l-6.548-3.867z",fill:"#fff"}),(0,i.jsx)("path",{d:"m15.995 20.07 6.548-3.87-6.548-2.976v6.847z",fill:"#8698e8"}),(0,i.jsx)("path",{d:"m9.448 16.2 6.548 3.87v-6.846z",fill:"#c2ccf4"})]}),B=e=>(0,i.jsxs)("svg",{viewBox:"0 0 32 32",xmlns:"http://www.w3.org/2000/svg",...e,children:[(0,i.jsxs)("linearGradient",{id:"a",gradientUnits:"userSpaceOnUse",x1:"7.233",x2:"24.766",y1:"24.766",y2:"7.234",children:[(0,i.jsx)("stop",{offset:"0",stopColor:"#9945ff"}),(0,i.jsx)("stop",{offset:".2",stopColor:"#7962e7"}),(0,i.jsx)("stop",{offset:"1",stopColor:"#00d18c"})]}),(0,i.jsx)("path",{d:"m0 0h32v32h-32z",fill:"#10111a"}),(0,i.jsx)("path",{clipRule:"evenodd",d:"m9.873 20.41a.645.645 0 0 1 .476-.21l14.662.012a.323.323 0 0 1 .238.54l-3.123 3.438a.643.643 0 0 1 -.475.21l-14.662-.012a.323.323 0 0 1 -.238-.54zm15.376-2.862a.322.322 0 0 1 -.238.54l-14.662.012a.642.642 0 0 1 -.476-.21l-3.122-3.44a.323.323 0 0 1 .238-.54l14.662-.012a.644.644 0 0 1 .475.21zm-15.376-9.738a.644.644 0 0 1 .476-.21l14.662.012a.322.322 0 0 1 .238.54l-3.123 3.438a.643.643 0 0 1 -.475.21l-14.662-.012a.323.323 0 0 1 -.238-.54z",fill:"url(#a)",fillRule:"evenodd"})]});C.zo.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,C.zo.button`
  padding: 0.25rem;
  height: 30px;
  width: 30px;

  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-full);
  background: var(--privy-color-background-2);
`;let q=C.zo.div`
  position: relative;
  display: inline-flex;
  align-items: center;

  &::after {
    content: ' ';
    border-radius: var(--privy-border-radius-full);
    height: 6px;
    width: 6px;
    background-color: var(--privy-color-icon-success);
    position: absolute;
    right: -3px;
    top: -3px;
  }
`,D=C.zo.img`
  width: 32px;
  height: 32px;
  border-radius: 0.25rem;
  object-fit: contain;
`,K=C.zo.span`
  display: flex;
  gap: 0.25rem;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
  border-radius: var(--privy-border-radius-sm);
  background-color: var(--privy-color-background-2);

  svg {
    width: 100%;
    max-width: 1rem;
    max-height: 1rem;
    stroke-width: 2;
  }
`;function P({enabled:e=!0,walletList:t,walletChainType:n}){let i=(0,$.u)(),{connectors:o}=(0,O.u)(),{listings:r,loading:s}=(0,A.f)(e),a=n??i.appearance.walletChainType,c=t??i.appearance?.walletList,d=(0,l.useMemo)(()=>new R(a,c),[a,c]),{wallets:h,walletCount:u}=(0,l.useMemo)(()=>d.getWallets(o,r),[d,o,r]),[g,p]=(0,l.useState)(""),m=(0,l.useMemo)(()=>g?h.filter(e=>e.label.toLowerCase().includes(g.toLowerCase())):h,[g,h]),[f,v]=(0,l.useState)();return{selected:f,setSelected:v,search:g,setSearch:p,loadingListings:s,wallets:m,walletCount:u}}C.zo.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 24rem;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-gutter: stable both-edges;
  scrollbar-width: none;
  -ms-overflow-style: none;

  ${e=>"light"===e.$colorScheme?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.06)) bottom;":"dark"===e.$colorScheme?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.06)) bottom;":void 0}

  background-repeat: no-repeat;
  background-size:
    100% 32px,
    100% 16px;
  background-attachment: local, scroll;
`;let U=e=>!e||"string"!=typeof e&&(e instanceof A.d||e instanceof A.S),V=({index:e,style:t,data:n,recent:l})=>{let o=n.wallets[e],{walletChainType:r,handleWalletClick:s}=n,{t:a}=(0,M.u)(),c={...t,boxSizing:"border-box"};return o?(0,i.jsxs)(Y,{style:c,onClick:()=>s(o),children:[o.icon&&(o.connector&&!U(o.connector)?(0,i.jsx)(q,{children:"string"==typeof o.icon?(0,i.jsx)(D,{src:o.icon}):(0,i.jsx)(o.icon,{style:{width:"32px",height:"32px"}})}):"string"==typeof o.icon?(0,i.jsx)(D,{src:o.icon}):(0,i.jsx)(o.icon,{style:{width:"32px",height:"32px"}})),(0,i.jsx)(X,{children:o.label}),l?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(K,{children:a("connectWallet.lastUsed")}),(0,i.jsx)(G,{children:(0,i.jsxs)(i.Fragment,{children:["ethereum-only"===r&&(0,i.jsx)(N,{}),"solana-only"===r&&(0,i.jsx)(B,{})]})})]}):(0,i.jsx)(G,{children:!("ethereum-only"===r||"solana-only"===r)&&(0,i.jsxs)(i.Fragment,{children:[o.chains?.some(e=>e.startsWith("eip155"))&&(0,i.jsx)(N,{}),o.chains?.some(e=>e.startsWith("solana"))&&(0,i.jsx)(B,{})]})})]}):null};var H=({className:e,customDescription:t,connectOnly:n,preSelectedWalletId:s,hideHeader:a,...c})=>{let d=(0,$.u)(),{t:h}=(0,M.u)(),{connectors:u}=(0,O.u)(),g=c.walletChainType||d.appearance.walletChainType,m=c.walletList||d.appearance?.walletList,{onBack:f,onClose:x,app:b}=c,{selected:C,setSelected:k,qrUrl:q,setQrUrl:K,connecting:H,uiState:en,errorCode:ei,wallets:el,walletCount:eo,handleConnect:er,handleBack:es,showSearchBar:ea,isInitialConnectView:ec,title:ed,search:eh,setSearch:eu}=function({onConnect:e,onBack:t,onClose:n,onConnectError:i,walletList:o,walletChainType:r,app:s}){let a=(0,$.u)(),{connectors:c}=(0,O.u)(),{t:d}=(0,M.u)(),{wallets:h,walletCount:u,search:g,setSearch:p,selected:m,setSelected:f}=P({enabled:(0,A.s)(o??[]),walletList:o,walletChainType:r}),[v,x]=(0,l.useState)(),[w,y]=(0,l.useState)(),[b,z]=(0,l.useState)(),[C,j]=(0,l.useState)(),k=!m&&!b&&!C,W=k&&(u>6||g.length>0),T=c.find(e=>"wallet_connect_v2"===e.connectorType),E=(0,l.useCallback)(async(t,n)=>{if(!t)return;let l=n?.name??"Wallet";if(C?.connector!==t||"loading"!==v){if(x("loading"),"string"==typeof t)return L.c.debug("Connecting wallet via deeplink",{wallet:l,url:t.length>80?`${t.slice(0,80)}...`:t}),j({connector:t,name:l,icon:n?.icon,id:n?.id,url:n?.url}),void window.open(t,"_blank");L.c.debug("Connecting wallet via connector",{wallet:l,connectorType:t.connectorType}),j({connector:t,name:n?.name??t.walletBranding.name??"Wallet",icon:n?.icon??t.walletBranding.icon,id:n?.id,url:n?.url});try{let n=await t.connect({showPrompt:!0});if(!n)return L.c.warn("Wallet connection returned null",{wallet:l,connectorType:t.connectorType}),x("error"),y(void 0),void i?.(new O.P("Unable to connect wallet"));L.c.debug("Wallet connection successful",{wallet:l,connectorType:t.connectorType}),x("success"),y(void 0),(0,A.w)({address:n.address,client:n.walletClientType,appId:a.id}),setTimeout(()=>{e({connector:t,wallet:n})},$.q)}catch(n){if(n?.message?.includes("already pending for origin")||n?.message?.includes("wallet_requestPermissions"))return void L.c.debug("Connection request already pending, maintaining loading state",{wallet:l});let e=n instanceof Error?n.message:String(n?.message||"Unknown error");L.c.error("Wallet connection failed",n,{wallet:l,connectorType:t.connectorType,errorCode:n?.privyErrorCode}),x("error"),y(n?.privyErrorCode),i?.(n instanceof Error?n:new O.P(e||"Unable to connect wallet"))}}else L.c.debug("Duplicate connection attempt prevented",{wallet:l})},[a.id,e,C,v]),_=(0,l.useCallback)(()=>b?(x(void 0),y(void 0),j(void 0),void z(void 0)):C?(x(void 0),y(void 0),void j(void 0)):m?(x(void 0),y(void 0),j(void 0),void f(void 0)):"error"===v||"loading"===v?(x(void 0),y(void 0),void j(void 0)):void t?.(),[b,C,m,v,t]),F=(0,l.useMemo)(()=>C?.connector===T&&b&&S.tq&&C?.name?d("connectWallet.goToWallet",{walletName:C.name}):C?.connector===T&&b&&C?.name?d("connectWallet.scanToConnect",{walletName:C.name}):b&&C?.name?d(S.tq?"connectWallet.goToWallet":"connectWallet.scanToConnect",{walletName:C.name}):"string"==typeof C?.connector?d("connectWallet.openOrInstall",{walletName:C.name}):m&&!C?d("connectWallet.selectNetwork"):C?null:d("connectWallet.selectYourWallet"),[C,b,m,T,d]);return{selected:m,setSelected:f,qrUrl:b,setQrUrl:z,connecting:C,uiState:v,errorCode:w,search:g,setSearch:p,wallets:h,walletCount:u,wc:T,isInitialConnectView:k,showSearchBar:W,title:F,handleConnect:E,handleBack:_,onClose:n,onConnect:e,app:s}}({...c,walletList:m,walletChainType:g}),eg=u.find(e=>"wallet_connect_v2"===e.connectorType),ep=u.find(e=>"walletconnect_solana"===e.walletBranding.id),em=(0,l.useRef)(null),ef=function({useFlushSync:e=!0,...t}){let n=l.useReducer(()=>({}),{})[1],i={...t,onChange:(i,l)=>{var o;e&&l?(0,r.flushSync)(n):n(),null==(o=t.onChange)||o.call(t,i,l)}},[o]=l.useState(()=>new y(i));return o.setOptions(i),z(()=>o._didMount(),[]),z(()=>o._willUpdate()),o}({observeElementRect:p,observeElementOffset:v,scrollToFn:w,count:el.length,getScrollElement:()=>em.current,estimateSize:()=>56,overscan:6,gap:5}),ev=(0,l.useCallback)(async e=>{let t="solana-only"!==g&&e.chains?.some(e=>e.startsWith("eip155")),i="ethereum-only"!==g&&e.chains?.some(e=>e.startsWith("solana")),l=()=>{let t=e.id;return A.m[t]||A.m[`${t}_wallet`]},o=t=>{let n=R.normalize(e.id);return u.find(e=>R.normalize(e.walletClientType)===n&&e.chainType===t&&"wallet_connect_v2"!==e.connectorType&&!("ethereum"===e.chainType&&e instanceof A.d||"solana"===e.chainType&&e instanceof A.S))},r=async()=>{if(!eg||!e.listing)return!1;let t=I[e.listing.slug]?{...e.listing,...I[e.listing.slug]}:e.listing;return eg.setWalletEntry(t,K),await eg.resetConnection(e.id),await er(eg,{name:e.label,icon:e.icon,id:e.id,url:e.url}),!0},s=async()=>!!ep&&!!e.listing&&(await ep.disconnect(),ep.wallet.setWalletEntry(e.listing,K),await new Promise(e=>setTimeout(e,100)),await er(ep,{name:e.label,icon:e.icon,id:e.id,url:e.url}),!0),a=async t=>{let i=(e=>{let t=l();if(t)return t.getMobileRedirect({isSolana:e,connectOnly:!!n,useUniversalLink:!1})})(t);return!!i&&(await er(i,{name:e.label,icon:e.icon,id:e.id,url:e.url}),!0)};if(t&&i)k(e);else{if(t&&!i){let t=o("ethereum");if(t&&!U(t))return L.c.debug("Attempting injected EVM connection",{wallet:e.id,connectorType:t.connectorType}),void await er(t,{name:e.label,icon:e.icon,id:e.id,url:e.url});if(S.tq&&l()){if(await a(!1)||await r())return}else if(await r()||await a(!1))return}if(i&&!t){let t=o("solana");if(t&&!U(t))return L.c.debug("Attempting injected Solana connection",{wallet:e.id,connectorType:t.connectorType}),void await er(t,{name:e.label,icon:e.icon,id:e.id,url:e.url});if(S.tq){if(await a(!0)||await s())return}else if(await s()||await a(!0))return}if(!U(e.connector)){if(L.c.debug("Using fallback direct connector",{wallet:e.id,connectorType:e.connector?.connectorType}),eg&&"wallet_connect_v2"===e.connector?.connectorType){if(await eg.resetConnection(e.id),"wallet_connect_qr"!==e.id&&e.listing){let t=I[e.listing.slug]?{...e.listing,...I[e.listing.slug]}:e.listing;eg.setWalletEntry(t,K)}else eg.setWalletEntry({id:"wallet_connect_qr",name:"WalletConnect",rdns:"",slug:"wallet-connect",homepage:"",chains:["eip155"],mobile:{native:"",universal:void 0}},K)}return ep&&"walletconnect_solana"===e.connector?.walletBranding.id&&(await ep.disconnect(),"wallet_connect_qr_solana"!==e.id&&e.listing?ep.wallet.setWalletEntry(e.listing,K):ep.wallet.setWalletEntry({id:"wallet_connect_solana_qr",name:"WalletConnect",rdns:"",slug:"wallet-connect-solana",homepage:"",chains:["solana"],mobile:{native:"",universal:void 0}},K),await new Promise(e=>setTimeout(e,100))),void await er(e.connector,{name:e.label,icon:e.icon,id:e.id,url:e.url})}e.url?await er(e.url,{name:e.label,icon:e.icon,id:e.id,url:e.url}):L.c.warn("No available connection method for wallet",{wallet:e.id})}},[eg,ep,er,k,K,g,n,u]);return(0,l.useEffect)(()=>{if(!s)return;let e=el.find(({id:e})=>e===s);e&&ev(e).catch(console.error)},[s]),(0,i.jsxs)(F.S,{className:e,children:[(0,i.jsx)(F.S.Header,{icon:a&&ec?void 0:H&&!q||q&&S.tq&&H?.icon?H.icon:H?void 0:_.W,iconVariant:H&&!q||q&&S.tq?"loading":void 0,iconLoadingStatus:H&&!q||q&&S.tq?{success:"success"===en,fail:"error"===en}:void 0,title:a&&ec?void 0:H&&!q?h("connectWallet.waitingForWallet",{walletName:H.name}):q&&S.tq?h("connectWallet.waitingForWallet",{walletName:H?.name??"connection"}):ed,subtitle:a&&ec?void 0:H&&!q&&"string"==typeof H.connector?h("connectWallet.installAndConnect",{walletName:H.name}):H&&!q&&"string"!=typeof H.connector?"error"===en?ei===O.c.NO_SOLANA_ACCOUNTS?`The connected wallet has no Solana accounts. Please add a Solana account in ${H.name} and try again.`:h("connectWallet.tryConnectingAgain"):h("connectionStatus.connectOneWallet"):ec?t??(b?h("connectWallet.connectToAccount",{appName:b.name}):null):null,showBack:!!f||!ec,showClose:!0,onBack:f||es,onClose:x}),(0,i.jsxs)(F.S.Body,{ref:em,$colorScheme:d.appearance.palette.colorScheme,style:{marginBottom:q?"0.5rem":void 0},children:[ea&&(0,i.jsx)(Q,{children:(0,i.jsxs)(E.E,{style:{background:"transparent"},children:[(0,i.jsx)(A.C,{children:(0,i.jsx)(o,{})}),(0,i.jsx)("input",{className:"login-method-button",type:"text",placeholder:h("connectWallet.searchPlaceholder",{count:String(eo)}),onChange:e=>eu(e.target.value),value:eh})]})}),q&&S.tq&&"loading"===en&&(0,i.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"},children:[(0,i.jsx)(j.a,{variant:"primary",onClick:()=>window.open(q.universal??q.native,"_blank"),style:{width:"100%"},children:h("connectWallet.openInApp")}),(0,i.jsx)(ee,{value:q.universal??q.native,iconOnly:!0,children:"Copy link"})]}),q&&!S.tq&&"loading"===en&&(0,i.jsx)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"},children:(0,i.jsx)(ee,{value:q.universal??q.native,iconOnly:!0,children:h("connectWallet.copyLink")})}),q&&!S.tq&&(0,i.jsx)(T.Q,{size:280,url:q.universal??q.native,squareLogoElement:H?.icon?"string"==typeof H.icon?e=>(0,i.jsx)("svg",{...e,children:(0,i.jsx)("image",{href:H.icon,height:e.height,width:e.width})}):H.icon:L.B}),q&&!S.tq&&H?.url&&("binance"===H.id||"binanceus"===H.id||"binance-defi"===H.id)&&(0,i.jsxs)(et,{children:[(0,i.jsxs)("span",{children:["Don't have ",H.name,"? "]}),(0,i.jsx)(W.L,{href:H.url,target:"_blank",size:"sm",children:"Download here"})]}),(0,i.jsxs)(Z,{children:[H&&!q&&"string"==typeof H.connector&&(0,i.jsxs)(Y,{onClick:()=>window.open(H.connector,"_blank"),children:[H.icon&&("string"==typeof H.icon?(0,i.jsx)(D,{src:H.icon}):(0,i.jsx)(H.icon,{})),(0,i.jsx)(X,{children:H.name})]}),C?.chains.some(e=>e.startsWith("eip155"))&&!H&&(0,i.jsxs)(Y,{onClick:()=>ev({...C,chains:C.chains.filter(e=>e.startsWith("eip155"))}),children:[C.icon&&("string"==typeof C.icon?(0,i.jsx)(D,{src:C.icon}):(0,i.jsx)(C.icon,{})),(0,i.jsx)(X,{children:C.label}),(0,i.jsx)(G,{children:(0,i.jsx)(N,{})})]}),C?.chains.some(e=>e.startsWith("solana"))&&!H&&(0,i.jsxs)(Y,{onClick:()=>ev({...C,chains:C.chains.filter(e=>e.startsWith("solana"))}),children:[C.icon&&("string"==typeof C.icon?(0,i.jsx)(D,{src:C.icon}):(0,i.jsx)(C.icon,{})),(0,i.jsx)(X,{children:C.label}),(0,i.jsx)(G,{children:(0,i.jsx)(B,{})})]}),ec&&(0,i.jsxs)(i.Fragment,{children:[!(eo>0)&&(0,i.jsx)(J,{children:h("connectWallet.noWalletsFound")}),eo>0&&!q&&(0,i.jsx)("div",{style:{maxHeight:56*Math.min(el.length,5)+5,width:"100%"},children:(0,i.jsx)("div",{style:{height:`${ef.getTotalSize()}px`,width:"100%",position:"relative"},children:ef.getVirtualItems().map(e=>(0,i.jsx)(V,{index:e.index,style:{position:"absolute",top:0,left:0,height:`${e.size}px`,transform:`translateY(${e.start}px)`},data:{wallets:el,walletChainType:g,handleWalletClick:ev}},e.key))})})]})]})]}),(0,i.jsxs)(F.S.Footer,{children:[H&&!q&&"string"!=typeof H.connector&&"error"===en&&(0,i.jsx)(F.S.Actions,{children:(0,i.jsx)(j.a,{style:{width:"100%",alignItems:"center"},variant:"error",onClick:()=>er(H.connector,{name:H.name,icon:H.icon,id:H.id,url:H.url}),children:h("connectWallet.retry")})}),!!(b&&b.legal.privacyPolicyUrl&&b.legal.termsAndConditionsUrl)&&(0,i.jsx)(j.T,{app:b,alwaysShowImplicitConsent:!0}),(0,i.jsx)(F.S.Watermark,{})]})]})};let Q=C.zo.div`
  position: sticky;
  // Offset by negative margin to account for focus outline
  margin-top: -3px;
  padding-top: 3px;
  top: -3px;
  z-index: 1;
  background: var(--privy-color-background);
  padding-bottom: calc(var(--screen-space) / 2);
`,Z=C.zo.div`
  display: flex;
  flex-direction: column;
  gap: ${5}px;
`,Y=C.zo.button`
  && {
    gap: 0.5rem;
    align-items: center;
    display: flex;
    position: relative;
    text-align: left;
    font-weight: 500;
    transition: background 200ms ease-in;
    width: calc(100% - 4px);
    border-radius: var(--privy-border-radius-md);
    padding: 0.75em;
    border: 1px solid var(--privy-color-foreground-4);
    justify-content: space-between;
  }

  &:hover {
    background: var(--privy-color-background-2);
  }
`,G=C.zo.span`
  display: flex;
  align-items: center;
  justify-content: end;
  position: relative;

  & > svg {
    border-radius: var(--privy-border-radius-full);
    stroke-width: 2.5;
    width: 100%;
    max-height: 1rem;
    max-width: 1rem;
    flex-shrink: 0;
  }

  & > svg:not(:last-child) {
    border-radius: var(--privy-border-radius-full);
    margin-right: -0.375rem;
  }
`,J=C.zo.div`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`,X=C.zo.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--privy-color-foreground);
  font-weight: 400;
  flex: 1;
`,ee=(0,C.zo)(k.C)`
  && {
    margin: 0.5rem auto 0 auto;
  }
`,et=C.zo.div`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--privy-color-foreground-3);
`},45328:function(e,t,n){n.d(t,{C:function(){return u},a:function(){return g}});var i=n(89418),l=n(12859),o=n(68610),r=n(4753),s=n(43803);let a=s.zo.button`
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`,c=s.zo.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--privy-color-foreground-2);
`,d=(0,s.zo)(l.Z)`
  color: var(--privy-color-icon-success);
  flex-shrink: 0;
`,h=(0,s.zo)(o.Z)`
  color: var(--privy-color-icon-muted);
  flex-shrink: 0;
`;function u({children:e,iconOnly:t,value:n,hideCopyIcon:l,...o}){let[s,u]=(0,r.useState)(!1);return(0,i.jsxs)(a,{...o,onClick:()=>{navigator.clipboard.writeText(n||("string"==typeof e?e:"")).catch(console.error),u(!0),setTimeout(()=>u(!1),1500)},children:[e," ",s?(0,i.jsxs)(c,{children:[(0,i.jsx)(d,{})," ",!t&&"Copied"]}):!l&&(0,i.jsx)(h,{})]})}let g=({value:e,includeChildren:t,children:n,...l})=>{let[o,s]=(0,r.useState)(!1),u=()=>{navigator.clipboard.writeText(e).catch(console.error),s(!0),setTimeout(()=>s(!1),1500)};return(0,i.jsxs)(i.Fragment,{children:[t?(0,i.jsx)(a,{...l,onClick:u,children:n}):(0,i.jsx)(i.Fragment,{children:n}),(0,i.jsx)(a,{...l,onClick:u,children:o?(0,i.jsx)(c,{children:(0,i.jsx)(d,{})}):(0,i.jsx)(h,{})})]})}},49134:function(e,t,n){n.d(t,{E:function(){return r},I:function(){return a},a:function(){return s}});var i=n(43803),l=n(41815);let o=i.zo.label`
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
`,r=(0,i.zo)(o)`
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
`,s=(0,i.zo)(o)`
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
`,a=i.zo.div`
  width: 100%;

  /* Add styling for the ErrorMessage within EmailInput */
  && > ${l.E} {
    display: block;
    text-align: left;
    padding-left: var(--privy-border-radius-md);
    padding-bottom: 5px;
  }
`},41815:function(e,t,n){n.d(t,{E:function(){return l}});var i=n(43803);let l=i.zo.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`},86717:function(e,t,n){n.d(t,{L:function(){return r}});var i=n(89418),l=n(43803);let o=l.zo.a`
  && {
    color: ${({$variant:e})=>"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))"};
    font-weight: 400;
    text-decoration: ${({$variant:e})=>"underlined"===e?"underline":"var(--privy-link-navigation-decoration, none)"};
    text-underline-offset: 4px;
    text-decoration-thickness: 1px;
    cursor: ${({$disabled:e})=>e?"not-allowed":"pointer"};
    opacity: ${({$disabled:e})=>e?.5:1};

    font-size: ${({$size:e})=>{switch(e){case"xs":return"12px";case"sm":return"14px";default:return"16px"}}};

    line-height: ${({$size:e})=>{switch(e){case"xs":return"18px";case"sm":return"22px";default:return"24px"}}};

    transition:
      color 200ms ease,
      text-decoration-color 200ms ease,
      opacity 200ms ease;

    &:hover {
      color: ${({$variant:e,$disabled:t})=>"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))"};
      text-decoration: ${({$disabled:e})=>e?"none":"underline"};
      text-underline-offset: 4px;
    }

    &:active {
      color: ${({$variant:e,$disabled:t})=>t?"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))":"var(--privy-color-foreground)"};
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px #949df9;
      border-radius: 2px;
    }
  }
`,r=({size:e="md",variant:t="navigation",disabled:n=!1,as:l,children:r,onClick:s,...a})=>(0,i.jsx)(o,{as:l,$size:e,$variant:t,$disabled:n,onClick:e=>{n?e.preventDefault():s?.(e)},...a,children:r})},79478:function(e,t,n){n.d(t,{Q:function(){return x}});var i=n(89418),l=n(2892),o=n(4753),r=n(43803),s=n(64982),a=n(40099);let c=()=>(0,i.jsx)("svg",{width:"200",height:"200",viewBox:"-77 -77 200 200",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{height:"28px",width:"28px"},children:(0,i.jsx)("rect",{width:"50",height:"50",fill:"black",rx:10,ry:10})}),d=(e,t,n,i,l)=>{for(let o=t;o<t+i;o++)for(let t=n;t<n+l;t++){let n=e?.[t];n&&n[o]&&(n[o]=0)}return e},h=(e,t)=>{let n=l.create(e,{errorCorrectionLevel:t}).modules,i=(0,a.E)(Array.from(n.data),n.size);return i=d(i,0,0,7,7),i=d(i,i.length-7,0,7,7),d(i,0,i.length-7,7,7)},u=({x:e,y:t,cellSize:n,bgColor:l,fgColor:o})=>(0,i.jsx)(i.Fragment,{children:[0,1,2].map(r=>(0,i.jsx)("circle",{r:n*(7-2*r)/2,cx:e+7*n/2,cy:t+7*n/2,fill:r%2!=0?l:o},`finder-${e}-${t}-${r}`))}),g=({cellSize:e,matrixSize:t,bgColor:n,fgColor:l})=>(0,i.jsx)(i.Fragment,{children:[[0,0],[(t-7)*e,0],[0,(t-7)*e]].map(([t,o])=>(0,i.jsx)(u,{x:t,y:o,cellSize:e,bgColor:n,fgColor:l},`finder-${t}-${o}`))}),p=({matrix:e,cellSize:t,color:n})=>(0,i.jsx)(i.Fragment,{children:e.map((e,l)=>e.map((e,r)=>e?(0,i.jsx)("rect",{height:t-.4,width:t-.4,x:l*t+.1*t,y:r*t+.1*t,rx:.5*t,ry:.5*t,fill:n},`cell-${l}-${r}`):(0,i.jsx)(o.Fragment,{},`circle-${l}-${r}`)))}),m=({cellSize:e,matrixSize:t,element:n,sizePercentage:l,bgColor:o})=>{if(!n)return(0,i.jsx)(i.Fragment,{});let r=t*(l||.14),s=Math.floor(t/2-r/2),a=Math.floor(t/2+r/2);(a-s)%2!=t%2&&(a+=1);let c=(a-s)*e,d=c-.2*c,h=s*e;return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("rect",{x:s*e,y:s*e,width:c,height:c,fill:o}),(0,i.jsx)(n,{x:h+.1*c,y:h+.1*c,height:d,width:d})]})},f=e=>{let t=e.outputSize,n=h(e.url,e.errorCorrectionLevel),l=t/n.length,o=(0,a.F)(2*l,{min:.025*t,max:.036*t});return(0,i.jsxs)("svg",{height:e.outputSize,width:e.outputSize,viewBox:`0 0 ${e.outputSize} ${e.outputSize}`,style:{height:"100%",width:"100%",padding:`${o}px`},children:[(0,i.jsx)(p,{matrix:n,cellSize:l,color:e.fgColor}),(0,i.jsx)(g,{cellSize:l,matrixSize:n.length,fgColor:e.fgColor,bgColor:e.bgColor}),(0,i.jsx)(m,{cellSize:l,element:e.logo?.element,bgColor:e.bgColor,matrixSize:n.length})]})},v=r.zo.div.attrs({className:"ph-no-capture"})`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${e=>`${e.$size}px`};
  width: ${e=>`${e.$size}px`};
  margin: auto;
  background-color: ${e=>e.$bgColor};

  && {
    border-width: 2px;
    border-color: ${e=>e.$borderColor};
    border-radius: var(--privy-border-radius-md);
  }
`,x=e=>{let{appearance:t}=(0,s.u)(),n=e.bgColor||"#FFFFFF",l=e.fgColor||"#000000",o=e.size||160,r="dark"===t.palette.colorScheme?n:l;return(0,i.jsx)(v,{$size:o,$bgColor:n,$fgColor:l,$borderColor:r,children:(0,i.jsx)(f,{url:e.url,logo:{element:e.squareLogoElement??c},outputSize:o,bgColor:n,fgColor:l,errorCorrectionLevel:e.errorCorrectionLevel||"Q"})})}},18532:function(e,t,n){n.d(t,{S:function(){return z}});var i=n(89418),l=n(4753),o=n(43803),r=n(61318),s=n(13188),a=n(99539);let c=o.zo.div`
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
`,h=o.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,u=(0,o.zo)(s.M)`
  margin: 0 -8px;
`,g=o.zo.div`
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
`,p=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,m=o.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,f=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,v=o.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,x=o.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,w=o.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,y=o.zo.div`
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
`,z=({children:e,...t})=>(0,i.jsx)(c,{children:(0,i.jsx)(d,{...t,children:e})}),S=o.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,C=(0,o.zo)(s.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,j=o.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,k=({step:e})=>e?(0,i.jsx)(S,{children:(0,i.jsx)(j,{pct:Math.min(100,e.current/e.total*100)})}):null;z.Header=({title:e,subtitle:t,icon:n,iconVariant:l,iconLoadingStatus:o,showBack:r,onBack:s,showInfo:a,onInfo:c,showClose:d,onClose:g,step:p,headerTitle:w,...y})=>(0,i.jsxs)(h,{...y,children:[(0,i.jsx)(u,{backFn:r?s:void 0,infoFn:a?c:void 0,onClose:d?g:void 0,title:w,closeable:d}),(n||l||e||t)&&(0,i.jsxs)(m,{children:[n||l?(0,i.jsx)(z.Icon,{icon:n,variant:l,loadingStatus:o}):null,!(!e&&!t)&&(0,i.jsxs)(f,{children:[e&&(0,i.jsx)(v,{children:e}),t&&(0,i.jsx)(x,{children:t})]})]}),p&&(0,i.jsx)(k,{step:p})]}),(z.Body=l.forwardRef(({children:e,...t},n)=>(0,i.jsx)(g,{ref:n,...t,children:e}))).displayName="Screen.Body",z.Footer=({children:e,...t})=>(0,i.jsx)(p,{id:"privy-content-footer-container",...t,children:e}),z.Actions=({children:e,...t})=>(0,i.jsx)(W,{...t,children:e}),z.HelpText=({children:e,...t})=>(0,i.jsx)(T,{...t,children:e}),z.FooterText=({children:e,...t})=>(0,i.jsx)(E,{...t,children:e}),z.Watermark=()=>(0,i.jsx)(C,{}),z.Icon=({icon:e,variant:t="subtle",loadingStatus:n})=>"logo"===t&&e?(0,i.jsx)(y,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:l.isValidElement(e)?{children:e}:{children:l.createElement(e)}):"loading"===t?e?(0,i.jsx)(b,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(r.N,{success:n?.success,fail:n?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):l.isValidElement(e)?l.cloneElement(e,{style:{width:"38px",height:"38px"}}):l.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(w,{$variant:t,children:(0,i.jsx)(a.N,{size:"64px"})}):(0,i.jsx)(w,{$variant:t,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):l.isValidElement(e)?e:l.createElement(e,{width:32,height:32,stroke:(()=>{switch(t){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let W=o.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,T=o.zo.div`
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
`,E=o.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},23304:function(e,t,n){n.d(t,{W:function(){return l}});var i=n(89418);let l=({...e})=>(0,i.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",...e,children:[(0,i.jsx)("rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"}),(0,i.jsx)("path",{d:"M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"}),(0,i.jsx)("path",{d:"M3 11h3c.8 0 1.6.3 2.1.9l1.1.9c1.6 1.6 4.1 1.6 5.7 0l1.1-.9c.5-.5 1.3-.9 2.1-.9H21"})]})},99539:function(e,t,n){n.d(t,{N:function(){return o}});var i=n(89418),l=n(43803);let o=({size:e,centerIcon:t})=>(0,i.jsx)(r,{$size:e,children:(0,i.jsxs)(s,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),t?(0,i.jsx)(a,{children:t}):null]})}),r=l.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=l.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,a=l.zo.div`
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
`,c=l.zo.div`
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
`,d=l.zo.div`
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
`},77532:function(e,t,n){n.d(t,{u:function(){return o}});var i=n(64982);let l={"connectionStatus.successfullyConnected":"Successfully connected with {walletName}","connectionStatus.errorTitle":"{errorMessage}","connectionStatus.connecting":"Connecting","connectionStatus.connectOneWallet":"For the best experience, connect only one wallet at a time.","connectionStatus.checkOtherWindows":"Don't see your wallet? Check your other browser windows.","connectionStatus.stillHere":"Still here?","connectionStatus.tryConnectingAgain":"Try connecting again","connectionStatus.or":"or","connectionStatus.useDifferentLink":"use this different link","connectWallet.connectYourWallet":"Connect a wallet","connectWallet.waitingForWallet":"Waiting for {walletName}","connectWallet.connectToAccount":"Connect a wallet to your {appName} account","connectWallet.installAndConnect":"To connect to {walletName}, install and open the app. Then confirm the connection when prompted.","connectWallet.tryConnectingAgain":"Please try connecting again.","connectWallet.openInApp":"Open in app","connectWallet.copyLink":"Copy link","connectWallet.retry":"Retry","connectWallet.searchPlaceholder":"Search through {count} wallets","connectWallet.noWalletsFound":"No wallets found. Try another search.","connectWallet.lastUsed":"Last used","connectWallet.selectYourWallet":"Select your wallet","connectWallet.selectNetwork":"Select network","connectWallet.goToWallet":"Go to {walletName} to continue","connectWallet.scanToConnect":"Scan code to connect to {walletName}","connectWallet.openOrInstall":"Open or install {walletName}"};function o(){let e=(0,i.u)();return{t:(t,n)=>{var i;let o;return i=e.intl.textLocalization,o=i?.[t]??l[t],n&&0!==Object.keys(n).length?o.replace(/\{(\w+)\}/g,(e,t)=>n[t]??e):o}}}}}]);