let m_status_time_chk = 0;
let m_time_last = 0;
let m_contents_url = "";
let m_root_url = "";
let m_notice_mode = "";
let setTimeoutID = null;

let m_xml_data = new Object();
let m_header = new Object();
let m_notice_list = [];
let m_contents_list = [];

let m_curr_notice = 1;
let m_curr_notice_ptime = 0;
let m_curr_notice_type = "";
let m_curr_notice_cnt = -1;
let m_notice_timeout = null;

let m_main_swiper;

function setInit() {

    m_main_swiper = new Swiper('.main_list', {
        spaceBetween: 200, //슬라이드 간격
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {},
        on: {
            slideChange: function () {
            },
            init: function () {
            },
        },
    });
    
    
    $(".btn_pass").on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickBtnPass(this);
    });
    
    $('.screen_page').on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickScreenSaver();
    });

    $("html").on("touchstart mousedown", function (e) {
        e.preventDefault();
        setTouched();
    });

    m_time_last = new Date().getTime();
    setInterval(setMainInterval, 1000);
    setLoadSetting("include/setting.json");
    setInitFsCommand();
}


//메인 타이머
function setMainInterval() {
    var time_gap = 0;
    var time_curr = new Date().getTime();
    
    time_gap = time_curr - m_time_last;
    time_gap = Math.floor(time_gap / 1000);
    if (time_gap >= 90) {
        m_time_last = new Date().getTime();
        setMainReset();
    }
}

function setTouched() {
    m_time_last = new Date().getTime();
}

function setLoadSetting(_url) {
    $.ajax({
        url: _url,
        dataType: 'json',
        success: function (data) {
            m_contents_url = data.setting.content_url;
            m_root_url = data.setting.root_url;
            m_notice_mode = data.notice_mode;
            setContents();
        },
        error: function (xhr, status, error) {
            console.error('컨텐츠 에러 발생:', status, error);
        },
    });
}

//kiosk_contents를 읽기
function setContents() {
    setLoadDataContentsXml(m_contents_url);
}

//로딩 커버 가리기
function setHideCover() {
    if ($(".cover").css("display") != "none") {
        $('.cover').hide();
    }
}

//초기화
function setInitSetting(_ret_code) {
    //console.log(m_notice_list);
    //console.log(m_contents_list);
    
    setNoticeDrawInfo();
    
    $('#id_main_list_wrapper').html("");
    let t_max = 6;
    let t_html = "";
    let r_html = "";
    let page_cnt = Math.ceil(m_contents_list.length / t_max);
    for (let i = 0; i < page_cnt; i += 1) {
        t_html += "<div id='id_main_list_slide_" + i + "' class='swiper-slide'>";
        t_html += "    <ul id='id_main_list_wrap_" + i + "' class='swiper-slide-container list list_typeG'>";
        t_html += '    </ul>';
        t_html += '</div>';
    }
    $('#id_main_list_wrapper').append(t_html);

    for (let i = 0; i < m_contents_list.length; i += 1) {
        let t_obj = m_contents_list[i];
        let t_id = Math.floor(i / t_max);
        r_html += "<li class='item' onClick='javascript:onClickItem(" + i + ");'>";
        r_html += "    <div class='inner'>";
        r_html += "         <div class='img_zone'>";
        r_html += "              <img src="+convFilePath(t_obj.THUM_URL)+">";
        t_html += "         <div>";
        r_html += "         <div class='txt'>";
        r_html += "             <p><span>' + convStr(t_obj.CONTENTS_NAME) + '</span>' + '</p>";
        r_html += "          </div>";
        r_html += "      </div>";
        r_html += "</li>";

        $('#id_main_list_wrap_' + t_id).append(r_html);
        r_html = '';
    }
    
    
    
    for (let i = 0; i < m_contents_list.length; i += 1) {
        let t_obj = m_contents_list[i];
        t_html += "<li class='item' code='" + t_obj.id + "'>";
        t_html += "    <div class='img_zone'>";
        t_html += "        <img src="+convFilePath(t_obj.THUM_URL)+">";
        t_html += "    <div>";
        t_html += "    <a>" + t_obj.title + "</a>";
        t_html += "</lis>";
    }
    $('#id_main_page_list').append(t_html);
    
    m_main_swiper.update(); // 스와이퍼 업데이트
    m_main_swiper.slideTo(0, 0);
    
    setTimeout(function () {
        setHideCover();
    }, 500);
}

