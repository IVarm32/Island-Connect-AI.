(function() {
    
    function prepareContent() {
        const wrapper = document.querySelector('.is-wrapper');
        wrapper.classList.add('box-v2');

        // Scroll Down Arrow

        const nextSection = function(currentSection) {
            let next = currentSection.nextElementSibling;
            if(!next) return false;
            if(next.classList.contains('is-section')) {
                return next;
            } else {
                return nextSection(next);
            }
        }

        let scrollArrow = document.querySelectorAll('.is-arrow-down a');
        scrollArrow.forEach(function(btn){
            btn.addEventListener('click', function(e){
                let currentSection = e.target.closest('.is-section');
                if(currentSection) {
                    let gotoSection = nextSection(currentSection);
                    if(gotoSection) {
                        scrollIt(gotoSection, 1000, 'easeInQuad'); // stable
                    }
                }
                e.preventDefault();
                e.stopImmediatePropagation();
            });
        });

        // Smooth Scroll Link

        if(wrapper) if(!hasClass(wrapper,'is-edit')) { // run this only if not in edit mode
            let links = wrapper.querySelectorAll('a');
            links.forEach(function(link){
                link.addEventListener('click', function(e){
        
                    let url = link.getAttribute('href');
                    if(url) {
                        // Will go to the link
                        if(url.indexOf('#')===0) {
                            if(url.indexOf('#section')===0) {
                                let num = url.replace('#section','');
                                if(!isNaN(parseInt(num))) {

                                    // let section = document.querySelector(`.is-section:nth-child(${num})`);
                                    // if(section) scrollIt(section, 1000, 'easeInQuad');

                                    let sections = document.querySelectorAll('.is-section');
                                    let gotoSection;
                                    let x = 0;
                                    sections.forEach(function(section){
                                        if(!hasClass(section, 'is-section-navbar')) {
                                            if(x===num-1) {
                                                gotoSection = section;
                                            }
                                            x++;
                                        }
                                    });
                                    if(gotoSection) scrollIt(gotoSection, 1000, 'easeInQuad');

                                    e.preventDefault();
                                }
                            } else {
                                try{
                                    let bookmark = document.querySelector(url);
                                    if(bookmark) {
                                        scrollIt(bookmark, 1000, 'easeInQuad');
                                        e.preventDefault();
                                    }
                                } catch(e) {
                                    // Do Nothing
                                }
                            }
        
                        } 
        
                    }
                            
                });
            });
        }

        // Cleanup
        let elmsInView = document.querySelectorAll('.section-inview');
        elmsInView.forEach(function(elm){
            elm.classList.remove('section-inview');
        });

        // Prepare for ScrollTrigger
        let elms = document.querySelectorAll('.is-animated,.is-scale-animated');
        elms.forEach(function(elm){
            if(elm.classList.contains('once')) {
                elm.removeAttribute('data-scroll','');
                elm.setAttribute('data-scroll-once','');
            } else {
                elm.removeAttribute('data-scroll-once','');
                elm.setAttribute('data-scroll','');
            }
        });
        // Auto add delays
        elms = document.querySelectorAll('.is-container > div');
        elms.forEach(function(row){
            let animElms = row.querySelectorAll('.is-animated[data-scroll],.is-animated[data-scroll-once]');
            let n = 0;
            if(animElms.length>1) animElms.forEach(function(elm){
                if(elm.className.indexOf('delay-')===-1) {
                    if(n>0) {
                        elm.style.transitionDelay = n+'s';
                        elm.style.animationDelay = n+'s';
                    }
                    n=n+0.2;
                }
            });
        });

        // Prepare for Skrollr
        skrollrSetup();

        // Adjust Bg Image
        adjustBgPos();

    }

    function updateOnResize() {

        // On Resize
        function debounce(func){
            var timer;
            return function(event){
            if(timer) clearTimeout(timer);
            timer = setTimeout(func,100,event);
            };
        }

        const wrapper = document.querySelector('.is-wrapper');

        // let viewportWidth = window.innerWidth;
        window.addEventListener("resize",debounce(function(e){

            if(!document.body.classList.contains('data-editor')) return; // pageReRender only during editing
            // if (window.innerWidth != viewportWidth) {

                // viewportWidth = window.innerWidth;

                // noRender is when controlpanel is opened
                if(wrapper.querySelector('.pin-wrap') && !window.noRender) {
                    pageReRender();
                } else {
                    if(window.skrollrr) {
                        window.skrollrr.refresh(); 
                    }
                    
                }
                window.noRender = false;
                
                // skrollrSetup();
                adjustBgPos();
                
            // }
        }));

        if(wrapper.classList.contains('is-edit')) {
            window.onbeforeunload = function(e){
                localStorage.setItem('_lastscrollpos', document.documentElement.scrollTop);
                window.scrollTo(0, 0);
            }
            setTimeout(()=>{
                if(localStorage.getItem('_lastscrollpos')) {
                    window.scrollTo(0, localStorage.getItem('_lastscrollpos'));
                }
            }, 300);
        }

    }

    // Must be used after Skrollrr script loaded
    function initeSkrollrr() {

        // Change filter from is-overlay-bg to is-overlay (to prevent conflict with animation)
        var overlayBgs = document.querySelectorAll('.is-overlay-bg');
        overlayBgs.forEach((elm)=>{
            if(elm.style) if(elm.style.filter) {
                if(elm.style.filter.indexOf('grayscale')!==-1) {
                    elm.parentNode.style.filter = 'grayscale(1)';
                }
            }
        });
        const skrollrr = new Skrollrr({
            transition: 'all 0.3s ease-out'
        });
        skrollrr.init();

        window.skrollrr = skrollrr;
    }
  
    function _scrollTo(el, yOffset = 0){
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }

    function scrollIt(destination, duration = 200, easing = 'linear', callback) {
        _scrollTo(destination);
    }

    function skrollrSetup() {

        // Reset
        let pinWraps = document.querySelectorAll('.pin-wrap');
        pinWraps.forEach(pinWrap=>{
            // pinWrap.outerHTML = pinWrap.innerHTML;
            const sectionElm = pinWrap.firstElementChild;
            pinWrap.after(sectionElm);
            pinWrap.parentNode.removeChild(pinWrap);
        });
        // if(pinWraps.length>0) {
        const sections = document.querySelectorAll('.is-section');
        sections.forEach( section => {
            if(section.hasAttribute('data-section-clone')) section.parentNode.removeChild(section);
            if(section.hasAttribute('data-section-original')) {
                section.style.display = '';
                section.removeAttribute('data-section-original')
            }
        });
        // }
    
        let viewportWidth = window.innerWidth;
        
        // section-wrap
        if(viewportWidth<=760) { // disable on mobile /* mobile update */
            let sectionWraps = document.querySelectorAll('.section-wrap');
            sectionWraps.forEach(wrap=>{
                wrap.outerHTML = wrap.innerHTML;
            });
        }

        const isInIframe = (window.self !== window.top);
    
        // pin section
        let pins;
        if(isInIframe) {
            pins = document.querySelectorAll('.is-wrapper .section-pin');
            // if(viewportWidth<=760) pins = document.querySelectorAll('.is-wrapper .section-pin:not(.m-skrollrr-off):not(.m-pin-off)'); // do not apply skrollrr if .m-skrollrr-off found on mobile /* mobile update */
        } else {
            pins = document.querySelectorAll('.is-wrapper:not(.is-edit) .section-pin');
            // if(viewportWidth<=760) pins = document.querySelectorAll('.is-wrapper:not(.is-edit) .section-pin:not(.m-skrollrr-off):not(.m-pin-off)'); // do not apply skrollrr 
        }

        if(pins.length>0) window.scrollTo(0, 0);
    
        // Re-structure multi boxes 
        pins.forEach(function(sectionPin){
            if(viewportWidth<=970 && (sectionPin.querySelector('.is-box'))) { /* mobile update (not needed) */
    
                let boxes = sectionPin.querySelectorAll('.is-box');
                boxes.forEach(box=>{
                    const cloneSection = sectionPin.cloneNode(false);
                    box.getAttributeNames().map(name => {
                        if(name.indexOf('data-')!==-1) {
                            cloneSection.setAttribute(name,box.getAttribute(name));
                        }
                    });
                    cloneSection.classList.add('is-box');
                    box.classList.forEach(item=>{
                        if(item.indexOf('is-box-')!==-1 ||
                            item.indexOf('is-content-')!==-1 ||
                            item.indexOf('box-autofit')!==-1 ||
                            item.indexOf('is-light-text')!==-1 ||
                            item.indexOf('is-dark-text')!==-1 ||
                            item.indexOf('is-align-')!==-1 ||
                            item.indexOf('type-')!==-1 ||
                            item.indexOf('block-click')!==-1 ||
                            item.indexOf('hover-zoom')!==-1) cloneSection.classList.add(item);
                    });
                    cloneSection.setAttribute('data-section-clone','');
                    cloneSection.innerHTML = box.innerHTML;
                    sectionPin.parentNode.insertBefore(cloneSection, sectionPin);
                })
                // sectionPin.parentNode.removeChild(sectionPin);
                sectionPin.setAttribute('data-section-original','');
                sectionPin.style.display = 'none';
            }
        });

        if(isInIframe) {
            pins = document.querySelectorAll('.is-wrapper .section-pin');
            // if(viewportWidth<=760) pins = document.querySelectorAll('.is-wrapper .section-pin:not(.m-skrollrr-off):not(.m-pin-off)'); /* mobile update */    
        } else {
            pins = document.querySelectorAll('.is-wrapper:not(.is-edit) .section-pin');
            // if(viewportWidth<=760) pins = document.querySelectorAll('.is-wrapper:not(.is-edit) .section-pin:not(.m-skrollrr-off):not(.m-pin-off)'); /* mobile update */
        }

        pins.forEach(function(sectionPin){
            if(sectionPin.parentNode.closest('.section-wrap')) return; // section-wrap
            if(viewportWidth<=970 && sectionPin.hasAttribute('data-section-original')) return; /* mobile update (not needed) */
    
            const pinWrap = document.createElement('div');
            pinWrap.classList.add('pin-wrap');
            if(sectionPin.classList.contains('m-skrollrr-off')) pinWrap.classList.add('m-skrollrr-off');
            
            if(sectionPin.classList.contains('pin-space-lg')) pinWrap.classList.add('pin-space-lg');
            if(sectionPin.classList.contains('pin-space-xl')) pinWrap.classList.add('pin-space-xl');
            
            // Section Visibility
            if(sectionPin.classList.contains('xs-hidden')) pinWrap.classList.add('xs-hidden');
            if(sectionPin.classList.contains('sm-hidden')) pinWrap.classList.add('sm-hidden');
            if(sectionPin.classList.contains('desktop-hidden')) pinWrap.classList.add('desktop-hidden');
    
            sectionPin.after(pinWrap);
            pinWrap.appendChild(sectionPin);
        });
        
        // no-spacing (adding .section-inview)
        const funcScroll = (e) => {
    
            const sections = document.querySelectorAll('.is-section');
            sections.forEach( section => {
    
                const topDistance = section.getBoundingClientRect().top;
    
                let nextSection;
                let prevSection;
                if(section.parentNode.classList.contains('pin-wrap')) {
                    nextSection = section.parentNode.nextElementSibling;
                    prevSection = section.parentNode.previousElementSibling;
                } else {
                    nextSection = section.nextElementSibling;
                    prevSection = section.previousElementSibling;
                }
                if(nextSection) {
                    if(nextSection.classList.contains('pin-wrap')) {
                        nextSection = nextSection.querySelector('.is-section');
                    } 
                }
                if(prevSection) {
                    if(prevSection.classList.contains('pin-wrap')) {
                        prevSection = prevSection.querySelector('.is-section');
                    } 
                }
    
                if (topDistance<=0) {
                    // const sections = document.querySelectorAll('.is-section');
                    // sections.forEach( section => {
                    //     section.classList.remove('section-inview');
                    // });
    
                    if(section.classList.contains('no-spacing')||section.classList.contains('pin-overlap')) section.classList.add('section-inview');
    
                    const sections = document.querySelectorAll('.is-section');
                    sections.forEach( elm => {
                        if(elm!==section) elm.classList.remove('section-inview');
                    });
                } else {
                    // section.classList.remove('section-inview');
                }
                
            });
        };
        setTimeout(()=>{
            let wrapper = document.querySelector('.is-wrapper');
            // Add event if not in editing mode. Alwasy add if in iframe.
            if((!wrapper.classList.contains('is-edit') || isInIframe) && !window.funcScroll) {
                window.addEventListener('scroll', funcScroll);
                window.funcScroll = true;
            }
        }, 300);
    
        // if(window.skrollrr) window.skrollrr.refresh();
    }
    
    function adjustBgPos() {

        const saveOri = (elm) => {
            const div = document.createElement('div');
            div.style.backgroundPositionX = elm.style.backgroundPositionX;
            div.style.backgroundPositionY = elm.style.backgroundPositionY;
            div.style.backgroundSize = elm.style.backgroundSize;
            if(!elm.hasAttribute('data-bg-ori')) elm.setAttribute('data-bg-ori', div.style.cssText);
        };
        const loadOri = (elm) => {
            if(elm.hasAttribute('data-bg-ori')) {
                const div = document.createElement('div');
                div.style.cssText = elm.getAttribute('data-bg-ori');
                elm.style.backgroundPositionX = div.style.backgroundPositionX;
                elm.style.backgroundPositionY = div.style.backgroundPositionY;
                elm.style.backgroundSize = div.style.backgroundSize;
                elm.removeAttribute('data-bg-ori');
            }
        }
    
        // Adjust Bg Pos
        let viewportWidth = window.innerWidth;
        const elmBg = document.querySelectorAll('[data-bg-xs],[data-bg-sm],[data-bg-md],[data-bg-lg]');
        elmBg.forEach(elm=>{
            saveOri(elm);
            if(viewportWidth<=760) {
                if(elm.hasAttribute('data-bg-xs')){
                    elm.style.cssText = elm.style.cssText+ ';'+elm.getAttribute('data-bg-xs');
                } else {
                    loadOri(elm);
                }
            }
            if(viewportWidth>760 && viewportWidth<=970) {
                if(elm.hasAttribute('data-bg-sm')){
                    elm.style.cssText = elm.style.cssText+ ';'+elm.getAttribute('data-bg-sm');
                } else {
                    loadOri(elm);
                }
            }
            if(viewportWidth>970 && viewportWidth<=1280) {
                if(elm.hasAttribute('data-bg-md')){
                    elm.style.cssText = elm.style.cssText+ ';'+elm.getAttribute('data-bg-md');
                } else {
                    loadOri(elm);
                }
            }
            if(viewportWidth>1280) {
                if(elm.hasAttribute('data-bg-lg')){
                    elm.style.cssText = elm.style.cssText+ ';'+elm.getAttribute('data-bg-lg');
                } else {
                    loadOri(elm);
                }
            }
        });
    }
    
    function inViewSetup() {
        
        let videoBg = document.querySelectorAll('.is-overlay-content');
        videoBg.forEach(elm=>{
            if(elm.querySelector('video.is-video-bg')) elm.setAttribute('data-scroll','');
        });

        let videoContent = document.querySelectorAll('.is-container video'); //make embedded video auto play/pause on view
        videoContent.forEach(elm=>{
            elm.parentNode.setAttribute('data-scroll','');
        });

        const trigger = new ScrollTrigger.default({
            trigger: {
                once: true,
                offset: {
                    element: {
                        x: 0,
                        y: (trigger, rect, direction) => {
                            return 0.1
                        }
                    },
                    viewport: {
                        x: 0,
                        y: (trigger, frame, direction) => {
                            return trigger.visible ? 0 : 0.1
                        }
                    }
                },
                toggle: {
                    class: {
                        in: 'is-inview',
                        out: ['']
                    },
                    callback: {
                        in: (trigger) => { 
                            let videos = trigger.element.querySelectorAll('video');
                            videos.forEach(video=>{
                                let btnPlay = video.parentNode.querySelector('.video-bg-play');
                                if(video.autoplay) {
                                    if(btnPlay) {
                                        if(btnPlay.innerHTML.indexOf('play')===-1) { // meant to play
                                            // video.currentTime = 0;
                                            video.play();
                                        }
                                    } else {
                                        // video.currentTime = 0;
                                        video.play();
                                    }
                                } else {
                                    if(btnPlay) {
                                        if(btnPlay.innerHTML.indexOf('play')===-1) { // meant to play
                                            // video.currentTime = 0;
                                            video.play();
                                        }
                                    } 
                                }
                            });
                        },
                        out: (trigger) => { 
                            let videos = trigger.element.querySelectorAll('video');
                            videos.forEach(video=>{
                                if (!video.paused && !video.closest('[data-html]')) { // exclude slider video
                                    video.pause();
                                }
                            });
                        }
                    }
                },
            }
        });
        trigger.add('[data-scroll-once]');
        trigger.add('[data-scroll]', { once: false });

        window.trigger = trigger;
    }

    function hasClass(element, className) {
        return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
    }

    function contentBoxOnRenderUpdate() {
        
        try {

            if(window.contentbox||parent.contentbox) {
        
                let old;
                if(window.contentbox) {
                    old = window.contentbox.onRender;
                } else if(parent.contentbox) {
                    old = parent.contentbox.onRender;
                }
            
                const onRender = () =>{
                    old.call(this); 
                    
                    // if(window.skrollrr) window.skrollrr.refresh();
            
                    try {
                        if(window.trigger) window.trigger.kill();
                    } catch(e) {}
                
                    let elms = document.querySelectorAll('.is-animated,.is-scale-animated');
                    elms.forEach(function(elm){
                        if(elm.classList.contains('once')) {
                            elm.removeAttribute('data-scroll','');
                            elm.setAttribute('data-scroll-once','');
                        } else {
                            elm.removeAttribute('data-scroll-once','');
                            elm.setAttribute('data-scroll','');
                        }
                    });
                
                    // Auto add delays
                    elms = document.querySelectorAll('.is-container > div');
                    elms.forEach(function(row){
                        let animElms = row.querySelectorAll('.is-animated[data-scroll],.is-animated[data-scroll-once]');
                        let n = 0;
                        if(animElms.length>1) animElms.forEach(function(elm){
                            if(elm.className.indexOf('delay-')===-1) {
                                if(n>0) {
                                    elm.style.transitionDelay = n+'s';
                                    elm.style.animationDelay = n+'s';
                                }
                                n=n+0.2;
                            }
                        });
                    });
            
                    setTimeout(()=>{
                        inViewSetup();
                    }, 100);
                    
                }
            
                if(window.contentbox) {
                    window.contentbox.onRender = onRender;
                } else if(parent.contentbox) {
                    parent.contentbox.onRender = onRender;
                }
            }
            
        } catch(e) {
            //
        }
    }

    // Must be used after Lightbox script loaded
    function functionLightboxInit() {
        let wrapper = document.querySelector('.is-wrapper');
        if(wrapper) if(!hasClass(wrapper,'is-edit')) { // run this only if not in edit mode
            window.lightbox.init();
        }
    }

    // box-canvas
    const Block = {
        start: ()=>{
            document.querySelectorAll('.is-block').forEach(block=>{
                if(!block.hasAttribute('data--t')) {
                    block.setAttribute('data--t', block.style.top);
                }
                if(!block.hasAttribute('data--l')) {
                    block.setAttribute('data--l', block.style.left);
                }
                if(!block.hasAttribute('data--b')) {
                    block.setAttribute('data--b', block.style.bottom);
                }
                if(!block.hasAttribute('data--r')) {
                    block.setAttribute('data--r', block.style.right);
                }
                if(!block.hasAttribute('data--w')) {
                    block.setAttribute('data--w', block.style.width);
                }
                if(!block.hasAttribute('data--h')) {
                    block.setAttribute('data--h', block.style.height);
                }
                block.removeAttribute('data-prev'); // reset => initial call before resize()
                block.removeAttribute('data-fluid');
                block.removeAttribute('data-fluid-val');
                block.classList.remove('fluid');
                block.style.transition = '';
            });
        },
        apply: (block, breakpoint, initial) => {
            if(breakpoint) {
                if(block.getAttribute('data-prev')!==breakpoint+'') {
    
                    if(!initial) block.style.transition = 'all 0.35s ease'; 
    
                    if(breakpoint!==10000) {
                        // console.log('Apply: ' + breakpoint);
                        block.setAttribute('data-breakpoint', breakpoint)
                        if(block.hasAttribute('data--t-'+breakpoint)) {
                            let top = block.getAttribute('data--t-'+breakpoint);
                            block.style.top = top;
                        }
                        if(block.hasAttribute('data--l-'+breakpoint)) {
                            let left = block.getAttribute('data--l-'+breakpoint);
                            block.style.left = left;
                        }
                        if(block.hasAttribute('data--b-'+breakpoint)) {
                            let bottom = block.getAttribute('data--b-'+breakpoint);
                            block.style.bottom = bottom;
                        }
                        if(block.hasAttribute('data--r-'+breakpoint)) {
                            let right = block.getAttribute('data--r-'+breakpoint);
                            block.style.right = right;
                        }
                        if(block.hasAttribute('data--w-'+breakpoint)) {
                            let width = block.getAttribute('data--w-'+breakpoint);
                            block.style.width = width;
                        }
                        if(block.hasAttribute('data--h-'+breakpoint)) {
                            let height = block.getAttribute('data--h-'+breakpoint);
                            block.style.height = height;
                        }
                        if(block.hasAttribute('data--transform-'+breakpoint)) {
                            let transform = block.getAttribute('data--transform-'+breakpoint);
                            block.style.transform = transform; 
                            block.setAttribute('data--transform-val', breakpoint); 
                        }
                    } else {
                        // console.log('Apply: Normal');
                        block.removeAttribute('data-breakpoint')
                        if(block.hasAttribute('data--t')) {
                            let top = block.getAttribute('data--t');
                            block.style.top = top;
                        }
                        if(block.hasAttribute('data--l')) {
                            let left = block.getAttribute('data--l');
                            block.style.left = left;
                        }
                        if(block.hasAttribute('data--b')) {
                            let bottom = block.getAttribute('data--b');
                            block.style.bottom = bottom;
                        }
                        if(block.hasAttribute('data--r')) {
                            let right = block.getAttribute('data--r');
                            block.style.right = right;
                        }
                        if(block.hasAttribute('data--w')) {
                            let width = block.getAttribute('data--w');
                            block.style.width = width;
                        }
                        if(block.hasAttribute('data--h')) {
                            let height = block.getAttribute('data--h');
                            block.style.height = height;
                        }
                        if(block.hasAttribute('data--transform')) {
                            let transform = block.getAttribute('data--transform');
                            block.style.transform = transform; 
                            block.setAttribute('data--transform-val', ''); 
                        }
                    }
                    block.setAttribute('data-prev', breakpoint);
    
                    setTimeout(()=>{
                        if(!initial) block.style.transition = '';
                    }, 400)
                }
            } 
        },
        applyFluid: (block, val) => {
            block.classList.toggle('fluid', val === 'yes');
            block.setAttribute('data-fluid', val);
        },
        resize: (initial) => {
            // document.body.removeAttribute('data-breakpoint');
    
            const viewportWidth = window.innerWidth;
    
            // box height
            document.querySelectorAll('.is-box').forEach(box=>{
                let dataBreakpoints = [];
                const attributes = box.attributes;
                for (let i = 0; i < attributes.length; i++) {
                    const attributeName = attributes[i].name;
                    let match = attributeName.match(/^data--h-(\d+)$/);
                    if (match) {
                        const number = parseInt(match[1], 10);
                        dataBreakpoints.push(number);
                    }
                }
                dataBreakpoints = [...new Set(dataBreakpoints)];
                dataBreakpoints.sort((a, b) => b - a);
    
                for (let i = 0; i < dataBreakpoints.length; i++) {
                    const currentBreakpoint = dataBreakpoints[i];
                    if (i === 0) {
                        if(viewportWidth>currentBreakpoint) {
                            let h = box.getAttribute('data--h');
                            if(h) box.style.height = h;
                            else box.style.height = '';
                        }
                    } else {
                        const previousBreakpoint = dataBreakpoints[i - 1];
                        if(previousBreakpoint>=viewportWidth && viewportWidth>currentBreakpoint) {
                            let h = box.getAttribute('data--h-'+previousBreakpoint);
                            if(h) box.style.height = h;
                        }
                    }
                }
                if (dataBreakpoints.length > 0) {
                    const lowestValue = dataBreakpoints[dataBreakpoints.length - 1];
                    if(lowestValue>=viewportWidth) {
                        const lowestValue = dataBreakpoints[dataBreakpoints.length - 1];
                        let h = box.getAttribute('data--h-'+lowestValue);
                        if(h) box.style.height = h;
                    }
                }
            });
            
            document.querySelectorAll('.is-block').forEach(block=>{
    
                // fluid
                if(!block.classList.contains('locked')) {
                    if((block.offsetWidth + 0 > viewportWidth) && !block.classList.contains('fluid')) {
                        block.setAttribute('data-fluid-val', block.offsetWidth)
                        Block.applyFluid(block, 'yes');
                    } 
                    let bf = block.getAttribute('data-fluid-val');
                    if(bf) {
                        if ((parseInt(bf) + 0 <= viewportWidth) && block.classList.contains('fluid')){
                            Block.applyFluid(block, 'no');
                        }
                    }
                }
    
                // For each block, get all its breakpoints
                let dataBreakpoints = [];
                const attributes = block.attributes;
                for (let i = 0; i < attributes.length; i++) {
                    const attributeName = attributes[i].name;
                    let match = attributeName.match(/^data--t-(\d+)$/);
                    if (match) {
                        const number = parseInt(match[1], 10);
                        dataBreakpoints.push(number);
                    }
                    match = attributeName.match(/^data--w-(\d+)$/);
                    if (match) {
                        const number = parseInt(match[1], 10);
                        dataBreakpoints.push(number);
                    }
                    match = attributeName.match(/^data--transform-(\d+)$/);
                    if (match) {
                        const number = parseInt(match[1], 10);
                        dataBreakpoints.push(number);
                    }
                }
                dataBreakpoints = [...new Set(dataBreakpoints)]; // remove duplicates
                dataBreakpoints.sort((a, b) => b - a);
    
                // Go through each range
                for (let i = 0; i < dataBreakpoints.length; i++) {
                    const currentBreakpoint = dataBreakpoints[i];
                    if (i === 0) {
                        if(viewportWidth>currentBreakpoint) {
                            // console.log(block)
                            // console.log(`range > ${currentBreakpoint}`);
                            Block.apply(block, 10000, initial);
                        }
                    } else {
                        const previousBreakpoint = dataBreakpoints[i - 1];
                        if(previousBreakpoint>=viewportWidth && viewportWidth>currentBreakpoint) {
                            // console.log(block)
                            // console.log(`${previousBreakpoint} >= range > ${currentBreakpoint}`);
                            Block.apply(block, previousBreakpoint, initial);
                        }
                    }
                }
                if (dataBreakpoints.length > 0) {
                    const lowestValue = dataBreakpoints[dataBreakpoints.length - 1];
                    if(lowestValue>=viewportWidth) {
                        // console.log(block)
                        // console.log(`${lowestValue} >= range`);
                        Block.apply(block, lowestValue, initial);
                    }
                }

                /*
                if(!document.body.classList.contains('data-editor')) {
                    const content = block.querySelector('.is-container');
                    if(content) {
                        if(viewportWidth>1600) {
                            const n = (viewportWidth/1600) * 0.87; // adjustment: 0.9
                            content.style.transform = `scale(${n})`;
                            content.style.transformOrigin = 'center'
                        } else {
                            content.style.transform = '';
                            content.style.transformOrigin = ''
                        }
                    }
                }
                */
               
            });
        },
        render: ()=>{
            Block.start();
            Block.resize(true); //true=initial
        }
    }

    // const resize = () => {
    //     Block.resize();
    // }
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };
    const resize = debounce(() => {
        Block.resize();
    }, 0);

    window.addEventListener('resize', resize);

    function pageReRender() {

        prepareContent();
    
        contentBoxOnRenderUpdate();
    
        if(!window.skrollrr) {
    
            initeSkrollrr();
    
        } else {
    
            window.skrollrr.refresh();
        }
        
        functionLightboxInit();
    
        inViewSetup();
        setTimeout(()=>{ inViewSetup() },750);
        setTimeout(()=>{ inViewSetup() },1500);

        // box-canvas
        Block.start();
        Block.resize();
    }

    window.Block = Block; // box-canvas

    window.prepareContent = prepareContent;
    window.updateOnResize = updateOnResize;

    window.initeSkrollrr = initeSkrollrr; // Requires Skrollrr script
    window.contentBoxOnRenderUpdate = contentBoxOnRenderUpdate;

    window.functionLightboxInit = functionLightboxInit; //Requires Lightbox script
    window.inViewSetup = inViewSetup;

    window.pageReRender = pageReRender;

    window.adjustBgPos = adjustBgPos;
})();

