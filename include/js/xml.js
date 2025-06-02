function setLoadDataContentsXml(_url) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var xmlDoc = xhr.responseXML;
            setParsingContentsXml(xmlDoc);
        }
    };
    xhr.open("GET", _url, true);
    xhr.send();
}

function setParsingContentsXml(xmlDoc) {
    var ret_code = "FAIL";

    try {
        var root = xmlDoc.getElementsByTagName("KIOSK")[0];
        if (!root) {
            setInitSetting("FAIL DATA");
            return;
        }

        // HEADER 처리
        var headerNode = root.getElementsByTagName("HEADER")[0];
        m_header = {};
        if (headerNode) {
            function getTagText(tagName) {
                var el = headerNode.getElementsByTagName(tagName)[0];
                return setConvXmlTag(el ? el.textContent : "");
            }

            m_header.BG_URL = getTagText("BG_URL");
            m_header.WAITING_TIME = getTagText("WAITING_TIME");

            ret_code = m_header.RET_CODE;
        }

        // NOTICE_LIST 처리
        m_notice_list = [];
        var noticeInfos = root.getElementsByTagName("NOTICE_INFO");
        for (var i = 0; i < noticeInfos.length; i++) {
            var node = noticeInfos[i];
            var obj = {};

            obj.ID = setConvXmlTag(node.getAttribute("id"));
            obj.TYPE = setConvXmlTag(node.getAttribute("type"));
            obj.SORT = setConvXmlTag(node.getAttribute("sort"));
            obj.RATIO = setConvXmlTag(node.getAttribute("ratio"));

            var schNode = node.getElementsByTagName("SCH_TYPE")[0];
            if (schNode) {
                obj.SDAY = setConvXmlTag(schNode.getAttribute("sday"));
                obj.EDAY = setConvXmlTag(schNode.getAttribute("eday"));
                obj.STIME = setConvXmlTag(schNode.getAttribute("stime"));
                obj.ETIME = setConvXmlTag(schNode.getAttribute("etime"));
            }

            var fileNode = node.getElementsByTagName("FILE_URL")[0];
            obj.FILE_URL = setConvXmlTag(fileNode ? fileNode.textContent : "");
            obj.PTIME = setConvXmlNum(fileNode ? fileNode.getAttribute("ptime") : "", 10);

            var now = new Date();
            var today_str = now.getFullYear().toString().padStart(4, "0") +
                (now.getMonth() + 1).toString().padStart(2, "0") +
                now.getDate().toString().padStart(2, "0");
            var today = parseInt(today_str, 10);
            var sday_num = 0;
            var eday_num = 0;


            if (obj.FILE_URL !== "") {
                sday_num = parseInt(obj.SDAY, 10);
                eday_num = parseInt(obj.EDAY, 10);
                if (today >= sday_num && today <= eday_num) {
                    m_notice_list.push(obj);
                }
            }
            m_notice_list = convSortList(m_notice_list, "SORT");
        }

        // CONTENTS_LIST 처리
        m_contents_list = [];
        var contentInfos = root.getElementsByTagName("MEDIA_INFO");
        for (var i = 0; i < contentInfos.length; i++) {
            var node = contentInfos[i];
            var obj = {};

            obj.ID = setConvXmlTag(node.getAttribute("id"));
            //obj.TYPE = setConvXmlTag(node.getAttribute("type"));

            var schNode = node.getElementsByTagName("SCH_TYPE")[0];
            if (schNode) {
                //obj.SCH_TYPE = setConvXmlTag(schNode.textContent || "");
                obj.SDAY = setConvXmlTag(schNode.getAttribute("sday"));
                obj.EDAY = setConvXmlTag(schNode.getAttribute("eday"));
                obj.STIME = setConvXmlTag(schNode.getAttribute("stime"));
                obj.ETIME = setConvXmlTag(schNode.getAttribute("etime"));
            }

            var nameNode = node.getElementsByTagName("BTN_NAME")[0];
            obj.CONTENTS_NAME = setConvXmlTag(nameNode ? nameNode.textContent : "");

            var thumNode = node.getElementsByTagName("THUM_URL")[0];
            obj.THUM_URL = setConvXmlTag(thumNode ? thumNode.textContent : "");

            obj.NUM = 0;

            if (obj.FILE_URL !== "") {
                m_contents_list.push(obj);
            }
        }

    } catch (err) {
        console.log("XML Parse Error:", err);
        ret_code = "FAIL XML Data Error : " + err;
    }

    setInitSetting(ret_code);
}


function setConvXmlTag(p_src) {
    var p1 = /&amp;/gi;
    var p2 = /&lt;/gi;
    var p3 = /&gt;/gi;
    var p4 = /&quot;/gi;
    var p5 = /&apos;/gi;

    if (p_src == null || p_src == undefined) {
        return "";
    }

    p_src = p_src + "";
    p_src = p_src.replace(p1, "&");
    p_src = p_src.replace(p2, "<");
    p_src = p_src.replace(p3, ">");
    p_src = p_src.replace(p4, "\"");
    p_src = p_src.replace(p5, "\'");
    p_src = p_src.trim();
    return p_src;
}

function setConvXmlNum(p_src, p_default) {
    if (p_default == undefined) p_default = 0;
    if (p_src == null) return p_default;
    if (isNaN(p_src) == true) return p_default;
    return Number(p_src);
}

function convSortList(arr, key) {
    // 원본 배열을 변경하지 않고 새로운 배열을 반환하기 위해 slice() 사용
    return [...arr].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        // 숫자 비교를 위한 간단한 오름차순 로직
        if (valA < valB) {
            return -1;
        }
        if (valA > valB) {
            return 1;
        }
        return 0; // 값이 같을 경우 순서 변경 없음
    });
}
