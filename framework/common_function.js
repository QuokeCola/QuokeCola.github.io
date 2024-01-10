class HTML_parser{
    constructor(url) {
        let _this_ref = this

        this.onload = null;
        this.onerror= null;
        this.head   = null;
        this.body   = null;
        this.css    = [];
        this.script = [];

        let request =new XMLHttpRequest();
        request.open("get", url);
        request.send(null);
        request.onload = function () {
            if (request.status===200){
                let parser = new DOMParser();
                let parsedDOM = parser.parseFromString(request.responseText, 'text/html');
                _this_ref.head = parsedDOM.head;
                _this_ref.body   = parsedDOM.body;
                for (let i = 0; i < _this_ref.head.childNodes.length; i++){
                    if (_this_ref.head.childNodes[i].nodeName==="LINK" && _this_ref.head.childNodes[i].type ==="text/css"){
                        if(!_this_ref.css.includes(_this_ref.head.childNodes[i])) _this_ref.css.push(_this_ref.head.childNodes[i]);
                    }
                }
                for (let i = _this_ref.body.childNodes.length - 1; i > 0; i--){
                    if (_this_ref.body.childNodes[i].nodeName==="SCRIPT"){
                        if(!_this_ref.script.includes(_this_ref.body.childNodes[i])) _this_ref.script.push(_this_ref.body.childNodes[i]);
                    }
                }
                try{
                    _this_ref.onload();
                }catch (e) {
                    console.log('error: '+e);
                }
            } else if (request.status === 404){
                try {
                    _this_ref.onerror("404");
                } catch (e){
                    console.log('error: '+e);
                }
            }
        }
    }

}

function sleep(d){
    let t = Date.now();
    while(Date.now() - t <= d);
}

function to_top() {
    let content_screent = document.getElementById("content-screen");
    // if(window.chrome === undefined) { // Safari
    //     const scl2top = () => {
    //         let sTop = content_screent.scrollTop;
    //         if (sTop > 1) {
    //             window.requestAnimationFrame(scl2top);
    //             content_screent.scrollTo(0, sTop - sTop / 8);
    //         }
    //     }
    //     window.requestAnimationFrame(scl2top);
    // } else {
        content_screent.scrollTo(0,0);
    // }
}