documentReady(function(){
    
    prepareContent();

    updateOnResize();

    // box-canvas
    Block.start();
    Block.resize(true); //true=initial
});

function documentReady(fn) {
    var stateCheck = setInterval(function () {
        if (document.readyState === "interactive" || document.readyState === "complete") {
            clearInterval(stateCheck);
            try {
                fn()
            } catch (e) {}
        } 
    }, 1);
};

/* 
Skrollrr | 2022 InnovaStudio.
Inspired by Skrollr (https://github.com/Prinzhorn/skrollr | MIT license)
Powered by Lax.js (https://github.com/alexfoxy/lax.js | MIT license) 
*/
var Skrollrr=function(){"use strict";var t={exports:{}};!function(t){function e(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var a=[],s=!0,n=!1,i=void 0;try{for(var r,l=t[Symbol.iterator]();!(s=(r=l.next()).done)&&(a.push(r.value),!e||a.length!==e);s=!0);}catch(t){n=!0,i=t}finally{try{s||null==l.return||l.return()}finally{if(n)throw i}}return a}}(t,e)||function(t,e){if(t){if("string"==typeof t)return a(t,e);var s=Object.prototype.toString.call(t).slice(8,-1);return"Object"===s&&t.constructor&&(s=t.constructor.name),"Map"===s||"Set"===s?Array.from(t):"Arguments"===s||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(s)?a(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function a(t,e){(null==e||e>t.length)&&(e=t.length);for(var a=0,s=new Array(e);a<e;a++)s[a]=t[a];return s}function s(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function n(t,e,a){return e in t?Object.defineProperty(t,e,{value:a,enumerable:!0,configurable:!0,writable:!0}):t[e]=a,t}!function(){function a(t){return["elInY+elHeight","elCenterY-".concat(t=0<arguments.length&&void 0!==t?t:30),"elCenterY","elCenterY+".concat(t),"elOutY-elHeight"]}var i,r,l,d,h,o,b={fadeInOut:function(t,e){return e=1<arguments.length&&void 0!==e?e:0,{opacity:[a(0<arguments.length&&void 0!==t?t:30),[e,1,1,1,e]]}},fadeIn:function(t,e){return{opacity:[["elInY+elHeight",0<arguments.length&&void 0!==t?t:"elCenterY"],[1<arguments.length&&void 0!==e?e:0,1]]}},fadeOut:function(t,e){return{opacity:[[0<arguments.length&&void 0!==t?t:"elCenterY","elOutY-elHeight"],[1,1<arguments.length&&void 0!==e?e:0]]}},blurInOut:function(t,e){return e=1<arguments.length&&void 0!==e?e:20,{blur:[a(0<arguments.length&&void 0!==t?t:100),[e,0,0,0,e]]}},blurIn:function(t,e){return{blur:[["elInY+elHeight",0<arguments.length&&void 0!==t?t:"elCenterY"],[1<arguments.length&&void 0!==e?e:20,0]]}},blurOut:function(t,e){return{opacity:[[0<arguments.length&&void 0!==t?t:"elCenterY","elOutY-elHeight"],[0,1<arguments.length&&void 0!==e?e:20]]}},scaleInOut:function(t,e){return e=1<arguments.length&&void 0!==e?e:.6,{scale:[a(0<arguments.length&&void 0!==t?t:100),[e,1,1,1,e]]}},scaleIn:function(t,e){return{scale:[["elInY+elHeight",0<arguments.length&&void 0!==t?t:"elCenterY"],[1<arguments.length&&void 0!==e?e:.6,1]]}},scaleOut:function(t,e){return{scale:[[0<arguments.length&&void 0!==t?t:"elCenterY","elOutY-elHeight"],[1,1<arguments.length&&void 0!==e?e:.6]]}},slideX:function(t,e){return{translateX:[["elInY",0<arguments.length&&void 0!==t?t:0],[0,1<arguments.length&&void 0!==e?e:500]]}},slideY:function(t,e){return{translateY:[["elInY",0<arguments.length&&void 0!==t?t:0],[0,1<arguments.length&&void 0!==e?e:500]]}},spin:function(t,e){return{rotate:[[0,t=0<arguments.length&&void 0!==t?t:1e3],[0,1<arguments.length&&void 0!==e?e:360],{modValue:t}]}},flipX:function(t,e){return{rotateX:[[0,t=0<arguments.length&&void 0!==t?t:1e3],[0,1<arguments.length&&void 0!==e?e:360],{modValue:t}]}},flipY:function(t,e){return{rotateY:[[0,t=0<arguments.length&&void 0!==t?t:1e3],[0,1<arguments.length&&void 0!==e?e:360],{modValue:t}]}},jiggle:function(t,e){return{skewX:[[0,+(t=0<arguments.length&&void 0!==t?t:50),2*t,3*t,4*t],[0,e=1<arguments.length&&void 0!==e?e:40,0,-e,0],{modValue:4*t}]}},seesaw:function(t,e){return{skewY:[[0,+(t=0<arguments.length&&void 0!==t?t:50),2*t,3*t,4*t],[0,e=1<arguments.length&&void 0!==e?e:40,0,-e,0],{modValue:4*t}]}},zigzag:function(t,e){return{translateX:[[0,+(t=0<arguments.length&&void 0!==t?t:100),2*t,3*t,4*t],[0,e=1<arguments.length&&void 0!==e?e:100,0,-e,0],{modValue:4*t}]}},hueRotate:function(t,e){return{"hue-rotate":[[0,t=0<arguments.length&&void 0!==t?t:600],[0,1<arguments.length&&void 0!==e?e:360],{modValue:t}]}}},u=(i=["perspective","scaleX","scaleY","scale","skewX","skewY","skew","rotateX","rotateY","rotate"],r=["blur","hue-rotate","brightness"],l=["translateX","translateY","translateZ"],d=["perspective","border-radius","blur","translateX","translateY","translateZ"],h=["hue-rotate","rotate","rotateX","rotateY","skew","skewX","skewY"],o={easeInQuad:function(t){return t*t},easeOutQuad:function(t){return t*(2-t)},easeInOutQuad:function(t){return t<.5?2*t*t:(4-2*t)*t-1},easeInCubic:function(t){return t*t*t},easeOutCubic:function(t){return--t*t*t+1},easeInOutCubic:function(t){return t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1},easeInQuart:function(t){return t*t*t*t},easeOutQuart:function(t){return 1- --t*t*t*t},easeInOutQuart:function(t){return t<.5?8*t*t*t*t:1-8*--t*t*t*t},easeInQuint:function(t){return t*t*t*t*t},easeOutQuint:function(t){return 1+--t*t*t*t*t},easeInOutQuint:function(t){return t<.5?16*t*t*t*t*t:1+16*--t*t*t*t*t},easeOutBounce:function(t){var e=7.5625,a=2.75;return t<1/a?e*t*t:t<2/a?e*(t-=1.5/a)*t+.75:t<2.5/a?e*(t-=2.25/a)*t+.9375:e*(t-=2.625/a)*t+.984375},easeInBounce:function(t){return 1-o.easeOutBounce(1-t)},easeOutBack:function(t){return 1+2.70158*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2)},easeInBack:function(t){return 2.70158*t*t*t-1.70158*t*t}},new function t(){var e=this;s(this,t),n(this,"drivers",[]),n(this,"elements",[]),n(this,"frame",0),n(this,"debug",!1),n(this,"windowWidth",0),n(this,"windowHeight",0),n(this,"presets",b),n(this,"debugData",{frameLengths:[]}),n(this,"init",(function(){e.findAndAddElements(),window.requestAnimationFrame(e.onAnimationFrame),e.windowWidth=document.body.clientWidth,e.windowHeight=document.body.clientHeight,window.onresize=e.onWindowResize})),n(this,"onWindowResize",(function(){document.body.clientWidth===e.windowWidth&&document.body.clientHeight===e.windowHeight||(e.windowWidth=document.body.clientWidth,e.windowHeight=document.body.clientHeight,e.elements.forEach((function(t){return t.calculateTransforms()})))})),n(this,"onAnimationFrame",(function(t){e.debug&&(e.debugData.frameStart=Date.now());var a,s={};e.drivers.forEach((function(t){s[t.name]=t.getValue(e.frame)})),e.elements.forEach((function(t){t.update(s,e.frame)})),e.debug&&e.debugData.frameLengths.push(Date.now()-e.debugData.frameStart),e.frame%60==0&&e.debug&&(a=Math.ceil(e.debugData.frameLengths.reduce((function(t,e){return t+e}),0)/60),console.log("Average frame calculation time: ".concat(a,"ms")),e.debugData.frameLengths=[]),e.frame++,window.requestAnimationFrame(e.onAnimationFrame)})),n(this,"addDriver",(function(t,a){var s=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{};e.drivers.push(new O(t,a,s))})),n(this,"removeDriver",(function(t){e.drivers=e.drivers.filter((function(e){return e.name!==t}))})),n(this,"findAndAddElements",(function(){e.elements=[],document.querySelectorAll(".lax").forEach((function(t){var a=[];t.classList.forEach((function(t){t.includes("lax_preset")&&(t=t.replace("lax_preset_",""),a.push(t))}));var s=n({},"scrollY",{presets:a});e.elements.push(new m(".lax",e,t,s,0,{}))}))})),n(this,"addElements",(function(t,a,s){document.querySelectorAll(t).forEach((function(n,i){e.elements.push(new m(t,e,n,a,i,s))}))})),n(this,"removeElements",(function(t){e.elements=e.elements.filter((function(e){return e.selector!==t}))})),n(this,"addElement",(function(t,a,s){e.elements.push(new m("",e,t,a,0,s))})),n(this,"removeElement",(function(t){e.elements=e.elements.filter((function(e){return e.domElement!==t}))}))});function c(t,e){if(Array.isArray(t))return t;for(var a=Object.keys(t).map((function(t){return parseInt(t)})).sort((function(t,e){return e<t?1:-1})),s=a[a.length-1],n=0;n<a.length;n++){var i=a[n];if(e<i){s=i;break}}return t[s]}function g(t,e,a){var s=e.width,n=e.height,i=e.x,r=e.y;if("number"==typeof t)return t;var l=document.body.scrollHeight,d=document.body.scrollWidth,h=window.innerWidth,o=window.innerHeight,b=window.scrollY;i=(e=i+window.scrollX)+s,b=(r=r+b)+n;return Function("return ".concat(t.replace(/screenWidth/g,h).replace(/screenHeight/g,o).replace(/pageHeight/g,l).replace(/pageWidth/g,d).replace(/elWidth/g,s).replace(/elHeight/g,n).replace(/elInY/g,r-o).replace(/elOutY/g,b).replace(/elCenterY/g,r+n/2-o/2).replace(/elInX/g,e-h).replace(/elOutX/g,i).replace(/elCenterX/g,e+s/2-h/2).replace(/index/g,a)))()}function O(t,e){var a=this,i=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{};s(this,O),n(this,"getValueFn",void 0),n(this,"name",""),n(this,"lastValue",0),n(this,"frameStep",1),n(this,"m1",0),n(this,"m2",0),n(this,"inertia",0),n(this,"inertiaEnabled",!1),n(this,"getValue",(function(t){var e=a.lastValue;return t%a.frameStep==0&&(e=a.getValueFn()),a.inertiaEnabled&&(t=e-a.lastValue,a.m1=.8*a.m1+t*(1-.8),a.m2=.8*a.m2+a.m1*(1-.8),a.inertia=Math.round(5e3*a.m2)/15e3),a.lastValue=e,[a.lastValue,a.inertia]})),this.name=t,this.getValueFn=e,Object.keys(i).forEach((function(t){a[t]=i[t]})),this.lastValue=this.getValueFn()}function m(t,a,b,u){var O=this,j=4<arguments.length&&void 0!==arguments[4]?arguments[4]:0,f=5<arguments.length&&void 0!==arguments[5]?arguments[5]:{};s(this,m),n(this,"domElement",void 0),n(this,"transformsData",void 0),n(this,"styles",{}),n(this,"selector",""),n(this,"groupIndex",0),n(this,"laxInstance",void 0),n(this,"onUpdate",void 0),n(this,"update",(function(t,a){var s,n=O.transforms,i={};for(s in n){var r=n[s];t[s]||console.error("No lax driver with name: ",s);var l,b=e(t[s],2),u=b[0],c=b[1];for(l in r){var g,m=(y=e(r[l],3))[0],j=y[1],f=(Y=void 0===(A=y[2])?{}:A).modValue,p=void 0===(v=Y.frameStep)?1:v,V=Y.easing,y=Y.inertia,A=Y.inertiaMode,v=Y.cssFn,Y=void 0===(Y=Y.cssUnit)?"":Y;V=o[V];a%p==0&&(V=function(t,e,a,s){var n=0;if(t.forEach((function(t){t<a&&n++})),n<=0)return e[0];if(n>=t.length)return e[t.length-1];var i,r=(r=t[i=n-1],t=t[n],(a-r)/(t-r));return s&&(r=s(r)),(i=e[i])*(1-r)+(e=e[n])*r}(m,j,f?u%f:u,V),y&&(g=c*y,"absolute"===A&&(g=Math.abs(g)),V+=g),g="px"==(Y||d.includes(l)?"px":h.includes(l)?"deg":"")?0:3,g=V.toFixed(g),i[l]=v?v(g,O.domElement):g+Y)}}O.applyStyles(i),O.onUpdate&&O.onUpdate(t,O.domElement)})),n(this,"calculateTransforms",(function(){O.transforms={};var t,a=O.laxInstance.windowWidth;for(t in O.transformsData)!function(t){var s=O.transformsData[t],n={},i=s.presets;for(var r in(void 0===i?[]:i).forEach((function(t){var a,n,i=(n=e(t.split("-"),3))[0],r=n[1];t=n[2];(n=window.lax.presets[i])?(a=n(r,t),Object.keys(a).forEach((function(t){s[t]=a[t]}))):console.error("Lax preset cannot be found with name: ",i)})),delete s.presets,s)!function(t){var i=void 0===(r=(l=e(s[t],3))[0])?[-1e9,1e9]:r,r=void 0===(r=l[1])?[-1e9,1e9]:r,l=void 0===(l=l[2])?{}:l,d=O.domElement.getBoundingClientRect();i=c(i,a).map((function(t){return g(t,d,O.groupIndex)})),r=c(r,a).map((function(t){return g(t,d,O.groupIndex)}));n[t]=[i,r,l]}(r);O.transforms[t]=n}(t)})),n(this,"applyStyles",(function(t){var e,a,s,n=(e=t,a={transform:"",filter:""},s={translateX:1e-5,translateY:1e-5,translateZ:1e-5},Object.keys(e).forEach((function(t){var n=e[t],o=d.includes(t)?"px":h.includes(t)?"deg":"";l.includes(t)?s[t]=n:i.includes(t)?a.transform+="".concat(t,"(").concat(n).concat(o,") "):r.includes(t)?a.filter+="".concat(t,"(").concat(n).concat(o,") "):a[t]="".concat(n).concat(o," ")})),a.transform="translate3d(".concat(s.translateX,"px, ").concat(s.translateY,"px, ").concat(s.translateZ,"px) ").concat(a.transform),a);Object.keys(n).forEach((function(t){O.domElement.style.setProperty(t,n[t])}))})),this.selector=t,this.laxInstance=a,this.domElement=b,this.transformsData=u,this.groupIndex=j;var p=void 0===(j=f.style)?{}:j;f=f.onUpdate;Object.keys(p).forEach((function(t){b.style.setProperty(t,p[t])})),f&&(this.onUpdate=f),this.calculateTransforms()}void 0!==t.exports?t.exports=u:window.lax=u}()}(t);var e=t.exports;return class{constructor(t={}){this.settings=Object.assign(this,{},t),this.elements=[]}init(){e.init(),e.addDriver("scrollY",(function(){return window.scrollY})),this.refresh(),this.lax=e,Object.assign(this,e)}refresh(){let t=!1;document.body.hasAttribute("data-skrollrr-off")&&(t=!0),this.elements.forEach((t=>{e.removeElement(t),t.style&&(t.style.transition&&(t.style.transition=""),t.style.transform&&(t.style.transform=""))})),this.elements=[];let a=window.innerWidth;document.querySelectorAll("[data-bottom-top],[data-center],[data-center-bottom],[data-100-top],[data-50-top],[data-top],[data-top-bottom],[data-center-top],[data--300-bottom],[data--150-bottom],[data--50-bottom],[data-bottom],[data-100-bottom],[data-150-bottom],[data-400-bottom],[data--400-bottom],[data--200-bottom],[data--100-bottom],[data-50-bottom],[data-200-bottom],[data-300-bottom],[data-in],[data-in-150],[data-in-300],[data-cen--150],[data-cen],[data-cen-150],[data-out--300],[data-out--150],[data-out][data-t],[data-t-100],[data-t-200],[data-t-300],[data-t-400],[data-t-500],[data-t-600],[data-t-700],[data-t-800],[data-t-900],[data-t-1000],[data-t-1100],[data-t-1200],[data-t-1300],[data-t-1400],[data-t-1500],[data-t-1600],[data-t-1700],[data-t-1800],[data-t-1900],[data-t-2000],[data-t-2100],[data-t-2200],[data-t-2300],[data-t-2400],[data-t-2500],[data-t-2600],[data-t-2700],[data-t-2800]").forEach((s=>{let n=!1;if(a<=760&&s.closest(".m-skrollrr-off")&&(n=!0),t||n)return s.style.transform="",s.style.transition="",void(s.style.opacity="");s.style.transform="";let i=this.getObjVal(s,"data-top-bottom"),r=this.getObjVal(s,"data-top"),l=this.getObjVal(s,"data-50-top"),d=this.getObjVal(s,"data-100-top"),h=this.getObjVal(s,"data-center-bottom"),o=this.getObjVal(s,"data-center"),b=this.getObjVal(s,"data-center-top"),u=this.getObjVal(s,"data--400-bottom"),c=this.getObjVal(s,"data--300-bottom"),g=this.getObjVal(s,"data--200-bottom"),O=this.getObjVal(s,"data--150-bottom"),m=this.getObjVal(s,"data--100-bottom"),j=this.getObjVal(s,"data--50-bottom"),f=this.getObjVal(s,"data-bottom"),p=this.getObjVal(s,"data-50-bottom"),V=this.getObjVal(s,"data-100-bottom"),y=this.getObjVal(s,"data-150-bottom"),A=this.getObjVal(s,"data-200-bottom"),v=this.getObjVal(s,"data-300-bottom"),Y=this.getObjVal(s,"data-400-bottom"),x=this.getObjVal(s,"data-bottom-top"),I=this.getObjVal(s,"data-in"),k=this.getObjVal(s,"data-in-150"),w=this.getObjVal(s,"data-in-300"),E=this.getObjVal(s,"data-cen--150"),X=this.getObjVal(s,"data-cen"),C=this.getObjVal(s,"data-cen-150"),H=this.getObjVal(s,"data-out--300"),F=this.getObjVal(s,"data-out--150"),S=this.getObjVal(s,"data-out"),W=!1;s.hasAttribute("data-xs")&&(W=!0);let D=!1;s.hasAttribute("data-sm")&&(D=!0);let Q=!1;s.hasAttribute("data-md")&&(Q=!0),s.hasAttribute("data-lg"),s.hasAttribute("data-xl");let T={},M={},U={},q={},B={},L={},z={},P={},R={},Z={},_={},N={},$={},G={},J={},K={},tt={},et={},at={},st={},nt={},it={},rt={},lt={},dt={},ht={},ot={},bt={},ut={},ct={},gt={},Ot={},mt={};(a>1280||a>970&&a<=1280&&!Q||a>760&&a<=970&&!D||a<=760&&!W)&&(U=this.getObjVal(s,"data-t"),q=this.getObjVal(s,"data-t-100"),B=this.getObjVal(s,"data-t-200"),L=this.getObjVal(s,"data-t-300"),z=this.getObjVal(s,"data-t-400"),P=this.getObjVal(s,"data-t-500"),R=this.getObjVal(s,"data-t-600"),Z=this.getObjVal(s,"data-t-700"),_=this.getObjVal(s,"data-t-800"),N=this.getObjVal(s,"data-t-900"),$=this.getObjVal(s,"data-t-1000"),G=this.getObjVal(s,"data-t-1100"),J=this.getObjVal(s,"data-t-1200"),K=this.getObjVal(s,"data-t-1300"),tt=this.getObjVal(s,"data-t-1400"),et=this.getObjVal(s,"data-t-1500"),at=this.getObjVal(s,"data-t-1600"),st=this.getObjVal(s,"data-t-1700"),nt=this.getObjVal(s,"data-t-1800"),it=this.getObjVal(s,"data-t-1900"),rt=this.getObjVal(s,"data-t-2000"),lt=this.getObjVal(s,"data-t-2100"),dt=this.getObjVal(s,"data-t-2200"),ht=this.getObjVal(s,"data-t-2300"),ot=this.getObjVal(s,"data-t-2400"),bt=this.getObjVal(s,"data-t-2500"),ut=this.getObjVal(s,"data-t-2600"),ct=this.getObjVal(s,"data-t-2700"),gt=this.getObjVal(s,"data-t-2800")),a>970&&a<=1280&&Q&&(s.hasAttribute("data-md-t")&&(U=this.getObjVal(s,"data-md-t")),s.hasAttribute("data-md-t-100")&&(q=this.getObjVal(s,"data-md-t-100")),s.hasAttribute("data-md-t-200")&&(B=this.getObjVal(s,"data-md-t-200")),s.hasAttribute("data-md-t-300")&&(L=this.getObjVal(s,"data-md-t-300")),s.hasAttribute("data-md-t-400")&&(z=this.getObjVal(s,"data-md-t-400")),s.hasAttribute("data-md-t-500")&&(P=this.getObjVal(s,"data-md-t-500")),s.hasAttribute("data-md-t-600")&&(R=this.getObjVal(s,"data-md-t-600")),s.hasAttribute("data-md-t-700")&&(Z=this.getObjVal(s,"data-md-t-700")),s.hasAttribute("data-md-t-800")&&(_=this.getObjVal(s,"data-md-t-800")),s.hasAttribute("data-md-t-900")&&(N=this.getObjVal(s,"data-md-t-900")),s.hasAttribute("data-md-t-1000")&&($=this.getObjVal(s,"data-md-t-1000")),s.hasAttribute("data-md-t-1100")&&(G=this.getObjVal(s,"data-md-t-1100")),s.hasAttribute("data-md-t-1200")&&(J=this.getObjVal(s,"data-md-t-1200")),s.hasAttribute("data-md-t-1300")&&(K=this.getObjVal(s,"data-md-t-1300")),s.hasAttribute("data-md-t-1400")&&(tt=this.getObjVal(s,"data-md-t-1400")),s.hasAttribute("data-md-t-1500")&&(et=this.getObjVal(s,"data-md-t-1500")),s.hasAttribute("data-md-t-1600")&&(at=this.getObjVal(s,"data-md-t-1600")),s.hasAttribute("data-md-t-1700")&&(st=this.getObjVal(s,"data-md-t-1700")),s.hasAttribute("data-md-t-1800")&&(nt=this.getObjVal(s,"data-md-t-1800")),s.hasAttribute("data-md-t-1900")&&(it=this.getObjVal(s,"data-md-t-1900")),s.hasAttribute("data-md-t-2000")&&(rt=this.getObjVal(s,"data-md-t-2000")),s.hasAttribute("data-md-t-2100")&&(lt=this.getObjVal(s,"data-md-t-2100")),s.hasAttribute("data-md-t-2200")&&(dt=this.getObjVal(s,"data-md-t-2200")),s.hasAttribute("data-md-t-2300")&&(ht=this.getObjVal(s,"data-md-t-2300")),s.hasAttribute("data-md-t-2400")&&(ot=this.getObjVal(s,"data-md-t-2400")),s.hasAttribute("data-md-t-2500")&&(bt=this.getObjVal(s,"data-md-t-2500")),s.hasAttribute("data-md-t-2600")&&(ut=this.getObjVal(s,"data-md-t-2600")),s.hasAttribute("data-md-t-2700")&&(ct=this.getObjVal(s,"data-md-t-2700")),s.hasAttribute("data-md-t-2800")&&(gt=this.getObjVal(s,"data-md-t-2800"))),a<=970&&s.hasAttribute("m-data-out")&&(S=this.getObjVal(s,"m-data-out")),(a>760&&a<=970&&D||a<=760&&!W&&D)&&(s.hasAttribute("data-sm-t")&&(U=this.getObjVal(s,"data-sm-t")),s.hasAttribute("data-sm-t-100")&&(q=this.getObjVal(s,"data-sm-t-100")),s.hasAttribute("data-sm-t-200")&&(B=this.getObjVal(s,"data-sm-t-200")),s.hasAttribute("data-sm-t-300")&&(L=this.getObjVal(s,"data-sm-t-300")),s.hasAttribute("data-sm-t-400")&&(z=this.getObjVal(s,"data-sm-t-400")),s.hasAttribute("data-sm-t-500")&&(P=this.getObjVal(s,"data-sm-t-500")),s.hasAttribute("data-sm-t-600")&&(R=this.getObjVal(s,"data-sm-t-600")),s.hasAttribute("data-sm-t-700")&&(Z=this.getObjVal(s,"data-sm-t-700")),s.hasAttribute("data-sm-t-800")&&(_=this.getObjVal(s,"data-sm-t-800")),s.hasAttribute("data-sm-t-900")&&(N=this.getObjVal(s,"data-sm-t-900")),s.hasAttribute("data-sm-t-1000")&&($=this.getObjVal(s,"data-sm-t-1000")),s.hasAttribute("data-sm-t-1100")&&(G=this.getObjVal(s,"data-sm-t-1100")),s.hasAttribute("data-sm-t-1200")&&(J=this.getObjVal(s,"data-sm-t-1200")),s.hasAttribute("data-sm-t-1300")&&(K=this.getObjVal(s,"data-sm-t-1300")),s.hasAttribute("data-sm-t-1400")&&(tt=this.getObjVal(s,"data-sm-t-1400")),s.hasAttribute("data-sm-t-1500")&&(et=this.getObjVal(s,"data-sm-t-1500")),s.hasAttribute("data-sm-t-1600")&&(at=this.getObjVal(s,"data-sm-t-1600")),s.hasAttribute("data-sm-t-1700")&&(st=this.getObjVal(s,"data-sm-t-1700")),s.hasAttribute("data-sm-t-1800")&&(nt=this.getObjVal(s,"data-sm-t-1800")),s.hasAttribute("data-sm-t-1900")&&(it=this.getObjVal(s,"data-sm-t-1900")),s.hasAttribute("data-sm-t-2000")&&(rt=this.getObjVal(s,"data-sm-t-2000")),s.hasAttribute("data-sm-t-2100")&&(lt=this.getObjVal(s,"data-sm-t-2100")),s.hasAttribute("data-sm-t-2200")&&(dt=this.getObjVal(s,"data-sm-t-2200")),s.hasAttribute("data-sm-t-2300")&&(ht=this.getObjVal(s,"data-sm-t-2300")),s.hasAttribute("data-sm-t-2400")&&(ot=this.getObjVal(s,"data-sm-t-2400")),s.hasAttribute("data-sm-t-2500")&&(bt=this.getObjVal(s,"data-sm-t-2500")),s.hasAttribute("data-sm-t-2600")&&(ut=this.getObjVal(s,"data-sm-t-2600")),s.hasAttribute("data-sm-t-2700")&&(ct=this.getObjVal(s,"data-sm-t-2700")),s.hasAttribute("data-sm-t-2800")&&(gt=this.getObjVal(s,"data-sm-t-2800"))),a<=414&&W&&(s.hasAttribute("data-xs-t")&&(U=this.getObjVal(s,"data-xs-t")),s.hasAttribute("data-xs-t-100")&&(q=this.getObjVal(s,"data-xs-t-100")),s.hasAttribute("data-xs-t-200")&&(B=this.getObjVal(s,"data-xs-t-200")),s.hasAttribute("data-xs-t-300")&&(L=this.getObjVal(s,"data-xs-t-300")),s.hasAttribute("data-xs-t-400")&&(z=this.getObjVal(s,"data-xs-t-400")),s.hasAttribute("data-xs-t-500")&&(P=this.getObjVal(s,"data-xs-t-500")),s.hasAttribute("data-xs-t-600")&&(R=this.getObjVal(s,"data-xs-t-600")),s.hasAttribute("data-xs-t-700")&&(Z=this.getObjVal(s,"data-xs-t-700")),s.hasAttribute("data-xs-t-800")&&(_=this.getObjVal(s,"data-xs-t-800")),s.hasAttribute("data-xs-t-900")&&(N=this.getObjVal(s,"data-xs-t-900")),s.hasAttribute("data-xs-t-1000")&&($=this.getObjVal(s,"data-xs-t-1000")),s.hasAttribute("data-xs-t-1100")&&(G=this.getObjVal(s,"data-xs-t-1100")),s.hasAttribute("data-xs-t-1200")&&(J=this.getObjVal(s,"data-xs-t-1200")),s.hasAttribute("data-xs-t-1300")&&(K=this.getObjVal(s,"data-xs-t-1300")),s.hasAttribute("data-xs-t-1400")&&(tt=this.getObjVal(s,"data-xs-t-1400")),s.hasAttribute("data-xs-t-1500")&&(et=this.getObjVal(s,"data-xs-t-1500")),s.hasAttribute("data-xs-t-1600")&&(at=this.getObjVal(s,"data-xs-t-1600")),s.hasAttribute("data-xs-t-1700")&&(st=this.getObjVal(s,"data-xs-t-1700")),s.hasAttribute("data-xs-t-1800")&&(nt=this.getObjVal(s,"data-xs-t-1800")),s.hasAttribute("data-xs-t-1900")&&(it=this.getObjVal(s,"data-xs-t-1900")),s.hasAttribute("data-xs-t-2000")&&(rt=this.getObjVal(s,"data-xs-t-2000")),s.hasAttribute("data-xs-t-2100")&&(lt=this.getObjVal(s,"data-xs-t-2100")),s.hasAttribute("data-xs-t-2200")&&(dt=this.getObjVal(s,"data-xs-t-2200")),s.hasAttribute("data-xs-t-2300")&&(ht=this.getObjVal(s,"data-xs-t-2300")),s.hasAttribute("data-xs-t-2400")&&(ot=this.getObjVal(s,"data-xs-t-2400")),s.hasAttribute("data-xs-t-2500")&&(bt=this.getObjVal(s,"data-xs-t-2500")),s.hasAttribute("data-xs-t-2600")&&(ut=this.getObjVal(s,"data-xs-t-2600")),s.hasAttribute("data-xs-t-2700")&&(ct=this.getObjVal(s,"data-xs-t-2700")),s.hasAttribute("data-xs-t-2800")&&(gt=this.getObjVal(s,"data-xs-t-2800")));let jt=U,ft=q,pt=B,Vt=L,yt=z,At=P,vt=R,Yt=Z,xt=_,It=N,kt=$,wt=G,Et=J,Xt=K,Ct=tt,Ht=et,Ft=at,St=st,Wt=nt,Dt=it,Qt=rt,Tt=lt,Mt=dt,Ut=ht,qt=ot,Bt=bt,Lt=ut,zt=ct,Pt=gt,Rt=window.innerHeight;Rt<730?(T=jt,M=ft,U=pt,q=Vt,B=yt,L=At,z=vt,P=Yt,R=xt,Z=It,_=kt,N=wt,$=Et,G=Xt,J=Ct,K=Ht,tt=Ft,et=St,at=Wt,st=Dt,nt=Qt,it=Tt,rt=Mt,lt=Ut,dt=qt,ht=Bt,ot=Lt,bt=zt,ut=Pt,ct={},gt={}):Rt>=730&&Rt<790?(M=jt,U=ft,q=pt,B=Vt,L=yt,z=At,P=vt,R=Yt,Z=xt,_=It,N=kt,$=wt,G=Et,J=Xt,K=Ct,tt=Ht,et=Ft,at=St,st=Wt,nt=Dt,it=Qt,rt=Tt,lt=Mt,dt=Ut,ht=qt,ot=Bt,bt=Lt,ut=zt,ct=Pt,gt={}):Rt>=790&&Rt<840||(Rt>=840&&Rt<1125?(U={},q=jt,B=ft,L=pt,z=Vt,P=yt,R=At,Z=vt,_=Yt,N=xt,$=It,G=kt,J=wt,K=Et,tt=Xt,et=Ct,at=Ht,st=Ft,nt=St,it=Wt,rt=Dt,lt=Qt,dt=Tt,ht=Mt,ot=Ut,bt=qt,ut=Bt,ct=Lt,gt=zt,Ot=Pt):(U={},q={},B=jt,L=ft,z=pt,P=Vt,R=yt,Z=At,_=vt,N=Yt,$=xt,G=It,J=kt,K=wt,tt=Et,et=Xt,at=Ct,st=Ht,nt=Ft,it=St,rt=Wt,lt=Dt,dt=Qt,ht=Tt,ot=Mt,bt=Ut,ut=qt,ct=Bt,gt=Lt,Ot=zt,mt=Pt));let Zt={};0!==Object.keys(x).length&&(Zt=this.parseObj(x,"elInY",Zt)),0!==Object.keys(Y).length&&(Zt=this.parseObj(Y,"elInY+50",Zt)),0!==Object.keys(v).length&&(Zt=this.parseObj(v,"elInY+100",Zt)),0!==Object.keys(A).length&&(Zt=this.parseObj(A,"elInY+150",Zt)),0!==Object.keys(y).length&&(Zt=this.parseObj(y,"elInY+200",Zt)),0!==Object.keys(V).length&&(Zt=this.parseObj(V,"elInY+250",Zt)),0!==Object.keys(p).length&&(Zt=this.parseObj(p,"elInY+300",Zt)),0!==Object.keys(f).length&&(Zt=this.parseObj(f,"elInY+350",Zt)),0!==Object.keys(j).length&&(Zt=this.parseObj(j,"elInY+400",Zt)),0!==Object.keys(m).length&&(Zt=this.parseObj(m,"elInY+450",Zt)),0!==Object.keys(O).length&&(Zt=this.parseObj(O,"elInY+500",Zt)),0!==Object.keys(g).length&&(Zt=this.parseObj(g,"elInY+550",Zt)),0!==Object.keys(c).length&&(Zt=this.parseObj(c,"elInY+600",Zt)),0!==Object.keys(u).length&&(Zt=this.parseObj(u,"elInY+650",Zt)),0!==Object.keys(b).length&&(Zt=this.parseObj(b,"elCenterY-300",Zt)),0!==Object.keys(o).length&&(Zt=this.parseObj(o,"elCenterY",Zt)),0!==Object.keys(h).length&&(Zt=this.parseObj(h,"elCenterY+100",Zt)),0!==Object.keys(d).length&&(Zt=this.parseObj(d,"elCenterY+200",Zt)),0!==Object.keys(l).length&&(Zt=this.parseObj(l,"elCenterY+300",Zt)),0!==Object.keys(r).length&&(Zt=this.parseObj(r,"elOutY-300",Zt)),0!==Object.keys(i).length&&(Zt=this.parseObj(i,"elOutY",Zt)),0!==Object.keys(I).length&&(Zt=this.parseObj(I,"elInY",Zt)),0!==Object.keys(k).length&&(Zt=this.parseObj(k,"elInY+150",Zt)),0!==Object.keys(w).length&&(Zt=this.parseObj(w,"elInY+300 ",Zt)),0!==Object.keys(E).length&&(Zt=this.parseObj(E,"elCenterY-150",Zt)),0!==Object.keys(X).length&&(Zt=this.parseObj(X,"elCenterY",Zt)),0!==Object.keys(C).length&&(Zt=this.parseObj(C,"elCenterY+150",Zt)),0!==Object.keys(H).length&&(Zt=this.parseObj(H,"elOutY-300 ",Zt)),0!==Object.keys(F).length&&(Zt=this.parseObj(F,"elOutY-150  ",Zt)),0!==Object.keys(S).length&&(Zt=this.parseObj(S,"elOutY",Zt)),0!==Object.keys(T).length&&(Zt=this.parseObj(T,"elInY-200",Zt)),0!==Object.keys(M).length&&(Zt=this.parseObj(M,"elInY-100",Zt)),0!==Object.keys(U).length&&(Zt=this.parseObj(U,"elInY",Zt)),0!==Object.keys(q).length&&(Zt=this.parseObj(q,"elInY+100",Zt)),0!==Object.keys(B).length&&(Zt=this.parseObj(B,"elInY+200",Zt)),0!==Object.keys(L).length&&(Zt=this.parseObj(L,"elInY+300 ",Zt)),0!==Object.keys(z).length&&(Zt=this.parseObj(z,"elInY+400 ",Zt)),0!==Object.keys(P).length&&(Zt=this.parseObj(P,"elInY+500 ",Zt)),0!==Object.keys(R).length&&(Zt=this.parseObj(R,"elInY+600 ",Zt)),0!==Object.keys(Z).length&&(Zt=this.parseObj(Z,"elInY+700 ",Zt)),0!==Object.keys(_).length&&(Zt=this.parseObj(_,"elInY+800 ",Zt)),0!==Object.keys(N).length&&(Zt=this.parseObj(N,"elInY+900 ",Zt)),0!==Object.keys($).length&&(Zt=this.parseObj($,"elInY+1000 ",Zt)),0!==Object.keys(G).length&&(Zt=this.parseObj(G,"elInY+1100 ",Zt)),0!==Object.keys(J).length&&(Zt=this.parseObj(J,"elInY+1200 ",Zt)),0!==Object.keys(K).length&&(Zt=this.parseObj(K,"elInY+1300 ",Zt)),0!==Object.keys(tt).length&&(Zt=this.parseObj(tt,"elInY+1400 ",Zt)),0!==Object.keys(et).length&&(Zt=this.parseObj(et,"elInY+1500 ",Zt)),0!==Object.keys(at).length&&(Zt=this.parseObj(at,"elInY+1600 ",Zt)),0!==Object.keys(st).length&&(Zt=this.parseObj(st,"elInY+1700 ",Zt)),0!==Object.keys(nt).length&&(Zt=this.parseObj(nt,"elInY+1800 ",Zt)),0!==Object.keys(it).length&&(Zt=this.parseObj(it,"elInY+1900 ",Zt)),0!==Object.keys(rt).length&&(Zt=this.parseObj(rt,"elInY+2000 ",Zt)),0!==Object.keys(lt).length&&(Zt=this.parseObj(lt,"elInY+2100 ",Zt)),0!==Object.keys(dt).length&&(Zt=this.parseObj(dt,"elInY+2200 ",Zt)),0!==Object.keys(ht).length&&(Zt=this.parseObj(ht,"elInY+2300 ",Zt)),0!==Object.keys(ot).length&&(Zt=this.parseObj(ot,"elInY+2400 ",Zt)),0!==Object.keys(bt).length&&(Zt=this.parseObj(bt,"elInY+2500 ",Zt)),0!==Object.keys(ut).length&&(Zt=this.parseObj(ut,"elInY+2600 ",Zt)),0!==Object.keys(ct).length&&(Zt=this.parseObj(ct,"elInY+2700 ",Zt)),0!==Object.keys(gt).length&&(Zt=this.parseObj(gt,"elInY+2800 ",Zt)),0!==Object.keys(Ot).length&&(Zt=this.parseObj(Ot,"elInY+2900 ",Zt)),0!==Object.keys(mt).length&&(Zt=this.parseObj(mt,"elInY+3000 ",Zt)),s.style.transition="",s.setAttribute("data-dummy-selector","1"),e.addElements("[data-dummy-selector]",{scrollY:Zt}),this.elements.push(document.querySelector("[data-dummy-selector]")),s.removeAttribute("data-dummy-selector"),setTimeout((()=>{s.style.opacity=1,"off"===s.getAttribute("data-smooth-scrolling")||this.settings.transition&&(s.style.transition=this.settings.transition)}),100)}))}parseTransformProperty(t){for(var e,a=/(\w+)\((.+?)\)/g,s={};e=a.exec(t);)s[e[1]]=s[e[1]]?s[e[1]].concat([e[2]]):[e[2]];return s}getObjVal(t,e){let a={},s=t.getAttribute(e);if(s){s.split(";").forEach((t=>{if(-1!==t.indexOf("transform")&&(a=this.parseTransformProperty(t)),-1!==t.indexOf("opacity")){let e=t.replace("opacity:","").replace(";","");a.opacity=[parseFloat(e)]}}))}return a}parseObj(t,e,a){if(t.translateY){let s;s=-1!==t.translateY[0].indexOf("%")?parseFloat(t.translateY[0])/100*window.innerHeight:parseFloat(t.translateY[0]),a.translateY||(a.translateY=[[],[]]),a.translateY[0].push(e),a.translateY[1].push(s)}if(t.translateX){let s;s=-1!==t.translateX[0].indexOf("%")?parseFloat(t.translateX[0])/100*window.innerWidth:parseFloat(t.translateX[0]),a.translateX||(a.translateX=[[],[]]),a.translateX[0].push(e),a.translateX[1].push(s)}if(t.scale){let s=parseFloat(t.scale[0]);a.scale||(a.scale=[[],[]]),a.scale[0].push(e),a.scale[1].push(s)}if(t.rotate){let s=parseFloat(t.rotate[0]);a.rotate||(a.rotate=[[],[]]),a.rotate[0].push(e),a.rotate[1].push(s)}if(t.opacity){let s=parseFloat(t.opacity[0]);a.opacity||(a.opacity=[[],[]]),a.opacity[0].push(e),a.opacity[1].push(s)}return a}}}();


documentReady(function(){

    initeSkrollrr();

    contentBoxOnRenderUpdate();

});


/* AOS (Animate on scroll) | Copyright (c) 2015 Michał Sajnóg | The MIT License (MIT) */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.AOS=t()}(this,function(){"use strict";var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},t="Expected a function",n=NaN,o="[object Symbol]",i=/^\s+|\s+$/g,a=/^[-+]0x[0-9a-f]+$/i,r=/^0b[01]+$/i,c=/^0o[0-7]+$/i,s=parseInt,u="object"==typeof e&&e&&e.Object===Object&&e,d="object"==typeof self&&self&&self.Object===Object&&self,l=u||d||Function("return this")(),f=Object.prototype.toString,m=Math.max,p=Math.min,b=function(){return l.Date.now()};function v(e,n,o){var i,a,r,c,s,u,d=0,l=!1,f=!1,v=!0;if("function"!=typeof e)throw new TypeError(t);function y(t){var n=i,o=a;return i=a=void 0,d=t,c=e.apply(o,n)}function h(e){var t=e-u;return void 0===u||t>=n||t<0||f&&e-d>=r}function k(){var e=b();if(h(e))return x(e);s=setTimeout(k,function(e){var t=n-(e-u);return f?p(t,r-(e-d)):t}(e))}function x(e){return s=void 0,v&&i?y(e):(i=a=void 0,c)}function O(){var e=b(),t=h(e);if(i=arguments,a=this,u=e,t){if(void 0===s)return function(e){return d=e,s=setTimeout(k,n),l?y(e):c}(u);if(f)return s=setTimeout(k,n),y(u)}return void 0===s&&(s=setTimeout(k,n)),c}return n=w(n)||0,g(o)&&(l=!!o.leading,r=(f="maxWait"in o)?m(w(o.maxWait)||0,n):r,v="trailing"in o?!!o.trailing:v),O.cancel=function(){void 0!==s&&clearTimeout(s),d=0,i=u=a=s=void 0},O.flush=function(){return void 0===s?c:x(b())},O}function g(e){var t=typeof e;return!!e&&("object"==t||"function"==t)}function w(e){if("number"==typeof e)return e;if(function(e){return"symbol"==typeof e||function(e){return!!e&&"object"==typeof e}(e)&&f.call(e)==o}(e))return n;if(g(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=g(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(i,"");var u=r.test(e);return u||c.test(e)?s(e.slice(2),u?2:8):a.test(e)?n:+e}var y=function(e,n,o){var i=!0,a=!0;if("function"!=typeof e)throw new TypeError(t);return g(o)&&(i="leading"in o?!!o.leading:i,a="trailing"in o?!!o.trailing:a),v(e,n,{leading:i,maxWait:n,trailing:a})},h="Expected a function",k=NaN,x="[object Symbol]",O=/^\s+|\s+$/g,j=/^[-+]0x[0-9a-f]+$/i,E=/^0b[01]+$/i,N=/^0o[0-7]+$/i,z=parseInt,C="object"==typeof e&&e&&e.Object===Object&&e,A="object"==typeof self&&self&&self.Object===Object&&self,q=C||A||Function("return this")(),L=Object.prototype.toString,T=Math.max,M=Math.min,S=function(){return q.Date.now()};function D(e){var t=typeof e;return!!e&&("object"==t||"function"==t)}function H(e){if("number"==typeof e)return e;if(function(e){return"symbol"==typeof e||function(e){return!!e&&"object"==typeof e}(e)&&L.call(e)==x}(e))return k;if(D(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=D(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(O,"");var n=E.test(e);return n||N.test(e)?z(e.slice(2),n?2:8):j.test(e)?k:+e}var $=function(e,t,n){var o,i,a,r,c,s,u=0,d=!1,l=!1,f=!0;if("function"!=typeof e)throw new TypeError(h);function m(t){var n=o,a=i;return o=i=void 0,u=t,r=e.apply(a,n)}function p(e){var n=e-s;return void 0===s||n>=t||n<0||l&&e-u>=a}function b(){var e=S();if(p(e))return v(e);c=setTimeout(b,function(e){var n=t-(e-s);return l?M(n,a-(e-u)):n}(e))}function v(e){return c=void 0,f&&o?m(e):(o=i=void 0,r)}function g(){var e=S(),n=p(e);if(o=arguments,i=this,s=e,n){if(void 0===c)return function(e){return u=e,c=setTimeout(b,t),d?m(e):r}(s);if(l)return c=setTimeout(b,t),m(s)}return void 0===c&&(c=setTimeout(b,t)),r}return t=H(t)||0,D(n)&&(d=!!n.leading,a=(l="maxWait"in n)?T(H(n.maxWait)||0,t):a,f="trailing"in n?!!n.trailing:f),g.cancel=function(){void 0!==c&&clearTimeout(c),u=0,o=s=i=c=void 0},g.flush=function(){return void 0===c?r:v(S())},g},W=function(){};function P(e){e&&e.forEach(function(e){var t=Array.prototype.slice.call(e.addedNodes),n=Array.prototype.slice.call(e.removedNodes);if(function e(t){var n=void 0,o=void 0;for(n=0;n<t.length;n+=1){if((o=t[n]).dataset&&o.dataset.aos)return!0;if(o.children&&e(o.children))return!0}return!1}(t.concat(n)))return W()})}function Y(){return window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver}var _={isSupported:function(){return!!Y()},ready:function(e,t){var n=window.document,o=new(Y())(P);W=t,o.observe(n.documentElement,{childList:!0,subtree:!0,removedNodes:!0})}},B=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},F=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),I=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},K=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,G=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,J=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,Q=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;function R(){return navigator.userAgent||navigator.vendor||window.opera||""}var U=new(function(){function e(){B(this,e)}return F(e,[{key:"phone",value:function(){var e=R();return!(!K.test(e)&&!G.test(e.substr(0,4)))}},{key:"mobile",value:function(){var e=R();return!(!J.test(e)&&!Q.test(e.substr(0,4)))}},{key:"tablet",value:function(){return this.mobile()&&!this.phone()}},{key:"ie11",value:function(){return"-ms-scroll-limit"in document.documentElement.style&&"-ms-ime-align"in document.documentElement.style}}]),e}()),V=function(e,t){var n=void 0;return U.ie11()?(n=document.createEvent("CustomEvent")).initCustomEvent(e,!0,!0,{detail:t}):n=new CustomEvent(e,{detail:t}),document.dispatchEvent(n)},X=function(e){return e.forEach(function(e,t){return function(e,t){var n=e.options,o=e.position,i=e.node,a=(e.data,function(){e.animated&&(function(e,t){t&&t.forEach(function(t){return e.classList.remove(t)})}(i,n.animatedClassNames),V("aos:out",i),e.options.id&&V("aos:in:"+e.options.id,i),e.animated=!1)});n.mirror&&t>=o.out&&!n.once?a():t>=o.in?e.animated||(function(e,t){t&&t.forEach(function(t){return e.classList.add(t)})}(i,n.animatedClassNames),V("aos:in",i),e.options.id&&V("aos:in:"+e.options.id,i),e.animated=!0):e.animated&&!n.once&&a()}(e,window.pageYOffset)})},Z=function(e){for(var t=0,n=0;e&&!isNaN(e.offsetLeft)&&!isNaN(e.offsetTop);)t+=e.offsetLeft-("BODY"!=e.tagName?e.scrollLeft:0),n+=e.offsetTop-("BODY"!=e.tagName?e.scrollTop:0),e=e.offsetParent;return{top:n,left:t}},ee=function(e,t,n){var o=e.getAttribute("data-aos-"+t);if(void 0!==o){if("true"===o)return!0;if("false"===o)return!1}return o||n},te=function(e,t){return e.forEach(function(e,n){var o=ee(e.node,"mirror",t.mirror),i=ee(e.node,"once",t.once),a=ee(e.node,"id"),r=t.useClassNames&&e.node.getAttribute("data-aos"),c=[t.animatedClassName].concat(r?r.split(" "):[]).filter(function(e){return"string"==typeof e});t.initClassName&&e.node.classList.add(t.initClassName),e.position={in:function(e,t,n){var o=window.innerHeight,i=ee(e,"anchor"),a=ee(e,"anchor-placement"),r=Number(ee(e,"offset",a?0:t)),c=a||n,s=e;i&&document.querySelectorAll(i)&&(s=document.querySelectorAll(i)[0]);var u=Z(s).top-o;switch(c){case"top-bottom":break;case"center-bottom":u+=s.offsetHeight/2;break;case"bottom-bottom":u+=s.offsetHeight;break;case"top-center":u+=o/2;break;case"center-center":u+=o/2+s.offsetHeight/2;break;case"bottom-center":u+=o/2+s.offsetHeight;break;case"top-top":u+=o;break;case"bottom-top":u+=o+s.offsetHeight;break;case"center-top":u+=o+s.offsetHeight/2}return u+r}(e.node,t.offset,t.anchorPlacement),out:o&&function(e,t){window.innerHeight;var n=ee(e,"anchor"),o=ee(e,"offset",t),i=e;return n&&document.querySelectorAll(n)&&(i=document.querySelectorAll(n)[0]),Z(i).top+i.offsetHeight-o}(e.node,t.offset)},e.options={once:i,mirror:o,animatedClassNames:c,id:a}}),e},ne=function(){var e=document.querySelectorAll("[data-aos]");return Array.prototype.map.call(e,function(e){return{node:e}})},oe=[],ie=!1,ae={offset:120,delay:0,easing:"ease",duration:400,disable:!1,once:!1,mirror:!1,anchorPlacement:"top-bottom",startEvent:"DOMContentLoaded",animatedClassName:"aos-animate",initClassName:"aos-init",useClassNames:!1,disableMutationObserver:!1,throttleDelay:99,debounceDelay:50},re=function(){return document.all&&!window.atob},ce=function(){arguments.length>0&&void 0!==arguments[0]&&arguments[0]&&(ie=!0),ie&&(oe=te(oe,ae),X(oe),window.addEventListener("scroll",y(function(){X(oe,ae.once)},ae.throttleDelay)))},se=function(){if(oe=ne(),de(ae.disable)||re())return ue();ce()},ue=function(){oe.forEach(function(e,t){e.node.removeAttribute("data-aos"),e.node.removeAttribute("data-aos-easing"),e.node.removeAttribute("data-aos-duration"),e.node.removeAttribute("data-aos-delay"),ae.initClassName&&e.node.classList.remove(ae.initClassName),ae.animatedClassName&&e.node.classList.remove(ae.animatedClassName)})},de=function(e){return!0===e||"mobile"===e&&U.mobile()||"phone"===e&&U.phone()||"tablet"===e&&U.tablet()||"function"==typeof e&&!0===e()};return{init:function(e){return ae=I(ae,e),oe=ne(),ae.disableMutationObserver||_.isSupported()||(console.info('\n      aos: MutationObserver is not supported on this browser,\n      code mutations observing has been disabled.\n      You may have to call "refreshHard()" by yourself.\n    '),ae.disableMutationObserver=!0),ae.disableMutationObserver||_.ready("[data-aos]",se),de(ae.disable)||re()?ue():(document.querySelector("body").setAttribute("data-aos-easing",ae.easing),document.querySelector("body").setAttribute("data-aos-duration",ae.duration),document.querySelector("body").setAttribute("data-aos-delay",ae.delay),-1===["DOMContentLoaded","load"].indexOf(ae.startEvent)?document.addEventListener(ae.startEvent,function(){ce(!0)}):window.addEventListener("load",function(){ce(!0)}),"DOMContentLoaded"===ae.startEvent&&["complete","interactive"].indexOf(document.readyState)>-1&&ce(!0),window.addEventListener("resize",$(ce,ae.debounceDelay,!0)),window.addEventListener("orientationchange",$(ce,ae.debounceDelay,!0)),oe)},refresh:ce,refreshHard:se}});
AOS.init({
    duration: 1200
});

!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("ScrollTrigger",[],e):"object"==typeof exports?exports.ScrollTrigger=e():t.ScrollTrigger=e()}(window,(function(){return function(t){var e={};function i(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,i),o.l=!0,o.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)i.d(n,o,function(e){return t[e]}.bind(null,o));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=2)}([function(t,e){
    /*!
     * object-extend
     * A well-tested function to deep extend (or merge) JavaScript objects without further dependencies.
     *
     * http://github.com/bernhardw
     *
     * Copyright 2013, Bernhard Wanger <mail@bernhardwanger.com>
     * Released under the MIT license.
     *
     * Date: 2013-04-10
     */
    t.exports=function t(e,i){return null==e||null==i?e:(Object.keys(i).forEach((function(n){"[object Object]"==Object.prototype.toString.call(i[n])?"[object Object]"!=Object.prototype.toString.call(e[n])?e[n]=i[n]:e[n]=t(e[n],i[n]):e[n]=i[n]})),e)}},function(t,e){Array.prototype.each=function(t){for(var e=this.length,i=0;i<e;i++){var n=this[i];n&&t(n,i)}},NodeList.prototype.each=Array.prototype.each,NodeList.prototype.filter=Array.prototype.filter},function(t,e,i){"use strict";i.r(e);var n=function(){this.trigger={once:!1,offset:{viewport:{x:0,y:0},element:{x:0,y:0}},toggle:{class:{in:"visible",out:"invisible"},callback:{in:null,visible:null,out:null}}},this.scroll={sustain:300,element:window,callback:function(){},start:function(){},stop:function(){},directionChange:function(){}}},o=i(0),s=i.n(o);i(1);function r(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function l(t){return Number(t)===t&&t%1==0}function c(t){return Number(t)===t&&t%1!=0}var a=function(){function t(e,i){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.element=e,i=s()((new n).trigger,i),this.offset=i.offset,this.toggle=i.toggle,this.once=i.once,this.visible=null,this.active=!0}var e,i,o;return e=t,(i=[{key:"checkVisibility",value:function(t,e){if(!this.active)return this.visible;var i={w:t.offsetWidth||t.innerWidth||0,h:t.offsetHeight||t.innerHeight||0},n=this.getBounds(),o=this._checkVisibility(n,i,e);if(o!==this.visible){this.visible=o;var s=this._toggleCallback();s instanceof Promise?s.then(this._toggleClass.bind(this)).catch((function(t){console.error("Trigger promise failed"),console.error(t)})):this._toggleClass(),this.visible&&this.once&&(this.active=!1)}else if(o&&"function"==typeof this.toggle.callback.visible)return this.toggle.callback.visible.call(this.element,this);return o}},{key:"getBounds",value:function(){return this.element.getBoundingClientRect()}},{key:"_getElementOffset",value:function(t,e){var i={x:0,y:0};return"function"==typeof this.offset.element.x?i.x=t.width*this.offset.element.x(this,t,e):c(this.offset.element.x)?i.x=t.width*this.offset.element.x:l(this.offset.element.x)&&(i.x=this.offset.element.x),"function"==typeof this.offset.element.y?i.y=t.height*this.offset.element.y(this,t,e):c(this.offset.element.y)?i.y=t.height*this.offset.element.y:l(this.offset.element.y)&&(i.y=this.offset.element.y),i}},{key:"_getViewportOffset",value:function(t,e){var i={x:0,y:0};return"function"==typeof this.offset.viewport.x?i.x=t.w*this.offset.viewport.x(this,t,e):c(this.offset.viewport.x)?i.x=t.w*this.offset.viewport.x:l(this.offset.viewport.x)&&(i.x=this.offset.viewport.x),"function"==typeof this.offset.viewport.y?i.y=t.h*this.offset.viewport.y(this,t,e):c(this.offset.viewport.y)?i.y=t.h*this.offset.viewport.y:l(this.offset.viewport.y)&&(i.y=this.offset.viewport.y),i}},{key:"_checkVisibility",value:function(t,e,i){var n=this._getElementOffset(t,i),o=this._getViewportOffset(e,i),s=!0;return t.left-o.x<-(t.width-n.x)&&(s=!1),t.left+o.x>e.w-n.x&&(s=!1),t.top-o.y<-(t.height-n.y)&&(s=!1),t.top+o.y>e.h-n.y&&(s=!1),s}},{key:"_toggleClass",value:function(){var t=this;if(this.visible)return Array.isArray(this.toggle.class.in)?this.toggle.class.in.each((function(e){t.element.classList.add(e)})):this.element.classList.add(this.toggle.class.in),void(Array.isArray(this.toggle.class.out)?this.toggle.class.out.each((function(e){t.element.classList.remove(e)})):this.element.classList.remove(this.toggle.class.out));Array.isArray(this.toggle.class.in)?this.toggle.class.in.each((function(e){t.element.classList.remove(e)})):this.element.classList.remove(this.toggle.class.in),Array.isArray(this.toggle.class.out)?this.toggle.class.out.each((function(e){t.element.classList.add(e)})):this.element.classList.add(this.toggle.class.out)}},{key:"_toggleCallback",value:function(){if(this.visible){if("function"==typeof this.toggle.callback.in)return this.toggle.callback.in.call(this.element,this)}else if("function"==typeof this.toggle.callback.out)return this.toggle.callback.out.call(this.element,this)}}])&&r(e.prototype,i),o&&r(e,o),t}();function u(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var h=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.triggers=e instanceof Array?e:[]}var e,i,n;return e=t,(i=[{key:"add",value:function(t){var e=this;if(t instanceof a)return this.triggers.push(t);t.each((function(t){t instanceof a?e.triggers.push(t):console.error("Object added to TriggerCollection is not a Trigger. Object: ",t)}))}},{key:"remove",value:function(t){t instanceof a&&(t=[t]),this.triggers=this.triggers.filter((function(e){var i=!1;return t.each((function(t){t==e&&(i=!0)})),!i}))}},{key:"query",value:function(t){return this.triggers.filter((function(e){var i=e.element,n=i.parentNode;return[].slice.call(n.querySelectorAll(t)).indexOf(i)>-1}))}},{key:"search",value:function(t){var e=this.triggers.filter((function(e){if(t instanceof NodeList||Array.isArray(t)){var i=!1;return t.each((function(t){e.element==t&&(i=!0)})),i}return e.element==t}));return 0==e.length?null:e.length>1?e:e[0]}},{key:"call",value:function(t){this.triggers.each(t)}}])&&u(e.prototype,i),n&&u(e,n),t}();function f(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var g=function(){function t(e,i){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._parseOptions(e),"function"==typeof i&&(this.callback=i),this.direction="none",this.position=this.getPosition(),this.lastAction=this._getTimestamp(),this._startRun(),this._boundListener=this._didScroll.bind(this),this.element.addEventListener("scroll",this._boundListener)}var e,i,o;return e=t,(i=[{key:"_parseOptions",value:function(t){var e=(new n).scroll;"function"!=typeof t?(e.callback=function(){},e=s()(e,t)):e.callback=t,this.element=e.element,this.sustain=e.sustain,this.callback=e.callback,this.startCallback=e.start,this.stopCallback=e.stop,this.directionChange=e.directionChange}},{key:"_didScroll",value:function(){var t=this.getPosition();if(this.position!==t){var e=this.direction;(e=t.x!==this.position.x?t.x>this.position.x?"right":"left":t.y!==this.position.y?t.y>this.position.y?"bottom":"top":"none")!==this.direction&&(this.direction=e,"function"==typeof this.directionChange&&this.directionChange(this.direction)),this.position=t,this.lastAction=this._getTimestamp()}else this.direction="none";this.running||this._startRun()}},{key:"_startRun",value:function(){this.running=!0,"function"==typeof this.startCallback&&this.startCallback(),this._loop()}},{key:"_stopRun",value:function(){this.running=!1,"function"==typeof this.stopCallback&&this.stopCallback()}},{key:"getPosition",value:function(){return{x:this.element.pageXOffset||this.element.scrollLeft||document.documentElement.scrollLeft||0,y:this.element.pageYOffset||this.element.scrollTop||document.documentElement.scrollTop||0}}},{key:"_getTimestamp",value:function(){return Number(Date.now())}},{key:"_tick",value:function(){this.callback(this.position,this.direction),this._getTimestamp()-this.lastAction>this.sustain&&this._stopRun(),this.running&&this._loop()}},{key:"_loop",value:function(){(window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||function(t){setTimeout(t,1e3/60)})(this._tick.bind(this))}},{key:"kill",value:function(){this.running=!1,this.element.removeEventListener("scroll",this._boundListener)}}])&&f(e.prototype,i),o&&f(e,o),t}();function y(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}i.d(e,"Trigger",(function(){return p})),i.d(e,"TriggerCollection",(function(){return v})),i.d(e,"ScrollAnimationLoop",(function(){return d})),i.d(e,"default",(function(){return m}));
    /*!
     * ScrollTrigger
     *
     *
     * http://github.com/terwanerik
     *
     * Copyright 2017, Erik Terwan <erik@erikterwan.com>
     * Released under the MIT license.
     *
     * Date: 2017-07-09
     */
    var p=a,v=h,d=g,m=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._parseOptions(e),this._initCollection(),this._initLoop()}var e,i,o;return e=t,(i=[{key:"_parseOptions",value:function(t){t=s()(new n,t),this.defaultTrigger=t.trigger,this.scrollOptions=t.scroll}},{key:"_initCollection",value:function(){var t=document.querySelectorAll("[data-scroll]"),e=[];t.length>0&&(e=this.createTriggers(t)),this.collection=new v(e)}},{key:"_initLoop",value:function(){var t=this;this.loop=new d({sustain:this.scrollOptions.sustain,element:this.scrollOptions.element,callback:function(e,i){t._scrollCallback(e,i)},start:function(){t._scrollStart()},stop:function(){t._scrollStop()},directionChange:function(e){t._scrollDirectionChange(e)}})}},{key:"_scrollCallback",value:function(t,e){var i=this;this.collection.call((function(t){t.checkVisibility(i.scrollOptions.element,e)})),this.scrollOptions.callback(t,e)}},{key:"_scrollStart",value:function(){this.scrollOptions.start()}},{key:"_scrollStop",value:function(){this.scrollOptions.stop()}},{key:"_scrollDirectionChange",value:function(t){this.scrollOptions.directionChange(t)}},{key:"createTrigger",value:function(t,e){return new p(t,s()(this.defaultTrigger,e))}},{key:"createTriggers",value:function(t,e){var i=this,n=[];return t.each((function(t){n.push(i.createTrigger(t,e))})),n}},{key:"add",value:function(t,e){return t instanceof HTMLElement?(this.collection.add(this.createTrigger(t,e)),this):t instanceof p?(this.collection.add(t),this):t instanceof NodeList?(this.collection.add(this.createTriggers(t,e)),this):Array.isArray(t)&&t.length&&t[0]instanceof p?(this.collection.add(t),this):Array.isArray(t)&&t.length&&t[0]instanceof HTMLElement?(this.collection.add(this.createTriggers(t,e)),this):(this.collection.add(this.createTriggers(document.querySelectorAll(t),e)),this)}},{key:"remove",value:function(t){return t instanceof p?(this.collection.remove(t),this):Array.isArray(t)&&t.length&&t[0]instanceof p?(this.collection.remove(t),this):t instanceof HTMLElement?(this.collection.remove(this.search(t)),this):Array.isArray(t)&&t.length&&t[0]instanceof HTMLElement?(this.collection.remove(this.search(t)),this):t instanceof NodeList?(this.collection.remove(this.search(t)),this):Array.isArray(t)&&t.length&&t[0]instanceof p?(this.collection.remove(t),this):(this.collection.remove(this.query(t.toString())),this)}},{key:"query",value:function(t){return this.collection.query(t)}},{key:"search",value:function(t){return this.collection.search(t)}},{key:"listen",value:function(){this.loop||this._initLoop()}},{key:"kill",value:function(){this.loop.kill(),this.loop=null}}])&&y(e.prototype,i),o&&y(e,o),t}()}])}));