function setMainReset() {
    console.log("setMainReset");
    setScreenAuto();
}

function setInitFsCommand() {
    if (window.chrome.webview) {
        window.chrome.webview.addEventListener('message', (arg) => {
            console.log(arg.data);
            setCommand(arg.data);
        });
    }
}

function setCommand(_data) {
    console.log("setCommand", _data);
    const parts = _data.trim().split('|');
}

function setScreenAuto() {
    if ($(".screen_page").css("display") == "none") {
        clearTimeout(setTimeoutID);
        setNoticeDrawInfo();
        $(".screen_page").show();
    }
}

function setNoticeDrawInfo() {
    var str_type = "";
    var str_show = "",
        str_hide = "";
    if (m_notice_list.length == 0) return;

    m_curr_notice_cnt++;
    if (m_curr_notice_cnt >= m_notice_list.length) m_curr_notice_cnt = 0;

    var obj = m_notice_list[m_curr_notice_cnt];

    if (m_curr_notice == 1) {
        m_curr_notice = 2;

        str_show = "id_notice_box_02";
        str_hide = "id_notice_box_01";

        $("#id_notice_box_01").css("zIndex", 10);
        $("#id_notice_box_02").css("zIndex", 9);
    } else {
        m_curr_notice = 1;

        str_show = "id_notice_box_01";
        str_hide = "id_notice_box_02";

        $("#id_notice_box_01").css("zIndex", 10);
        $("#id_notice_box_02").css("zIndex", 9);
    }

    if (obj.TYPE == "IMG") {
        $("#" + str_show + " > img").attr("src", m_root_url + obj.FILE_URL);
        $("#" + str_show + " > video").hide();
        $("#" + str_show).children("video")[0].pause();
        $("#" + str_show + " > img").show();
    } else {
        $("#" + str_show + " > video").attr("src", m_root_url + obj.FILE_URL);
        $("#" + str_show + " > video").show();
        $("#" + str_show + " > img").hide();
        $("#" + str_show).children("video")[0].play();
    }
    m_curr_notice_type = obj.TYPE;
    m_curr_notice_ptime = obj.PTIME;
    if (m_curr_notice_ptime < 5) m_curr_notice_ptime = 5;
    m_curr_notice_ptime = m_curr_notice_ptime * 1000;
    clearTimeout(setTimeoutID);
    setTimeoutID = setTimeout(setMainTimeOut, m_curr_notice_ptime);
    setTimeout(setNoticeDrawInfoEnd, 10);
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function setNoticeDrawInfoEnd() {
    if (m_notice_list.length == 1) {
        if (m_curr_notice == 1) {
            $("#id_notice_box_01").show();
            $("#id_notice_box_02").hide();
        } else {
            $("#id_notice_box_01").hide();
            $("#id_notice_box_02").show();
        }
    } else {
        if (m_curr_notice == 1) {
            $("#id_notice_box_01").show();
            $("#id_notice_box_02").hide();
        } else {
            $("#id_notice_box_01").hide();
            $("#id_notice_box_02").show();
        }
    }
}

function setMainTimeOut() {
    if ($("#id_page_notice_list").css("display") == "none") {
        return;
    } else {
        setNoticeDrawInfo();
    }
}

function onClickScreenSaver() {
    if ($(".screen_page").css("display") == "none") {
        return;
    }
    try {
        $("#id_screen_area_01").children("video")[0].pause();
    } catch (err) {}
    try {
        $("#id_screen_area_02").children("video")[0].pause();
    } catch (err) {}
    $(".screen_page").hide();
    clearTimeout(setTimeoutID);
}




















































function onClickBtnMenuBig(_obj) {
    if ($(_obj).hasClass("disabled") == true) {
        return;
    }
    let t_code = $(_obj).attr("code");
    m_cate_code = t_code;
    let t_num = parseInt(t_code) + 1;
    $(".menu_btn_b").removeClass("active");
    $(_obj).addClass("active");
    setMenuList(t_num);
}

function onClickBtnMenuSmall(_obj) {
    let t_code = $(_obj).attr("code");
    let t_group = $(_obj).closest('.menu_bot_box').attr('code');
    $(".menu_btn_s").removeClass("active");
    $(_obj).addClass("active");

    let chk_num = 0;
    
    if(parseInt(t_code)<100){
        if (m_big_button_num == 0) {
            chk_num = parseInt(m_osc_number_list.cmd_0);
        } else if (m_big_button_num == 1) {
            if (t_group == "0") {
                chk_num = parseInt(m_osc_number_list.cmd_1);
            } else if (t_group == "1") {
                chk_num = parseInt(m_osc_number_list.cmd_2);
            }
        } else if (m_big_button_num == 2) {
            chk_num = parseInt(m_osc_number_list.cmd_3);
        } else if (m_big_button_num == 3) {
            chk_num = parseInt(m_osc_number_list.cmd_4);
        }        
    }else{
        if (m_big_button_num == 0) {
            t_code = parseInt(t_code)-100;
            chk_num = parseInt(m_osc_number_list.cmd_5);
        }  
    }
    let t_cue = convCue(m_device_code, chk_num + parseInt(t_code));
    setCmd(t_cue);
}

function onClickBtnMenu(_obj) {
    //let t_code = $(_obj).attr("code");
    let t_code = $(_obj).closest('.menu_box').attr('code');
    m_device_code = t_code;

    if ($(_obj).hasClass("active") == true) {
        $(".menu_btn").removeClass("active");
        $(".menu_page_txt").show();
        $(".menu_list_zone").hide();
    } else {
        $(".menu_btn").removeClass("active");
        $(_obj).addClass("active");
        $(".menu_page_txt").hide();
        $(".menu_list_zone").show();
        setMenuList(0);
        if (m_device_code == 3) {
            $(".menu_btn_b[code='1']").addClass("disabled");
            $(".menu_btn_b[code='3']").addClass("disabled");
        } else {
            $(".menu_btn_b[code='1']").removeClass("disabled");
            $(".menu_btn_b[code='3']").removeClass("disabled");
        }
    }
}

function setMenuList(_num) {
    let t_cmd = "";
    let t_cue = "";
    let chk_num = "";
    $(".menu_btn_s").removeClass("active");
    $(".menu_bot_box").hide();
    t_cmd = "";
    m_big_button_num = (_num - 1);
    switch (_num) {
        case 0:
            $(".menu_btn_b").removeClass("active");
            break;
        case 1:
            t_chk = parseInt(m_osc_number_list.cmd_start) + 1;
            t_cue = convCue(m_device_code, t_chk);
            setCmd(t_cue);
            $(".menu_bot_box[code='2']").show();
            if(m_device_code=="0" || m_device_code=="1"){
                $(".menu_btn_s[code='100']").html("Echoed Of Light Media");
            }else{
                $(".menu_btn_s[code='100']").html("");
            }
            
            break;
        case 2:
            $(".menu_bot_box[code='0'] .box_title").show();
            $(".menu_bot_box[code='0'] .menu_btn_s[code='4']").show();
            $(".menu_bot_box[code='0']").show();
            $(".menu_bot_box[code='1']").show();
            break;
        case 3:
            $(".menu_bot_box[code='0'] .box_title").hide();
            $(".menu_bot_box[code='0'] .menu_btn_s[code='4']").hide();
            $(".menu_bot_box[code='0']").show();

            break;
        case 4:
            if (m_device_code == "0" || m_device_code == "2") {
                $(".menu_bot_box[code='3']").show();
            } else {
                chk_num = parseInt(m_osc_number_list.cmd_4);
                t_cue = convCue(m_device_code, chk_num);
                setCmd(t_cue);
            }
            break;
    }
}

function onClickBtnAlertClose(_obj) {
    $(".alert_page").hide();
}

function onClickBtnPopupOk(_obj) {
    console.log(m_checked_radio);
    sendPowerInfo(m_main_header.powerControlUrl, m_checked_radio);
    //$(".popup_page").hide();
}

function onClickBtnPopupPause(_obj) {
    setCmd("1");
}

function onClickBtnPopupClose(_obj) {
    $(".popup_page").hide();
}

function onClickControlRadio(_obj) {
    var id = $(_obj).attr('id');
    var code = $(_obj).attr('code');
    m_checked_radio = code;
}

function onClickBtnLogout(_obj) {
    setMainReset();
}

function onClickBtnSetting(_obj) {
    setShowSetting();
}

function setShowSetting() {
    if ($('#control2').is(':checked')) {
        $('#control2').prop('checked', false);
        $('#control1').prop('checked', true);
    }
    m_checked_radio = "ON";
    $(".popup_page").show();
}


function setLoginResult(_str) {
    if (_str == "SUCC") {
        $(".menu_page_txt").show();
        $(".menu_list_zone").hide();
        $(".menu_btn_b").removeClass("active");
        $(".menu_btn_s").removeClass("active");
        $(".menu_btn").removeClass("active");
        $(".menu_page").show();
    } else {
        setShowAlert("비밀번호가 일치하지 않습니다.");
        $(".pass_dot").removeClass("active");
        m_curr_pass_txt = "";
        setDotsCount();
    }
}

function setCmd(_str) {
    let t_cmd = "/cue/" + _str + "/start";
    setCallWebToApp('OSC_SEND', t_cmd);
}

function setCmdOLD(_type, _str) {
    let t_cmd = "";
    for (var i = 0; i < m_cmd_list.length; i += 1) {
        if (m_cmd_list[i].type == _type) {
            t_cmd = m_cmd_list[i].cmd_name + m_header.cmd_line + _str;
            break;
        }
    }
    setCallWebToApp('OSC_SEND', t_cmd);
}

function onVolumeChange(_obj) {
    var vol = $(_obj).val();
    var codeValue = $(_obj).closest('.menu_box').attr('code');
    //console.log(vol);
    let t_vol_db = volumeToDb(parseInt(vol));
    let t_cue = convCue(codeValue, t_vol_db);
    setCmd(t_cue);
    sendVolumeInfo(m_main_header.soundSaveUrl, codeValue, vol);
}

function onVolumeSlide(_obj) {
    var value = $(_obj).val();
    var min = $(_obj).attr('min');
    var max = $(_obj).attr('max');
    var percentage = Math.round(((value - min) / (max - min)) * 100);
    //console.log(value, min, max, percentage);
    $(_obj).css('background', `linear-gradient(to right, #0EAAFB ${percentage}%, #FFFFFF33 ${percentage}%)`);
    var codeValue = $(_obj).closest('.menu_box').attr('code');
    var volumeText = $(_obj).closest('.menu_box').find('.menu_volume_txt');
    volumeText.text(value);
}

function onClickBtnKey(_obj) {
    if ($(_obj).hasClass("back_key")) {
        //console.log("back");
        if (m_curr_pass_txt.length > 0) {
            m_curr_pass_txt = m_curr_pass_txt.substr(0, m_curr_pass_txt.length - 1);
        }
    } else if ($(_obj).hasClass("login_key")) {
        //console.log("login");
        //setLoginResult("SUCC");
        setCheckLogin();
        return;
    } else if ($(_obj).hasClass("home_key")) {
        setMainReset();
        return;
    } else {
        //console.log($(_obj).html());
        if (m_curr_pass_txt.length < 6 && m_curr_pass_txt.length >= 0) {
            m_curr_pass_txt = m_curr_pass_txt + $(_obj).html();
        }
    };

    $(".pass_dot").each(function (index) {
        if (index < m_curr_pass_txt.length) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
    //console.log(m_curr_pass_txt);
}

function setCheckLogin() {
    if (m_curr_pass_txt.length != 6) {
        setShowAlert("비밀번호를 모두 입력해주세요.");
    } else {
        if (m_pass_mode == "online") {
            sendLoginInfo(m_header.password_url);
        } else {
            console.log(m_curr_pass_txt);
            if (m_curr_pass_txt == "000000") {
                setLoginResult("SUCC");
            } else {
                setLoginResult("FAIL");
            }
        }
    }
}



function sendPowerInfo(_url, _code) {
    const timeout = 60000;
    const controller = new AbortController();
    const signal = controller.signal;

    const params = new URLSearchParams();

    // 타임아웃 설정 (timeout 밀리초 후 요청 취소)
    const timeoutId = setTimeout(() => {
        controller.abort(); // 요청 중단
    }, timeout);

    let t_url = _url;

    if (_url.startsWith("http") == true) {
        params.append('power', _code);
    }
    $(".loading_cover").show();
    console.log(t_url);
    fetch(t_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString(),
            signal: signal // signal 추가
        })
        .then(response => {
            clearTimeout(timeoutId); // 응답이 오면 타이머 해제
            return response.json();
        })
        .then(data => {
            $(".loading_cover").hide();
            $(".popup_page").hide();
            console.log(data);
            let t_code = data.resultcode;
            if (t_code != undefined && t_code != null) {
                if (t_code == "SUCC") {
                    setShowAlert("전원 신호 전달을 완료하였습니다.");
                    setDeviceAllPowerSetting(_code);
                } else {
                    setShowAlert("전원 신호 전달에 실패하였습니다.");
                }
            }
        })
        .catch(error => {
            $(".loading_cover").hide();
            $(".popup_page").hide();
            if (error.name === "AbortError") {
                console.error('요청이 타임아웃되었습니다.');
            } else {
                console.error('컨텐츠 에러 발생:', error);
            }
            setShowAlert("서버가 응답하지 않습니다.");
        });
}

function sendVolumeInfo(_url, _code, _vol) {
    const timeout = 5000;
    const controller = new AbortController();
    const signal = controller.signal;

    const params = new URLSearchParams();

    // 타임아웃 설정 (timeout 밀리초 후 요청 취소)
    const timeoutId = setTimeout(() => {
        controller.abort(); // 요청 중단
    }, timeout);

    let t_url = _url;

    if (_url.startsWith("http") == true) {
        //t_url = _url+"?pw="+m_curr_pass_txt;    
        params.append('code', m_main_list[parseInt(_code)].areaCode);
        params.append('volume', _vol);
    }

    $(".loading_cover").show();
    console.log(t_url);
    fetch(t_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString(),
            signal: signal // signal 추가
        })
        .then(response => {
            clearTimeout(timeoutId); // 응답이 오면 타이머 해제
            return response.json();
        })
        .then(data => {
            $(".loading_cover").hide();
            //console.log(data);
            let t_code = data.resultcode;
            if (t_code != undefined && t_code != null) {
                if (t_code == "SUCC") {
                    //setShowAlert("볼륨 저장을 완료하였습니다.");
                } else {
                    setShowAlert("볼륨 저장에 실패하였습니다.");
                }
            }
        })
        .catch(error => {
            $(".loading_cover").hide();
            if (error.name === "AbortError") {
                console.error('요청이 타임아웃되었습니다.');
            } else {
                console.error('컨텐츠 에러 발생:', error);
            }
            setShowAlert("서버가 응답하지 않습니다.");
        });
}

function sendLoginInfo(_url) {
    const timeout = 5000;
    const controller = new AbortController();
    const signal = controller.signal;

    const params = new URLSearchParams();

    // 타임아웃 설정 (timeout 밀리초 후 요청 취소)
    const timeoutId = setTimeout(() => {
        controller.abort(); // 요청 중단
    }, timeout);

    let t_url = _url;

    if (_url.startsWith("http") == true) {
        //t_url = _url+"?pw="+m_curr_pass_txt;    
        params.append('pw', m_curr_pass_txt);
    }

    $(".loading_cover").show();
    //console.log(t_url);
    fetch(t_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString(),
            signal: signal // signal 추가
        })
        .then(response => {
            clearTimeout(timeoutId); // 응답이 오면 타이머 해제
            return response.json();
        })
        .then(data => {
            $(".loading_cover").hide();
            console.log(data);
            let t_code = data.header.code;
            if (t_code != undefined && t_code != null) {
                //console.log(t_code);
                setLoginResult(t_code);
                m_main_header = data.header;
                m_main_list = data.list;
                setDeviceAllVolumeSetting();
            }
        })
        .catch(error => {
            $(".loading_cover").hide();
            if (error.name === "AbortError") {
                console.error('요청이 타임아웃되었습니다.');
            } else {
                console.error('컨텐츠 에러 발생:', error);
            }
            setShowAlert("서버가 응답하지 않습니다.");
            m_pass_mode = "offline";
            setShowPassPage();
        });
}

