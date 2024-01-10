class website_controller{
    constructor(url) {
        this.url = url;

        this.loading_status = document.getElementById("loading-status");
        this.link_panel_status = document.getElementById("nav-panel-status");

        let json_request = new XMLHttpRequest();
        let _this_ref = this;

        json_request.open("get",this.url);
        json_request.send(null);
        json_request.onload = function () {
            if (json_request.status === 200){
                let parsed_json = JSON.parse(json_request.responseText);
                nav_controller.init(parsed_json);
                content_loader.init(parsed_json);
                document.title = parsed_json.title;
                let current_sub_page_index = 0;
                let url_levels = window.location.href.split("#")
                for (let i = 0; i < parsed_json.links.length; i++) {
                    if (url_levels[1] === parsed_json.links[i].title) {
                        current_sub_page_index = i;
                        _this_ref.loading_status.checked = true;
                        _this_ref.link_panel_status.checked = false;
                        let event = null
                        if(url_levels[1] == "ARTICLES") {
                            let url_tags = []
                            let url_page = 1
                            let url_md_src = "none"
                            if (url_levels.length > 2) {
                                for (let url_index = 2; url_index < url_levels.length; url_index++) {
                                    let reg = /^[\d|\.]*$/;
                                    if(url_levels[url_index].indexOf("TAGS") === 0) {
                                        url_levels[url_index].split("&").slice(1,url_levels[url_index].split("&").length).forEach(tags=> {
                                            url_tags.push(tags.replace("%20", " "))
                                        })
                                    }
                                    if(reg.test(url_levels[url_index])) {
                                        url_page = url_levels[url_index].toString()
                                    }
                                    if(url_levels[url_index].indexOf("^") !== -1) {
                                        url_md_src = url_levels[url_index].replace("^", "/") + ".md"
                                    }
                                }
                            }
                            event = new CustomEvent("loadContentRequest", {detail:{web_info: parsed_json.links[current_sub_page_index],
                                                                                    article_info: {tags: url_tags, page: url_page, md_src: url_md_src}}}
                            )
                        } else {
                            event = new CustomEvent("loadContentRequest", {detail:{web_info: parsed_json.links[current_sub_page_index]}});
                        }
                        document.dispatchEvent(event);
                    } else if(url_levels[1]==="404"){
                        _this_ref.loading_status.checked = true;
                        content_loader.catch_error("404");
                    } else {
                        let event = new CustomEvent("loadContentRequest",{detail:{web_info:parsed_json.links[0]}});
                        document.dispatchEvent(event);
                    }
                }
            }
        }
    }
}