/* Lightbox */
/**
 * GLightbox
 * Awesome pure javascript lightbox
 * made by https://www.biati.digital
 * Github: https://github.com/biati-digital/glightbox
 */

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).GLightbox=t()}(this,(function(){"use strict";function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,(s=n.key,l=void 0,"symbol"==typeof(l=function(e,t){if("object"!=typeof e||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var n=i.call(e,t||"default");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(s,"string"))?l:String(l)),n)}var s,l}function n(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),Object.defineProperty(e,"prototype",{writable:!1}),e}var s=Date.now();function l(){var e={},t=!0,i=0,n=arguments.length;"[object Boolean]"===Object.prototype.toString.call(arguments[0])&&(t=arguments[0],i++);for(var s=function(i){for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(t&&"[object Object]"===Object.prototype.toString.call(i[n])?e[n]=l(!0,e[n],i[n]):e[n]=i[n])};i<n;i++){var o=arguments[i];s(o)}return e}function o(e,t){if((k(e)||e===window||e===document)&&(e=[e]),A(e)||L(e)||(e=[e]),0!=P(e))if(A(e)&&!L(e))for(var i=e.length,n=0;n<i&&!1!==t.call(e[n],e[n],n,e);n++);else if(L(e))for(var s in e)if(O(e,s)&&!1===t.call(e[s],e[s],s,e))break}function r(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,n=e[s]=e[s]||[],l={all:n,evt:null,found:null};return t&&i&&P(n)>0&&o(n,(function(e,n){if(e.eventName==t&&e.fn.toString()==i.toString())return l.found=!0,l.evt=n,!1})),l}function a(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=t.onElement,n=t.withCallback,s=t.avoidDuplicate,l=void 0===s||s,a=t.once,h=void 0!==a&&a,d=t.useCapture,c=void 0!==d&&d,u=arguments.length>2?arguments[2]:void 0,g=i||[];function v(e){T(n)&&n.call(u,e,this),h&&v.destroy()}return C(g)&&(g=document.querySelectorAll(g)),v.destroy=function(){o(g,(function(t){var i=r(t,e,v);i.found&&i.all.splice(i.evt,1),t.removeEventListener&&t.removeEventListener(e,v,c)}))},o(g,(function(t){var i=r(t,e,v);(t.addEventListener&&l&&!i.found||!l)&&(t.addEventListener(e,v,c),i.all.push({eventName:e,fn:v}))})),v}function h(e,t){o(t.split(" "),(function(t){return e.classList.add(t)}))}function d(e,t){o(t.split(" "),(function(t){return e.classList.remove(t)}))}function c(e,t){return e.classList.contains(t)}function u(e,t){for(;e!==document.body;){if(!(e=e.parentElement))return!1;if("function"==typeof e.matches?e.matches(t):e.msMatchesSelector(t))return e}}function g(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",i=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(!e||""===t)return!1;if("none"===t)return T(i)&&i(),!1;var n=x(),s=t.split(" ");o(s,(function(t){h(e,"g"+t)})),a(n,{onElement:e,avoidDuplicate:!1,once:!0,withCallback:function(e,t){o(s,(function(e){d(t,"g"+e)})),T(i)&&i()}})}function v(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";if(""===t)return e.style.webkitTransform="",e.style.MozTransform="",e.style.msTransform="",e.style.OTransform="",e.style.transform="",!1;e.style.webkitTransform=t,e.style.MozTransform=t,e.style.msTransform=t,e.style.OTransform=t,e.style.transform=t}function f(e){e.style.display="block"}function p(e){e.style.display="none"}function m(e){var t=document.createDocumentFragment(),i=document.createElement("div");for(i.innerHTML=e;i.firstChild;)t.appendChild(i.firstChild);return t}function y(){return{width:window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,height:window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight}}function x(){var e,t=document.createElement("fakeelement"),i={animation:"animationend",OAnimation:"oAnimationEnd",MozAnimation:"animationend",WebkitAnimation:"webkitAnimationEnd"};for(e in i)if(void 0!==t.style[e])return i[e]}function b(e,t,i,n){if(e())t();else{var s;i||(i=100);var l=setInterval((function(){e()&&(clearInterval(l),s&&clearTimeout(s),t())}),i);n&&(s=setTimeout((function(){clearInterval(l)}),n))}}function S(e,t,i){if(I(e))console.error("Inject assets error");else if(T(t)&&(i=t,t=!1),C(t)&&t in window)T(i)&&i();else{var n;if(-1!==e.indexOf(".css")){if((n=document.querySelectorAll('link[href="'+e+'"]'))&&n.length>0)return void(T(i)&&i());var s=document.getElementsByTagName("head")[0],l=s.querySelectorAll('link[rel="stylesheet"]'),o=document.createElement("link");return o.rel="stylesheet",o.type="text/css",o.href=e,o.media="all",l?s.insertBefore(o,l[0]):s.appendChild(o),void(T(i)&&i())}if((n=document.querySelectorAll('script[src="'+e+'"]'))&&n.length>0){if(T(i)){if(C(t))return b((function(){return void 0!==window[t]}),(function(){i()})),!1;i()}}else{var r=document.createElement("script");r.type="text/javascript",r.src=e,r.onload=function(){if(T(i)){if(C(t))return b((function(){return void 0!==window[t]}),(function(){i()})),!1;i()}},document.body.appendChild(r)}}}function w(){return"navigator"in window&&window.navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i)}function T(e){return"function"==typeof e}function C(e){return"string"==typeof e}function k(e){return!(!e||!e.nodeType||1!=e.nodeType)}function E(e){return Array.isArray(e)}function A(e){return e&&e.length&&isFinite(e.length)}function L(t){return"object"===e(t)&&null!=t&&!T(t)&&!E(t)}function I(e){return null==e}function O(e,t){return null!==e&&hasOwnProperty.call(e,t)}function P(e){if(L(e)){if(e.keys)return e.keys().length;var t=0;for(var i in e)O(e,i)&&t++;return t}return e.length}function M(e){return!isNaN(parseFloat(e))&&isFinite(e)}function z(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:-1,t=document.querySelectorAll(".gbtn[data-taborder]:not(.disabled)");if(!t.length)return!1;if(1==t.length)return t[0];"string"==typeof e&&(e=parseInt(e));var i=[];o(t,(function(e){i.push(e.getAttribute("data-taborder"))}));var n=Math.max.apply(Math,i.map((function(e){return parseInt(e)}))),s=e<0?1:e+1;s>n&&(s="1");var l=i.filter((function(e){return e>=parseInt(s)})),r=l.sort()[0];return document.querySelector('.gbtn[data-taborder="'.concat(r,'"]'))}function X(e){if(e.events.hasOwnProperty("keyboard"))return!1;e.events.keyboard=a("keydown",{onElement:window,withCallback:function(t,i){var n=(t=t||window.event).keyCode;if(9==n){var s=document.querySelector(".gbtn.focused");if(!s){var l=!(!document.activeElement||!document.activeElement.nodeName)&&document.activeElement.nodeName.toLocaleLowerCase();if("input"==l||"textarea"==l||"button"==l)return}t.preventDefault();var o=document.querySelectorAll(".gbtn[data-taborder]");if(!o||o.length<=0)return;if(!s){var r=z();return void(r&&(r.focus(),h(r,"focused")))}var a=z(s.getAttribute("data-taborder"));d(s,"focused"),a&&(a.focus(),h(a,"focused"))}39==n&&e.nextSlide(),37==n&&e.prevSlide(),27==n&&e.close()}})}function Y(e){return Math.sqrt(e.x*e.x+e.y*e.y)}function q(e,t){var i=function(e,t){var i=Y(e)*Y(t);if(0===i)return 0;var n=function(e,t){return e.x*t.x+e.y*t.y}(e,t)/i;return n>1&&(n=1),Math.acos(n)}(e,t);return function(e,t){return e.x*t.y-t.x*e.y}(e,t)>0&&(i*=-1),180*i/Math.PI}var N=function(){function e(i){t(this,e),this.handlers=[],this.el=i}return n(e,[{key:"add",value:function(e){this.handlers.push(e)}},{key:"del",value:function(e){e||(this.handlers=[]);for(var t=this.handlers.length;t>=0;t--)this.handlers[t]===e&&this.handlers.splice(t,1)}},{key:"dispatch",value:function(){for(var e=0,t=this.handlers.length;e<t;e++){var i=this.handlers[e];"function"==typeof i&&i.apply(this.el,arguments)}}}]),e}();function D(e,t){var i=new N(e);return i.add(t),i}var _=function(){function e(i,n){t(this,e),this.element="string"==typeof i?document.querySelector(i):i,this.start=this.start.bind(this),this.move=this.move.bind(this),this.end=this.end.bind(this),this.cancel=this.cancel.bind(this),this.element.addEventListener("touchstart",this.start,!1),this.element.addEventListener("touchmove",this.move,!1),this.element.addEventListener("touchend",this.end,!1),this.element.addEventListener("touchcancel",this.cancel,!1),this.preV={x:null,y:null},this.pinchStartLen=null,this.zoom=1,this.isDoubleTap=!1;var s=function(){};this.rotate=D(this.element,n.rotate||s),this.touchStart=D(this.element,n.touchStart||s),this.multipointStart=D(this.element,n.multipointStart||s),this.multipointEnd=D(this.element,n.multipointEnd||s),this.pinch=D(this.element,n.pinch||s),this.swipe=D(this.element,n.swipe||s),this.tap=D(this.element,n.tap||s),this.doubleTap=D(this.element,n.doubleTap||s),this.longTap=D(this.element,n.longTap||s),this.singleTap=D(this.element,n.singleTap||s),this.pressMove=D(this.element,n.pressMove||s),this.twoFingerPressMove=D(this.element,n.twoFingerPressMove||s),this.touchMove=D(this.element,n.touchMove||s),this.touchEnd=D(this.element,n.touchEnd||s),this.touchCancel=D(this.element,n.touchCancel||s),this.translateContainer=this.element,this._cancelAllHandler=this.cancelAll.bind(this),window.addEventListener("scroll",this._cancelAllHandler),this.delta=null,this.last=null,this.now=null,this.tapTimeout=null,this.singleTapTimeout=null,this.longTapTimeout=null,this.swipeTimeout=null,this.x1=this.x2=this.y1=this.y2=null,this.preTapPosition={x:null,y:null}}return n(e,[{key:"start",value:function(e){if(e.touches){if(e.target&&e.target.nodeName&&["a","button","input"].indexOf(e.target.nodeName.toLowerCase())>=0)console.log("ignore drag for this touched element",e.target.nodeName.toLowerCase());else{this.now=Date.now(),this.x1=e.touches[0].pageX,this.y1=e.touches[0].pageY,this.delta=this.now-(this.last||this.now),this.touchStart.dispatch(e,this.element),null!==this.preTapPosition.x&&(this.isDoubleTap=this.delta>0&&this.delta<=250&&Math.abs(this.preTapPosition.x-this.x1)<30&&Math.abs(this.preTapPosition.y-this.y1)<30,this.isDoubleTap&&clearTimeout(this.singleTapTimeout)),this.preTapPosition.x=this.x1,this.preTapPosition.y=this.y1,this.last=this.now;var t=this.preV;if(e.touches.length>1){this._cancelLongTap(),this._cancelSingleTap();var i={x:e.touches[1].pageX-this.x1,y:e.touches[1].pageY-this.y1};t.x=i.x,t.y=i.y,this.pinchStartLen=Y(t),this.multipointStart.dispatch(e,this.element)}this._preventTap=!1,this.longTapTimeout=setTimeout(function(){this.longTap.dispatch(e,this.element),this._preventTap=!0}.bind(this),750)}}}},{key:"move",value:function(e){if(e.touches){var t=this.preV,i=e.touches.length,n=e.touches[0].pageX,s=e.touches[0].pageY;if(this.isDoubleTap=!1,i>1){var l=e.touches[1].pageX,o=e.touches[1].pageY,r={x:e.touches[1].pageX-n,y:e.touches[1].pageY-s};null!==t.x&&(this.pinchStartLen>0&&(e.zoom=Y(r)/this.pinchStartLen,this.pinch.dispatch(e,this.element)),e.angle=q(r,t),this.rotate.dispatch(e,this.element)),t.x=r.x,t.y=r.y,null!==this.x2&&null!==this.sx2?(e.deltaX=(n-this.x2+l-this.sx2)/2,e.deltaY=(s-this.y2+o-this.sy2)/2):(e.deltaX=0,e.deltaY=0),this.twoFingerPressMove.dispatch(e,this.element),this.sx2=l,this.sy2=o}else{if(null!==this.x2){e.deltaX=n-this.x2,e.deltaY=s-this.y2;var a=Math.abs(this.x1-this.x2),h=Math.abs(this.y1-this.y2);(a>10||h>10)&&(this._preventTap=!0)}else e.deltaX=0,e.deltaY=0;this.pressMove.dispatch(e,this.element)}this.touchMove.dispatch(e,this.element),this._cancelLongTap(),this.x2=n,this.y2=s,i>1&&e.preventDefault()}}},{key:"end",value:function(e){if(e.changedTouches){this._cancelLongTap();var t=this;e.touches.length<2&&(this.multipointEnd.dispatch(e,this.element),this.sx2=this.sy2=null),this.x2&&Math.abs(this.x1-this.x2)>30||this.y2&&Math.abs(this.y1-this.y2)>30?(e.direction=this._swipeDirection(this.x1,this.x2,this.y1,this.y2),this.swipeTimeout=setTimeout((function(){t.swipe.dispatch(e,t.element)}),0)):(this.tapTimeout=setTimeout((function(){t._preventTap||t.tap.dispatch(e,t.element),t.isDoubleTap&&(t.doubleTap.dispatch(e,t.element),t.isDoubleTap=!1)}),0),t.isDoubleTap||(t.singleTapTimeout=setTimeout((function(){t.singleTap.dispatch(e,t.element)}),250))),this.touchEnd.dispatch(e,this.element),this.preV.x=0,this.preV.y=0,this.zoom=1,this.pinchStartLen=null,this.x1=this.x2=this.y1=this.y2=null}}},{key:"cancelAll",value:function(){this._preventTap=!0,clearTimeout(this.singleTapTimeout),clearTimeout(this.tapTimeout),clearTimeout(this.longTapTimeout),clearTimeout(this.swipeTimeout)}},{key:"cancel",value:function(e){this.cancelAll(),this.touchCancel.dispatch(e,this.element)}},{key:"_cancelLongTap",value:function(){clearTimeout(this.longTapTimeout)}},{key:"_cancelSingleTap",value:function(){clearTimeout(this.singleTapTimeout)}},{key:"_swipeDirection",value:function(e,t,i,n){return Math.abs(e-t)>=Math.abs(i-n)?e-t>0?"Left":"Right":i-n>0?"Up":"Down"}},{key:"on",value:function(e,t){this[e]&&this[e].add(t)}},{key:"off",value:function(e,t){this[e]&&this[e].del(t)}},{key:"destroy",value:function(){return this.singleTapTimeout&&clearTimeout(this.singleTapTimeout),this.tapTimeout&&clearTimeout(this.tapTimeout),this.longTapTimeout&&clearTimeout(this.longTapTimeout),this.swipeTimeout&&clearTimeout(this.swipeTimeout),this.element.removeEventListener("touchstart",this.start),this.element.removeEventListener("touchmove",this.move),this.element.removeEventListener("touchend",this.end),this.element.removeEventListener("touchcancel",this.cancel),this.rotate.del(),this.touchStart.del(),this.multipointStart.del(),this.multipointEnd.del(),this.pinch.del(),this.swipe.del(),this.tap.del(),this.doubleTap.del(),this.longTap.del(),this.singleTap.del(),this.pressMove.del(),this.twoFingerPressMove.del(),this.touchMove.del(),this.touchEnd.del(),this.touchCancel.del(),this.preV=this.pinchStartLen=this.zoom=this.isDoubleTap=this.delta=this.last=this.now=this.tapTimeout=this.singleTapTimeout=this.longTapTimeout=this.swipeTimeout=this.x1=this.x2=this.y1=this.y2=this.preTapPosition=this.rotate=this.touchStart=this.multipointStart=this.multipointEnd=this.pinch=this.swipe=this.tap=this.doubleTap=this.longTap=this.singleTap=this.pressMove=this.touchMove=this.touchEnd=this.touchCancel=this.twoFingerPressMove=null,window.removeEventListener("scroll",this._cancelAllHandler),null}}]),e}();function W(e){var t=function(){var e,t=document.createElement("fakeelement"),i={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(e in i)if(void 0!==t.style[e])return i[e]}(),i=window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,n=c(e,"gslide-media")?e:e.querySelector(".gslide-media"),s=u(n,".ginner-container"),l=e.querySelector(".gslide-description");i>769&&(n=s),h(n,"greset"),v(n,"translate3d(0, 0, 0)"),a(t,{onElement:n,once:!0,withCallback:function(e,t){d(n,"greset")}}),n.style.opacity="",l&&(l.style.opacity="")}function B(e){if(e.events.hasOwnProperty("touch"))return!1;var t,i,n,s=y(),l=s.width,o=s.height,r=!1,a=null,g=null,f=null,p=!1,m=1,x=1,b=!1,S=!1,w=null,T=null,C=null,k=null,E=0,A=0,L=!1,I=!1,O={},P={},M=0,z=0,X=document.getElementById("glightbox-slider"),Y=document.querySelector(".goverlay"),q=new _(X,{touchStart:function(t){if(r=!0,(c(t.targetTouches[0].target,"ginner-container")||u(t.targetTouches[0].target,".gslide-desc")||"a"==t.targetTouches[0].target.nodeName.toLowerCase())&&(r=!1),u(t.targetTouches[0].target,".gslide-inline")&&!c(t.targetTouches[0].target.parentNode,"gslide-inline")&&(r=!1),r){if(P=t.targetTouches[0],O.pageX=t.targetTouches[0].pageX,O.pageY=t.targetTouches[0].pageY,M=t.targetTouches[0].clientX,z=t.targetTouches[0].clientY,a=e.activeSlide,g=a.querySelector(".gslide-media"),n=a.querySelector(".gslide-inline"),f=null,c(g,"gslide-image")&&(f=g.querySelector("img")),(window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth)>769&&(g=a.querySelector(".ginner-container")),d(Y,"greset"),t.pageX>20&&t.pageX<window.innerWidth-20)return;t.preventDefault()}},touchMove:function(s){if(r&&(P=s.targetTouches[0],!b&&!S)){if(n&&n.offsetHeight>o){var a=O.pageX-P.pageX;if(Math.abs(a)<=13)return!1}p=!0;var h,d=s.targetTouches[0].clientX,c=s.targetTouches[0].clientY,u=M-d,m=z-c;if(Math.abs(u)>Math.abs(m)?(L=!1,I=!0):(I=!1,L=!0),t=P.pageX-O.pageX,E=100*t/l,i=P.pageY-O.pageY,A=100*i/o,L&&f&&(h=1-Math.abs(i)/o,Y.style.opacity=h,e.settings.touchFollowAxis&&(E=0)),I&&(h=1-Math.abs(t)/l,g.style.opacity=h,e.settings.touchFollowAxis&&(A=0)),!f)return v(g,"translate3d(".concat(E,"%, 0, 0)"));v(g,"translate3d(".concat(E,"%, ").concat(A,"%, 0)"))}},touchEnd:function(){if(r){if(p=!1,S||b)return C=w,void(k=T);var t=Math.abs(parseInt(A)),i=Math.abs(parseInt(E));if(!(t>29&&f))return t<29&&i<25?(h(Y,"greset"),Y.style.opacity=1,W(g)):void 0;e.close()}},multipointEnd:function(){setTimeout((function(){b=!1}),50)},multipointStart:function(){b=!0,m=x||1},pinch:function(e){if(!f||p)return!1;b=!0,f.scaleX=f.scaleY=m*e.zoom;var t=m*e.zoom;if(S=!0,t<=1)return S=!1,t=1,k=null,C=null,w=null,T=null,void f.setAttribute("style","");t>4.5&&(t=4.5),f.style.transform="scale3d(".concat(t,", ").concat(t,", 1)"),x=t},pressMove:function(e){if(S&&!b){var t=P.pageX-O.pageX,i=P.pageY-O.pageY;C&&(t+=C),k&&(i+=k),w=t,T=i;var n="translate3d(".concat(t,"px, ").concat(i,"px, 0)");x&&(n+=" scale3d(".concat(x,", ").concat(x,", 1)")),v(f,n)}},swipe:function(t){if(!S)if(b)b=!1;else{if("Left"==t.direction){if(e.index==e.elements.length-1)return W(g);e.nextSlide()}if("Right"==t.direction){if(0==e.index)return W(g);e.prevSlide()}}}});e.events.touch=q}var H=function(){function e(i,n){var s=this,l=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(t(this,e),this.img=i,this.slide=n,this.onclose=l,this.img.setZoomEvents)return!1;this.active=!1,this.zoomedIn=!1,this.dragging=!1,this.currentX=null,this.currentY=null,this.initialX=null,this.initialY=null,this.xOffset=0,this.yOffset=0,this.img.addEventListener("mousedown",(function(e){return s.dragStart(e)}),!1),this.img.addEventListener("mouseup",(function(e){return s.dragEnd(e)}),!1),this.img.addEventListener("mousemove",(function(e){return s.drag(e)}),!1),this.img.addEventListener("click",(function(e){return s.slide.classList.contains("dragging-nav")?(s.zoomOut(),!1):s.zoomedIn?void(s.zoomedIn&&!s.dragging&&s.zoomOut()):s.zoomIn()}),!1),this.img.setZoomEvents=!0}return n(e,[{key:"zoomIn",value:function(){var e=this.widowWidth();if(!(this.zoomedIn||e<=768)){var t=this.img;if(t.setAttribute("data-style",t.getAttribute("style")),t.style.maxWidth=t.naturalWidth+"px",t.style.maxHeight=t.naturalHeight+"px",t.naturalWidth>e){var i=e/2-t.naturalWidth/2;this.setTranslate(this.img.parentNode,i,0)}this.slide.classList.add("zoomed"),this.zoomedIn=!0}}},{key:"zoomOut",value:function(){this.img.parentNode.setAttribute("style",""),this.img.setAttribute("style",this.img.getAttribute("data-style")),this.slide.classList.remove("zoomed"),this.zoomedIn=!1,this.currentX=null,this.currentY=null,this.initialX=null,this.initialY=null,this.xOffset=0,this.yOffset=0,this.onclose&&"function"==typeof this.onclose&&this.onclose()}},{key:"dragStart",value:function(e){e.preventDefault(),this.zoomedIn?("touchstart"===e.type?(this.initialX=e.touches[0].clientX-this.xOffset,this.initialY=e.touches[0].clientY-this.yOffset):(this.initialX=e.clientX-this.xOffset,this.initialY=e.clientY-this.yOffset),e.target===this.img&&(this.active=!0,this.img.classList.add("dragging"))):this.active=!1}},{key:"dragEnd",value:function(e){var t=this;e.preventDefault(),this.initialX=this.currentX,this.initialY=this.currentY,this.active=!1,setTimeout((function(){t.dragging=!1,t.img.isDragging=!1,t.img.classList.remove("dragging")}),100)}},{key:"drag",value:function(e){this.active&&(e.preventDefault(),"touchmove"===e.type?(this.currentX=e.touches[0].clientX-this.initialX,this.currentY=e.touches[0].clientY-this.initialY):(this.currentX=e.clientX-this.initialX,this.currentY=e.clientY-this.initialY),this.xOffset=this.currentX,this.yOffset=this.currentY,this.img.isDragging=!0,this.dragging=!0,this.setTranslate(this.img,this.currentX,this.currentY))}},{key:"onMove",value:function(e){if(this.zoomedIn){var t=e.clientX-this.img.naturalWidth/2,i=e.clientY-this.img.naturalHeight/2;this.setTranslate(this.img,t,i)}}},{key:"setTranslate",value:function(e,t,i){e.style.transform="translate3d("+t+"px, "+i+"px, 0)"}},{key:"widowWidth",value:function(){return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth}}]),e}(),j=function(){function e(){var i=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};t(this,e);var s=n.dragEl,l=n.toleranceX,o=void 0===l?40:l,r=n.toleranceY,a=void 0===r?65:r,h=n.slide,d=void 0===h?null:h,c=n.instance,u=void 0===c?null:c;this.el=s,this.active=!1,this.dragging=!1,this.currentX=null,this.currentY=null,this.initialX=null,this.initialY=null,this.xOffset=0,this.yOffset=0,this.direction=null,this.lastDirection=null,this.toleranceX=o,this.toleranceY=a,this.toleranceReached=!1,this.dragContainer=this.el,this.slide=d,this.instance=u,this.el.addEventListener("mousedown",(function(e){return i.dragStart(e)}),!1),this.el.addEventListener("mouseup",(function(e){return i.dragEnd(e)}),!1),this.el.addEventListener("mousemove",(function(e){return i.drag(e)}),!1)}return n(e,[{key:"dragStart",value:function(e){if(this.slide.classList.contains("zoomed"))this.active=!1;else{"touchstart"===e.type?(this.initialX=e.touches[0].clientX-this.xOffset,this.initialY=e.touches[0].clientY-this.yOffset):(this.initialX=e.clientX-this.xOffset,this.initialY=e.clientY-this.yOffset);var t=e.target.nodeName.toLowerCase();e.target.classList.contains("nodrag")||u(e.target,".nodrag")||-1!==["input","select","textarea","button","a"].indexOf(t)?this.active=!1:(e.preventDefault(),(e.target===this.el||"img"!==t&&u(e.target,".gslide-inline"))&&(this.active=!0,this.el.classList.add("dragging"),this.dragContainer=u(e.target,".ginner-container")))}}},{key:"dragEnd",value:function(e){var t=this;e&&e.preventDefault(),this.initialX=0,this.initialY=0,this.currentX=null,this.currentY=null,this.initialX=null,this.initialY=null,this.xOffset=0,this.yOffset=0,this.active=!1,this.doSlideChange&&(this.instance.preventOutsideClick=!0,"right"==this.doSlideChange&&this.instance.prevSlide(),"left"==this.doSlideChange&&this.instance.nextSlide()),this.doSlideClose&&this.instance.close(),this.toleranceReached||this.setTranslate(this.dragContainer,0,0,!0),setTimeout((function(){t.instance.preventOutsideClick=!1,t.toleranceReached=!1,t.lastDirection=null,t.dragging=!1,t.el.isDragging=!1,t.el.classList.remove("dragging"),t.slide.classList.remove("dragging-nav"),t.dragContainer.style.transform="",t.dragContainer.style.transition=""}),100)}},{key:"drag",value:function(e){if(this.active){e.preventDefault(),this.slide.classList.add("dragging-nav"),"touchmove"===e.type?(this.currentX=e.touches[0].clientX-this.initialX,this.currentY=e.touches[0].clientY-this.initialY):(this.currentX=e.clientX-this.initialX,this.currentY=e.clientY-this.initialY),this.xOffset=this.currentX,this.yOffset=this.currentY,this.el.isDragging=!0,this.dragging=!0,this.doSlideChange=!1,this.doSlideClose=!1;var t=Math.abs(this.currentX),i=Math.abs(this.currentY);if(t>0&&t>=Math.abs(this.currentY)&&(!this.lastDirection||"x"==this.lastDirection)){this.yOffset=0,this.lastDirection="x",this.setTranslate(this.dragContainer,this.currentX,0);var n=this.shouldChange();if(!this.instance.settings.dragAutoSnap&&n&&(this.doSlideChange=n),this.instance.settings.dragAutoSnap&&n)return this.instance.preventOutsideClick=!0,this.toleranceReached=!0,this.active=!1,this.instance.preventOutsideClick=!0,this.dragEnd(null),"right"==n&&this.instance.prevSlide(),void("left"==n&&this.instance.nextSlide())}if(this.toleranceY>0&&i>0&&i>=t&&(!this.lastDirection||"y"==this.lastDirection)){this.xOffset=0,this.lastDirection="y",this.setTranslate(this.dragContainer,0,this.currentY);var s=this.shouldClose();return!this.instance.settings.dragAutoSnap&&s&&(this.doSlideClose=!0),void(this.instance.settings.dragAutoSnap&&s&&this.instance.close())}}}},{key:"shouldChange",value:function(){var e=!1;if(Math.abs(this.currentX)>=this.toleranceX){var t=this.currentX>0?"right":"left";("left"==t&&this.slide!==this.slide.parentNode.lastChild||"right"==t&&this.slide!==this.slide.parentNode.firstChild)&&(e=t)}return e}},{key:"shouldClose",value:function(){var e=!1;return Math.abs(this.currentY)>=this.toleranceY&&(e=!0),e}},{key:"setTranslate",value:function(e,t,i){var n=arguments.length>3&&void 0!==arguments[3]&&arguments[3];e.style.transition=n?"all .2s ease":"",e.style.transform="translate3d(".concat(t,"px, ").concat(i,"px, 0)")}}]),e}();function V(e,t,i,n){var s=e.querySelector(".gslide-media"),l=new Image,o="gSlideTitle_"+i,r="gSlideDesc_"+i;l.addEventListener("load",(function(){T(n)&&n()}),!1),l.src=t.href,""!=t.sizes&&""!=t.srcset&&(l.sizes=t.sizes,l.srcset=t.srcset),l.alt="",I(t.alt)||""===t.alt||(l.alt=t.alt),""!==t.title&&l.setAttribute("aria-labelledby",o),""!==t.description&&l.setAttribute("aria-describedby",r),t.hasOwnProperty("_hasCustomWidth")&&t._hasCustomWidth&&(l.style.width=t.width),t.hasOwnProperty("_hasCustomHeight")&&t._hasCustomHeight&&(l.style.height=t.height),s.insertBefore(l,s.firstChild)}function F(e,t,i,n){var s=this,l=e.querySelector(".ginner-container"),o="gvideo"+i,r=e.querySelector(".gslide-media"),a=this.getAllPlayers();h(l,"gvideo-container"),r.insertBefore(m('<div class="gvideo-wrapper"></div>'),r.firstChild);var d=e.querySelector(".gvideo-wrapper");S(this.settings.plyr.css,"Plyr");var c=t.href,u=null==t?void 0:t.videoProvider,g=!1;r.style.maxWidth=t.width,S(this.settings.plyr.js,"Plyr",(function(){if(!u&&c.match(/vimeo\.com\/([0-9]*)/)&&(u="vimeo"),!u&&(c.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/)||c.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/)||c.match(/(youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9\-_]+)/))&&(u="youtube"),"local"===u||!u){u="local";var l='<video id="'+o+'" ';l+='style="background:#000; max-width: '.concat(t.width,';" '),l+='preload="metadata" ',l+='x-webkit-airplay="allow" ',l+="playsinline ",l+="controls ",l+='class="gvideo-local">',l+='<source src="'.concat(c,'">'),g=m(l+="</video>")}var r=g||m('<div id="'.concat(o,'" data-plyr-provider="').concat(u,'" data-plyr-embed-id="').concat(c,'"></div>'));h(d,"".concat(u,"-video gvideo")),d.appendChild(r),d.setAttribute("data-id",o),d.setAttribute("data-index",i);var v=O(s.settings.plyr,"config")?s.settings.plyr.config:{},f=new Plyr("#"+o,v);f.on("ready",(function(e){a[o]=e.detail.plyr,T(n)&&n()})),b((function(){return e.querySelector("iframe")&&"true"==e.querySelector("iframe").dataset.ready}),(function(){s.resize(e)})),f.on("enterfullscreen",R),f.on("exitfullscreen",R)}))}function R(e){var t=u(e.target,".gslide-media");"enterfullscreen"===e.type&&h(t,"fullscreen"),"exitfullscreen"===e.type&&d(t,"fullscreen")}function G(e,t,i,n){var s,l=this,o=e.querySelector(".gslide-media"),r=!(!O(t,"href")||!t.href)&&t.href.split("#").pop().trim(),d=!(!O(t,"content")||!t.content)&&t.content;if(d&&(C(d)&&(s=m('<div class="ginlined-content">'.concat(d,"</div>"))),k(d))){"none"==d.style.display&&(d.style.display="block");var c=document.createElement("div");c.className="ginlined-content",c.appendChild(d),s=c}if(r){var u=document.getElementById(r);if(!u)return!1;var g=u.cloneNode(!0);g.style.height=t.height,g.style.maxWidth=t.width,h(g,"ginlined-content"),s=g}if(!s)return console.error("Unable to append inline slide content",t),!1;o.style.height=t.height,o.style.width=t.width,o.appendChild(s),this.events["inlineclose"+r]=a("click",{onElement:o.querySelectorAll(".gtrigger-close"),withCallback:function(e){e.preventDefault(),l.close()}}),T(n)&&n()}function Z(e,t,i,n){var s=e.querySelector(".gslide-media"),l=function(e){var t=e.url,i=e.allow,n=e.callback,s=e.appendTo,l=document.createElement("iframe");return l.className="vimeo-video gvideo",l.src=t,l.style.width="100%",l.style.height="100%",i&&l.setAttribute("allow",i),l.onload=function(){l.onload=null,h(l,"node-ready"),T(n)&&n()},s&&s.appendChild(l),l}({url:t.href,callback:n});s.parentNode.style.maxWidth=t.width,s.parentNode.style.height=t.height,s.appendChild(l)}var U=function(){function e(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};t(this,e),this.defaults={href:"",sizes:"",srcset:"",title:"",type:"",videoProvider:"",description:"",alt:"",descPosition:"bottom",effect:"",width:"",height:"",content:!1,zoomable:!0,draggable:!0},L(i)&&(this.defaults=l(this.defaults,i))}return n(e,[{key:"sourceType",value:function(e){var t=e;if(null!==(e=e.toLowerCase()).match(/\.(jpeg|jpg|jpe|gif|png|apn|webp|avif|svg)/))return"image";if(e.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/)||e.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/)||e.match(/(youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9\-_]+)/))return"video";if(e.match(/vimeo\.com\/([0-9]*)/))return"video";if(null!==e.match(/\.(mp4|ogg|webm|mov)/))return"video";if(null!==e.match(/\.(mp3|wav|wma|aac|ogg)/))return"audio";if(e.indexOf("#")>-1&&""!==t.split("#").pop().trim())return"inline";return e.indexOf("goajax=true")>-1?"ajax":"external"}},{key:"parseConfig",value:function(e,t){var i=this,n=l({descPosition:t.descPosition},this.defaults);if(L(e)&&!k(e)){O(e,"type")||(O(e,"content")&&e.content?e.type="inline":O(e,"href")&&(e.type=this.sourceType(e.href)));var s=l(n,e);return this.setSize(s,t),s}var r="",a=e.getAttribute("data-glightbox"),h=e.nodeName.toLowerCase();if("a"===h&&(r=e.href),"img"===h&&(r=e.src,n.alt=e.alt),n.href=r,o(n,(function(s,l){O(t,l)&&"width"!==l&&(n[l]=t[l]);var o=e.dataset[l];I(o)||(n[l]=i.sanitizeValue(o))})),n.content&&(n.type="inline"),!n.type&&r&&(n.type=this.sourceType(r)),I(a)){if(!n.title&&"a"==h){var d=e.title;I(d)||""===d||(n.title=d)}if(!n.title&&"img"==h){var c=e.alt;I(c)||""===c||(n.title=c)}}else{var u=[];o(n,(function(e,t){u.push(";\\s?"+t)})),u=u.join("\\s?:|"),""!==a.trim()&&o(n,(function(e,t){var s=a,l=new RegExp("s?"+t+"s?:s?(.*?)("+u+"s?:|$)"),o=s.match(l);if(o&&o.length&&o[1]){var r=o[1].trim().replace(/;\s*$/,"");n[t]=i.sanitizeValue(r)}}))}if(n.description&&"."===n.description.substring(0,1)){var g;try{g=document.querySelector(n.description).innerHTML}catch(e){if(!(e instanceof DOMException))throw e}g&&(n.description=g)}if(!n.description){var v=e.querySelector(".glightbox-desc");v&&(n.description=v.innerHTML)}return this.setSize(n,t,e),this.slideConfig=n,n}},{key:"setSize",value:function(e,t){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,n="video"==e.type?this.checkSize(t.videosWidth):this.checkSize(t.width),s=this.checkSize(t.height);return e.width=O(e,"width")&&""!==e.width?this.checkSize(e.width):n,e.height=O(e,"height")&&""!==e.height?this.checkSize(e.height):s,i&&"image"==e.type&&(e._hasCustomWidth=!!i.dataset.width,e._hasCustomHeight=!!i.dataset.height),e}},{key:"checkSize",value:function(e){return M(e)?"".concat(e,"px"):e}},{key:"sanitizeValue",value:function(e){return"true"!==e&&"false"!==e?e:"true"===e}}]),e}(),$=function(){function e(i,n,s){t(this,e),this.element=i,this.instance=n,this.index=s}return n(e,[{key:"setContent",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,i=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(c(t,"loaded"))return!1;var n=this.instance.settings,s=this.slideConfig,l=w();T(n.beforeSlideLoad)&&n.beforeSlideLoad({index:this.index,slide:t,player:!1});var o=s.type,r=s.descPosition,a=t.querySelector(".gslide-media"),d=t.querySelector(".gslide-title"),u=t.querySelector(".gslide-desc"),g=t.querySelector(".gdesc-inner"),v=i,f="gSlideTitle_"+this.index,p="gSlideDesc_"+this.index;if(T(n.afterSlideLoad)&&(v=function(){T(i)&&i(),n.afterSlideLoad({index:e.index,slide:t,player:e.instance.getSlidePlayerInstance(e.index)})}),""==s.title&&""==s.description?g&&g.parentNode.parentNode.removeChild(g.parentNode):(d&&""!==s.title?(d.id=f,d.innerHTML=s.title):d.parentNode.removeChild(d),u&&""!==s.description?(u.id=p,l&&n.moreLength>0?(s.smallDescription=this.slideShortDesc(s.description,n.moreLength,n.moreText),u.innerHTML=s.smallDescription,this.descriptionEvents(u,s)):u.innerHTML=s.description):u.parentNode.removeChild(u),h(a.parentNode,"desc-".concat(r)),h(g.parentNode,"description-".concat(r))),h(a,"gslide-".concat(o)),h(t,"loaded"),"video"!==o){if("external"!==o)return"inline"===o?(G.apply(this.instance,[t,s,this.index,v]),void(s.draggable&&new j({dragEl:t.querySelector(".gslide-inline"),toleranceX:n.dragToleranceX,toleranceY:n.dragToleranceY,slide:t,instance:this.instance}))):void("image"!==o?T(v)&&v():V(t,s,this.index,(function(){var i=t.querySelector("img");s.draggable&&new j({dragEl:i,toleranceX:n.dragToleranceX,toleranceY:n.dragToleranceY,slide:t,instance:e.instance}),s.zoomable&&i.naturalWidth>i.offsetWidth&&(h(i,"zoomable"),new H(i,t,(function(){e.instance.resize()}))),T(v)&&v()})));Z.apply(this,[t,s,this.index,v])}else F.apply(this.instance,[t,s,this.index,v])}},{key:"slideShortDesc",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:50,i=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=document.createElement("div");n.innerHTML=e;var s=n.innerText,l=i;if((e=s.trim()).length<=t)return e;var o=e.substr(0,t-1);return l?(n=null,o+'... <a href="#" class="desc-more">'+i+"</a>"):o}},{key:"descriptionEvents",value:function(e,t){var i=this,n=e.querySelector(".desc-more");if(!n)return!1;a("click",{onElement:n,withCallback:function(e,n){e.preventDefault();var s=document.body,l=u(n,".gslide-desc");if(!l)return!1;l.innerHTML=t.description,h(s,"gdesc-open");var o=a("click",{onElement:[s,u(l,".gslide-description")],withCallback:function(e,n){"a"!==e.target.nodeName.toLowerCase()&&(d(s,"gdesc-open"),h(s,"gdesc-closed"),l.innerHTML=t.smallDescription,i.descriptionEvents(l,t),setTimeout((function(){d(s,"gdesc-closed")}),400),o.destroy())}})}})}},{key:"create",value:function(){return m(this.instance.settings.slideHTML)}},{key:"getConfig",value:function(){k(this.element)||this.element.hasOwnProperty("draggable")||(this.element.draggable=this.instance.settings.draggable);var e=new U(this.instance.settings.slideExtraAttributes);return this.slideConfig=e.parseConfig(this.element,this.instance.settings),this.slideConfig}}]),e}(),J=w(),K=null!==w()||void 0!==document.createTouch||"ontouchstart"in window||"onmsgesturechange"in window||navigator.msMaxTouchPoints,Q=document.getElementsByTagName("html")[0],ee={selector:".glightbox",elements:null,skin:"clean",theme:"clean",closeButton:!0,startAt:null,autoplayVideos:!0,autofocusVideos:!0,descPosition:"bottom",width:"900px",height:"506px",videosWidth:"960px",beforeSlideChange:null,afterSlideChange:null,beforeSlideLoad:null,afterSlideLoad:null,slideInserted:null,slideRemoved:null,slideExtraAttributes:null,onOpen:null,onClose:null,loop:!1,zoomable:!0,draggable:!0,dragAutoSnap:!1,dragToleranceX:40,dragToleranceY:65,preload:!0,oneSlidePerOpen:!1,touchNavigation:!0,touchFollowAxis:!0,keyboardNavigation:!0,closeOnOutsideClick:!0,plugins:!1,plyr:{css:"https://cdn.plyr.io/3.6.12/plyr.css",js:"https://cdn.plyr.io/3.6.12/plyr.js",config:{ratio:"16:9",fullscreen:{enabled:!0,iosNative:!0},youtube:{noCookie:!0,rel:0,showinfo:0,iv_load_policy:3},vimeo:{byline:!1,portrait:!1,title:!1,transparent:!1}}},openEffect:"zoom",closeEffect:"zoom",slideEffect:"slide",moreText:"See more",moreLength:60,cssEfects:{fade:{in:"fadeIn",out:"fadeOut"},zoom:{in:"zoomIn",out:"zoomOut"},slide:{in:"slideInRight",out:"slideOutLeft"},slideBack:{in:"slideInLeft",out:"slideOutRight"},none:{in:"none",out:"none"}},svg:{close:'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><g><g><path d="M505.943,6.058c-8.077-8.077-21.172-8.077-29.249,0L6.058,476.693c-8.077,8.077-8.077,21.172,0,29.249C10.096,509.982,15.39,512,20.683,512c5.293,0,10.586-2.019,14.625-6.059L505.943,35.306C514.019,27.23,514.019,14.135,505.943,6.058z"/></g></g><g><g><path d="M505.942,476.694L35.306,6.059c-8.076-8.077-21.172-8.077-29.248,0c-8.077,8.076-8.077,21.171,0,29.248l470.636,470.636c4.038,4.039,9.332,6.058,14.625,6.058c5.293,0,10.587-2.019,14.624-6.057C514.018,497.866,514.018,484.771,505.942,476.694z"/></g></g></svg>',next:'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 477.175 477.175" xml:space="preserve"> <g><path d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z"/></g></svg>',prev:'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 477.175 477.175" xml:space="preserve"><g><path d="M145.188,238.575l215.5-215.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0l-225.1,225.1c-5.3,5.3-5.3,13.8,0,19.1l225.1,225c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L145.188,238.575z"/></g></svg>'},slideHTML:'<div class="gslide">\n    <div class="gslide-inner-content">\n        <div class="ginner-container">\n            <div class="gslide-media">\n            </div>\n            <div class="gslide-description">\n                <div class="gdesc-inner">\n                    <h4 class="gslide-title"></h4>\n                    <div class="gslide-desc"></div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>',lightboxHTML:'<div id="glightbox-body" class="glightbox-container" tabindex="-1" role="dialog" aria-hidden="false">\n    <div class="gloader visible"></div>\n    <div class="goverlay"></div>\n    <div class="gcontainer">\n    <div id="glightbox-slider" class="gslider"></div>\n    <button class="gclose gbtn" aria-label="Close" data-taborder="3">{closeSVG}</button>\n    <button class="gprev gbtn" aria-label="Previous" data-taborder="2">{prevSVG}</button>\n    <button class="gnext gbtn" aria-label="Next" data-taborder="1">{nextSVG}</button>\n</div>\n</div>'},te=function(){function e(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};t(this,e),this.customOptions=i,this.settings=l(ee,i),this.effectsClasses=this.getAnimationClasses(),this.videoPlayers={},this.apiEvents=[],this.fullElementsList=!1}return n(e,[{key:"init",value:function(){var e=this,t=this.getSelector();t&&(this.baseEvents=a("click",{onElement:t,withCallback:function(t,i){t.preventDefault(),e.open(i)}})),this.elements=this.getElements()}},{key:"open",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(0===this.elements.length)return!1;this.activeSlide=null,this.prevActiveSlideIndex=null,this.prevActiveSlide=null;var i=M(t)?t:this.settings.startAt;if(k(e)){var n=e.getAttribute("data-gallery");n&&(this.fullElementsList=this.elements,this.elements=this.getGalleryElements(this.elements,n)),I(i)&&(i=this.getElementIndex(e))<0&&(i=0)}M(i)||(i=0),this.build(),g(this.overlay,"none"===this.settings.openEffect?"none":this.settings.cssEfects.fade.in);var s=document.body,l=window.innerWidth-document.documentElement.clientWidth;if(l>0){var o=document.createElement("style");o.type="text/css",o.className="gcss-styles",o.innerText=".gscrollbar-fixer {margin-right: ".concat(l,"px}"),document.head.appendChild(o),h(s,"gscrollbar-fixer")}h(s,"glightbox-open"),h(Q,"glightbox-open"),J&&(h(document.body,"glightbox-mobile"),this.settings.slideEffect="slide"),this.showSlide(i,!0),1===this.elements.length?(h(this.prevButton,"glightbox-button-hidden"),h(this.nextButton,"glightbox-button-hidden")):(d(this.prevButton,"glightbox-button-hidden"),d(this.nextButton,"glightbox-button-hidden")),this.lightboxOpen=!0,this.trigger("open"),T(this.settings.onOpen)&&this.settings.onOpen(),K&&this.settings.touchNavigation&&B(this),this.settings.keyboardNavigation&&X(this)}},{key:"openAt",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;this.open(null,e)}},{key:"showSlide",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,i=arguments.length>1&&void 0!==arguments[1]&&arguments[1];f(this.loader),this.index=parseInt(t);var n=this.slidesContainer.querySelector(".current");n&&d(n,"current"),this.slideAnimateOut();var s=this.slidesContainer.querySelectorAll(".gslide")[t];if(c(s,"loaded"))this.slideAnimateIn(s,i),p(this.loader);else{f(this.loader);var l=this.elements[t],o={index:this.index,slide:s,slideNode:s,slideConfig:l.slideConfig,slideIndex:this.index,trigger:l.node,player:null};this.trigger("slide_before_load",o),l.instance.setContent(s,(function(){p(e.loader),e.resize(),e.slideAnimateIn(s,i),e.trigger("slide_after_load",o)}))}this.slideDescription=s.querySelector(".gslide-description"),this.slideDescriptionContained=this.slideDescription&&c(this.slideDescription.parentNode,"gslide-media"),this.settings.preload&&(this.preloadSlide(t+1),this.preloadSlide(t-1)),this.updateNavigationClasses(),this.activeSlide=s}},{key:"preloadSlide",value:function(e){var t=this;if(e<0||e>this.elements.length-1)return!1;if(I(this.elements[e]))return!1;var i=this.slidesContainer.querySelectorAll(".gslide")[e];if(c(i,"loaded"))return!1;var n=this.elements[e],s=n.type,l={index:e,slide:i,slideNode:i,slideConfig:n.slideConfig,slideIndex:e,trigger:n.node,player:null};this.trigger("slide_before_load",l),"video"===s||"external"===s?setTimeout((function(){n.instance.setContent(i,(function(){t.trigger("slide_after_load",l)}))}),200):n.instance.setContent(i,(function(){t.trigger("slide_after_load",l)}))}},{key:"prevSlide",value:function(){this.goToSlide(this.index-1)}},{key:"nextSlide",value:function(){this.goToSlide(this.index+1)}},{key:"goToSlide",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(this.prevActiveSlide=this.activeSlide,this.prevActiveSlideIndex=this.index,!this.loop()&&(e<0||e>this.elements.length-1))return!1;e<0?e=this.elements.length-1:e>=this.elements.length&&(e=0),this.showSlide(e)}},{key:"insertSlide",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:-1;t<0&&(t=this.elements.length);var i=new $(e,this,t),n=i.getConfig(),s=l({},n),o=i.create(),r=this.elements.length-1;s.index=t,s.node=!1,s.instance=i,s.slideConfig=n,this.elements.splice(t,0,s);var a=null,h=null;if(this.slidesContainer){if(t>r)this.slidesContainer.appendChild(o);else{var d=this.slidesContainer.querySelectorAll(".gslide")[t];this.slidesContainer.insertBefore(o,d)}(this.settings.preload&&0==this.index&&0==t||this.index-1==t||this.index+1==t)&&this.preloadSlide(t),0===this.index&&0===t&&(this.index=1),this.updateNavigationClasses(),a=this.slidesContainer.querySelectorAll(".gslide")[t],h=this.getSlidePlayerInstance(t),s.slideNode=a}this.trigger("slide_inserted",{index:t,slide:a,slideNode:a,slideConfig:n,slideIndex:t,trigger:null,player:h}),T(this.settings.slideInserted)&&this.settings.slideInserted({index:t,slide:a,player:h})}},{key:"removeSlide",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:-1;if(e<0||e>this.elements.length-1)return!1;var t=this.slidesContainer&&this.slidesContainer.querySelectorAll(".gslide")[e];t&&(this.getActiveSlideIndex()==e&&(e==this.elements.length-1?this.prevSlide():this.nextSlide()),t.parentNode.removeChild(t)),this.elements.splice(e,1),this.trigger("slide_removed",e),T(this.settings.slideRemoved)&&this.settings.slideRemoved(e)}},{key:"slideAnimateIn",value:function(e,t){var i=this,n=e.querySelector(".gslide-media"),s=e.querySelector(".gslide-description"),l={index:this.prevActiveSlideIndex,slide:this.prevActiveSlide,slideNode:this.prevActiveSlide,slideIndex:this.prevActiveSlide,slideConfig:I(this.prevActiveSlideIndex)?null:this.elements[this.prevActiveSlideIndex].slideConfig,trigger:I(this.prevActiveSlideIndex)?null:this.elements[this.prevActiveSlideIndex].node,player:this.getSlidePlayerInstance(this.prevActiveSlideIndex)},o={index:this.index,slide:this.activeSlide,slideNode:this.activeSlide,slideConfig:this.elements[this.index].slideConfig,slideIndex:this.index,trigger:this.elements[this.index].node,player:this.getSlidePlayerInstance(this.index)};if(n.offsetWidth>0&&s&&(p(s),s.style.display=""),d(e,this.effectsClasses),t)g(e,this.settings.cssEfects[this.settings.openEffect].in,(function(){i.settings.autoplayVideos&&i.slidePlayerPlay(e),i.trigger("slide_changed",{prev:l,current:o}),T(i.settings.afterSlideChange)&&i.settings.afterSlideChange.apply(i,[l,o])}));else{var r=this.settings.slideEffect,a="none"!==r?this.settings.cssEfects[r].in:r;this.prevActiveSlideIndex>this.index&&"slide"==this.settings.slideEffect&&(a=this.settings.cssEfects.slideBack.in),g(e,a,(function(){i.settings.autoplayVideos&&i.slidePlayerPlay(e),i.trigger("slide_changed",{prev:l,current:o}),T(i.settings.afterSlideChange)&&i.settings.afterSlideChange.apply(i,[l,o])}))}setTimeout((function(){i.resize(e)}),100),h(e,"current")}},{key:"slideAnimateOut",value:function(){if(!this.prevActiveSlide)return!1;var e=this.prevActiveSlide;d(e,this.effectsClasses),h(e,"prev");var t=this.settings.slideEffect,i="none"!==t?this.settings.cssEfects[t].out:t;this.slidePlayerPause(e),this.trigger("slide_before_change",{prev:{index:this.prevActiveSlideIndex,slide:this.prevActiveSlide,slideNode:this.prevActiveSlide,slideIndex:this.prevActiveSlideIndex,slideConfig:I(this.prevActiveSlideIndex)?null:this.elements[this.prevActiveSlideIndex].slideConfig,trigger:I(this.prevActiveSlideIndex)?null:this.elements[this.prevActiveSlideIndex].node,player:this.getSlidePlayerInstance(this.prevActiveSlideIndex)},current:{index:this.index,slide:this.activeSlide,slideNode:this.activeSlide,slideIndex:this.index,slideConfig:this.elements[this.index].slideConfig,trigger:this.elements[this.index].node,player:this.getSlidePlayerInstance(this.index)}}),T(this.settings.beforeSlideChange)&&this.settings.beforeSlideChange.apply(this,[{index:this.prevActiveSlideIndex,slide:this.prevActiveSlide,player:this.getSlidePlayerInstance(this.prevActiveSlideIndex)},{index:this.index,slide:this.activeSlide,player:this.getSlidePlayerInstance(this.index)}]),this.prevActiveSlideIndex>this.index&&"slide"==this.settings.slideEffect&&(i=this.settings.cssEfects.slideBack.out),g(e,i,(function(){var t=e.querySelector(".ginner-container"),i=e.querySelector(".gslide-media"),n=e.querySelector(".gslide-description");t.style.transform="",i.style.transform="",d(i,"greset"),i.style.opacity="",n&&(n.style.opacity=""),d(e,"prev")}))}},{key:"getAllPlayers",value:function(){return this.videoPlayers}},{key:"getSlidePlayerInstance",value:function(e){var t="gvideo"+e,i=this.getAllPlayers();return!(!O(i,t)||!i[t])&&i[t]}},{key:"stopSlideVideo",value:function(e){if(k(e)){var t=e.querySelector(".gvideo-wrapper");t&&(e=t.getAttribute("data-index"))}console.log("stopSlideVideo is deprecated, use slidePlayerPause");var i=this.getSlidePlayerInstance(e);i&&i.playing&&i.pause()}},{key:"slidePlayerPause",value:function(e){if(k(e)){var t=e.querySelector(".gvideo-wrapper");t&&(e=t.getAttribute("data-index"))}var i=this.getSlidePlayerInstance(e);i&&i.playing&&i.pause()}},{key:"playSlideVideo",value:function(e){if(k(e)){var t=e.querySelector(".gvideo-wrapper");t&&(e=t.getAttribute("data-index"))}console.log("playSlideVideo is deprecated, use slidePlayerPlay");var i=this.getSlidePlayerInstance(e);i&&!i.playing&&i.play()}},{key:"slidePlayerPlay",value:function(e){var t;if(!J||null!==(t=this.settings.plyr.config)&&void 0!==t&&t.muted){if(k(e)){var i=e.querySelector(".gvideo-wrapper");i&&(e=i.getAttribute("data-index"))}var n=this.getSlidePlayerInstance(e);n&&!n.playing&&(n.play(),this.settings.autofocusVideos&&n.elements.container.focus())}}},{key:"setElements",value:function(e){var t=this;this.settings.elements=!1;var i=[];e&&e.length&&o(e,(function(e,n){var s=new $(e,t,n),o=s.getConfig(),r=l({},o);r.slideConfig=o,r.instance=s,r.index=n,i.push(r)})),this.elements=i,this.lightboxOpen&&(this.slidesContainer.innerHTML="",this.elements.length&&(o(this.elements,(function(){var e=m(t.settings.slideHTML);t.slidesContainer.appendChild(e)})),this.showSlide(0,!0)))}},{key:"getElementIndex",value:function(e){var t=!1;return o(this.elements,(function(i,n){if(O(i,"node")&&i.node==e)return t=n,!0})),t}},{key:"getElements",value:function(){var e=this,t=[];this.elements=this.elements?this.elements:[],!I(this.settings.elements)&&E(this.settings.elements)&&this.settings.elements.length&&o(this.settings.elements,(function(i,n){var s=new $(i,e,n),o=s.getConfig(),r=l({},o);r.node=!1,r.index=n,r.instance=s,r.slideConfig=o,t.push(r)}));var i=!1;return this.getSelector()&&(i=document.querySelectorAll(this.getSelector())),i?(o(i,(function(i,n){var s=new $(i,e,n),o=s.getConfig(),r=l({},o);r.node=i,r.index=n,r.instance=s,r.slideConfig=o,r.gallery=i.getAttribute("data-gallery"),t.push(r)})),t):t}},{key:"getGalleryElements",value:function(e,t){return e.filter((function(e){return e.gallery==t}))}},{key:"getSelector",value:function(){return!this.settings.elements&&(this.settings.selector&&"data-"==this.settings.selector.substring(0,5)?"*[".concat(this.settings.selector,"]"):this.settings.selector)}},{key:"getActiveSlide",value:function(){return this.slidesContainer.querySelectorAll(".gslide")[this.index]}},{key:"getActiveSlideIndex",value:function(){return this.index}},{key:"getAnimationClasses",value:function(){var e=[];for(var t in this.settings.cssEfects)if(this.settings.cssEfects.hasOwnProperty(t)){var i=this.settings.cssEfects[t];e.push("g".concat(i.in)),e.push("g".concat(i.out))}return e.join(" ")}},{key:"build",value:function(){var e=this;if(this.built)return!1;var t=document.body.childNodes,i=[];o(t,(function(e){e.parentNode==document.body&&"#"!==e.nodeName.charAt(0)&&e.hasAttribute&&!e.hasAttribute("aria-hidden")&&(i.push(e),e.setAttribute("aria-hidden","true"))}));var n=O(this.settings.svg,"next")?this.settings.svg.next:"",s=O(this.settings.svg,"prev")?this.settings.svg.prev:"",l=O(this.settings.svg,"close")?this.settings.svg.close:"",r=this.settings.lightboxHTML;r=m(r=(r=(r=r.replace(/{nextSVG}/g,n)).replace(/{prevSVG}/g,s)).replace(/{closeSVG}/g,l)),document.body.appendChild(r);var d=document.getElementById("glightbox-body");this.modal=d;var g=d.querySelector(".gclose");this.prevButton=d.querySelector(".gprev"),this.nextButton=d.querySelector(".gnext"),this.overlay=d.querySelector(".goverlay"),this.loader=d.querySelector(".gloader"),this.slidesContainer=document.getElementById("glightbox-slider"),this.bodyHiddenChildElms=i,this.events={},h(this.modal,"glightbox-"+this.settings.skin),this.settings.closeButton&&g&&(this.events.close=a("click",{onElement:g,withCallback:function(t,i){t.preventDefault(),e.close()}})),g&&!this.settings.closeButton&&g.parentNode.removeChild(g),this.nextButton&&(this.events.next=a("click",{onElement:this.nextButton,withCallback:function(t,i){t.preventDefault(),e.nextSlide()}})),this.prevButton&&(this.events.prev=a("click",{onElement:this.prevButton,withCallback:function(t,i){t.preventDefault(),e.prevSlide()}})),this.settings.closeOnOutsideClick&&(this.events.outClose=a("click",{onElement:d,withCallback:function(t,i){e.preventOutsideClick||c(document.body,"glightbox-mobile")||u(t.target,".ginner-container")||u(t.target,".gbtn")||c(t.target,"gnext")||c(t.target,"gprev")||e.close()}})),o(this.elements,(function(t,i){e.slidesContainer.appendChild(t.instance.create()),t.slideNode=e.slidesContainer.querySelectorAll(".gslide")[i]})),K&&h(document.body,"glightbox-touch"),this.events.resize=a("resize",{onElement:window,withCallback:function(){e.resize()}}),this.built=!0}},{key:"resize",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;if((e=e||this.activeSlide)&&!c(e,"zoomed")){var t=y(),i=e.querySelector(".gvideo-wrapper"),n=e.querySelector(".gslide-image"),s=this.slideDescription,l=t.width,o=t.height;if(l<=768?h(document.body,"glightbox-mobile"):d(document.body,"glightbox-mobile"),i||n){var r=!1;if(s&&(c(s,"description-bottom")||c(s,"description-top"))&&!c(s,"gabsolute")&&(r=!0),n)if(l<=768)n.querySelector("img");else if(r){var a,u=s.offsetHeight,g=n.querySelector("img"),v=this.elements[this.index].node,f=null!==(a=v.getAttribute("data-height"))&&void 0!==a?a:"100vh";g.setAttribute("style","max-height: calc(".concat(f," - ").concat(u,"px)")),s.setAttribute("style","max-width: ".concat(g.offsetWidth,"px;"))}if(i){var p=O(this.settings.plyr.config,"ratio")?this.settings.plyr.config.ratio:"";if(!p){var m=i.clientWidth,x=i.clientHeight,b=m/x;p="".concat(m/b,":").concat(x/b)}var S=p.split(":"),w=this.settings.videosWidth,T=this.settings.videosWidth,C=(T=M(w)||-1!==w.indexOf("px")?parseInt(w):-1!==w.indexOf("vw")?l*parseInt(w)/100:-1!==w.indexOf("vh")?o*parseInt(w)/100:-1!==w.indexOf("%")?l*parseInt(w)/100:parseInt(i.clientWidth))/(parseInt(S[0])/parseInt(S[1]));if(C=Math.floor(C),r&&(o-=s.offsetHeight),T>l||C>o||o<C&&l>T){var k=i.offsetWidth,E=i.offsetHeight,A=o/E,L={width:k*A,height:E*A};i.parentNode.setAttribute("style","max-width: ".concat(L.width,"px")),r&&s.setAttribute("style","max-width: ".concat(L.width,"px;"))}else i.parentNode.style.maxWidth="".concat(w),r&&s.setAttribute("style","max-width: ".concat(w,";"))}}}}},{key:"reload",value:function(){this.init()}},{key:"updateNavigationClasses",value:function(){var e=this.loop();d(this.nextButton,"disabled"),d(this.prevButton,"disabled"),0==this.index&&this.elements.length-1==0?(h(this.prevButton,"disabled"),h(this.nextButton,"disabled")):0!==this.index||e?this.index!==this.elements.length-1||e||h(this.nextButton,"disabled"):h(this.prevButton,"disabled")}},{key:"loop",value:function(){var e=O(this.settings,"loopAtEnd")?this.settings.loopAtEnd:null;return e=O(this.settings,"loop")?this.settings.loop:e,e}},{key:"close",value:function(){var e=this;if(!this.lightboxOpen){if(this.events){for(var t in this.events)this.events.hasOwnProperty(t)&&this.events[t].destroy();this.events=null}return!1}if(this.closing)return!1;this.closing=!0,this.slidePlayerPause(this.activeSlide),this.fullElementsList&&(this.elements=this.fullElementsList),this.bodyHiddenChildElms.length&&o(this.bodyHiddenChildElms,(function(e){e.removeAttribute("aria-hidden")})),h(this.modal,"glightbox-closing"),g(this.overlay,"none"==this.settings.openEffect?"none":this.settings.cssEfects.fade.out),g(this.activeSlide,this.settings.cssEfects[this.settings.closeEffect].out,(function(){if(e.activeSlide=null,e.prevActiveSlideIndex=null,e.prevActiveSlide=null,e.built=!1,e.events){for(var t in e.events)e.events.hasOwnProperty(t)&&e.events[t].destroy();e.events=null}var i=document.body;d(Q,"glightbox-open"),d(i,"glightbox-open touching gdesc-open glightbox-touch glightbox-mobile gscrollbar-fixer"),e.modal.parentNode.removeChild(e.modal),e.trigger("close"),T(e.settings.onClose)&&e.settings.onClose();var n=document.querySelector(".gcss-styles");n&&n.parentNode.removeChild(n),e.lightboxOpen=!1,e.closing=null}))}},{key:"destroy",value:function(){this.close(),this.clearAllEvents(),this.baseEvents&&this.baseEvents.destroy()}},{key:"on",value:function(e,t){var i=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(!e||!T(t))throw new TypeError("Event name and callback must be defined");this.apiEvents.push({evt:e,once:i,callback:t})}},{key:"once",value:function(e,t){this.on(e,t,!0)}},{key:"trigger",value:function(e){var t=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=[];o(this.apiEvents,(function(t,s){var l=t.evt,o=t.once,r=t.callback;l==e&&(r(i),o&&n.push(s))})),n.length&&o(n,(function(e){return t.apiEvents.splice(e,1)}))}},{key:"clearAllEvents",value:function(){this.apiEvents.splice(0,this.apiEvents.length)}},{key:"version",value:function(){return"3.2.0"}}]),e}();return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=new te(e);return t.init(),t}}));