function setShowAlert(_str) {
    $(".alert_title").html(_str);
    $(".alert_page").show();
}

function onClickBtnPass(_obj) {
    m_pass_click_cnt += 1;
    if (m_pass_click_cnt == 5) {
        setShowPassPage();
        m_pass_click_cnt = 0;
    } else {
        clearTimeout(m_pass_timeout);
        m_pass_timeout = setTimeout(resetPassCounter, 3000);
    }
}

function resetPassCounter() {
    m_pass_click_cnt = 0;
    clearTimeout(m_pass_timeout);
}

function setDeviceAllVolumeSetting() {
    for (var i = 0; i < m_main_list.length; i += 1) {
        let menuBox = $(".menu_box").eq(i);
        let data = m_main_list[i];
        let vol = parseInt(data.soundLevel);
        /*
        if (vol < 0) {
            vol = 0;
        } else if (vol > 100) {
            vol = 100;
        }
        */

        menuBox.find(".menu_name").text(data.areaName); // 메뉴 이름 변경
        menuBox.find(".volume").val(vol); // 슬라이더 값 변경
        menuBox.find(".menu_volume_txt").text(vol); // 볼륨 텍스트 변경
        menuBox.find(".volume").trigger("input");

        let t_vol_db = volumeToDb(parseInt(vol));
        let t_cue = convCue(i, t_vol_db);
        setCmd(t_cue);
    }
}

