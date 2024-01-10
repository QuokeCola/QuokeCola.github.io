document.write("<script language=javascript src='/framework/common_function.js'></script>")
document.write("<script language=javaScript src='/apps/article_browser/article_browser_scheduler.js'></script>")
class content_loader {
    static init(parsed_json) {
        this.article_scheduler = new ArticleBrowserSKD('/apps/markdowns')

        content_loader.content_window_obj = document.getElementById("content-screen");
        content_loader.loading_grid_obj = document.getElementById("loading-grid");
        content_loader.organization_name_obj = document.getElementById("loading-orgName");
        content_loader.loading_status = document.getElementById("loading-status");

        content_loader.organization_name_obj.innerHTML = parsed_json.organization;

        content_loader.loading_text_show_keyframe = [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 },
                                        { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }];
        content_loader.loading_text_fade_keyframe = [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 },
                                        { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 },
                                        { opacity: 1 },{ opacity: 1 },{ opacity: 1 },{ opacity: 1 },
                                        { opacity: 1 },{ opacity: 1 },{ opacity: 1 },{ opacity: 1 },
                                        { opacity: 1 },{ opacity: 1 },{ opacity: 1 },{ opacity: 1 },
                                        { opacity: 1 },{ opacity: 1 },{ opacity: 1 },{ opacity: 1 },
                                        { opacity: 1 },{ opacity: 0 }, { opacity: 1 }, { opacity: 0 },
                                        { opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 },];

        let _content_loader_ref = content_loader;
        content_loader._update_grid();
        window.addEventListener('resize',function (){
            _content_loader_ref._update_grid();
        });
        window.addEventListener('orientationchange',function (){
            _content_loader_ref._update_grid();
        });
        document.addEventListener('loadContentRequest',function (event){
            _content_loader_ref.load_content(event);
        });
        window.addEventListener('error',function (e) {
            _content_loader_ref.catch_error(e);
        }, true);
    }

    static load_content(event){
        let _content_loader_ref = content_loader;
        let htmlParser = new HTML_parser(event.detail.web_info.src);
        htmlParser.onload = function () {
            setTimeout(function (){
                // Clear previous page CSS
                for (let i = 0; i < document.head.childNodes.length; i++) {
                    if(document.head.childNodes[i].nodeName==="LINK"&& document.head.childNodes[i].type ==="text/css"){
                        if(!document.head.childNodes[i].href.includes("/framework/")) {
                            document.head.removeChild(document.head.childNodes[i]);
                        }
                    }
                }
                // Add css
                for (let i = 0; i < htmlParser.css.length; i++) {
                    if(!htmlParser.css[i].href.includes("/framework/")) { // exclude universal css
                        document.head.appendChild(htmlParser.css[i]);
                    }
                }
                /** TODO: Any way for javascript injection? */
            },400);

            setTimeout(function (){
                let innerHTML = null;
                // HTML inject
                for(let i = 0; i < htmlParser.body.childNodes.length; i++) {
                    if (htmlParser.body.childNodes[i].id === "content-screen"){
                        innerHTML = htmlParser.body.childNodes[i].innerHTML;
                    }
                }
                _content_loader_ref.content_window_obj.innerHTML = innerHTML;
                // Browser history
                if(event.detail.web_info.title != "ARTICLES") {
                    window.history.pushState(event.detail.web_info,  event.detail.web_info.title, "#"+event.detail.web_info.title);
                } else {
                    _content_loader_ref.article_scheduler.awake()
                    _content_loader_ref.article_scheduler.onload = function () {
                        if(event.detail.article_info != undefined) {
                            let event_tag = event.detail.article_info.tags;
                            let event_page = event.detail.article_info.page;
                            let event_md   = event.detail.article_info.md_src;
                            _content_loader_ref.article_scheduler.update_ui_by_state({md_src: event_md, tags: event_tag, page: event_page})
                        } else {
                            _content_loader_ref.article_scheduler.update_ui_by_local()
                        }
                    }
                }
                _content_loader_ref.loading_status.checked = false;
            },1000);
        };
        htmlParser.onerror = function (e) {
            _content_loader_ref.catch_error(e);
        }
        if(document.documentElement.style.getPropertyValue('--loading-text').includes("ERROR")){
            document.getElementById('loading-textBox').animate(
                content_loader.loading_text_fade_keyframe , {
                    fill: "auto",
                    easing: 'ease-in-out',
                    duration: 1500
                });
        }
        document.documentElement.style.setProperty("--loading-text",'"LOADING"');
        document.documentElement.style.setProperty("--loading-color", "var(--rm-yellow-darken)");
        document.documentElement.style.setProperty("--loading-grid-color",'var(--loading-grid-dark)');
    }

    static catch_error(e){
        document.getElementById('loading-textBox').animate(
            content_loader.loading_text_show_keyframe , {
                fill: "auto",
                easing: 'ease-in-out',
                duration: 500
            });
        document.documentElement.style.setProperty("--loading-text",'"ERROR:'+e+'"');
        document.documentElement.style.setProperty("--loading-color", "rgb(255,100,100)");
        document.documentElement.style.setProperty("--loading-grid-color",'var(--loading-grid-red)');
        window.history.pushState(null,  null, "#404");
    }

    /**
     * @brief Update the grid background in loading view.
     */
    static _update_grid() {
        content_loader._property = getComputedStyle(content_loader.content_window_obj);
        let width = parseFloat(content_loader._property.width.replace("px",""));
        let height = parseFloat(content_loader._property.height.replace("px",""))
        content_loader.grid_size = ((width/8 > height/5) ? width/8: height/5);
        let new_vert_half_line_count = width/2/content_loader.grid_size-0.5;
        let new_horz_half_line_count = height/2/content_loader.grid_size - 0.5;
        if(new_vert_half_line_count !== content_loader.vert_half_line_count){
            content_loader.vert_half_line_count = width/2/content_loader.grid_size-0.5;
            content_loader._generate_grid();
        }
        if(new_horz_half_line_count !== content_loader.horz_half_line_count){
            content_loader.horz_half_line_count = height/2/content_loader.grid_size - 0.5;
            content_loader._generate_grid();
        }
        document.documentElement.style.setProperty("--loading-grid-index-offset-vert",content_loader.vert_half_line_count);
        document.documentElement.style.setProperty("--loading-grid-index-offset-horz",content_loader.horz_half_line_count);
        document.documentElement.style.setProperty("--loading-grid-active-size",content_loader.grid_size+"px");
        document.documentElement.style.setProperty("--loading-grid-idle-size",content_loader.grid_size*2+"px");
    }

    /**
     * @brief Generate grid background in loading view
     * @detain Removes all children in #grid-bg element and regenerate lines.
     */
    static _generate_grid(){
        while (content_loader.loading_grid_obj.childNodes.length>0){
            content_loader.loading_grid_obj.removeChild(content_loader.loading_grid_obj.lastChild);
        }
        for (let i = -Math.floor(content_loader.vert_half_line_count); i <= 0; i++){
            let left_line = document.createElement("vert-line");
            left_line.setAttribute('style', "--index: ("+String(i-0.5)+")");
            let right_line = document.createElement("vert-line");
            right_line.setAttribute('style', "--index: ("+String(-i+0.5)+")");
            content_loader.loading_grid_obj.appendChild(left_line);
            content_loader.loading_grid_obj.appendChild(right_line);
        }
        for (let i = -Math.floor(content_loader.horz_half_line_count); i <= 0; i++) {
            let top_line = document.createElement("horz-line");
            top_line.setAttribute('style', "--index: ("+String(i-0.5)+")");
            let bottom_line = document.createElement("horz-line");
            bottom_line.setAttribute('style', "--index: ("+String(-i+0.5)+")");
            content_loader.loading_grid_obj.appendChild(top_line);
            content_loader.loading_grid_obj.appendChild(bottom_line);
        }
        document.documentElement.style.setProperty("--loading-grid-active-size",content_loader.grid_size+"px");
    }
}