/* Custom Wrap */
var Lbox = class Lightbox {
    init() {
        const options = {
            touchNavigation: true,
            selector: '.dummy', // do not use .is-lightbox if used for programmatically open
            loop: true,
            autoplayVideos: true,
            zoomable: true,
            slideEffect: 'slide',
            descPosition: 'bottom',
            skin: 'light'
        };

        this.refreshLightbox(options);
        
        const clickables = document.querySelectorAll('.is-lightbox,.block-click');
        clickables.forEach((elm)=>{
            elm.addEventListener('click', (e)=>{
                let url = elm.getAttribute('href');
                if(!url) url = elm.getAttribute('data-modal-url');
                this.openLightbox(url, elm, options);
                e.preventDefault();
                e.stopImmediatePropagation();
            })
        });
    }

    refreshLightbox(options) {
        if(this.glightbox) this.glightbox.destroy();
        this.glightbox = GLightbox(options);
    }

    openLightbox(url, elm, options) {
        let list = [];
        let open = 0;
        if(elm) {
            const gallery = elm.closest('[data-gallery]');
            let links=[];
            if(gallery) {
                links = gallery.querySelectorAll('.is-lightbox');
            } else {
                let elms = document.querySelectorAll('.is-lightbox,.block-click');
                elms.forEach(elm=>{
                    if(!elm.closest('[data-gallery]')) { // exclude galleries
                        links.push(elm);
                    }
                });
            }
            links.forEach((link, index)=>{
                let linkUrl = link.getAttribute('href');
                if(!linkUrl) linkUrl = link.getAttribute('data-modal-url');
                list.push({
                    'href': linkUrl
                });
                if(url===linkUrl) open = index;
            });
        }

        if(list.length>0) {
            this.glightbox.setElements(list);
            this.glightbox.openAt(open);
        } else {
            this.glightbox.setElements([
                {
                'href': url
                }
            ]);
            this.glightbox.open();
        }

        this.glightbox.on('close', () => {
            this.refreshLightbox(options);
        });
    }
}
window.lightbox = new Lbox();

documentReady(function(){
    functionLightboxInit();

    inViewSetup();
    setTimeout(()=>{ inViewSetup() },750);
    setTimeout(()=>{ inViewSetup() },1500);
});