function setDevicelVolumeSetting(_name, _vol) {

    let data = null;
    let vol = 0;
    let t_num = -1;
    if (m_main_list.length == 0) {
        for (var i = 0; i < m_device_list.length; i += 1) {
            if (m_device_list[i].areaCode == _name) {
                data = m_device_list[i];
                t_num = i;
                break;
            }
        }
    } else {
        for (var i = 0; i < m_main_list.length; i += 1) {
            if (m_main_list[i].areaCode == _name) {
                data = m_main_list[i];
                t_num = i;
                break;
            }
        }
    }

    if (t_num == -1) {
        return;
    }

    let menuBox = $(".menu_box").eq(t_num);

    vol = parseInt(_vol);
    menuBox.find(".menu_name").text(data.areaName); // 메뉴 이름 변경
    menuBox.find(".volume").val(vol); // 슬라이더 값 변경
    menuBox.find(".menu_volume_txt").text(vol); // 볼륨 텍스트 변경
    menuBox.find(".volume").trigger("input");

    let t_vol_db = volumeToDb(parseInt(vol));
    let t_cue = convCue(t_num, t_vol_db);
    setCmd(t_cue);
}

function setDeviceAllPowerSetting(_cmd) {
    let t_cmd = "";
    let t_chk = "";
    if (_cmd == "OFF") {
        t_chk = parseInt(m_osc_number_list.cmd_stop);
    } else if (_cmd == "ON") {
        t_chk = parseInt(m_osc_number_list.cmd_start);
    }
    // /cue/{큐번호}/start
    if (_cmd == "") {
        return;
    }
    if (m_main_list.length == 0) {
        for (var i = 0; i < m_device_list.length; i += 1) {
            //t_cmd = "/cue/" + (i + 1) + "/" + t_chk;
            //setCmd(t_cue);
            let t_cue = convCue(i, t_chk);
            setCmd(t_cue);
        }
    } else {
        for (var i = 0; i < m_main_list.length; i += 1) {
            let t_cue = convCue(i, t_chk);
            setCmd(t_cue);
        }
    }
}

