document.write("<script language=javascript src='/ui_components/article-browser/article_browser_interface.js'></script>")

class ArticleBrowserSKD {
    constructor(md_dir) {
        let _this_ref = this

        this.idx = 1
        this.full_idx = 1
        this.tags= []
        this.md_src = "none"
        this.md_dir = md_dir

        addEventListener('article_tag_click_event', function (event) {
            _this_ref.handle_tag_click(event)
            _this_ref.validate_index_left_right_btn_enable()
        })
        addEventListener('article_index_click_event', function (event) {
            _this_ref.handle_index_click(event)
            _this_ref.validate_index_left_right_btn_enable()
        })

        addEventListener('update_index_event', function (event) {
            _this_ref.full_idx = event.detail
            _this_ref.validate_index_left_right_btn_enable()
        })

        addEventListener('link_card_click_event', function (event) {
            _this_ref.handle_link_card_click(event)
        })
    }

    onload = function(){}

    awake() {
        let _this_ref = this

        this.article_interface = new ArticleBrowserIF(this.md_dir)
        this.article_interface.onload = function () {
            _this_ref.onload()
        }

        this.article_left_btn = document.getElementById("article-index-btn-left")
        this.article_right_btn = document.getElementById("article-index-btn-right")
        this.article_title_wrapper = document.getElementById("article-title-wrapper")

        this.article_left_btn.onclick = function () {
            _this_ref.article_interface.refresh_page(_this_ref.idx-1)
            _this_ref.article_interface.highlight_index_btn(_this_ref.idx-1)
            _this_ref.idx = _this_ref.idx-1
            if(_this_ref.idx === 1) {
                _this_ref.article_left_btn.disabled=true
            }
            _this_ref.article_right_btn.disabled=false
            _this_ref.content_push_history()
        }

        this.article_right_btn.onclick = function () {
            _this_ref.article_interface.refresh_page(_this_ref.idx+1)
            _this_ref.article_interface.highlight_index_btn(_this_ref.idx+1)
            _this_ref.idx = _this_ref.idx+1
            if(_this_ref.idx >= _this_ref.full_idx) {
                _this_ref.article_right_btn.disabled=true
            }
            _this_ref.article_left_btn.disabled=false
            _this_ref.content_push_history()
        }

        this.article_title_wrapper.onclick = function () {
            if(!_this_ref.article_title_wrapper.classList.contains("entered_article")) {
                _this_ref.article_title_wrapper.classList.add("entered_article")
            }
            history.back()
            setTimeout(function () {
                if(history.state.tags !== undefined) {
                    _this_ref.update_ui_by_state(history.state)
                } else {
                    _this_ref.md_src = "none"
                    _this_ref.update_ui_by_local()
                    _this_ref.content_push_history()
                }
            },100)
        }
    }

    handle_tag_click(event) {
        this.tags = event.detail.selected_tags
        let _this_ref = this

        this.article_interface.content_panel_fade()
        this.article_interface.index_panel_fade()

        setTimeout(function () {
            _this_ref.article_interface.refresh_article_list(_this_ref.tags)
            _this_ref.article_interface.refresh_indexes()

            _this_ref.article_interface.refresh_page(1)

            _this_ref.article_interface.content_panel_show()
            _this_ref.article_interface.index_panel_show()

            _this_ref.content_push_history()
        },250)
    }

    handle_index_click(event) {
        let _this_ref = this
        this.idx = event.detail

        this.article_interface.content_panel_fade()

        setTimeout(function () {
            _this_ref.article_interface.refresh_page(_this_ref.idx)
            _this_ref.article_interface.content_panel_show()
            _this_ref.content_push_history()
        }, 250)
    }

    handle_link_card_click(event) {
        let src = event.detail.src
        this.md_src = event.detail.src
        let _this_ref = this
        this.article_interface.content_panel_fade()
        this.article_interface.tag_panel_fade()
        this.article_interface.index_panel_fade()
        _this_ref.article_interface.recommend_panel_fade()
        setTimeout(function () {
            _this_ref.article_interface.generate_recommended()
            _this_ref.article_interface.clear_main_view()
            _this_ref.article_interface.show_article(src)
            _this_ref.article_interface.recommend_panel_show()
            _this_ref.article_interface.content_panel_show()
            _this_ref.markdown_push_history(event.detail)
        },250)
    }

    validate_index_left_right_btn_enable() {
        if(this.full_idx===1) {
            this.article_left_btn.disabled=true
            this.article_right_btn.disabled=true
            return
        }
        if(this.idx === 1) {
            this.article_left_btn.disabled=true
        } else {
            this.article_left_btn.disabled=false
        }
        if(this.idx === this.full_idx) {
            this.article_right_btn.disabled=true
        } else {
            this.article_right_btn.disabled=false
        }
    }

    content_push_history() {
        let url = "#" + "ARTICLES" + "#TAGS"
        this.tags.forEach(tag=>{
            url = url + "&"+tag
        })
        url = url + "#"+this.idx
        history.pushState({tags: this.tags, page: this.idx, md_src: "none"},"ARTICLES", url)
    }

    markdown_push_history(article_object) {
        let md_src = article_object.src
        let url = "#" + "ARTICLES" + "#TAGS"
        this.tags.forEach(tag=>{
            url = url + "&"+ tag
        })
        url = url + "#"+this.idx + "#"+md_src.replace('/',"^").replace(".md","")
        history.pushState({tags: this.tags, page: this.idx, md_src: md_src},article_object.title, url)
    }

    /**
     * Handle history state, reloaded UI according to the state object.
     * @param state {{md_src: string, page: number, tags: []}}
     */
    update_ui_by_state(state) {
        let _this_ref = this
        this.tags = state.tags
        this.idx = state.page
        this.md_src = state.md_src

        this.article_interface.content_panel_fade()
        this.article_interface.tag_panel_fade()
        this.article_interface.recommend_panel_fade()
        this.article_interface.index_panel_fade()
        let md_loaded = false
        if (state.md_src !== "none") { /// Markdown loaded
            this.article_interface.document_info.forEach(document_obj=>{
                if (state.md_src === document_obj.src) {
                    this.markdown_push_history(document_obj)
                    setTimeout(function () {
                        _this_ref.article_interface.generate_recommended()
                        _this_ref.article_interface.clear_main_view()
                        _this_ref.article_interface.show_article(state.md_src)
                        _this_ref.article_interface.content_panel_show()
                        _this_ref.article_interface.recommend_panel_show()
                        _this_ref.article_interface.index_panel_show()
                    }, 250)
                    md_loaded = true
                }
            })
        }
        if(!md_loaded) {
            this.content_push_history()
            setTimeout(function () {
                _this_ref.article_interface.refresh_article_list(state.tags)
                _this_ref.article_interface.refresh_indexes()
                _this_ref.article_interface.refresh_page(state.page)
                _this_ref.article_interface.refresh_tags(_this_ref.tags)
                _this_ref.article_interface.content_panel_show()
                _this_ref.article_interface.tag_panel_show()
                _this_ref.article_interface.index_panel_show()
            }, 250)
        }
    }

    update_ui_by_local() {
        console.log(this.md_src)
        this.article_interface._init_tag()
        this.update_ui_by_state({md_src: this.md_src, tags: this.tags, page: this.idx})
    }
}
