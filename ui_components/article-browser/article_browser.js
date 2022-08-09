class ArticleBrowser {
    constructor(markdown_dir_) {
        let _this_ref = this;

        this.md_dir = markdown_dir_;
        let json_request = new XMLHttpRequest();

        this.content_panel = document.getElementById("article-content_panel")

        json_request.open("get", this.md_dir+"/article_list.json");
        json_request.send(null);

        json_request.onload = function () {
            if (json_request.status === 200) {
                let parsed_json = JSON.parse(json_request.responseText)
                _this_ref.document_info = parsed_json
                _this_ref.onload();
            }
        }
    }

    onload = function () {

    }

    generate_link_card(article_list_object) {
        let card_obj = document.createElement("div")
        let img_wrapper = document.createElement("div")
        let img = document.createElement("img")
        let title = document.createElement("h1")
        let text = document.createElement("p")
        let link_img = document.createElement("img")
        title.innerText = article_list_object.title
        text.innerText = "A ba a ba a ba a ba a ba a ba a ba a ba a ba";
        card_obj.classList.add("article-card-wrapper")
        card_obj.classList.add("article-card-loading")
        img_wrapper.classList.add("article-card-image-wrapper")
        img.classList.add("article-card-image")
        img.onload = function () {
            card_obj.classList.remove("article-card-loading")
        }
        link_img.classList.add("article-card-link-arrow")
        link_img.src = "/resources/htmls/home/linkArrow.svg"

        img.src = this.md_dir + "/" + article_list_object.pic
        img_wrapper.append(img);
        card_obj.append(img_wrapper)
        card_obj.append(title)
        card_obj.append(text)
        card_obj.append(link_img)

        return card_obj;
    }

    /**
     * Load article by markdown file url
     * @param url Markdown file url.
     */
    load_article(url) {

    }

    /**
     * Load article page by selected tags.
     * @param tags tags to search.
     * @param page page to show.
     */
    load_page(tags, page) {
        if (tags === []) { /// Empty indicates all tags

        } else {           /// Else, tags selected.

        }
    }
}