function setDevicelPowerSetting(_cmd, _name, _vol) {
    let data = null;
    let vol = 0;
    let t_num = -1;
    let t_cmd = "";
    if (m_main_list.length == 0) {
        for (var i = 0; i < m_device_list.length; i += 1) {
            if (m_device_list[i].areaCode == _name) {
                data = m_device_list[i];
                t_num = i;
                break;
            }
        }
    } else {
        for (var i = 0; i < m_main_list.length; i += 1) {
            if (m_main_list[i].areaCode == _name) {
                data = m_main_list[i];
                t_num = i;
                break;
            }
        }
    }

    if (t_num == -1) {
        return;
    }


    if (_cmd == "OFF") {
        t_chk = parseInt(m_osc_number_list.cmd_stop);
    } else if (_cmd == "ON") {
        t_chk = parseInt(m_osc_number_list.cmd_start);
        setDevicelVolumeSetting(_name, _vol);
    }
    let t_cue = convCue(t_num, t_chk);
    setCmd(t_cue);
}

function moveIcon() {
    var iconPos = m_icon.position();
    var containerWidth = m_icon_container.width();
    var containerHeight = m_icon_container.height();
    var iconWidth = m_icon.width();
    var iconHeight = m_icon.height();
    
    // 벽 충돌 감지
    if (iconPos.left + m_icon_dx < 0 || iconPos.left + iconWidth + m_icon_dx > containerWidth) {
        m_icon_dx = -m_icon_dx; // x축 방향 반전
    }
    if (iconPos.top + m_icon_dy < 0 || iconPos.top + iconHeight + m_icon_dy > containerHeight) {
        m_icon_dy = -m_icon_dy; // y축 방향 반전
    }

    // 아이콘 위치 업데이트
    m_icon.css({
        left: iconPos.left + m_icon_dx,
        top: iconPos.top + m_icon_dy
    });

    requestAnimationFrame(moveIcon);
}

