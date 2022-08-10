document.write("<script language=javascript src='/ui_components/article-browser/marked.min.js'></script>");
document.write("<script language=javascript src='/ui_components/article-browser/highlight.min.js'></script>");


class ArticleBrowserIF {
    constructor(markdown_dir_) {
        let _this_ref = this;

        this._md_dir = markdown_dir_;
        this.page_item_number = 6;

        let json_request = new XMLHttpRequest();

        this._page_title = document.getElementById("article-title");
        this._main_content = document.getElementById("article-main-content")
        this._tag_content = document.getElementById("article-tags-content")
        this._index_wrapper = document.getElementById("article-index-wrapper")
        this._index_content = document.getElementById("article-index-content")
        this._recommend_wrapper = document.getElementById("article-recommendations-wrapper")
        this._recommend_content = document.getElementById("article-recommendations-content")

        this._tag_list = []
        this._selected_articles = []

        json_request.open("get", this._md_dir+"/article_list.json");
        json_request.send(null);

        json_request.onload = function () {
            if (json_request.status === 200) {
                let parsed_json = JSON.parse(json_request.responseText)
                _this_ref.document_info = parsed_json
                _this_ref.onload();
                _this_ref._init_tag()
            }
        }
    }

    onload = function () {
    }

    /**
     * Load article page by page number from article list.
     * @param page page to show.
     */
    show_page(page) {
        this._page_title.innerText="Articles"
        for(let i = (page-1) * this.page_item_number; i<((page*this.page_item_number < this._selected_articles.length)?
            (page*this.page_item_number):this._selected_articles.length); i++){
            try{
                this._main_content.append(this._generate_link_card(this._selected_articles[i]));
            } catch (e) {
                console.log(e);
            }
        }
    }

    /**
     * Load article by markdown file url
     * @param url Markdown file url.
     */
    show_article(url) {
        let _this_ref = this
        let md_file = new XMLHttpRequest()
        let markdown_container = document.createElement("div")
        md_file.open("get", this._md_dir+ "/" + url)
        md_file.send(null)
        md_file.onload = function () {
            if (md_file.status === 200) {
                markdown_container.innerHTML =  marked.parse(md_file.responseText)
                _this_ref._main_content.append(markdown_container)
                hljs.highlightAll();
            }
        }
    }

    /**
     * Update the article list with selected tags
     * @param tags String array with tags.
     */
    refresh_article_list(tags) {
        this._selected_articles = []
        if (tags === []) { /// Empty indicates all tags
            this._selected_articles = this.document_info
        } else {           /// Else, tags selected.
            this.document_info.forEach(article_obj=>{
                let satisfied_tag_search = true
                tags.forEach(tag=> {
                    if (!article_obj.class.includes(tag)) {
                        satisfied_tag_search = false
                    }
                })
                if (satisfied_tag_search) {
                    this._selected_articles.push(article_obj)
                }
            })
        }
    }

    /**
     * Update the indexes button with list.
     */
    refresh_indexes() {
        let _this_ref = this
        this._index_content.innerHTML=""
        for(let i = 0; i < Math.ceil(this._selected_articles.length/this.page_item_number); i++) {
            let btn = document.createElement("button")
            btn.innerText = (i+1).toString()
            btn.onclick = function () {
                let page_btn_click_event = new CustomEvent("article_page_refresh_event", {
                    detail: (i+1)
                });
                window.dispatchEvent(page_btn_click_event)
            }
            this._index_content.appendChild(btn)
        }
    }

    clear_main_view() {
        this._main_content.innerHTML = ""
    }

    /**
     * Animation will take 250ms
     */
    content_panel_fade() {
        this._main_content.style.opacity = "0.0"
    }

    /**
     * Animation will take 250ms
     */
    content_panel_show() {
        this._main_content.style.opacity = "1.0"
    }

    /**
     * Animation will take 250ms
     */
    index_panel_fade() {
        this._index_wrapper.style.opacity = "0.0"
    }

    /**
     * Animation will take 250ms
     */
    index_panel_show() {
        this._index_wrapper.style.opacity = "1.0"
    }

    _generate_link_card(article_list_object) {
        let card_obj = document.createElement("div")
        let img_wrapper = document.createElement("div")
        let img = document.createElement("img")
        let title = document.createElement("h1")
        let text = document.createElement("p")
        let link_img = document.createElement("img")
        title.innerText = article_list_object.title
        text.innerText = article_list_object.text;
        card_obj.classList.add("article-card-wrapper")
        card_obj.classList.add("article-card-loading")
        img_wrapper.classList.add("article-card-image-wrapper")
        img.classList.add("article-card-image")
        img.onload = function () {
            card_obj.classList.remove("article-card-loading")
        }
        link_img.classList.add("article-card-link-arrow")
        link_img.src = "/resources/htmls/home/linkArrow.svg"

        img.src = this._md_dir + "/" + article_list_object.pic
        img_wrapper.append(img);
        card_obj.append(img_wrapper)
        card_obj.append(title)
        card_obj.append(text)
        card_obj.append(link_img)

        return card_obj;
    }

    _init_tag() {
        let added_tags = []
        let _this_ref = this
        this.document_info.forEach(article_obj=>{
            article_obj.class.forEach(tag_str=>{
                if(!added_tags.includes(tag_str)) {
                    added_tags.push(tag_str)
                    let tag_obj = new Object()
                    tag_obj.tag = tag_str
                    tag_obj.selected = false
                    this._tag_list.push(tag_obj)

                    let tag_btn = document.createElement("button")
                    tag_btn.innerText = tag_str
                    tag_btn.onclick = function () {
                        tag_obj.selected = !tag_obj.selected;
                        if(tag_btn.classList.contains("article-tag-selected")) {
                            tag_btn.classList.remove("article-tag-selected")
                        } else {
                            tag_btn.classList.add("article-tag-selected")
                        }
                        let selected_tags = []
                        _this_ref._tag_list.forEach(tag=>{
                            if (tag.selected) {
                                selected_tags.push(tag.tag)
                            }
                        })
                        let tag_btn_click_event = new CustomEvent("article_page_refresh_event", {
                            detail: {selected_tags}
                        });
                        window.dispatchEvent(tag_btn_click_event)
                    }
                    this._tag_content.appendChild(tag_btn)
                }
            })
        })
    }
}