function startAnimation() {
    moveIcon();
}

function setShowPassPage() {
    if (m_pass_mode == "online") {
        $(".pass_title").html("비밀번호를 입력해주세요");
    } else {
        $(".pass_title").html("오프라인 비밀번호를 입력해주세요");
    }
    $(".pass_page").show();
    $(".pass_dot").removeClass("active");
    m_curr_pass_txt = "";
    m_is_first_page = false;
    setDotsCount();
}

function setDotsCount() {
    let passLength = m_curr_pass_txt.length;

    $(".pass_dot").each(function (index) {
        if (index < passLength) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
}




function setShowPopup(_cate, _num) {
    console.log("setShowPopup", _cate, _num);
    m_clickable = true;
    $(".txt_title").html("");
    $(".txt_desc").html("");
    $(".txt_address").html("");
    $(".txt_tel").html("");
    $(".txt_programs").html("");
    $(".img_0").attr("src", "");
    $(".img_1").attr("src", "");
    //$(".img_2").attr("src", "");
    $(".qr").hide();
    $(".popup_bot_txt_zone").hide();


    let t_contents = m_contents_list[_cate][_num];

    $(".txt_title").html(convStr(t_contents.name));
    $(".txt_desc").html(convStr(t_contents.desc));
    $(".txt_address").html(convStr(t_contents.address));
    $(".txt_tel").html(convStr(t_contents.tel));
    $(".txt_programs").html(convStr(t_contents.programs));
    $(".img_0").attr("src", t_contents.main_img_url);
    $(".img_1").attr("src", t_contents.sub_img_url);
    //$(".img_2").attr("src", t_contents.qr_img_url);
    m_qr_code.clear();
    if (t_contents.qr_img_url != "null" && t_contents.qr_img_url != null && t_contents.qr_img_url != undefined) {
        m_qr_code.makeCode(t_contents.qr_img_url);
        $(".qr").show();
        $(".popup_bot_txt_zone").show();
    }

    if ($(".txt_programs").html() == "") {
        $(".sub_area_2").hide();
    } else {
        $(".sub_area_2").show();
    }

    $(".popup_page").show();


    gsap.fromTo(".popup_area", {
        top: "151px",
        opacity: 0.25
    }, {
        top: "201px",
        duration: 0.5,
        opacity: 1,
        ease: "back.out"
    });

}

function setHidePopup() {
    m_clickable = true;
    $(".popup_page").fadeOut();
}

function convStr(_str) {
    if (_str == null) {
        return "";
    } else {
        return _str.replace(/(\r\n|\n\r|\n|\r)/g, '<br>');
    }
}


function volumeToDb(volume) {
    let t_vol_list = [69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 60];
    let t_i = volume;
    return t_vol_list[t_i];
    /*
    // 0~100 값을 0.0~1.0 범위로 변환
    let normalizedVolume = volume / 100.0;

    if (normalizedVolume <= 0) return -60.0; // 너무 낮으면 -60dB로 처리

    return 20 * Math.log10(normalizedVolume);
    */
}

function convCue(_num, _cue) {
    let f_cue = parseInt(m_device_list[parseInt(_num)].oscCode);
    let r_cue = 0;
    if (_cue == 100) {
        r_cue = f_cue / 100;
    } else {
        r_cue = f_cue + parseInt(_cue);
    }
    return r_cue;
}
