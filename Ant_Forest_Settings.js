// noinspection BadExpressionStatementJS
"ui"; // Auto.js UI mode with global object `activity`

let $$init = {
    check() {
        checkModulesMap();
        checkSdkAndAJVer();
        checkAccessibility();

        return this;

        // tool function(s) //

        function checkModulesMap() {
            void [
                "MODULE_PWMAP", "MODULE_MONSTER_FUNC", "MODULE_STORAGE",
                "MODULE_DEFAULT_CONFIG", "MODULE_TREASURY_VAULT",
                "EXT_DIALOGS", "EXT_TIMERS", "EXT_APP",
            ].filter((mod) => (
                !files.exists("./Modules/" + mod + ".js")
            )).some((mod, idx, arr) => {
                let _str = "";
                _str += "脚本无法继续|以下模块缺失或路径错误:|";
                _str += "- - - - - - - - - - - - - - - - -|";
                arr.forEach(n => _str += '-> "' + n + '"|');
                _str += "- - - - - - - - - - - - - - - - -|";
                _str += "请检查或重新放置模块";
                showSplitLineRaw();
                _str.split("|").forEach(s => messageActionRaw(s, 4));
                showSplitLineRaw();
                toast("模块缺失或路径错误", "Long");
                ui.finish();
            });

            // raw function(s) //

            function messageActionRaw(msg, lv, if_toast) {
                let _msg = msg || " ";
                if (lv && lv.toString().match(/^t(itle)?$/)) {
                    return messageActionRaw("[ " + msg + " ]", 1, if_toast);
                }
                if_toast && toast(_msg);
                let _lv = typeof lv === "undefined" ? 1 : lv;
                if (_lv >= 4) {
                    console.error(_msg);
                    _lv >= 8 && exit();
                    return false;
                }
                if (_lv >= 3) {
                    console.warn(_msg);
                    return false;
                }
                if (_lv === 0) {
                    console.verbose(_msg);
                } else if (_lv === 1) {
                    console.log(_msg);
                } else if (_lv === 2) {
                    console.info(_msg);
                }
                return true;
            }

            function showSplitLineRaw(extra, style) {
                console.log((
                    style === "dash" ? "- ".repeat(18).trim() : "-".repeat(33)
                ) + (extra || ""));
            }
        }

        function checkSdkAndAJVer() {
            // do not `require()` before `checkModulesMap()`
            require("./Modules/MODULE_MONSTER_FUNC").checkSdkAndAJVer();
        }

        function checkAccessibility() {
            // do not `require()` before `checkModulesMap()`
            let _a11y = require("./Modules/EXT_DEVICE").a11y;
            if (!_a11y.state()) {
                let _mod_sto = require("./Modules/MODULE_STORAGE");
                let $_cfg = _mod_sto.create("af_cfg").get("config", {});
                if ($_cfg.auto_enable_a11y_svc === "ON" && _a11y.enable(true)) {
                    toast("已自动开启无障碍服务\n请重新运行一次配置工具", "Long");
                } else {
                    toast("请手动开启Auto.js无障碍服务\n然后再次运行配置工具", "Long");
                    try {
                        // script will not go on without a normal state of accessibility service
                        // auto.waitFor() was abandoned here, as it may cause problems sometimes
                        auto();
                    } catch (e) {
                        // consume errors msg caused by auto()
                    }
                }
                ui.finish();
            }
        }
    },
    global() {
        setGlobalFunctions();
        setGlobalExtensions();
        setGlobalObjects();

        return this;

        // tool function(s) //

        function setGlobalFunctions() {
            require("./Modules/MODULE_MONSTER_FUNC").load([
                "classof", "messageAction", "setIntervalBySetTimeout",
                "timedTaskTimeFlagConverter", "waitForAndClickAction",
                "equalObjects", "deepCloneObject", "smoothScrollView",
                "runJsFile", "debugInfo", "timeRecorder",
                "waitForAction", "surroundWith",
            ]);
        }

        function setGlobalExtensions() {
            require("./Modules/EXT_APP").load();
            require("./Modules/EXT_FILES").load();
            require("./Modules/EXT_DIALOGS").load();
            require("./Modules/EXT_THREADS").load();
            require("./Modules/EXT_GLOBAL_OBJ").load();
            require("./Modules/EXT_TIMERS").load();
            require("./Modules/EXT_DEVICE").load();
            require("./Modules/EXT_UI").load();

            uix.init({requested_orientation: "PORTRAIT"});
            devicex.getDisplay(true);
        }

        function setGlobalObjects() {
            global.$$cfg = {
                list_heads: {
                    project_backup_info: [{
                        version_name: "项目版本", width: 0.5,
                    }, {
                        timestamp: "项目备份时间",
                        sort: {flag: -1, head_name: "timestamp"},
                        stringTransform: {
                            forward: t => $$tool.getTimeStrFromTs(t, "time_str_full"),
                            backward: t => $$tool.restoreFromTimestamp(t),
                        }
                    }],
                    server_releases_info: [{
                        tag_name: "项目标签", width: 0.5,
                    }, {
                        published_at: "项目发布时间",
                        sort: {flag: -1, head_name: "published_at"},
                        stringTransform: {
                            forward: t => $$tool.getTimeStrFromTs(new Date(t), "time_str_full"),
                        },
                    }],
                    blacklist_by_user: [{
                        name: "支付宝好友昵称", width: 0.58,
                    }, {
                        timestamp: "黑名单自动解除",
                        sort: {flag: 1, head_name: "timestamp"},
                        stringTransform: {
                            forward: t => $$tool.getTimeStrFromTs(t, "time_str_remove"),
                            backward: t => $$tool.restoreFromTimestamp(t),
                        },
                    }],
                    blacklist_protect_cover: [{
                        name: "支付宝好友昵称", width: 0.58,
                    }, {
                        timestamp: "黑名单自动解除",
                        sort: {flag: 1, head_name: "timestamp"},
                        stringTransform: {
                            forward: t => $$tool.getTimeStrFromTs(t, "time_str_remove"),
                            backward: t => $$tool.restoreFromTimestamp(t),
                        }
                    }],
                    foreground_app_blacklist: [{
                        app_combined_name: "应用名称 (含包名)",
                        sort: {flag: 1, head_name: "app_combined_name"},
                        width: 0.85,
                    }, {
                        available: "有效", gravity: "center", stringTransform: {
                            forward() {
                                let pkg_name = this.app_combined_name.split("\n")[1];
                                return app.getAppName(pkg_name) ? "\u2713" : "\u2717";
                            },
                            backward: "__keep__",
                        }
                    }],
                    timers_uninterrupted_check_sections: [{
                        section: "时间区间", width: 0.58,
                        sort: {flag: 1, head_name: "section"},
                        stringTransform: {
                            forward: arr => $$tool.timeSectionToStr(arr),
                            backward: str => $$tool.timeStrToSection(str),
                        },
                    }, {
                        interval: "间隔 (分)"
                    }],
                    timed_tasks: [{
                        type: "任务类型", width: 0.47, stringTransform: {
                            // []: daily; number[]: weekly; 0: disposable
                            forward: arr => $$tool.getTimedTaskTypeStr(arr),
                            backward: str => $$tool.restoreFromTimedTaskTypeStr(str),
                        },
                    }, {
                        next_run_time: "下次运行",
                        sort: {flag: 1, head_name: "next_run_time"},
                        stringTransform: {
                            forward: t => $$tool.getTimeStrFromTs(t, "time_str_full"),
                            backward: t => $$tool.restoreFromTimestamp(t),
                        },
                    }],
                    stat_list: [{
                        name: "用户昵称", width: 0.72,
                    }, {
                        pick: "收取量统计",
                        sort: {flag: -1, head_name: "pick", type: "number"},
                    }],
                },
            };

            global.$$sto = {
                af: require("./Modules/MODULE_STORAGE").create("af"),
                cfg: require("./Modules/MODULE_STORAGE").create("af_cfg"),
                af_blist: require("./Modules/MODULE_STORAGE").create("af_blist"),
                af_flist: require("./Modules/MODULE_STORAGE").create("af_flist"),
                af_backup: require("./Modules/MODULE_STORAGE").create("af_backup"),
                unlock: require("./Modules/MODULE_STORAGE").create("unlock"),
                def: require("./Modules/MODULE_DEFAULT_CONFIG"),
                vault: require("./Modules/MODULE_TREASURY_VAULT"),
            };

            global.$$def = Object.assign({}, $$sto.def.settings, {
                item_area_width: cX($$sto.def.settings.item_area_width) + "px",
                homepage_title: "蚂蚁森林",
                local_backup_path: files.getSdcardPath() + "/.local/Backup/Ant_Forest/",
                image_base64_data: $$sto.vault.image_base64_data || {},
                dialog_contents: $$sto.vault.dialog_contents || {},
            });

            global.$$view = {
                diag: {
                    colorSetter(opt) {
                        let _opt = opt || {};
                        let _rex_255 = /([01]?\d?\d|2(?:[0-4]\d|5[0-5]))/;
                        let _lim_255 = _rex_255.source;
                        let _rex_str = "^(rgb)?[\\( ]?" +
                            _lim_255 + "[, ]+" +
                            _lim_255 + "[, ]+" +
                            _lim_255 + "\\)?$";
                        let _rex_rgb_col = new RegExp(_rex_str, "i");
                        let _rex_hex_col = /^#?[A-F0-9]{6}$/i;
                        let _cur_col = "";
                        let _cfg_conj = this.config_conj;
                        return dialogsx
                            .builds([
                                _opt.title || this.title, _cfg_conj,
                                ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                            ], {inputHint: "rgb(RR,GG,BB) | #RRGGBB"})
                            .on("neutral", (d) => {
                                dialogsx.setInputText(d, $$sto.def.af[_cfg_conj]);
                            })
                            .on("negative", (d) => {
                                d.dismiss();
                            })
                            .on("positive", (d) => {
                                let _get_text = dialogsx.getInputText(d);
                                if (_get_text !== "") {
                                    if (!_cur_col) {
                                        return dialogsx.alertTitle(d, "输入的颜色值无法识别");
                                    }
                                    let _col_val = "#" + colors.toString(+_cur_col).slice(3);
                                    $$save.session(_cfg_conj, _col_val);
                                }
                                d.dismiss();
                            })
                            .on("input_change", (d, ipt) => {
                                let _col = "";
                                try {
                                    if (ipt.match(_rex_hex_col)) {
                                        _col = colors.parseColor("#" + ipt.slice(-6));
                                    } else if (ipt.match(_rex_rgb_col)) {
                                        let nums = ipt.match(/\d+.+\d+.+\d+/)[0].split(/\D+/);
                                        _col = colors.rgb(+nums[0], +nums[1], +nums[2]);
                                    }
                                    dialogsx.setTitleTextColor(d, _col || colors.argb(222, 0, 0, 0));
                                    dialogsx.setContentTextColor(d, _col || colors.argb(138, 0, 0, 0));
                                    dialogsx.setTitleBackgroundColor(d, _col ? colors.argb(222, 0, 0, 0) : -1);
                                } catch (e) {
                                }
                                _cur_col = _col;
                            })
                            .show();
                    },
                    numSetter(min, max, opt, addn) {
                        let _opt = opt || {};
                        let _addn = addn || {};
                        let _cfg_conj = _opt.config_conj;
                        if ($$und(_cfg_conj)) {
                            _cfg_conj = this.config_conj;
                        }
                        if ($$func(_cfg_conj)) {
                            _cfg_conj = _cfg_conj.call(this);
                        }
                        let _title = _opt.title || this.title;
                        let _content = _opt.content;
                        let _neutral = _opt.neutral;
                        let _negative = _opt.negative;
                        let _positive = _opt.positive;
                        let _def_key = _opt.def_key || "af";
                        let _getDefVal = () => $$sto.def[_def_key][_cfg_conj].toString();

                        let _set = _opt.hint_set || "N";
                        let _saveValue = $$func(_opt.saveValue)
                            ? n => Number(_opt.saveValue.call(_opt, n))
                            : _set.match(/^R[+-]?$/)
                                ? n => Number(Number(n).toFixed(2))
                                : n => Math.trunc(Number(n));

                        let _mini, _mini_p, _maxi, _maxi_p;

                        let _dist = _opt.distance;
                        if (_dist) {
                            let _cvt = _dist === "H" ? cY : cX;
                            let _div = _dist === "H" ? H : W;
                            _mini = _cvt(min);
                            _mini_p = (_mini / _div).toFixedNum(2);
                            _maxi = _cvt(max);
                            _maxi_p = (_maxi / _div).toFixedNum(2);
                            if ($$und(_content)) {
                                _content = "";
                            }
                            if (!$$arr(_content)) {
                                _content = [_content];
                            }
                            if ($$und(_content[1]) || !!_content[1]) {
                                _content[1] =
                                    "有效值: " + _mini + " [ " + _mini_p + " ] " +
                                    " -  " + _maxi + " [ " + _maxi_p + " ]\n" +
                                    "默认值: " + _cvt(_getDefVal()) + " [ " + _getDefVal() + " ]";
                            }
                            if (_content[0]) {
                                if (_content[1] || _content[2]) {
                                    _content[0] = _content[0] + "\n\n";
                                }
                            }
                            if (_content[1] && _content[2]) {
                                _content[1] = _content[1] + "\n";
                            }
                            _content = _content.join("");
                        } else {
                            _mini = _mini_p = min;
                            _maxi = _maxi_p = max;
                        }

                        return dialogsx
                            .builds([
                                _title, $$und(_content) ? _cfg_conj : $$nul(_content) ? "" : _content,
                                $$0(_neutral) || $$nul(_neutral) ? 0 : ["使用默认值", "hint_btn_dark_color"],
                                $$0(_negative) || $$nul(_negative) ? 0 : "返回",
                                $$0(_positive) || $$nul(_positive) ? 0 : "确认修改",
                                1,
                            ], Object.assign({
                                inputHint: (() => {
                                    let _u = _dist ? "(*" + _dist + ")" : "";
                                    return "{x|" + _mini_p + _u + "<=" +
                                        "x<=" + _maxi_p + _u + ",x∈" + _set + "}";
                                })(),
                            }, _addn))
                            .on("neutral", $$func(_neutral)
                                ? d => _neutral.call(this, d, s => dialogsx.setInputText(d, s))
                                : d => dialogsx.setInputText(d, _getDefVal()))
                            .on("negative", $$func(_negative)
                                ? d => _negative.call(this, d, _mini, _maxi)
                                : d => d.dismiss())
                            .on("positive", $$func(_positive)
                                ? d => _positive.call(this, d, _mini, _maxi)
                                : (d) => {
                                    let _n = $$view.diag.checkInputRange(
                                        d, [_mini, _maxi], [_mini_p, _maxi_p]
                                    );
                                    if (!$$F(_n)) {
                                        if (!_opt.positiveAddn || _opt.positiveAddn(d, _n, _save)) {
                                            return _save();
                                        }
                                    }

                                    // tool function(s) //

                                    function _save() {
                                        d.dismiss();
                                        $$save.session(_cfg_conj, _saveValue(_n));
                                    }
                                })
                            .show();
                    },
                    rectSetter(opt) {
                        let _opt = opt || {};
                        let _cfg_conj = this.config_conj;
                        let _def_key = _opt.def_key || "af";
                        let _title = _opt.title || this.title || "矩形区域设置";

                        dialogsx
                            .builds([
                                _title, _cfg_conj,
                                "使用默认值", "放弃", "确认修改", 1
                            ], {inputHint: "Rect(l,t,r,b) x.like=72|0.1|10%"})
                            .on("neutral", (d) => {
                                dialogsx.setInputText(d, $$sto.def[_def_key][_cfg_conj].join(","));
                            })
                            .on("negative", (d) => {
                                d.dismiss();
                            })
                            .on("positive", (d) => {
                                let _get_text = dialogsx.getInputText(d);
                                if (!_get_text) {
                                    return d.dismiss();
                                }
                                let _nums = _get_text.split(/[^\d.]+/);
                                if (_checkInput(_nums, d)) {
                                    d.dismiss();
                                    return $$save.session(_cfg_conj, _nums);
                                }
                            })
                            .show();

                        // tool function(s) //

                        function _checkInput(nums, d) {
                            let _l = nums.length;
                            if (_l !== 4) {
                                return dialogsx.alertTitle(d, "解析的数值数量不为4");
                            }
                            for (let i = 0; i < _l; i += 1) {
                                let _num = nums[i];
                                if (_num.match(/%$/)) {
                                    _num = _num.replace(/[^\d.]/g, "") / 100;
                                }
                                if (+_num < 1) {
                                    _num *= i % 2 ? H : W;
                                }
                                _num = parseInt(_num);
                                if (isNaN(_num)) {
                                    return dialogsx.alertTitle(d, "第" + i + "个参数无法解析");
                                }
                                nums[i] = _num;
                            }
                            if (nums[0] < 0) {
                                return dialogsx.alertTitle(d, "\"左\"值需大于0");
                            }
                            if (nums[1] < 0) {
                                return dialogsx.alertTitle(d, "\"上\"值需大于0");
                            }
                            if (nums[2] > W) {
                                return dialogsx.alertTitle(d, "\"右\"值不可大于屏幕宽度");
                            }
                            if (nums[3] > H) {
                                return dialogsx.alertTitle(d, "\"下\"值不可大于屏幕高度");
                            }
                            if (nums[0] >= nums[2]) {
                                return dialogsx.alertTitle(d, "\"左\"值需小于\"右\"值");
                            }
                            if (nums[1] >= nums[3]) {
                                return dialogsx.alertTitle(d, "\"上\"值需小于\"下\"值");
                            }
                            return true;
                        }
                    },
                    radioSetter(opt) {
                        let _opt = opt || {};
                        let _map = _opt["map"] || this.map;
                        let _keys = Object.keys(_map);
                        let _title = _opt.title || this.title;
                        let _content = _opt.content || "";

                        let _cfg_conj = this.config_conj;
                        let _def_key = _opt.def_key || "af";
                        let _def_sto_idx = $$sto.def[_def_key][_cfg_conj];
                        let _def_idx = _opt.def_idx;
                        if ($$und(_def_idx)) {
                            let _v = $$cfg.ses[_cfg_conj] || _def_sto_idx;
                            _def_idx = _keys.indexOf(_v.toString());
                        } else if ($$func(_def_idx)) {
                            _def_idx = _def_idx.call(this);
                        }

                        let _saveValue = $$func(_opt.saveValue)
                            ? d => _opt.saveValue.call(_opt, d)
                            : d => $$save.session(_cfg_conj, _keys[d.selectedIndex]);

                        let _neutral = _opt.neutral;
                        let _neu_value;
                        let _neu_lsn;
                        if ($$0(_neutral)) {
                            _neu_value = 0;
                            _neu_lsn = () => null;
                        } else if ($$func(_neutral)) {
                            _neu_value = ["了解详情", "hint_btn_bright_color"];
                            _neu_lsn = d => _neutral.call(this, d);
                        } else if ($$obj(_neutral)) {
                            _neu_value = _neutral.value;
                            _neu_lsn = d => _neutral.listener.call(this, d);
                        } else {
                            _neu_value = ["使用默认值", "hint_btn_dark_color"];
                            _neu_lsn = d => d.setSelectedIndex(_def_sto_idx);
                        }

                        let _neg_value;
                        let _neg_lsn;
                        let _negative = _opt["negative"] || "返回";
                        if ($$func(_negative)) {
                            _neg_value = _negative;
                            _neg_lsn = d => _negative.call(this, d);
                        } else if ($$obj(_negative)) {
                            _neg_value = _negative.value;
                            _neg_lsn = d => _negative.listener.call(this, d);
                        } else {
                            _neg_value = _negative;
                            _neg_lsn = d => d.dismiss();
                        }

                        let _pos_value;
                        let _pos_lsn;
                        let _positive = _opt.positive || "确认修改";
                        if ($$func(_positive)) {
                            _pos_value = _positive;
                            _pos_lsn = d => _positive.call(this, d);
                        } else if ($$obj(_positive)) {
                            _pos_value = _positive.value;
                            _pos_lsn = (d) => $$func(_positive.listener)
                                ? _positive.listener.call(this, d)
                                : (d) => {
                                    _saveValue(d);
                                    d.dismiss();
                                };
                        } else {
                            _pos_value = _positive;
                            _pos_lsn = (d) => {
                                _saveValue(d);
                                d.dismiss();
                            };
                        }

                        return dialogsx
                            .builds([
                                _title, _content,
                                _neu_value, _neg_value, _pos_value, 1
                            ], {
                                items: _keys.slice().map(k => _map[k]),
                                itemsSelectMode: "single",
                                itemsSelectedIndex: _def_idx,
                            })
                            .on("neutral", _neu_lsn)
                            .on("negative", _neg_lsn)
                            .on("positive", _pos_lsn)
                            .on("single_choice", $$func(_opt.single_choice)
                                ? (i, v, d) => _opt.single_choice.call(this, i, v, d)
                                : () => null)
                            .show();
                    },
                    checkInputRange(d) {
                        let _input = dialogsx.getInputText(d);
                        if (_input === "") {
                            d.dismiss();
                            return false;
                        }
                        let _max = 3;
                        while (_input.match("%") && _max--) {
                            _input = _input.replace(/(\d+(\.\d+)?\s*)%/g, ($0, $1) => {
                                return $1 / 100 + "";
                            });
                        }
                        let _num = +_input;
                        if (isNaN(_num)) {
                            dialogsx.alertTitle(d, "输入值类型不合法");
                            return false;
                        }

                        let _len = arguments.length;
                        for (let i = 1; i < _len; i += 1) {
                            let [_min, _max] = [];
                            let _arg = arguments[i];
                            if ($$num(_arg) || $$str(_arg)) {
                                _min = +_arg;
                                _max = +arguments[++i];
                            } else if ($$arr(_arg)) {
                                [_min, _max] = _arg;
                            } else {
                                continue;
                            }
                            if ($$num(_min, "<=", _num, "<=", _max)) {
                                return _num.toString();
                            }
                        }

                        dialogsx.alertTitle(d, "输入值范围不合法");
                        return false;
                    },
                },
                hint: {
                    colorSetter(view) {
                        let _sess_val = $$cfg.ses[this.config_conj];
                        if (classof(_sess_val, "Array")) {
                            let _len = _sess_val.length;
                            if (_len) {
                                let _s = _sess_val.join(" , ");
                                view.setHints("共" + _len + "项色值  [ " + _s + " ]");
                            } else {
                                view.setHints("无数据");
                            }
                        } else {
                            let _col = _sess_val.toString();
                            view.setHints("#", _col.slice(1) + " ", _col);
                        }
                    },
                },
                udop: {
                    main_sw(view, dependencies) {
                        view.setHintText($$cfg.ses[this.config_conj] ? "已开启" : "已关闭");
                        dependencies && $$view.checkDependency(view, dependencies);
                    },
                },
                page: {
                    buffer: {},
                    rolling: [],
                    get last_rolling() {
                        return this.rolling[this.rolling.length - 1] || {};
                    },
                    tree: {
                        self_collect_page: {
                            homepage_monitor_page: null,
                            homepage_background_monitor_page: null,
                            homepage_wball_page: null,
                        },
                        friend_collect_page: {
                            rank_list_samples_collect_page: {
                                rank_list_review_page: null,
                            },
                            forest_samples_collect_page: {
                                eballs_color_config_page: null,
                                hough_strategy_page: null,
                            },
                        },
                        help_collect_page: {
                            six_balls_review_page: null,
                            rank_list_samples_collect_page: {
                                rank_list_review_page: null,
                            },
                            forest_samples_collect_page: {
                                eballs_color_config_page: null,
                                hough_strategy_page: null,
                            },
                        },
                        auto_unlock_page: null,
                        message_showing_page: null,
                        global_log_page: null,
                        timers_page: {
                            homepage_monitor_page: null,
                            rank_list_review_page: null,
                            timers_self_manage_page: {
                                timers_uninterrupted_check_sections_page: null,
                            },
                            timers_control_panel_page: null,
                        },
                        account_page: {
                            account_log_back_in_page: null,
                        },
                        stat_page: null,
                        blacklist_page: {
                            cover_blacklist_page: null,
                            collect_blacklist_page: null,
                            foreground_app_blacklist_page: null,
                        },
                        script_security_page: {
                            kill_when_done_page: null,
                            phone_call_state_monitor_page: null,
                        },
                        local_project_backup_restore_page: {
                            restore_projects_from_local_page: null,
                            restore_projects_from_server_page: null,
                        },
                    },
                    new(title, tt_key, f) {
                        return this.buffer[tt_key] = f.bind(null, [title, tt_key]);
                    },
                    jump(drxn, nxt) {
                        if (!global._$_page_scrolling) {
                            if (nxt !== this.last_rolling.page_label_name) {
                                if (drxn.match(/back|previous|last/)) {
                                    smoothScrollView("full_right", 180, this.rolling);
                                    this.rolling.pop();
                                } else {
                                    this.rolling.push($$view.pages[nxt]);
                                    smoothScrollView("full_left", 180, this.rolling);
                                }
                            }
                        }
                    },
                    flush() {
                        let _pages_buffer = [];
                        let _pages_buffered_name = {};
                        let _emit = () => $$lsn.emit("sub_page_views_add");

                        // `_pages_buffer` will be updated
                        _traversePages(this.buffer, this.tree);
                        _pages_buffer.forEach(f => $$view.sub_pages.push(f));

                        _emit();

                        let _itv = setInterval(() => {
                            let i = $$ses.sub_page_view_idx;
                            let j = $$view.sub_pages.length;
                            i < j ? _emit() : clearInterval(_itv);
                        }, 50);

                        // tool function(s) //

                        function _traversePages(pages, tree) {
                            // traverse the page views by BFS (Breadth-First-Search) algorithm
                            // and put all widgets into _pages_buffer[] traversed
                            let sub_trees = [];
                            Object.keys(tree).forEach((key) => {
                                if (key in pages && !_pages_buffered_name[key]) {
                                    _pages_buffer.push(pages[key]);
                                    _pages_buffered_name[key] = true;
                                }
                                if (classof(tree[key], "Object")) {
                                    sub_trees.push(tree[key]);
                                }
                            });
                            sub_trees.forEach(sub_tree => _traversePages(pages, sub_tree));
                        }
                    },
                },
                pages: {},
                sub_pages: [],
                dyn_pages: [],
                setHomePage(home_title, bg_color) {
                    let _homepage = $$view.setPage(home_title, (p_view) => (
                        $$view.setButtons(p_view, "homepage", ["save", "SAVE", "OFF", (v) => {
                            if ($$save.trigger()) {
                                $$save.config();
                                v.switch_off();
                                toast("已保存");
                            }
                        }])
                    ), {title_bg_color: bg_color});

                    _homepage.ready = function () {
                        ui.main.getParent().addView(_homepage);
                        _homepage["_back_btn_area"].setVisibility(8);
                        $$view.page.rolling.unshift(_homepage);
                    };

                    return _homepage;
                },
                setPage(title, addn_func, options) {
                    let {no_scroll_view, check_page_state, title_bg_color} = options || {};
                    let [_title_name, _label_name] = $$arr(title) ? title : [title, ""];

                    let _page_view = ui.inflate(<vertical/>);

                    _page_view.addView(_getTitleBarView());
                    _page_view.addView(_getContentView());

                    _page_view.add = function (type, opt) {
                        if (type === "list") {
                            _page_view.hideContentMarginTop();
                        }

                        let item_view;
                        if (type.match(/^(.+_)?split_line/)) {
                            item_view = setSplitLine(opt);
                        } else if (type === "subhead") {
                            item_view = setSubHead(opt);
                        } else if (type === "blank") {
                            item_view = setBlank(opt);
                        } else if (type === "info") {
                            item_view = setInfo(opt);
                        } else if (type === "list") {
                            item_view = setList(opt);
                        } else if (type === "seekbar") {
                            item_view = setSeekbar(opt);
                        } else {
                            item_view = ui.inflate(
                                <horizontal id="_item_area" padding="16 8" gravity="left|center">
                                    <vertical id="_content" w="{{$$def.item_area_width}}" h="40"
                                              gravity="left|center">
                                        <text id="_title" textColor="#111111" textSize="16"/>
                                    </vertical>
                                </horizontal>
                            );
                        }

                        if (!$$obj(opt)) {
                            _page_view.content_view.addView(item_view);
                            return _page_view;
                        }

                        item_view.setNextPage = p => opt.next_page = p;
                        item_view.getNextPage = () => opt.next_page;
                        item_view.setHintText = (s) => {
                            item_view["_hint"] && ui.post(() => {
                                item_view["_hint"].text(s);
                            });
                        };
                        item_view.setHintTextColor = (c) => {
                            item_view["_hint"] && item_view["_hint"].setTextColor(
                                typeof c === "string" ? colors.parseColor(c) : c
                            );
                        };
                        item_view.setHintVisibility = (v) => {
                            item_view["_hint"] && ui.post(() => {
                                v = $$T(v) ? 0 : $$F(v) ? 8 : v;
                                item_view["_hint"].setVisibility(v);
                            });
                        };
                        item_view.setTitleText = (s) => {
                            item_view["_title"] && ui.post(() => {
                                item_view["_title"].text(s);
                            });
                        };
                        item_view.setTitleTextColor = (c) => {
                            item_view["_title"] && item_view["_title"].setTextColor(
                                typeof c === "string" ? colors.parseColor(c) : c
                            );
                        };
                        item_view.setChevronVisibility = (v) => {
                            item_view["_chevron_btn"] && ui.post(() => {
                                v = $$T(v) ? 0 : $$F(v) ? 8 : v;
                                item_view["_chevron_btn"].setVisibility(v);
                            });
                        };
                        item_view.page_view = _page_view;

                        let hint = opt.hint;
                        if (hint) {
                            let _hint_view = ui.inflate(
                                <horizontal id="_hints">
                                    <horizontal>
                                        <text id="_hint" textSize="13sp"/>
                                    </horizontal>
                                </horizontal>
                            );
                            let _getHintView = (text) => {
                                let _view = ui.inflate(
                                    <horizontal>
                                        <text id="_sub_hint" textSize="13sp"/>
                                    </horizontal>
                                );
                                let _col = text.match(/#[\da-fA-F]{6,}/);
                                let _hint = _view["_sub_hint"];
                                if (_col) {
                                    _hint.setText("\u25D1"); // "◑"
                                    _hint.setTextColor(colors.parseColor(_col[0]));
                                } else {
                                    _hint.setText(text);
                                    _hint.setTextColor(colors.parseColor("#888888"));
                                }
                                return _view;
                            };

                            item_view.setHints = function () {
                                let _arg_len = arguments.length;
                                let _views = [];
                                for (let i = 0; i < _arg_len; i += 1) {
                                    _views[i] = _getHintView.call({}, arguments[i]);
                                }
                                _hint_view["_hints"].removeAllViews();
                                _views.forEach(v => _hint_view["_hints"].addView(v));
                            };

                            if ($$str(hint)) {
                                _hint_view["_hint"].setText(hint);
                            }
                            item_view["_content"].addView(_hint_view);
                        }

                        if (type === "radio") {
                            item_view["_item_area"].removeAllViews();
                            let radiogroup_view = ui.inflate(
                                <radiogroup id="_radiogroup" orientation="horizontal" padding="-6 0 0 0"/>
                            );
                            opt.view = item_view;
                            let title = opt.title;

                            title.forEach((val) => {
                                let radio_view = ui.inflate(<radio padding="0 0 12 0"/>);
                                radio_view.setText(val);
                                Object.keys(opt.listeners).forEach((listener) => {
                                    radio_view.on(listener, opt.listeners[listener].bind(opt));
                                });
                                radiogroup_view["_radiogroup"].addView(radio_view);
                            });
                            item_view.addView(radiogroup_view);
                        }

                        item_view.setTitleText(opt.title);

                        if (type.match(/.*switch$/)) {
                            let sw_view;
                            if (type === "switch") {
                                sw_view = ui.inflate(<Switch id="_switch" checked="true"/>);
                                if ($$F(opt.default_state)) {
                                    sw_view["_switch"].setChecked(false);
                                }
                            }
                            if (type === "checkbox_switch") {
                                sw_view = ui.inflate(
                                    <vertical padding="8 0 0 0">
                                        <checkbox id="_checkbox_switch" checked="true"/>
                                    </vertical>
                                );
                                if ($$F(opt.default_state)) {
                                    sw_view["_checkbox_switch"].setChecked(false);
                                }
                            }
                            item_view["_item_area"].addView(sw_view);
                            opt.view = item_view;

                            let listener_ids = opt.listeners;
                            Object.keys(listener_ids).forEach((id) => {
                                let listeners = listener_ids[id];
                                Object.keys(listeners).forEach((listener) => {
                                    let callback = listeners[listener].bind(opt);
                                    if (id === "ui") ui.emitter.prependListener(listener, callback);
                                    else item_view[id].on(listener, callback);
                                });
                            });
                        } else if (type.match(/^page/)) {
                            // noinspection HtmlUnknownTarget
                            let _page_enter_view = ui.inflate(
                                <vertical id="_chevron_btn">
                                    <img src="@drawable/ic_chevron_right_black_48dp"
                                         bg="?selectableItemBackgroundBorderless"
                                         tint="#999999" h="31" paddingLeft="10" alt=""/>
                                </vertical>
                            );
                            item_view["_item_area"].addView(_page_enter_view);
                            opt.view = item_view;
                            item_view.setClickListener = (listener) => {
                                if (!listener) listener = () => null;
                                item_view["_item_area"].removeAllListeners("click");
                                item_view["_item_area"].on("click", listener);
                            };
                            item_view.restoreClickListener = () => item_view.setClickListener(() => {
                                let next_page = opt.next_page;
                                let opt_listeners = opt.listeners;
                                let opt_listeners_f = opt_listeners && opt_listeners.click;
                                let _next_page_view = next_page && $$view.pages[next_page];
                                if ($$func(opt_listeners_f)) {
                                    opt_listeners_f(item_view, _next_page_view);
                                }
                                if (_next_page_view) {
                                    $$view.page.jump("next", next_page);
                                }
                            });
                            item_view.setClickListener();
                            item_view.setChevronVisibility(8);
                            let sub_page_ready_interval = setInterval(function () {
                                if ($$ses["ready_signal_" + opt.next_page]) {
                                    ui.post(() => {
                                        item_view.restoreClickListener();
                                        item_view.setChevronVisibility(0);
                                    });
                                    clearInterval(sub_page_ready_interval);
                                }
                            }, 100);
                        } else if (type === "button") {
                            // noinspection HtmlUnknownTarget
                            let help_view = ui.inflate(
                                <vertical id="_info_icon" visibility="gone">
                                    <img src="@drawable/ic_info_outline_black_48dp"
                                         bg="?selectableItemBackgroundBorderless"
                                         h="22" tint="#888888" alt=""/>
                                </vertical>
                            );
                            item_view["_item_area"].addView(help_view);
                            opt.view = item_view;
                            item_view["_item_area"].on("click", () => opt.newWindow());
                            if (opt.infoWindow) {
                                item_view["_info_icon"].setVisibility(0);
                                item_view["_info_icon"].on("click", () => opt.infoWindow());
                            }
                        }

                        if (opt.view_tag) {
                            item_view.setTag(opt.view_tag);
                        }

                        _page_view.content_view.addView(item_view);

                        Object.keys(opt).forEach((key) => {
                            if (!key.match(/listeners/)) {
                                let item_data = opt[key];
                                if (!$$func(item_data)) {
                                    return item_view[key] = item_data;
                                }
                                if (key === "updateOpr") {
                                    $$view.dyn_pages.push(item_view);
                                    return (item_view.updateOpr = () => item_data.call(opt, item_view))();
                                }
                                item_view[key] = item_data.bind(item_view);
                            }
                        });

                        return _page_view;

                        // tool function(s) //

                        function setBlank(h) {
                            let new_view = ui.inflate(
                                <vertical>
                                    <horizontal id="_blank" w="*" h="1sp" margin="16 8"/>
                                </vertical>
                            );
                            new_view.setTag(type);
                            new_view.setVisibility(4);
                            new_view["_blank"].attr("height", h || 0);
                            return new_view;
                        }

                        function setSplitLine(options) {
                            let line_color = options && options.split_line_color || $$def.split_line_color;

                            let new_view = ui.inflate(
                                <vertical>
                                    <horizontal id="_line" w="*" h="1sp" margin="16 8"/>
                                </vertical>
                            );
                            new_view.setTag(type);
                            line_color = $$str(line_color) ? colors.parseColor(line_color) : line_color;
                            new_view["_line"].setBackgroundColor(line_color);
                            if (type.match(/invisible/)) {
                                new_view.setVisibility(8);
                            }

                            return new_view;
                        }

                        function setSubHead(options) {
                            let title = options.title;
                            let subhead_color = options.subhead_color || $$def.subhead_color;

                            let new_view = ui.inflate(
                                <vertical>
                                    <text id="_text" textSize="14" margin="16 8"/>
                                </vertical>
                            );
                            new_view["_text"].text(title);
                            let title_color = $$str(subhead_color) ? colors.parseColor(subhead_color) : subhead_color;
                            new_view["_text"].setTextColor(title_color);

                            return new_view;
                        }

                        function setInfo(options) {
                            let title = options.title;
                            let subhead_color = options.subhead_color || $$def.subhead_color;
                            let info_color = options.info_color || $$def.info_color;
                            $$ses.info_color = info_color;

                            // noinspection HtmlUnknownTarget
                            let new_view = ui.inflate(
                                <horizontal>
                                    <linear padding="15 10 0 0">
                                        <img src="@drawable/ic_info_outline_black_48dp"
                                             h="17" w="17" margin="0 1 4 0"
                                             tint="{{$$ses.info_color}}" alt=""/>
                                        <text id="_info_text" textSize="13"/>
                                    </linear>
                                </horizontal>
                            );
                            new_view["_info_text"].text(title);
                            let title_color = $$str(info_color) ? colors.parseColor(info_color) : subhead_color;
                            new_view["_info_text"].setTextColor(title_color);

                            return new_view;
                        }

                        function setList(options) {
                            let list_title_bg_color = options.list_title_bg_color || $$def.list_title_bg_color;
                            let list_head = options.list_head || [];
                            if ($$str(list_head)) {
                                list_head = $$cfg.list_heads[list_head];
                            }
                            list_head.forEach((o, idx) => {
                                let w = o.width;
                                if (!idx && !w) {
                                    return $$ses.list_width_0 = cX(0.3) + "px";
                                }
                                $$ses["list_width_" + idx] = w ? cX(w) + "px" : -2;
                            });
                            $$ses.list_checkbox = options.list_checkbox;
                            let ds_k = options.data_source_key_name || "unknown_key_name"; // just a key name
                            let getListItemName = (num) => {
                                if (list_head[num]) {
                                    return Object.keys(list_head[num])[0];
                                }
                                return null;
                            };

                            // items are expected not more than 4
                            for (let i = 0; i < 4; i += 1) {
                                $$ses["list_item_name_" + i] = getListItemName(i);
                            }

                            let list_view = ui.inflate(
                                <vertical>
                                    <horizontal id="_list_title_bg">
                                        <horizontal h="50" w="{{$$ses['list_width_0']}}" margin="8 0 0 0">
                                            <checkbox id="_check_all" layout_gravity="left|center"
                                                      clickable="false"/>
                                        </horizontal>
                                    </horizontal>
                                    <vertical>
                                        <list id="_list_data" focusable="true" scrollbars="none">
                                            <horizontal>
                                                <horizontal w="{{this.width_0}}">
                                                    <checkbox id="_checkbox" layout_gravity="left|center"
                                                              checked="{{this.checked}}" clickable="false"
                                                              h="50" margin="8 0 -16"/>
                                                    <text text="{{this.list_item_name_0}}" textSize="15"
                                                          h="50" margin="16 0 0" w="*"
                                                          gravity="left|center"/>
                                                </horizontal>
                                                <horizontal w="{{$$ses['list_width_1'] || 1}}" margin="8 0 0 0">
                                                    <text text="{{this.list_item_name_1}}"
                                                          visibility="{{$$ses['list_item_name_1'] ? 'visible' : 'gone'}}"
                                                          textSize="15" h="50" gravity="left|center"/>
                                                </horizontal>
                                                <horizontal w="{{$$ses['list_width_2'] || 1}}">
                                                    <text text="{{this.list_item_name_2}}"
                                                          visibility="{{$$ses['list_item_name_2'] ? 'visible' : 'gone'}}"
                                                          textSize="15" h="50" gravity="left|center"/>
                                                </horizontal>
                                                <horizontal w="{{$$ses['list_width_3'] || 1}}">
                                                    <text text="{{this.list_item_name_3}}"
                                                          visibility="{{$$ses['list_item_name_3'] ? 'visible' : 'gone'}}"
                                                          textSize="15" h="50" gravity="left|center"/>
                                                </horizontal>
                                            </horizontal>
                                        </list>
                                    </vertical>
                                </vertical>
                            );

                            $$view.updateDataSource(ds_k, "init", options.custom_data_source);
                            list_view["_check_all"].setVisibility(
                                android.view.View[options.list_checkbox.toUpperCase()]
                            );
                            list_view["_list_data"].setDataSource($$ses[ds_k]);
                            list_view["_list_title_bg"].attr("bg", list_title_bg_color);
                            list_view.setTag("list_page_view");
                            list_head.forEach((title_obj, idx) => {
                                let data_key_name = Object.keys(title_obj)[0];
                                let list_title_view = idx ? ui.inflate(
                                    <text textSize="15"/>
                                ) : ui.inflate(
                                    <text textSize="15"
                                          padding="{{$$ses.list_checkbox === 'gone' ? 8 : 0}} 0 0 0"/>
                                );

                                list_title_view.setText(title_obj[data_key_name]);
                                list_title_view.on("click", () => {
                                    if (!$$ses[ds_k][0]) {
                                        return;
                                    }

                                    let _sort_k = "list_sort_flag_" + data_key_name;
                                    if ($$und($$ses[_sort_k])) {
                                        let [a, b] = $$ses[ds_k];
                                        if (a === b) {
                                            $$ses[_sort_k] = 0;
                                        }
                                        $$ses[_sort_k] = a < b ? 1 : -1;
                                    }

                                    let _sess_data = $$ses[ds_k].map((v, idx) => [idx, v]);
                                    _sess_data.sort((a, b) => {
                                        let _is_num = (title_obj.sort || {}).type === "number";
                                        let _a = a[1][a[1][data_key_name]];
                                        let _b = b[1][b[1][data_key_name]];
                                        if (_is_num) {
                                            [_a, _b] = [+_a, +_b];
                                        }
                                        if (_a === _b) {
                                            return 0;
                                        }
                                        if ($$ses[_sort_k] > 0) {
                                            return _a > _b ? 1 : -1;
                                        }
                                        return _a < _b ? 1 : -1;
                                    });
                                    let _indices = {};
                                    _sess_data = _sess_data.map((v, i) => {
                                        _indices[v[0]] = i;
                                        return v[1];
                                    });
                                    let _del_idx_k = ds_k + "_deleted_items_idx";
                                    $$ses[_del_idx_k] = $$ses[_del_idx_k] || {};
                                    let _tmp_del_idx = {};
                                    Object.keys($$ses[_del_idx_k]).forEach((ori_idx_key) => {
                                        _tmp_del_idx[_indices[ori_idx_key]] = $$ses[_del_idx_k][ori_idx_key];
                                    });
                                    $$ses[_del_idx_k] = deepCloneObject(_tmp_del_idx);
                                    $$ses[ds_k].splice(0);
                                    _sess_data.forEach(v => $$ses[ds_k].push(v));
                                    $$ses[_sort_k] *= -1;
                                    // updateDataSource(data_source_key_name, "rewrite");
                                });

                                if ($$0(idx)) {
                                    list_view["_check_all"].getParent().addView(list_title_view);
                                } else {
                                    list_view["_list_title_bg"].addView(list_title_view);
                                }

                                list_title_view.attr("layout_gravity", "right|center");
                                idx && list_title_view.attr("width", $$ses["list_width_" + idx]);
                            });

                            options.view = list_view;

                            let listener_ids = options.listeners || [];
                            Object.keys(listener_ids).forEach((id) => {
                                let listeners = listener_ids[id];
                                Object.keys(listeners).forEach((listener) => {
                                    let callback = listeners[listener].bind(options);
                                    if (id === "ui") ui.emitter.prependListener(listener, callback);
                                    else list_view[id].on(listener, callback);
                                });
                            });

                            return list_view;
                        }

                        function setSeekbar(options) {
                            let {title, unit, config_conj, nums, inc} = options;
                            let _def = $$sto.def.af[config_conj];
                            let [min, max, init] = nums;
                            if (isNaN(+min)) {
                                min = 0;
                            }
                            if (isNaN(+init)) {
                                let _init = $$cfg.ses[config_conj] || _def;
                                init = isNaN(+_init) ? min : _init;
                            }
                            if (isNaN(+max)) {
                                max = 100;
                            }
                            if (isNaN(+inc)) {
                                inc = 1;
                            }

                            let _new_view = ui.inflate(
                                <vertical>
                                    <horizontal margin="16 8">
                                        <text id="_text" gravity="left" layout_gravity="center"/>
                                        <seekbar id="_seekbar" w="*" layout_gravity="center"
                                                 style="@android:style/Widget.Material.SeekBar"/>
                                    </horizontal>
                                </vertical>
                            );
                            /** @type android.widget.AbsSeekBar */
                            let _seekbar = _new_view["_seekbar"];
                            _seekbar.setMax(Math.ceil((max - min) / inc));
                            _seekbar.setProgress(Math.ceil((init - min) / inc));

                            let update = src => _new_view["_text"].setText(
                                (title ? title + ": " : "") + src.toString() +
                                (unit ? " " + unit : ""));

                            _new_view["_text"].on("long_click", (e) => {
                                e.consumed = true;
                                _seekbar.setProgress(Math.ceil((_def - min) / inc));
                            });

                            update(init);

                            _new_view["_seekbar"].setOnSeekBarChangeListener(
                                new android.widget.SeekBar.OnSeekBarChangeListener({
                                    onProgressChanged(seek_bar, progress) {
                                        let result = Math.min(progress * inc + min, max);
                                        update(result);
                                        $$save.session(config_conj, result);
                                    },
                                    onStartTrackingTouch: () => void 0,
                                    onStopTrackingTouch: () => void 0,
                                })
                            );

                            return _new_view;
                        }
                    };
                    _page_view.ready = function () {
                        if (_label_name) {
                            $$ses["ready_signal_" + _label_name] = true;
                        } else {
                            messageAction("页面标签不存在:", 3, 0, 0, -1);
                            messageAction(_title_name, 3, 0, 0, 1);
                        }
                        return _page_view;
                    };
                    _page_view.checkPageState = function () {
                        if ($$func(check_page_state)) {
                            return check_page_state(_page_view.content_view);
                        }
                        return true;
                    };

                    _page_view.page_title_name = _title_name;

                    if (_label_name) {
                        $$view.pages[_label_name] = _page_view;
                        _page_view.setTag(_page_view.page_label_name = _label_name);
                    }

                    return _page_view;

                    // tool function(s) //

                    function _getTitleBarView() {
                        // noinspection HtmlUnknownTarget
                        let _title_bar_view = ui.inflate(
                            <linear id="_title_bg" clickable="true">
                                <vertical id="_back_btn_area" marginRight="-22" layout_gravity="center">
                                    <img src="@drawable/ic_chevron_left_black_48dp"
                                         bg="?selectableItemBackgroundBorderless"
                                         h="31" tint="#ffffff" layout_gravity="center" alt=""/>
                                </vertical>
                                <text id="_title_text" textColor="#ffffff" textSize="19" margin="16"/>
                                <linear id="_title_btn" gravity="right" w="*" marginRight="5"/>
                            </linear>
                        );

                        _title_bar_view["_back_btn_area"].on("click", () => {
                            return $$view.checkPageState() && $$view.page.jump("back");
                        });
                        _title_bar_view["_title_text"].setText(_title_name);
                        _title_bar_view["_title_text"].getPaint().setFakeBoldText(true);
                        _title_bar_view["_title_bg"].setBackgroundColor((() => {
                            let _color = title_bg_color || $$def.title_bg_color;
                            if ($$str(_color)) {
                                _color = colors.parseColor(_color);
                            }
                            return _color;
                        })());

                        $$func(addn_func) && addn_func(_title_bar_view)
                        $$arr(addn_func) && addn_func.forEach(f => f(_title_bar_view));

                        return _page_view.title_bar_view = _title_bar_view;
                    }

                    function _getContentView() {
                        let _cnt_view_frame = ui.inflate(
                            no_scroll_view ? <vertical/> : <ScrollView/>
                        );
                        let _cnt_view = ui.inflate(
                            <vertical>
                                <frame id="_page_content_margin_top" h="8"/>
                            </vertical>
                        );

                        _page_view.hideContentMarginTop = () => {
                            _cnt_view["_page_content_margin_top"].setVisibility(8);
                        };
                        _cnt_view_frame.addView(_page_view.content_view = _cnt_view);

                        return _cnt_view_frame;
                    }
                },
                setButtons(p_view, data_source_key_name, button_params_arr) {
                    let buttons_count = 0;
                    for (let i = 2, l = arguments.length; i < l; i += 1) {
                        let arg = arguments[i];
                        if ($$arr(arg)) {
                            p_view["_title_btn"].addView(getButtonLayout.apply(null, arg));
                            buttons_count += 1;
                        }
                    }

                    // tool function(s) //

                    function getButtonLayout(button_icon_file_name, button_text, switch_state, btn_click_listener, other_params) {
                        other_params = other_params || {};
                        $$ses.button_icon_file_name = button_icon_file_name.replace(/^(ic_)?(.*?)(_black_48dp)?$/, "ic_$2_black_48dp");
                        $$ses.button_text = button_text;
                        let btn_text = button_text.toLowerCase();
                        let btn_icon_id = "_icon_" + btn_text;
                        $$ses.btn_icon_id = btn_icon_id;
                        let btn_text_id = "_text_" + btn_text;
                        $$ses.btn_text_id = btn_text_id;
                        let def_on_color = $$def.btn_on_color;
                        let def_off_color = $$def.btn_off_color;
                        let view = buttonView();
                        let switch_on_color = [other_params["btn_on_icon_color"] || def_on_color, other_params["btn_on_text_color"] || def_on_color];
                        let switch_off_color = [other_params["btn_off_icon_color"] || def_off_color, other_params["btn_off_text_color"] || def_off_color];
                        view.switch_on = () => {
                            view[btn_icon_id].attr("tint", switch_on_color[0]);
                            view[btn_text_id].setTextColor(colors.parseColor(switch_on_color[1]));
                        };
                        view.switch_off = () => {
                            view[btn_icon_id].attr("tint", switch_off_color[0]);
                            view[btn_text_id].setTextColor(colors.parseColor(switch_off_color[1]));
                        };

                        switch_state === "OFF" ? view.switch_off() : view.switch_on();

                        view[btn_text_id].on("click", () => btn_click_listener && btn_click_listener(view));
                        $$ses[data_source_key_name + "_btn_" + btn_text] = view;

                        return view;

                        // tool function(s) //

                        function buttonView() {
                            // noinspection HtmlUnknownTarget
                            return ui.inflate(
                                <vertical margin="13 0" id="btn" layout_gravity="right" gravity="right">
                                    <img id="{{$$ses.btn_icon_id}}"
                                         src="@drawable/{{$$ses.button_icon_file_name}}"
                                         bg="?selectableItemBackgroundBorderless"
                                         h="31" margin="0 7 0 0" layout_gravity="center" alt=""/>
                                    <text id="{{$$ses.btn_text_id}}"
                                          text="{{$$ses.button_text}}" textSize="10" textStyle="bold"
                                          w="50" h="40" marginTop="-26" gravity="bottom|center"/>
                                </vertical>
                            );
                        }
                    }
                },
                setListPageButtons(p_view, ds_k) {
                    let scenario = {
                        blacklist_by_user: sceBlacklistByUser,
                        foreground_app_blacklist: sceForeAppBlacklist,
                    }[ds_k]();
                    return $$view.setButtons.apply(
                        $$view.setButtons,
                        [p_view, ds_k].concat(scenario)
                    );

                    // scenario function(s) //

                    function sceBlacklistByUser() {
                        return [
                            ["restore", "RESTORE", "OFF", (btn_view) => {
                                let _blist_bak = $$cfg.sto[ds_k];
                                if (equalObjects($$cfg.ses[ds_k], _blist_bak)) {
                                    return;
                                }
                                let _diag = dialogsx.builds([
                                    "恢复列表数据", "restore_original_list_data",
                                    ["查看恢复列表", "hint_btn_bright_color"], "返回", "确定", 1,
                                ]);
                                _diag.on("neutral", () => {
                                    dialogsx.builds([
                                        "查看恢复列表", "", 0, 0, "返回", 1
                                    ], {
                                        content: "共计 " + _blist_bak.length + " 项",
                                        items: (() => {
                                            let _split_ln = "";
                                            for (let i = 0; i < 18; i += 1) {
                                                _split_ln += "- ";
                                            }
                                            let _items = [_split_ln];
                                            _blist_bak.forEach((o) => {
                                                let _time_str = $$tool.getTimeStrFromTs(
                                                    o.timestamp, "time_str_remove"
                                                );
                                                _items.push(
                                                    "好友昵称: " + o.name,
                                                    "解除时间: " + _time_str,
                                                    _split_ln
                                                );
                                            });
                                            return _items.length > 1 ? _items : ["列表为空"];
                                        })(),
                                    }).on("positive", (d) => {
                                        d.dismiss();
                                    }).show();
                                });
                                _diag.on("negative", d => d.dismiss());
                                _diag.on("positive", (d) => {
                                    d.dismiss();
                                    $$view.updateDataSource(ds_k, "splice", 0);

                                    let _del_idx_k = ds_k + "_deleted_items_idx";
                                    let _del_ctr_k = ds_k + "_deleted_items_idx_count";
                                    $$ses[_del_idx_k] = {};
                                    $$ses[_del_ctr_k] = 0;
                                    let _rm_btn = p_view["_text_remove"].getParent();
                                    _rm_btn.switch_off();
                                    btn_view.switch_off();
                                    _blist_bak.forEach((value) => {
                                        $$view.updateDataSource(ds_k, "update", value);
                                    });

                                    let _page_view = $$view.findViewByTag(
                                        p_view, "list_page_view"
                                    ).getParent();
                                    _page_view["_check_all"].setChecked(true);
                                    _page_view["_check_all"].setChecked(false);
                                });
                                _diag.show();
                            }],
                            ["delete_forever", "REMOVE", "OFF", (btn_view) => {
                                let _del_idx_k = ds_k + "_deleted_items_idx";
                                let _del_ctr_k = ds_k + "_deleted_items_idx_count";
                                if (!$$ses[_del_ctr_k]) {
                                    return;
                                }

                                let _thd_items_stable = threadsx.starts(function () {
                                    let _ctr_old = undefined;
                                    while ($$ses[_del_ctr_k] !== _ctr_old) {
                                        _ctr_old = $$ses[_del_ctr_k];
                                        sleep(50);
                                    }
                                });
                                _thd_items_stable.join(800);

                                let _del_idx_keys = Object.keys($$ses[_del_idx_k]);
                                _del_idx_keys
                                    .sort((a, b) => +a < +b ? 1 : -1)
                                    .forEach((idx) => {
                                        if ($$ses[_del_idx_k][idx]) {
                                            $$ses[ds_k].splice(idx, 1);
                                        }
                                    });
                                $$view.updateDataSource(ds_k, "rewrite");
                                $$ses[_del_idx_k] = {};
                                $$ses[_del_ctr_k] = 0;

                                let _restore_btn = p_view["_text_restore"].getParent();
                                equalObjects($$cfg.ses[ds_k], $$cfg.sto[ds_k])
                                    ? _restore_btn.switch_off()
                                    : _restore_btn.switch_on();

                                let _page_view = $$view.findViewByTag(
                                    p_view, "list_page_view"
                                ).getParent();
                                _page_view["_check_all"].setChecked(true);
                                _page_view["_check_all"].setChecked(false);
                                btn_view.switch_off();
                            }],
                            ["add_circle", "NEW", "ON", () => {
                                let _tmp_sel_fri = [];
                                let _blist_sel_fri = [];
                                let _lst_pg_view = $$view.findViewByTag(p_view, "list_page_view");

                                $$cfg.ses[ds_k].forEach(o => _blist_sel_fri.push(o.name));

                                let _diag_def_cnt = "从好友列表中选择并添加好友\n" +
                                    "或检索选择好友";
                                let _diag = dialogsx.builds([
                                    "添加新数据", _diag_def_cnt,
                                    ["从列表中选择", "hint_btn_bright_color"],
                                    ["检索选择", "hint_btn_bright_color"],
                                    "确认添加", 1,
                                ], {items: [" "]});
                                _diag.on("neutral", () => {
                                    let _diag_add_from_lst = dialogsx.builds([
                                        "列表选择好友", "",
                                        ["刷新列表", "hint_btn_bright_color"],
                                        0, "确认选择", 1,
                                    ], {
                                        items: ["列表为空"],
                                        itemsSelectMode: "multi",
                                    });
                                    _diag_add_from_lst.on("neutral", () => {
                                        $$tool.refreshFriLstByLaunchAlipay({
                                            dialog_prompt: true,
                                            onTrigger() {
                                                _diag_add_from_lst.dismiss();
                                                _diag.dismiss();
                                            },
                                            onResume() {
                                                _diag.show();
                                                threadsx.starts(function () {
                                                    let _btn_text = _diag.getActionButton("neutral");
                                                    if (_btn_text) {
                                                        waitForAndClickAction(text(_btn_text), 4e3, 100, {
                                                            click_strategy: "w",
                                                        });
                                                    }
                                                });
                                            },
                                        });
                                    });
                                    _diag_add_from_lst.on("positive", () => {
                                        refreshDiag();
                                        _diag_add_from_lst.dismiss();
                                    });
                                    _diag_add_from_lst.on("multi_choice", (indices, items) => {
                                        if (items.length === 1 && items[0] === "列表为空") {
                                            return;
                                        }
                                        if (items) {
                                            items.forEach((name) => {
                                                _tmp_sel_fri.push(name.split(". ")[1]);
                                            });
                                        }
                                    });
                                    _diag_add_from_lst.show();

                                    _refreshAddFromLstDiag();

                                    // tool function(s) //

                                    function _refreshAddFromLstDiag() {
                                        let _items = [];
                                        let _fri_lst = $$sto.af_flist.get("friends_list_data", {});
                                        if (_fri_lst.list_data) {
                                            _fri_lst.list_data.forEach((o) => {
                                                let _nick = o.nickname;
                                                let _cA = !_blist_sel_fri.includes(_nick);
                                                let _cB = !_tmp_sel_fri.includes(_nick);
                                                if (_cA && _cB) {
                                                    _items.push(o.rank_num + ". " + _nick);
                                                }
                                            });
                                        }
                                        let _i_len = _items.length;
                                        _items = _i_len ? _items : ["列表为空"];
                                        _diag_add_from_lst.setItems(_items);
                                        let _fri_lst_ts = _fri_lst.timestamp;
                                        if (isInfinite(_fri_lst_ts)) {
                                            _fri_lst_ts = -1;
                                        }
                                        _diag_add_from_lst.setContent(
                                            "上次刷新: " +
                                            $$tool.getTimeStrFromTs(_fri_lst_ts, "time_str") +
                                            "\n当前可添加的好友总数: " + _i_len
                                        );
                                    }
                                });
                                _diag.on("negative", () => {
                                    _diag.dismiss();
                                    $$view.setListItemsSearchAndSelectView((() => {
                                        let {list_data} = $$sto.af_flist.get("friends_list_data", {list_data: []});
                                        return list_data.map(o => o.nickname);
                                    }), {
                                        empty_list_prompt: true,
                                        refresh_btn_listener(ds_updater, ds_src) {
                                            $$tool.refreshFriLstByLaunchAlipay({
                                                dialog_prompt: true,
                                                onResume() {
                                                    ds_updater(ds_src());
                                                },
                                            });
                                        },
                                        list_item_listener(item, closeListPage) {
                                            let excluded_data_arrays = [_blist_sel_fri, _tmp_sel_fri];

                                            for (let i = 0, l = excluded_data_arrays.length; i < l; i += 1) {
                                                if (~excluded_data_arrays[i].indexOf(item)) {
                                                    return toast("此项已存在于黑名单列表或待添加列表中");
                                                }
                                            }
                                            closeListPage(item);
                                        },
                                        onFinish(result) {
                                            result && _tmp_sel_fri.push(result);
                                            _diag.show();
                                            refreshDiag();
                                        }
                                    });
                                });
                                _diag.on("positive", () => {
                                    _tmp_sel_fri.forEach(name => $$view.updateDataSource(ds_k, "update_unshift", {
                                        name: name,
                                        timestamp: Infinity,
                                    }));
                                    if (_tmp_sel_fri.length) setTimeout(function () {
                                        p_view.getParent()["_list_data"].smoothScrollBy(0, -Math.pow(10, 5));
                                    }, 200);
                                    let _restore_btn = _lst_pg_view.getParent()["_text_restore"].getParent();
                                    equalObjects($$cfg.ses[ds_k], $$cfg.sto[ds_k])
                                        ? _restore_btn.switch_off()
                                        : _restore_btn.switch_on();
                                    $$save.session(ds_k, $$cfg.ses[ds_k]);
                                    _diag.dismiss();
                                });
                                _diag.on("item_select", (idx) => {
                                    let _diag_items = _diag.getItems().toArray();
                                    if (_diag_items.length === 1 && _diag_items[0] === "\xa0") {
                                        return;
                                    }
                                    dialogsx.builds([
                                        "确认移除此项吗", "", 0, "返回", "确认", 1
                                    ]).on("negative", (d) => {
                                        d.dismiss();
                                    }).on("positive", (d) => {
                                        _tmp_sel_fri.splice(idx, 1);
                                        refreshDiag();
                                        d.dismiss();
                                    }).show();
                                });
                                _diag.show();

                                refreshDiag();

                                // tool function(s) //

                                function refreshDiag() {
                                    let _tmp_items_len = _tmp_sel_fri.length;
                                    let _tmp_items = _tmp_items_len ? _tmp_sel_fri : ["\xa0"];
                                    _diag.setItems(_tmp_items);
                                    let _cnt_info = _tmp_items_len
                                        ? "当前选择区好友总数: " + _tmp_items_len
                                        : _diag_def_cnt;
                                    _diag.setContent(_cnt_info);
                                }
                            }]
                        ];
                    }

                    function sceForeAppBlacklist() {
                        return [
                            ["restore", "RESTORE", "OFF", (btn_view) => {
                                let blacklist_backup = $$cfg.sto[ds_k];
                                if (equalObjects($$cfg.ses[ds_k], blacklist_backup)) return;
                                let diag = dialogsx.builds([
                                    "恢复列表数据", "restore_original_list_data",
                                    ["查看恢复列表", "hint_btn_bright_color"], "返回", "确定", 1,
                                ]);
                                diag.on("neutral", () => {
                                    let diag_restore_list = dialogsx.builds(["查看恢复列表", "", 0, 0, "返回", 1], {
                                        content: "共计 " + blacklist_backup.length + " 项",
                                        items: (function () {
                                            let items = [];
                                            blacklist_backup.forEach(o => items.push(o.app_combined_name));
                                            return items.length ? items : ["列表为空"];
                                        })(),
                                    });
                                    diag_restore_list.on("positive", () => diag_restore_list.dismiss());
                                    diag_restore_list.show();
                                });
                                diag.on("negative", () => diag.dismiss());
                                diag.on("positive", () => {
                                    diag.dismiss();
                                    $$view.updateDataSource(ds_k, "splice", 0);

                                    let deleted_items_idx = ds_k + "_deleted_items_idx";
                                    let deleted_items_idx_count = ds_k + "_deleted_items_idx_count";
                                    $$ses[deleted_items_idx] = {};
                                    $$ses[deleted_items_idx_count] = 0;
                                    let remove_btn = p_view["_text_remove"].getParent();
                                    remove_btn.switch_off();
                                    btn_view.switch_off();
                                    blacklist_backup.forEach(value => $$view.updateDataSource(ds_k, "update", value));
                                    let _page_view = $$view.findViewByTag(p_view, "list_page_view").getParent();
                                    _page_view["_check_all"].setChecked(true);
                                    _page_view["_check_all"].setChecked(false);
                                });
                                diag.show();
                            }],
                            ["delete_forever", "REMOVE", "OFF", (btn_view) => {
                                let deleted_items_idx = ds_k + "_deleted_items_idx";
                                let deleted_items_idx_count = ds_k + "_deleted_items_idx_count";
                                if (!$$ses[deleted_items_idx_count]) return;

                                let thread_items_stable = threadsx.starts(function () {
                                    let old_count = undefined;
                                    while ($$ses[deleted_items_idx_count] !== old_count) {
                                        old_count = $$ses[deleted_items_idx_count];
                                        sleep(50);
                                    }
                                });
                                thread_items_stable.join(800);

                                let deleted_items_idx_keys = Object.keys($$ses[deleted_items_idx]);
                                deleted_items_idx_keys
                                    .sort((a, b) => +a < +b ? 1 : -1)
                                    .forEach((idx) => {
                                        if ($$ses[deleted_items_idx][idx]) {
                                            $$ses[ds_k].splice(idx, 1);
                                        }
                                    });
                                $$view.updateDataSource(ds_k, "rewrite");
                                $$ses[deleted_items_idx] = {};
                                $$ses[deleted_items_idx_count] = 0;

                                let _restore_btn = p_view["_text_restore"].getParent();
                                let _sess = $$cfg.ses[ds_k];
                                let _sto = $$cfg.sto[ds_k];
                                equalObjects(_sess, _sto) ? _restore_btn.switch_off() : _restore_btn.switch_on();

                                let _page_view = $$view.findViewByTag(p_view, "list_page_view").getParent();
                                _page_view["_check_all"].setChecked(true);
                                _page_view["_check_all"].setChecked(false);
                                btn_view.switch_off();
                            }],
                            ["add_circle", "NEW", "ON", () => {
                                let tmp_selected_apps = [];
                                let blacklist_selected_apps = [];
                                let _page_view = $$view.findViewByTag(p_view, "list_page_view").getParent();

                                let _sess = $$cfg.ses[ds_k];
                                _sess.forEach(o => blacklist_selected_apps.push(o.app_combined_name));

                                let diag = dialogsx.builds([
                                    "添加新数据", "从应用列表中选择并添加应用\n或检索选择应用",
                                    ["从列表中选择", "hint_btn_bright_color"], ["检索选择", "hint_btn_bright_color"], "确认添加", 1,
                                ], {items: ["\xa0"]});
                                diag.on("neutral", () => {
                                    let diag_add_from_list = dialogsx.builds([
                                        "列表选择应用", "",
                                        ["刷新列表", "hint_btn_bright_color"], ["显示系统应用", "hint_btn_dark_color"], "确认选择", 1,
                                    ], {
                                        items: ["\xa0"],
                                        itemsSelectMode: "multi",
                                    });
                                    diag_add_from_list.on("neutral", () => refreshDiagList("force_refresh"));
                                    diag_add_from_list.on("negative", () => {
                                        if (diag_add_from_list.getActionButton("negative") === "显示系统应用") {
                                            diag_add_from_list.setActionButton("negative", "隐藏系统应用");
                                        } else {
                                            diag_add_from_list.setActionButton("negative", "显示系统应用");
                                        }
                                        refreshDiagList();
                                    });
                                    diag_add_from_list.on("positive", () => {
                                        refreshDiag();
                                        diag_add_from_list.dismiss();
                                    });
                                    diag_add_from_list.on("multi_choice", (indices, items) => {
                                        if (!items || items[0] === "\xa0") return;
                                        items.forEach(name => name === "... ..." || tmp_selected_apps.push(name));
                                    });
                                    diag_add_from_list.show();

                                    refreshDiagList();

                                    // tool function(s) //

                                    function refreshDiagList(force_refresh_flag) {
                                        diag_add_from_list.setItems(Array(15).join("... ...,").split(",").slice(0, -1));
                                        diag_add_from_list.setContent("当前可添加的应用总数: ... ...");
                                        diag_add_from_list.setSelectedIndices([]);
                                        threadsx.starts(function () {
                                            let items = $$tool.getAllAppsJointStr(
                                                () => diag_add_from_list.getActionButton("negative") !== "显示系统应用",
                                                [blacklist_selected_apps, tmp_selected_apps],
                                                force_refresh_flag
                                            );
                                            let items_len = items.length;
                                            items = items_len ? items : ["列表为空"];
                                            ui.post(function () {
                                                diag_add_from_list.setSelectedIndices([]);
                                                diag_add_from_list.setItems(items);
                                                diag_add_from_list.setContent("当前可添加的应用总数: " + items_len);
                                            });
                                        });
                                    }
                                });
                                diag.on("negative", () => {
                                    diag.dismiss();
                                    $$view.setListItemsSearchAndSelectView($$tool.getAllAppsJointStr, {
                                        refresh_btn_listener(data_source_updater, data_source_src, view) {
                                            view.list.setDataSource([]);
                                            data_source_updater(() => $$tool.getAllAppsJointStr(true, [], "force_refresh"), "refresh_btn_alter");
                                        },
                                        list_item_listener(item, closeListPage) {
                                            let excluded_data_arrays = [blacklist_selected_apps, tmp_selected_apps];

                                            for (let i = 0, l = excluded_data_arrays.length; i < l; i += 1) {
                                                if (~excluded_data_arrays[i].indexOf(item)) {
                                                    return toast("此项已存在于黑名单列表或待添加列表中");
                                                }
                                            }
                                            closeListPage(item);
                                        },
                                        onFinish(result) {
                                            result && tmp_selected_apps.push(result);
                                            diag.show();
                                            refreshDiag();
                                        }
                                    });
                                });
                                diag.on("positive", () => {
                                    tmp_selected_apps.forEach((n) => {
                                        $$view.updateDataSource(ds_k, "update_unshift", {app_combined_name: n})
                                    });
                                    if (tmp_selected_apps.length) setTimeout(function () {
                                        p_view.getParent()["_list_data"].smoothScrollBy(0, -Math.pow(10, 5));
                                    }, 200);
                                    let restore_btn = _page_view["_text_restore"].getParent();
                                    let _sess = $$cfg.ses[ds_k];
                                    let _sto = $$cfg.sto[ds_k];
                                    equalObjects(_sess, _sto) ? restore_btn.switch_off() : restore_btn.switch_on();
                                    $$save.session(ds_k, _sess);
                                    diag.dismiss();
                                });
                                diag.on("item_select", (idx) => {
                                    let diag_items = diag.getItems().toArray();
                                    if (diag_items.length !== 1 || diag_items[0] !== "\xa0") {
                                        let delete_confirm_diag = dialogsx.builds(["确认移除此项吗", "", 0, "返回", "确认", 1]);
                                        delete_confirm_diag.on("negative", () => delete_confirm_diag.dismiss());
                                        delete_confirm_diag.on("positive", () => {
                                            tmp_selected_apps.splice(idx, 1);
                                            refreshDiag();
                                            delete_confirm_diag.dismiss();
                                        });
                                        delete_confirm_diag.show();
                                    }
                                });
                                diag.show();

                                refreshDiag();

                                // tool function(s) //

                                function refreshDiag() {
                                    let tmp_items_len = tmp_selected_apps.length;
                                    let tmp_items = tmp_items_len ? tmp_selected_apps : ["\xa0"];
                                    diag.setItems(tmp_items);
                                    let content_info = tmp_items_len
                                        ? ("当前选择区应用总数: " + tmp_items_len)
                                        : "从列表中选择并添加应用\n或检索选择并添加应用";
                                    diag.setContent(content_info);
                                }
                            }]
                        ];
                    }
                },
                setInfoInputView(params) {
                    let _inf_ipt_view = null;
                    let _ipt_views_o = {};
                    let {
                        InputType, SpannableString, style, Spanned, SpannedString
                    } = android.text;

                    let _par = params || {};
                    if (!$$und($$ses)) {
                        $$ses.back_btn_consumed = true;
                        $$ses.back_btn_consumed_func = (
                            $$func(_par.back_btn_consumed)
                                ? () => _par.back_btn_consumed()
                                : () => _inf_ipt_view.back_btn.click()
                        );
                    }

                    _initInfIptView();
                    _addIptBoxes();
                    _addBtns();

                    // tool function(s) //

                    function _initInfIptView() {
                        _inf_ipt_view = ui.inflate(
                            <vertical focusable="true" focusableInTouchMode="true"
                                      bg="#ffffff" clickable="true">
                                <vertical h="*" gravity="center" focusableInTouchMode="true"
                                          id="info_input_view_main" clickable="true"/>
                            </vertical>
                        );

                        _inf_ipt_view.setTag("fullscreen_info_input");
                        ui.main.getParent().addView(_inf_ipt_view);
                    }

                    function _addIptBoxes() {
                        _par.input_views.forEach((o) => {
                            let _view = ui.inflate(
                                <vertical>
                                    <card foreground="?selectableItemBackground"
                                          cardBackgroundColor="#546e7a"
                                          cardCornerRadius="2dp" cardElevation="3dp"
                                          w="*" h="50" margin="18 0 18 30">
                                        <input id="input_area" background="?null"
                                               textSize="17" textColor="#eeeeee"
                                               hint="未设置" textColorHint="#e3e3e3"
                                               gravity="center"
                                               selectAllOnFocus="true"/>
                                        <vertical gravity="right|bottom">
                                            <text id="input_text" bg="#66000000"
                                                  textColor="#ffffff" textSize="12sp"
                                                  w="auto" h="auto"
                                                  padding="6 2" layout_gravity="right"
                                                  maxLines="1"/>
                                        </vertical>
                                    </card>
                                </vertical>
                            );
                            let {
                                text: _text, type: _type,
                                hint_text: _hint_t, init: _init,
                            } = o;
                            let {
                                input_area: _ipt_area_view,
                                input_text: _ipt_text_view,
                            } = _view;
                            let _setViewHintText = (_hint_t) => {
                                _setEditTextHint(_ipt_area_view, "-2", _hint_t);
                            };

                            if (_type === "password") {
                                _ipt_area_view.setInputType(
                                    _ipt_area_view.getInputType() | InputType.TYPE_TEXT_VARIATION_PASSWORD
                                );
                                _ipt_area_view.setOnKeyListener(
                                    function onKey(view, keyCode, event) {
                                        let KEYCODE_ENTER = android.view.KeyEvent.KEYCODE_ENTER;
                                        let ACTION_UP = android.view.KeyEvent.ACTION_UP;
                                        let _is_kc_enter = keyCode === KEYCODE_ENTER;
                                        let _is_act_up = event.getAction() === ACTION_UP;
                                        if (_is_kc_enter && _is_act_up) {
                                            _inf_ipt_view.confirm_btn.click();
                                        }
                                        return _is_kc_enter;
                                    }
                                );
                            } else {
                                _ipt_area_view.setSingleLine(true);
                            }

                            if (_type === "account") {
                                _init = $$tool.accountNameConverter(_init, "decrypt");
                            }

                            _ipt_text_view.setText(_text);
                            if (_init) {
                                _ipt_area_view.setText(_init);
                            }
                            _setViewHintText($$func(_hint_t) ? _hint_t() : _hint_t);
                            _view["input_area"].setViewHintText = _setViewHintText;
                            _ipt_area_view.setOnFocusChangeListener(_onFocusChangeLsn);
                            _inf_ipt_view["info_input_view_main"].addView(_view);
                            _ipt_views_o[_text] = _view;

                            // tool function(s) //

                            function _onFocusChangeLsn(view, has_focus) {
                                if (has_focus) {
                                    view.setHint(null)
                                } else {
                                    _setViewHintText(
                                        $$func(_hint_t) ? _hint_t() : _hint_t
                                    );
                                }
                            }

                            function _setEditTextHint(edit_text_view, text_size, text_str) {
                                if (text_size.toString().match(/^[+-]\d+$/)) {
                                    let _scale = context.getResources().getDisplayMetrics().scaledDensity;
                                    text_size = edit_text_view.getTextSize() / _scale + +text_size;
                                }
                                let _span_str = new SpannableString(text_str || edit_text_view.hint);
                                let _abs_size_span = new style.AbsoluteSizeSpan(text_size, true);
                                _span_str.setSpan(
                                    _abs_size_span, 0, _span_str.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                                );
                                edit_text_view.setHint(new SpannedString(_span_str));
                            }
                        });
                        _inf_ipt_view["info_input_view_main"].addView(ui.inflate(
                            <vertical>
                                <frame margin="0 15"/>
                            </vertical>
                        ));
                    }

                    function _addBtns() {
                        let {buttons: _btns} = _par;
                        let {additional: _addn} = _btns;

                        _addn && _addAddnBtns(_addn);

                        let _raw_btn_view = ui.inflate(
                            <vertical>
                                <horizontal id="btn_group" w="auto" layout_gravity="center">
                                    <button id="back_btn" text="返回"
                                            margin="20 0" backgroundTint="#eeeeee"/>
                                    <button id="reserved_btn" text="预留按钮"
                                            margin="-10 0" backgroundTint="#bbdefb" visibility="gone"/>
                                    <button id="confirm_btn" text="确定"
                                            margin="20 0" backgroundTint="#dcedc8"/>
                                </horizontal>
                            </vertical>
                        );

                        if (_btns.reserved_btn) {
                            let {
                                text: _text,
                                onClickListener: _lsn,
                                hint_color: _hint_c,
                            } = _btns.reserved_btn;

                            let _btn_view = _raw_btn_view.reserved_btn;
                            _btn_view.setVisibility(0);

                            if (_text) {
                                _btn_view.setText(_text);
                            }
                            if (_lsn) {
                                _btn_view.on("click", () => {
                                    _lsn(_ipt_views_o, _closeIptPage);
                                });
                            }
                            if (_hint_c) {
                                _btn_view.attr("backgroundTint", _hint_c);
                            }
                        }

                        _inf_ipt_view["info_input_view_main"].addView(_raw_btn_view);
                        _inf_ipt_view.back_btn.on("click", () => _closeIptPage());

                        if (_btns.confirm_btn) {
                            let {
                                text: _text,
                                onClickListener: _lsn,
                            } = _btns.confirm_btn;

                            let _btn_view = _raw_btn_view.confirm_btn;

                            if (_text) {
                                _btn_view.setText(_text);
                            }
                            if (_lsn) {
                                _btn_view.on("click", () => {
                                    _lsn(_ipt_views_o, _closeIptPage);
                                });
                            }
                        } else {
                            _inf_ipt_view.confirm_btn.on("click", _closeIptPage);
                        }

                        // tool function(s) //

                        function _addAddnBtns(addn) {
                            let _addi_btns = $$arr(addn) ? addn.slice() : [addn];
                            let _addi_btn_view = ui.inflate(
                                <vertical>
                                    <horizontal id="addi_button_area" w="auto" layout_gravity="center"/>
                                </vertical>
                            );
                            _addi_btns.forEach((o) => {
                                if (classof(o, "Array")) {
                                    return _addAddnBtns(o);
                                }
                                let _btn_view = ui.inflate(
                                    <button margin="2 0 2 8" backgroundTint="#cfd8dc"/>
                                );
                                let {
                                    text: _text,
                                    hint_color: _hint_c,
                                    onClickListener: _lsn,
                                } = o;
                                if (_text) {
                                    _btn_view.setText(_text);
                                }
                                if (_hint_c) {
                                    _btn_view.attr("backgroundTint", _hint_c);
                                }
                                if (_lsn) {
                                    _btn_view.on("click", () => {
                                        _lsn(_ipt_views_o, _closeIptPage);
                                    });
                                }
                                _addi_btn_view["addi_button_area"].addView(_btn_view);
                            });
                            _inf_ipt_view["info_input_view_main"].addView(_addi_btn_view);
                        }
                    }

                    function _closeIptPage() {
                        if (!$$und($$ses)) {
                            delete $$ses.back_btn_consumed;
                            delete $$ses.back_btn_consumed_func;
                        }
                        let _p = ui.main.getParent();
                        let _c_cnt = _p.getChildCount();
                        for (let i = 0; i < _c_cnt; i += 1) {
                            let _c_view = _p.getChildAt(i);
                            if (_c_view.findViewWithTag("fullscreen_info_input")) {
                                _p.removeView(_c_view);
                            }
                        }
                    }
                },
                setTimePickerView(params) {
                    let time_picker_view = null;
                    let week_checkbox_states = Array(7).join(" ").split(" ").map(() => false);

                    params = params || {};
                    if (!$$und($$ses)) {
                        $$ses.back_btn_consumed = true;
                        $$ses.back_btn_consumed_func = (
                            $$func(params.back_btn_consumed)
                                ? () => params.back_btn_consumed()
                                : () => time_picker_view.back_btn.click()
                        );
                    }

                    let picker_views = params.picker_views;
                    let date_or_time_indices = [];
                    ["date", "time"].forEach((aim_type) => {
                        picker_views.forEach((o, idx) => aim_type === o.type && date_or_time_indices.push(idx));
                    });
                    let date_or_time_len = date_or_time_indices.length;

                    initPickerView();
                    addPickers();
                    addTimeStr();
                    addButtons();

                    ui.main.getParent().addView(time_picker_view);

                    // tool function(s) //

                    function initPickerView() {
                        time_picker_view = ui.inflate(
                            <vertical bg="#ffffff" clickable="true" focusable="true">
                                <scroll>
                                    <vertical id="time_picker_view_main" padding="16"/>
                                </scroll>
                            </vertical>
                        );

                        time_picker_view.setTag("fullscreen_time_picker");
                    }

                    function addPickers() {
                        picker_views.forEach(addPickerView);

                        let type1 = (picker_views[date_or_time_indices[0]] || {}).type;
                        let type2 = (picker_views[date_or_time_indices[1]] || {}).type;
                        time_picker_view.getPickerTimeInfo[0] = date_or_time_len === 2 && type1 !== type2 ? {
                            timestamp() {
                                let f = num => time_picker_view.getPickerTimeInfo[date_or_time_indices[num - 1] + 1];
                                if (type1 === "date") return +new Date(+f(1).yy(), +f(1).MM() - 1, +f(1).dd(), +f(2).hh(), +f(2).mm());
                                if (type2 === "date") return +new Date(+f(2).yy(), +f(2).MM() - 1, +f(2).dd(), +f(1).hh(), +f(1).mm());
                            }, // timestamp from one "date" AND one "time"
                        } : {};

                        // tool function(s) //

                        function addPickerView(o, idx) {
                            if (!o || !o.type) return;

                            let picker_view = ui.inflate(
                                <vertical id="picker_root">
                                    <frame h="1" bg="#acacac" w="*"/>
                                    <frame w="auto" layout_gravity="center" marginTop="15">
                                        <text id="picker_title" text="设置时间" textColor="#01579b" textSize="16sp"/>
                                    </frame>
                                </vertical>
                            );

                            let text_widget = picker_view["picker_title"];
                            let {text, text_color, type, init} = o;
                            text && text_widget.setText(text);
                            text_color && text_widget.setTextColor(colors.parseColor(text_color));

                            if (type === "time") {
                                picker_view["picker_root"].addView(ui.inflate(
                                    <vertical>
                                        <timepicker h="160" id="picker" timePickerMode="spinner" marginTop="-10"/>
                                    </vertical>
                                ));
                                picker_view["picker"].setIs24HourView(java.lang.Boolean.TRUE);
                                if (init) {
                                    if ($$str(init)) {
                                        init = init.split(/\D+/);
                                    }
                                    if ($$num(init) && init.toString().match(/^\d{13}$/)) {
                                        let date = new Date(init);
                                        init = [date.getHours(), date.getMinutes()];
                                    }
                                    if ($$arr(init)) {
                                        picker_view["picker"].setHour(init[0]);
                                        picker_view["picker"].setMinute(init[1]);
                                    }
                                }
                            } else if (type === "date") {
                                picker_view["picker_root"].addView(ui.inflate(
                                    <vertical>
                                        <datepicker h="160" id="picker" datePickerMode="spinner" marginTop="-10"/>
                                    </vertical>
                                ));
                                let date;
                                if (init > 0 && init.toString().match(/^\d{13}$/)) {
                                    // eg. 1564483851219 - timestamp
                                    date = new Date(init);
                                } else if (Array.isArray(init)) {
                                    // eg. [2018, 7, 8] - number[]
                                    date = {
                                        getFullYear: () => init[0],
                                        getMonth: () => init[1],
                                        getDate: () => init[2],
                                    }
                                } else {
                                    date = new Date();
                                }
                                picker_view["picker"].init(
                                    date.getFullYear(), date.getMonth(), date.getDate(),
                                    new android.widget.DatePicker.OnDateChangedListener({
                                        onDateChanged: setTimeStr,
                                    })
                                );
                            } else if (type === "week") {
                                let weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                let checkbox_views = ui.inflate(
                                    <vertical id="checkboxes">
                                        <horizontal margin="0 15 0 5" layout_gravity="center" w="auto">
                                            <checkbox id="week_1" marginRight="13"/>
                                            <checkbox id="week_2"/>
                                        </horizontal>
                                        <horizontal margin="0 5" layout_gravity="center" w="auto">
                                            <checkbox id="week_3" marginRight="13"/>
                                            <checkbox id="week_4"/>
                                        </horizontal>
                                        <horizontal margin="0 5 0 15" layout_gravity="center" w="auto">
                                            <checkbox id="week_5" marginRight="13"/>
                                            <checkbox id="week_6" marginRight="13"/>
                                            <checkbox id="week_0"/>
                                        </horizontal>
                                    </vertical>
                                );

                                for (let i = 0; i < 7; i += 1) {
                                    checkbox_views["week_" + i].setText(weeks[i]);
                                    checkbox_views["week_" + i].on("check", (checked, view) => {
                                        week_checkbox_states[weeks.indexOf(view.text)] = checked;
                                        threadsx.starts(function () {
                                            let max_try_times = 20;
                                            let interval = setInterval(function () {
                                                if (!max_try_times--) return clearInterval(interval);
                                                try {
                                                    ui.post(setTimeStr);
                                                    clearInterval(interval);
                                                } catch (e) {
                                                }
                                            }, 100);
                                        });
                                    });
                                }

                                picker_view["picker_root"].addView(checkbox_views);

                                if (init) {
                                    if ($$num(init)) {
                                        init = timedTaskTimeFlagConverter(init);
                                    }
                                    init.forEach(n => picker_view["checkboxes"]["week_" + n].setChecked(true));
                                }
                            }

                            time_picker_view.getPickerTimeInfo = time_picker_view.getPickerTimeInfo || {};
                            let picker_widget = picker_view["picker"];
                            if (type === "time") {
                                picker_widget.setOnTimeChangedListener(setTimeStr);
                            }

                            let {yy, MM, dd, hh, mm} = {
                                yy() {
                                    try {
                                        return picker_widget.getYear();
                                    } catch (e) {
                                        return new Date().getFullYear();
                                    }
                                },
                                MM: () => padZero((() => {
                                    try {
                                        return picker_widget.getMonth();
                                    } catch (e) {
                                        return new Date().getMonth();
                                    }
                                })() + 1),
                                dd: () => padZero((() => {
                                    try {
                                        return picker_widget.getDayOfMonth();
                                    } catch (e) {
                                        return new Date().getDate();
                                    }
                                })()),
                                hh() {
                                    try {
                                        return padZero(picker_widget.getCurrentHour());
                                    } catch (e) {
                                        return null;
                                    }
                                },
                                mm() {
                                    try {
                                        return padZero(picker_widget.getCurrentMinute());
                                    } catch (e) {
                                        return null;
                                    }
                                },
                            };
                            let padZero = num => ("0" + num).slice(-2);
                            let parseDaysOfWeek = () => {
                                let result = [];
                                week_checkbox_states.forEach((bool, idx) => bool && result.push(idx));
                                return result;
                            };

                            time_picker_view.getPickerTimeInfo[idx + 1] = {
                                yy: yy,
                                MM: MM,
                                dd: dd,
                                hh: hh,
                                mm: mm,
                                default() {
                                    if (type === "date") return yy() + "年" + MM() + "月" + dd() + "日";
                                    if (type === "time") return hh() + ":" + mm();
                                    if (type === "week") {
                                        let parsed = parseDaysOfWeek();
                                        if (!parsed.length) return "";
                                        return "  [ " + parsed.map(x => x === 0 ? 7 : x).sort().join(", ") + " ]";
                                    }
                                },
                                timestamp: () => +new Date(+yy(), +MM(), +dd(), +hh(), +mm()),
                                daysOfWeek: parseDaysOfWeek,
                            };

                            time_picker_view["time_picker_view_main"].addView(picker_view);
                        }
                    }

                    function addTimeStr() {
                        time_picker_view["time_picker_view_main"].addView(ui.inflate(
                            <vertical>
                                <frame h="1" bg="#acacac" w="*"/>
                                <frame w="auto" layout_gravity="center" margin="0 30 0 25">
                                    <text id="time_str" text="" textColor="#bf360c" textSize="15sp" gravity="center"/>
                                </frame>
                            </vertical>
                        ));

                        setTimeStr();
                    }

                    function setTimeStr() {
                        let {picker_views} = params || [];
                        let {prefix, format, suffix, middle} = params.time_str || {};
                        let getTimeInfoFromPicker = num => time_picker_view.getPickerTimeInfo[num];

                        prefix = prefix && prefix.replace(/: ?/, "") + ": " || "";

                        if ($$func(middle)) middle = middle(getTimeInfoFromPicker);
                        middle = middle || formatTimeStr();

                        if ($$func(suffix)) suffix = suffix(getTimeInfoFromPicker);
                        suffix = suffix && suffix.replace(/^ */, " ") || "";

                        time_picker_view.time_str.setText(prefix + middle + suffix);

                        // tool function(s) //

                        function formatTimeStr() {
                            if (!format) {
                                let len = date_or_time_indices.length;
                                let str = getTimeInfoFromPicker(date_or_time_indices[0] + 1).default();
                                if (len === 2) {
                                    str += (
                                        picker_views[date_or_time_indices[0]].type === picker_views[date_or_time_indices[1]].type ? " - " : " "
                                    ) + getTimeInfoFromPicker(date_or_time_indices[1] + 1).default();
                                }
                                picker_views.forEach((o, idx) => {
                                    if (o.type === "week") str += getTimeInfoFromPicker(idx + 1).default();
                                });
                                return str;
                            }
                            return format.replace(/(([yMdhm]{2})([12]))/g, ($0, $1, $2, $3) => getTimeInfoFromPicker($3)[$2]());
                        }
                    }

                    function addButtons() {
                        let getTimeInfoFromPicker = num => time_picker_view.getPickerTimeInfo[num];
                        let btn_view = ui.inflate(
                            <vertical>
                                <horizontal id="btn_group" w="auto" layout_gravity="center">
                                    <button id="back_btn" text="返回"
                                            margin="20 0" backgroundTint="#eeeeee"/>
                                    <button id="reserved_btn" text="预留按钮"
                                            margin="-10 0" backgroundTint="#fff9c4" visibility="gone"/>
                                    <button id="confirm_btn" text="确认选择"
                                            margin="20 0" backgroundTint="#dcedc8"/>
                                </horizontal>
                            </vertical>
                        );
                        if ((params.buttons || {}).reserved_btn) {
                            let {text, onClickListener} = params.buttons.reserved_btn;
                            let reserved_btn_view = btn_view.reserved_btn;
                            reserved_btn_view.setVisibility(0);
                            text && reserved_btn_view.setText(text);
                            onClickListener && reserved_btn_view.on("click", () => onClickListener(getTimeInfoFromPicker, closeTimePickerPage));
                        }
                        time_picker_view["time_picker_view_main"].addView(btn_view);

                        if ((params.buttons || {}).back_btn) {
                            let {text, onClickListener} = params.buttons.back_btn;
                            let confirm_btn_view = btn_view.back_btn;
                            text && confirm_btn_view.setText(text);
                            onClickListener && confirm_btn_view.on("click", () => onClickListener(getTimeInfoFromPicker, closeTimePickerPage));
                        } else {
                            time_picker_view.back_btn.on("click", () => closeTimePickerPage());
                        }

                        if ((params.buttons || {}).confirm_btn) {
                            let {text, onClickListener} = params.buttons.confirm_btn;
                            let confirm_btn_view = btn_view.confirm_btn;
                            text && confirm_btn_view.setText(text);
                            onClickListener && confirm_btn_view.on("click", () => {
                                onClickListener(getTimeInfoFromPicker, closeTimePickerPage);
                            });
                        } else {
                            time_picker_view.confirm_btn.on("click", () => closeTimePickerPage("picker_view"));
                        }
                    }

                    function closeTimePickerPage(ret) {
                        if (!$$und($$ses)) {
                            delete $$ses.back_btn_consumed;
                            delete $$ses.back_btn_consumed_func;
                        }

                        let parent = ui.main.getParent();
                        let child_count = parent.getChildCount();
                        for (let i = 0; i < child_count; i += 1) {
                            let child_view = parent.getChildAt(i);
                            if (child_view.findViewWithTag("fullscreen_time_picker")) parent.removeView(child_view);
                        }

                        if (params.onFinish) {
                            params.onFinish(ret === "picker_view"
                                ? time_picker_view.time_str.getText().toString()
                                : ret
                            );
                        }
                    }
                },
                setListItemsSearchAndSelectView(data_source_src, params) {
                    params = params || {};
                    let {empty_list_prompt, refresh_btn_listener, list_item_listener} = params;

                    let search_view = null;

                    if (!$$und($$ses)) {
                        $$ses.back_btn_consumed = true;
                        $$ses.back_btn_consumed_func = ($$func(params.back_btn_consumed)
                            ? () => params.back_btn_consumed()
                            : () => search_view["back_btn"].click());
                    }

                    search_view = ui.inflate(
                        <vertical focusable="true" focusableInTouchMode="true" bg="#ffffff" clickable="true">
                            <horizontal margin="16 8 0 4">
                                <input id="input" lines="1" layout_weight="1" hint="列表加载中..."
                                       textColor="black" textSize="15sp" marginTop="3"/>
                                <horizontal margin="0 0 8 0">
                                    <button id="refresh_btn" text="刷新"
                                            style="Widget.AppCompat.Button.Borderless.Colored" w="55"/>
                                    <button id="back_btn" text="返回"
                                            style="Widget.AppCompat.Button.Borderless.Colored" w="55"/>
                                </horizontal>
                            </horizontal>
                            <grid id="list" spanCount="1" margin="16 0" border="1">
                                <text text="{{this}}" padding="4 5" margin="2 5" bg="#eeeeeef8"/>
                            </grid>
                        </vertical>
                    );

                    search_view.setTag("fullscreen_list_items_search_and_select");

                    let data_source_ori = [];
                    search_view["list"].setDataSource(data_source_ori);

                    updateListData(data_source_src);

                    search_view["input"].setOnKeyListener(
                        function onKey(view, keyCode) {
                            return keyCode === android.view.KeyEvent.KEYCODE_ENTER; // disable ENTER_KEY
                        }
                    );

                    let thread_calc_and_set_input = null;
                    search_view["input"].addTextChangedListener(
                        new android.text.TextWatcher({afterTextChanged: afterTextChanged})
                    );

                    if ($$func(refresh_btn_listener)) {
                        search_view["refresh_btn"].on("click", () => {
                            refresh_btn_listener(updateListData, data_source_src, search_view);
                        });
                    } else {
                        search_view["refresh_btn"].setVisibility(8);
                    }
                    search_view["back_btn"].on("click", () => {
                        $$view.collapseSoftKeyboard(search_view["input"]);
                        closeListPage();
                    });
                    search_view["list"].on("item_click", (item) => {
                        if ($$func(list_item_listener)) {
                            list_item_listener(item, closeListPage);
                        }
                    });

                    ui.main.getParent().addView(search_view);

                    // tool function(s) //

                    function afterTextChanged(input_text) {
                        if (thread_calc_and_set_input && thread_calc_and_set_input.isAlive()) {
                            thread_calc_and_set_input.interrupt();
                        }
                        thread_calc_and_set_input = threadsx.starts(function () {
                            let data_source = [];
                            if (input_text) {
                                data_source_ori.forEach((name) => {
                                    name = name.toString();
                                    input_text = input_text.toString();
                                    if (input_text.slice(0, 8).toUpperCase() === "#REGEXP#") {
                                        try {
                                            if (name.match(new RegExp(input_text.slice(8)))) data_source.push(name);
                                        } catch (e) {
                                            // unterminated char may cause a SyntaxError when typing
                                        }
                                    } else {
                                        let _name = name.toLowerCase();
                                        let _input = input_text.toLowerCase();
                                        if (~_name.indexOf(_input)) data_source.push(name);
                                    }
                                })
                            }
                            ui.post(() => search_view["list"].setDataSource(input_text ? data_source : data_source_ori));
                        });
                    }

                    function updateListData(data_source, refresh_btn_text_alter_flag) {
                        $$ses.list_refreshing_counter = $$ses.list_refreshing_counter || 0;
                        if ($$ses.list_refreshing_counter) return;
                        threadsx.starts(function () {
                            refresh_btn_text_alter_flag && search_view["refresh_btn"].setText("...");
                            $$ses.list_refreshing_counter += 1;
                            let _data_source = $$func(data_source) ? data_source() : data_source;
                            if (!_data_source.length && empty_list_prompt) {
                                empty_list_prompt = false;
                                dialogsx.builds([
                                    "空列表提示", '当前列表为空\n可能需要点击"刷新"按钮\n刷新后列表将自动更新',
                                    0, 0, "确定", 1
                                ]).on("positive", diag => diag.dismiss()).show();
                            }
                            ui.post(() => {
                                search_view["list"].setDataSource(data_source_ori = _data_source);
                                search_view["input"].setHint(_data_source.length ? "在此键入并筛选列表内容" : "列表为空");
                                refresh_btn_text_alter_flag && search_view["refresh_btn"].setText("刷新");
                                $$ses.list_refreshing_counter -= 1;
                            });
                        });
                    }

                    function closeListPage(result) {
                        if (!$$und($$ses)) {
                            delete $$ses.back_btn_consumed;
                            delete $$ses.back_btn_consumed_func;
                        }

                        let parent = ui.main.getParent();
                        let child_count = parent.getChildCount();
                        for (let i = 0; i < child_count; i += 1) {
                            let child_view = parent.getChildAt(i);
                            if (child_view.findViewWithTag("fullscreen_list_items_search_and_select")) parent.removeView(child_view);
                        }

                        let {onFinish} = params;
                        $$func(onFinish) && onFinish(result);
                    }
                },
                setTimersUninterruptedCheckAreasPageButtons(p_view, ds_k) {
                    return $$view.setButtons(p_view, ds_k,
                        ["restore", "RESTORE", "OFF", (btn_view) => {
                            let list_data_backup = $$cfg.sto[ds_k];
                            if (equalObjects($$cfg.ses[ds_k], list_data_backup)) return;
                            let diag = dialogsx.builds([
                                "恢复列表数据", "restore_original_list_data",
                                ["查看恢复列表", "hint_btn_bright_color"], "返回", "确定", 1,
                            ]);
                            diag.on("neutral", () => {
                                let diag_restore_list = dialogsx.builds(["查看恢复列表", "", 0, 0, "返回", 1], {
                                    content: "共计 " + list_data_backup.length + " 项",
                                    items: (function () {
                                        let split_line = "";
                                        for (let i = 0; i < 18; i += 1) split_line += "- ";
                                        let items = [split_line];
                                        list_data_backup.forEach((o) => {
                                            items.push("区间: " + $$tool.timeSectionToStr(o.section));
                                            items.push("间隔: " + o.interval + "分钟");
                                            items.push(split_line);
                                        });
                                        return items.length > 1 ? items : ["列表为空"];
                                    })(),
                                });
                                diag_restore_list.on("positive", () => diag_restore_list.dismiss());
                                diag_restore_list.show();
                            });
                            diag.on("negative", () => diag.dismiss());
                            diag.on("positive", () => {
                                diag.dismiss();
                                $$view.updateDataSource(ds_k, "splice", 0);

                                let deleted_items_idx = ds_k + "_deleted_items_idx";
                                let deleted_items_idx_count = ds_k + "_deleted_items_idx_count";
                                $$ses[deleted_items_idx] = {};
                                $$ses[deleted_items_idx_count] = 0;
                                let remove_btn = p_view["_text_remove"].getParent();
                                remove_btn.switch_off();
                                btn_view.switch_off();
                                list_data_backup.forEach(v => $$view.updateDataSource(ds_k, "update", v));
                                let _page_view = $$view.findViewByTag(p_view, "list_page_view").getParent();
                                _page_view["_check_all"].setChecked(true);
                                _page_view["_check_all"].setChecked(false);
                            });
                            diag.show();
                        }],
                        ["delete_forever", "REMOVE", "OFF", (btn_view) => {
                            let deleted_items_idx = ds_k + "_deleted_items_idx";
                            let deleted_items_idx_count = ds_k + "_deleted_items_idx_count";

                            if (!$$ses[deleted_items_idx_count]) return;

                            let thread_items_stable = threadsx.starts(function () {
                                let old_count = undefined;
                                while ($$ses[deleted_items_idx_count] !== old_count) {
                                    old_count = $$ses[deleted_items_idx_count];
                                    sleep(50);
                                }
                            });
                            thread_items_stable.join(800);

                            let deleted_items_idx_keys = Object.keys($$ses[deleted_items_idx]);
                            deleted_items_idx_keys.sort((a, b) => +a < +b ? 1 : -1).forEach(idx => $$ses[deleted_items_idx][idx] && $$ses[ds_k].splice(idx, 1));
                            $$view.updateDataSource(ds_k, "rewrite");
                            $$ses[deleted_items_idx] = {};
                            $$ses[deleted_items_idx_count] = 0;

                            let restore_btn = p_view["_text_restore"].getParent();
                            if (!equalObjects($$cfg.ses[ds_k], $$cfg.sto[ds_k])) restore_btn.switch_on();
                            else restore_btn.switch_off();
                            let _page_view = $$view.findViewByTag(p_view, "list_page_view").getParent();
                            _page_view["_check_all"].setChecked(true);
                            _page_view["_check_all"].setChecked(false);
                            btn_view.switch_off();
                        }],
                        ["add_circle", "NEW", "ON", () => {
                            let _diag = dialogsx.builds([
                                "添加延时接力数据", "设置新的时间区间及间隔\n点击可编辑对应项数据",
                                0, "放弃添加", "确认添加", 1,
                            ], {items: ["\xa0"]});

                            refreshItems();

                            _diag.on("positive", () => {
                                let sectionStringTransform = () => {
                                    let arr = $$cfg.list_heads[ds_k];
                                    for (let i = 0, l = arr.length; i < l; i += 1) {
                                        let o = arr[i];
                                        if ("section" in o) {
                                            return o.stringTransform;
                                        }
                                    }
                                };
                                let _items = _diag.getItems().toArray();
                                let [_sect, _itv] = _items.map(x => x.split(": ")[1]);
                                $$view.updateDataSource(ds_k, "update", {
                                    section: sectionStringTransform().backward(_sect),
                                    interval: +_itv,
                                });
                                setTimeout(function () {
                                    p_view.getParent()["_list_data"].smoothScrollBy(0, -Math.pow(10, 5));
                                }, 200);
                                let restore_btn = $$ses[ds_k + "_btn_restore"];
                                equalObjects($$cfg.ses[ds_k], $$cfg.sto[ds_k]) ? restore_btn.switch_off() : restore_btn.switch_on();
                                $$save.session(ds_k, $$cfg.ses[ds_k]);
                                _diag.dismiss();
                            });
                            _diag.on("negative", () => _diag.dismiss());
                            _diag.on("item_select", (idx, list_item) => {
                                let _pref = list_item.split(": ")[0];
                                let _cnt = list_item.split(": ")[1];

                                if (_pref === "区间") {
                                    _diag.dismiss();
                                    $$view.setTimePickerView({
                                        picker_views: [
                                            {type: "time", text: "设置开始时间", init: $$tool.timeStrToSection(_cnt)[0]},
                                            {type: "time", text: "设置结束时间", init: $$tool.timeStrToSection(_cnt)[1]},
                                        ],
                                        time_str: {
                                            suffix(getStrFunc) {
                                                if (getStrFunc(2).default() <= getStrFunc(1).default()) return "(+1)";
                                            },
                                        },
                                        onFinish(ret) {
                                            _diag.show();
                                            ret && refreshItems(_pref, ret);
                                        },
                                    });
                                }

                                if (_pref === "间隔") {
                                    dialogsx
                                        .builds([
                                            "修改" + _pref, "",
                                            0, "返回", "确认修改", 1
                                        ], {
                                            inputHint: "{x|1<=x<=600,x∈N}",
                                            inputPrefill: _cnt.toString(),
                                        })
                                        .on("negative", (d) => {
                                            d.dismiss();
                                        })
                                        .on("positive", (d) => {
                                            let _n = $$view.diag.checkInputRange(d, 1, 600);
                                            if (_n) {
                                                refreshItems(_pref, Math.trunc(+_n));
                                                d.dismiss();
                                            }
                                        })
                                        .show();
                                }
                            });
                            _diag.show();

                            // tool function(s) //

                            function refreshItems(prefix, value) {
                                let value_obj = {};
                                let key_map = {
                                    0: "区间",
                                    1: "间隔",
                                };
                                if (!prefix && !value) {
                                    value_obj = {};
                                    value_obj[key_map[0]] = "06:30 - 00:00 (+1)";
                                    value_obj[key_map[1]] = 60;
                                } else {
                                    _diag.getItems().toArray().forEach((value, idx) => value_obj[key_map[idx]] = value.split(": ")[1])
                                }
                                if (prefix && (prefix in value_obj)) value_obj[prefix] = value;
                                let items = [];
                                Object.keys(value_obj).forEach(key => items.push(key + ": " + value_obj[key]));
                                _diag.setItems(items);
                            }
                        }]
                    );
                },
                setStatPageButtons(p_view, ds_k) {
                    return $$view.setButtons(p_view, ds_k,
                        ["loop", "FRI_LS", "ON", () => {
                            $$tool.refreshFriLstByLaunchAlipay({
                                dialog_prompt: true,
                                onResume() {
                                    $$view.statListDataSource("SET");
                                },
                            });
                        }], ["filter_list", "FILTER", "ON", () => {
                            let _ds_k = "stat_list_show_zero";
                            let _show_zero = $$ses[_ds_k];
                            let _sess_sel_idx = $$und(_show_zero) ? $$cfg.ses[_ds_k] : _show_zero;
                            dialogsx
                                .builds([
                                    "收取值筛选", "",
                                    ["设为默认值", "hint_btn_bright_color"], "返回", "确定", 1
                                ], {
                                    items: _getItems($$sto.cfg.get("config", {})[_ds_k]),
                                    itemsSelectMode: "single",
                                    itemsSelectedIndex: _sess_sel_idx,
                                })
                                .on("neutral", (d) => {
                                    let _sel_i = d.getSelectedIndex();
                                    let _dat = {};
                                    _dat[_ds_k] = _sel_i;
                                    $$sto.cfg.put("config", _dat);
                                    d.setItems(_getItems(_sel_i));
                                })
                                .on("negative", (d) => {
                                    d.dismiss();
                                })
                                .on("positive", (d) => {
                                    $$ses.stat_list_show_zero = d.getSelectedIndex();
                                    $$view.statListDataSource("SET");
                                    d.dismiss();
                                })
                                .show();

                            // tool function(s) //

                            function _getItems(idx) {
                                return ["显示全部收取值", "不显示零收取值", "仅显示零收取值"]
                                    .map((v, i) => v + (i === idx ? " (默认值)" : ""));
                            }
                        }], ["date_range", "RANGE", "ON", () => {
                            let _ds_k = "stat_list_date_range";
                            let _range = $$ses[_ds_k];
                            let _sess_sel_idx = $$und(_range) ? $$cfg.ses[_ds_k] : _range;
                            let _positive_func = d => _posDefault(d);
                            let _diag = dialogsx
                                .builds([
                                    "日期统计范围", "",
                                    ["设为默认值", "hint_btn_bright_color"], "返回", "确定", 1
                                ], {
                                    items: _getItems({def: $$sto.cfg.get("config", {})[_ds_k]}),
                                    itemsSelectMode: "single",
                                    itemsSelectedIndex: _sess_sel_idx,
                                })
                                .on("neutral", (d) => {
                                    let _sel_i = d.getSelectedIndex();
                                    if (!_sel_i || _sel_i < 1 || !$$num(_sel_i)) {
                                        _sel_i = 0;
                                    }
                                    let _dat = {};
                                    _dat[_ds_k] = _sel_i;
                                    $$sto.cfg.put("config", _dat);
                                    d.setItems(_getItems({def: _sel_i}));
                                })
                                .on("negative", (d) => {
                                    _thd.interrupt();
                                    d.dismiss();
                                })
                                .on("positive", (d) => {
                                    _positive_func(d);
                                })
                                .show();

                            let _thd = threadsx.starts(function () {
                                while (1) {
                                    if (_diag.getSelectedIndex() === 1) {
                                        if (_diag.getActionButton("positive") === "确定") {
                                            _diag.setActionButton("positive", "设置范围");
                                            _diag.setActionButton("neutral", null);
                                            _positive_func = _posSetRange;
                                        }
                                    } else {
                                        if (_diag.getActionButton("positive") === "设置范围") {
                                            _diag.setActionButton("positive", "确定");
                                            _diag.setActionButton("neutral", "设为默认值");
                                            _positive_func = _posDefault;
                                        }
                                    }
                                    sleep(120);
                                }
                            });

                            // tool function(s) //

                            function _getItems(opt) {
                                let _opt = opt || {};
                                let _def_idx = _opt.def;
                                let _sess_idx = _opt.sel;

                                let _now = new Date();
                                let _yy = _now.getFullYear();
                                let _mm = _now.getMonth();
                                let _dd = _now.getDate();
                                let _day = _now.getDay() || 7;
                                let _pad = x => x < 10 ? "0" + x : x;
                                let _today_ts = +new Date(_yy, _mm, _dd);
                                let _today_sec = Math.trunc(_today_ts / 1e3);
                                let _1_day_sec = 24 * 3.6e3;
                                let _1_day_ts = _1_day_sec * 1e3;
                                let _today_max_sec = _today_sec + _1_day_sec - 1;
                                let _items = [
                                    (() => {
                                        let _du = _today_ts + _1_day_ts - $$ses.list_data_min_ts;
                                        let _days = Math.ceil(_du / _1_day_ts);
                                        _days = isInfinite(_days) ? 0 : _days;
                                        return {
                                            item: "全部 (共" + _days + "天)",
                                            range: [0, _today_max_sec],
                                        };
                                    })(), {
                                        item: "自定义范围",
                                    }, {
                                        item: "今天 (" + _pad(_mm + 1) + "/" + _pad(_dd) + ")",
                                        range: [_today_sec, _today_max_sec],
                                    }, (() => {
                                        let _date = new Date(+_now - _1_day_ts);
                                        let _mm = _date.getMonth();
                                        let _dd = _date.getDate();
                                        return {
                                            item: "昨天 (" + _pad(_mm + 1) + "/" + _pad(_dd) + ")",
                                            range: [_today_sec - _1_day_sec, _today_sec - 1],
                                        };
                                    })(), {
                                        item: "本周 (共" + _day + "天)",
                                        range: [_today_sec - _1_day_sec * (_day - 1), _today_max_sec],
                                    }, (() => {
                                        let _date = new Date(+_now - _1_day_ts * 6);
                                        let _mm = _date.getMonth();
                                        let _dd = _date.getDate();
                                        return {
                                            item: "近7天 (自" + _pad(_mm + 1) + "/" + _pad(_dd) + "至今)",
                                            range: [_today_sec - _1_day_sec * 6, _today_max_sec],
                                        };
                                    })(), {
                                        item: "本月 (共" + _dd + "天)",
                                        range: [_today_sec - _1_day_sec * (_dd - 1), _today_max_sec],
                                    }, (() => {
                                        let _date = new Date(+_now - _1_day_ts * 29);
                                        let _mm = _date.getMonth();
                                        let _dd = _date.getDate();
                                        return {
                                            item: "近30天 (自" + _pad(_mm + 1) + "/" + _pad(_dd) + "至今)",
                                            range: [_today_sec - _1_day_sec * 29, _today_max_sec],
                                        };
                                    })()
                                ];
                                if (!$$und(_def_idx)) {
                                    return _items.map((o, i) => {
                                        let v = o.item;
                                        if (i === _def_idx) {
                                            return v + " (默认值)";
                                        }
                                        return v;
                                    });
                                }
                                if (!$$und(_sess_idx)) {
                                    return _items[_sess_idx].range;
                                }
                            }

                            function _posSetRange(d) {
                                d.dismiss();
                                let _sess_range = $$ses.stat_list_date_range_data || [0, 1e10 - 1];
                                $$view.setTimePickerView({
                                    picker_views: [
                                        {type: "date", text: "设置开始日期", init: _sess_range[0] * 1e3},
                                        {type: "date", text: "设置结束日期", init: _sess_range[1] * 1e3},
                                    ],
                                    buttons: {
                                        back_btn: {
                                            onClickListener(getTimeInfoFromPicker, closeTimePickerPage) {
                                                d.show();
                                                closeTimePickerPage();
                                            },
                                        },
                                    },
                                    onFinish(ret) {
                                        if (ret) {
                                            $$ses.stat_list_date_range = d.getSelectedIndex();
                                            $$ses.stat_list_date_range_data = $$tool
                                                .timeStrToSection(ret).map((str, idx) => {
                                                    let [yy, mm, dd] = str.split(/\D+/);
                                                    // both "ss" are seconds
                                                    let _ss1 = +new Date(yy, mm - 1, dd) / 1e3 >>> 0;
                                                    let _ss2 = idx && 24 * 3.6e6 / 1e3 - 1;
                                                    return _ss1 + _ss2;
                                                });
                                            $$view.statListDataSource("SET");
                                        }
                                    },
                                });
                            }

                            function _posDefault(d) {
                                let _idx = d.getSelectedIndex();
                                $$ses.stat_list_date_range = _idx;
                                $$ses.stat_list_date_range_data = _getItems({sel: _idx});
                                $$view.statListDataSource("SET");
                                _thd.interrupt();
                                d.dismiss();
                            }
                        }]
                    );
                },
                setTimersControlPanelPageButtons(p_view, data_source_key_name, wizardFunc) {
                    return $$view.setButtons(p_view, data_source_key_name,
                        ["add_circle", "NEW", "ON", () => wizardFunc("add")]
                    );
                },
                checkPageState() {
                    let _check = $$view.page.last_rolling.checkPageState;
                    return typeof _check === "function" ? _check() : true;
                },
                /**
                 * @param {android.view.View} view
                 * @param {function|string|string[]} [dependencies]
                 */
                checkDependency(view, dependencies) {
                    let _deps = dependencies || [];
                    (() => {
                        if ($$func(_deps)) {
                            return _deps.call(null);
                        }
                        if (!classof(_deps, "Array")) {
                            _deps = [_deps];
                        }
                        return _deps.some((dep) => $$cfg.ses[dep]);
                    })() ? setViewEnabled(view) : setViewDisabled(view, _deps);


                    // tool function(s) //

                    function setViewDisabled(view, dependencies) {
                        let hint_text = "";
                        if (classof(dependencies, "Array")) {
                            dependencies.forEach(conj_text => {
                                hint_text += $$ses.title[conj_text] + " ";
                            });
                            if (dependencies.length > 1) {
                                hint_text += "均";
                            }
                            hint_text = "不可用  [ " + hint_text + "未开启 ]";
                        }
                        view.setHintText(hint_text);
                        view.setChevronVisibility(8);
                        view.setTitleTextColor("#919191");
                        view.setHintTextColor("#b0b0b0");
                        let next_page = view.getNextPage();
                        if (next_page) {
                            view.next_page_backup = next_page;
                            view.setNextPage(null);
                        }
                    }

                    function setViewEnabled(view) {
                        view.setChevronVisibility(0);
                        view.setTitleTextColor("#111111");
                        view.setHintTextColor("#888888");
                        let {next_page_backup} = view;
                        next_page_backup && view.setNextPage(next_page_backup);
                    }
                },
                collapseSoftKeyboard(view) {
                    context.getSystemService(
                        context.INPUT_METHOD_SERVICE
                    ).hideSoftInputFromWindow(
                        view.getWindowToken(), 0
                    );
                },
                commonItemBindCheckboxClickListener(checkbox_view, item_holder) {
                    let {data_source_key_name: _ds_k} = this;
                    let remove_btn_view = $$ses[_ds_k + "_btn_remove"];
                    let item = item_holder.item;
                    let aim_checked = !item.checked;
                    item.checked = aim_checked;
                    let idx = item_holder.position;
                    let deleted_items_idx = _ds_k + "_deleted_items_idx";
                    let deleted_items_idx_count = _ds_k + "_deleted_items_idx_count";
                    $$ses[deleted_items_idx] = $$ses[deleted_items_idx] || {};
                    $$ses[deleted_items_idx_count] = $$ses[deleted_items_idx_count] || 0;
                    $$ses[deleted_items_idx][idx] = aim_checked;
                    aim_checked ? $$ses[deleted_items_idx_count]++ : $$ses[deleted_items_idx_count]--;
                    $$ses[deleted_items_idx_count] ? remove_btn_view.switch_on() : remove_btn_view.switch_off();
                    let _sess_len = $$cfg.ses[_ds_k].length;
                    this.view["_check_all"].setChecked($$ses[deleted_items_idx_count] === _sess_len);
                },
                findViewByTag(view, tag) {
                    if (!tag) {
                        return;
                    }
                    let _len = view.getChildCount();
                    for (let i = 0; i < _len; i += 1) {
                        let _child = view.getChildAt(i);
                        if (_child.findViewWithTag(tag)) {
                            let _grandchild = $$view.findViewByTag(_child, tag);
                            return _grandchild || _child;
                        }
                    }
                    return view;
                },
                updateDataSource(ds_k, operation, data, options) {
                    let _opt = options || {};
                    let _quiet = _opt.is_quiet;
                    let _sync_ds_k = _opt.sync_data_source;
                    let _write_back = _opt.write_back === undefined ? true : !!_opt.write_back;

                    if (operation.match(/init/)) {
                        let _h_o_arr = $$cfg.list_heads[ds_k];
                        let _h_o_len = _h_o_arr.length;
                        let _ori_ds = data || $$cfg.ses[ds_k] || $$ses[ds_k];
                        _ori_ds = $$func(_ori_ds) ? _ori_ds() : _ori_ds;
                        for (let i = 0; i < _h_o_len; i += 1) {
                            let _h_o = _h_o_arr[i];
                            let _sort = _h_o.sort;
                            if (_sort) {
                                let _h_name = _sort.head_name;
                                let _type = _sort.type || "alphabet";
                                let _factor = _sort.flag > 0 ? 1 : -1;
                                let _sorter = (a, b) => {
                                    let _cvt = x => _type === "number" ? +x : x;
                                    let _a = _cvt(a[_h_name]);
                                    let _b = _cvt(b[_h_name]);
                                    if (_a === _b) {
                                        return 0;
                                    }
                                    return _a > _b ? _factor : -_factor;
                                };
                                _ori_ds.sort(_sorter);
                                break;
                            }
                        }
                        if (operation.match(/re/)) {
                            if (!$$ses[ds_k]) {
                                $$ses[ds_k] = [];
                            }
                            $$ses[ds_k].splice(0);
                            return _ori_ds.map(_magicData).forEach(v => $$ses[ds_k].push(v));
                        }
                        return $$ses[ds_k] = _ori_ds.map(_magicData);
                    }

                    if (operation === "rewrite") {
                        return _writeBack();
                    }

                    if (operation.match(/delete|splice/)) {
                        let _data_params = classof(data, "Array") ? data.slice() : [data];
                        if (_data_params.length > 2 && !_data_params[2]["list_item_name_0"]) {
                            _data_params[2] = _magicData(_data_params[2]);
                        }
                        Array.prototype.splice.apply($$ses[ds_k], _data_params);
                        return _writeBack();
                    }

                    if (operation.match(/update/)) {
                        if (data && !classof(data, "Array")) {
                            data = [data];
                        }
                        if (!$$ses[ds_k]) {
                            $$ses[ds_k] = [];
                        }
                        let arr_unshift_flag = operation.match(/unshift|beginning/);
                        data.map(_magicData).forEach((value) => {
                            // {name: 1, age: 2};
                            let arr = $$ses[ds_k];
                            arr_unshift_flag ? arr.unshift(value) : arr.push(value);
                        });
                        return _writeBack();
                    }

                    // tool function(s) //

                    function _magicData(obj) {
                        let _final_o = {};
                        $$cfg.list_heads[ds_k] && $$cfg.list_heads[ds_k].forEach((o, i) => {
                            let _ls_name = Object.keys(o).filter(k => $$str(o[k]))[0];
                            let _ls_value = obj[_ls_name];
                            _final_o["list_item_name_" + i] = o.stringTransform
                                ? o.stringTransform.forward.call(obj, _ls_value)
                                : _ls_value;
                            _final_o[_ls_name] = "list_item_name_" + i; // backup
                            _final_o["width_" + i] = o.width ? cX(o.width) + "px" : -2;
                        });
                        Object.keys(obj).forEach((k) => {
                            if (!(k in _final_o)) {
                                _final_o[k] = obj[k];
                            }
                        });
                        return _final_o;
                    }

                    function _writeBack() {
                        if (_write_back) {
                            $$cfg.ses[ds_k] = [];
                            $$save.session(ds_k, $$tool.restoreSessParListData(ds_k), _quiet);
                            if (_sync_ds_k) {
                                $$cfg.sto[ds_k] = deepCloneObject($$cfg.ses[ds_k]);
                            }
                        }
                    }
                },
                updateViewByTag(view_tag) {
                    ui.post(() => $$view.dyn_pages
                        .filter(view => view.view_tag === view_tag)
                        .forEach(view => view.updateOpr(view))
                    );
                },
                showOrHideBySwitch(o, state, hide_when_checked, nearest_end_tag) {
                    let _lbl = o.view.page_view.page_label_name;
                    setIntervalBySetTimeout(_act, 80, _ready);

                    // tool function(s) //

                    function _act() {
                        ui.post(() => {
                            let sw_state_key = o.config_conj + "_switch_states";
                            if (!$$ses[sw_state_key]) {
                                $$ses[sw_state_key] = [];
                            }

                            let myself = o.view;
                            let parent = myself.getParent();
                            let myself_index = parent.indexOfChild(myself);
                            let child_count = parent.getChildCount();

                            while (++myself_index < child_count) {
                                let child_view = parent.getChildAt(myself_index);
                                if (nearest_end_tag && child_view.findViewWithTag(nearest_end_tag)) {
                                    break;
                                }
                                !!state === !!hide_when_checked ? hide(child_view) : reveal(child_view);
                            }

                            // tool function(s) //

                            function hide(view) {
                                $$ses[sw_state_key].push(view.visibility);
                                view.setVisibility(8);
                            }

                            function reveal(view) {
                                if ($$ses[sw_state_key].length) {
                                    view.setVisibility($$ses[sw_state_key].shift());
                                }
                            }
                        });
                    }

                    function _ready() {
                        return _lbl ? $$ses["ready_signal_" + _lbl] : true;
                    }
                },
                weakOrStrongBySwitch(o, state, idx_offset) {
                    let _lbl = o.view.page_view.page_label_name;
                    setIntervalBySetTimeout(_act, 80, _ready);

                    // tool function(s) //

                    function _act() {
                        ui.post(() => {
                            if (!classof(idx_offset, "Array")) {
                                idx_offset = [idx_offset || 1];
                            }
                            let p = o.view.getParent();
                            let cur_i = p.indexOfChild(o.view);
                            idx_offset.forEach((offset) => {
                                let radio_group_view = p.getChildAt(cur_i + offset).getChildAt(0);
                                for (let i = 0, l = radio_group_view.getChildCount(); i < l; i += 1) {
                                    let v = radio_group_view.getChildAt(i);
                                    v.setClickable(state);
                                    v.setTextColor(colors.parseColor(state ? "#000000" : "#b0bec5"));
                                }
                            });
                        });
                    }

                    function _ready() {
                        return _lbl ? $$ses["ready_signal_" + _lbl] : true;
                    }
                },
                /**
                 * @param {"SET"|"GET"} act
                 * @returns {{}[]}
                 */
                statListDataSource(act) {
                    let _range = $$ses.stat_list_date_range_data || [];
                    let _ts_a = _range[0] || 0;
                    let _ts_b = _range[1] || 1e10 - 1;
                    let _ts = _ts_a + " and " + _ts_b;

                    let _ds_k = "stat_list_show_zero";
                    let _zero = $$ses[_ds_k];
                    _zero = $$und(_zero) ? $$cfg.ses[_ds_k] : _zero;
                    let [_show_zero, _show_other] = [0, 1];
                    if ($$2(_zero)) {
                        [_show_zero, _show_other] = [1, 0];
                    } else if ($$0(_zero)) {
                        _show_zero = 1;
                    }

                    let _db_data = $$ses.db.rawQueryData$(
                        "select name, sum(pick) as pick, timestamp as ts " +
                        "from ant_forest " +
                        "where timestamp between " + _ts + " " +
                        (_show_zero ? "" : "and pick <> 0 ") +
                        "group by name"
                    );

                    if ($$und($$ses.list_data_min_ts)) {
                        let _data = $$ses.db.rawQueryData$("select timestamp as ts from ant_forest");
                        $$ses.list_data_min_ts = Math.mini(_data.map(o => o.ts)) * 1e3;
                    }

                    _show_other && _db_data.unshift({
                        name: "%SUM%",
                        pick: _db_data.length > 1 ? _db_data.reduce((a, b) => (
                            ($$num(a) ? a : +a.pick) + +b.pick
                        )) : $$1(_db_data.length) ? +_db_data[0].pick : 0,
                    });

                    let _db_nickname = _db_data.map(o => o.name);
                    if (_show_zero) {
                        let _fri_lst = $$sto.af_flist.get("friends_list_data", {});
                        if (_fri_lst.list_data) {
                            _fri_lst.list_data.forEach((o) => {
                                let _nick = o.nickname;
                                if (!~_db_nickname.indexOf(_nick)) {
                                    _db_data.push({name: _nick, pick: 0});
                                }
                            });
                        }
                    }

                    if (!_show_other) {
                        _db_data = _db_data.filter(v => $$0(+v.pick));
                    }

                    if ($$2(_zero)) {
                        _db_data.sort((a, b) => {
                            let [_a, _b] = [a.name, b.name];
                            if (_a === _b) {
                                return 0;
                            }
                            return _a > _b ? 1 : -1;
                        });
                    } else {
                        _db_data.sort((a, b) => {
                            let [_a, _b] = [+a.pick, +b.pick];
                            if (_a === _b) {
                                return 0;
                            }
                            return _a < _b ? 1 : -1;
                        });
                    }

                    if (act === "GET") {
                        return _db_data;
                    }

                    let _ds_k_ls = "stat_list";
                    $$ses[_ds_k_ls].splice(0);
                    $$view.updateDataSource(_ds_k_ls, "update", _db_data, {write_back: false});
                },
            };

            global.$$ses = {
                db: require("./Modules/MODULE_DATABASE").create(
                    files.getSdcardPath() + "/.local/ant_forest.db", "ant_forest", [
                        {name: "name", not_null: true},
                        {name: "timestamp", type: "integer", primary_key: true},
                        {name: "pick", type: "integer"},
                        {name: "help", type: "integer"}
                    ]
                ),
            };

            global.$$save = {
                trigger: () => !equalObjects($$cfg.ses, $$cfg.sto),
                session(key, value, quiet_flag) {
                    if (key !== undefined) {
                        $$cfg.ses[key] = value;
                    }
                    if (!quiet_flag) {
                        $$lsn.emit("update_all");
                        threadsx.starts(function () {
                            let btn_save = null;
                            waitForAction(() => btn_save = $$ses["homepage_btn_save"], 10e3, 80);
                            ui.post(() => {
                                $$save.trigger() ? btn_save.switch_on() : btn_save.switch_off();
                            });
                        });
                    }
                },
                config() {
                    let sess_cfg_mixed = deepCloneObject($$cfg.ses);
                    writeUnlockStorage();
                    writeBlacklist();
                    $$sto.cfg.put("config", sess_cfg_mixed); // only "cfg" reserved now (without unlock, blacklist, etc)
                    $$cfg.sto = deepCloneObject($$cfg.ses);
                    return true;

                    // tool function(s) //

                    function writeUnlockStorage() {
                        let ori_config = deepCloneObject($$sto.def.unlock);
                        let tmp_config = {};
                        for (let i in ori_config) {
                            if (ori_config.hasOwnProperty(i)) {
                                tmp_config[i] = $$cfg.ses[i];
                                delete sess_cfg_mixed[i];
                            }
                        }
                        $$sto.unlock.put("config", Object.assign(
                            {}, $$sto.unlock.get("config", {}), tmp_config)
                        );
                    }

                    function writeBlacklist() {
                        let _blist = [];
                        let _blist_usr = sess_cfg_mixed.blacklist_by_user;
                        _blist_usr.forEach((o) => {
                            _blist.push({
                                name: o.name,
                                reason: "by_user",
                                timestamp: o.timestamp,
                            });
                        });
                        let _blist_cvr = sess_cfg_mixed.blacklist_protect_cover;
                        _blist_cvr.forEach((o) => {
                            _blist.push({
                                name: o.name,
                                reason: "protect_cover",
                                timestamp: o.timestamp,
                            });
                        });
                        $$sto.af_blist.put("blacklist", _blist);
                        delete sess_cfg_mixed.blacklist_protect_cover;
                        delete sess_cfg_mixed.blacklist_by_user;
                    }
                },
            };

            global.$$tool = {
                getLocalVerName() {
                    try {
                        return "v" + files.read("./Ant_Forest_Launcher.js")
                            .match(/version (\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/)[0].slice(8);
                    } catch (e) {
                        return "v0.0.0";
                    }
                },
                getTimeStrFromTs(time_param, format_str) {
                    let timestamp = +time_param;
                    let time_str = "";
                    let time_str_remove = "";
                    let time = new Date();
                    if (!timestamp) time_str = time_str_remove = "时间戳无效";
                    if (timestamp === Infinity) time_str_remove = "永不";
                    else if (timestamp <= time.getTime()) time_str_remove = "下次运行";
                    let padZero = num => ("0" + num).slice(-2);
                    if (!time_str) {
                        time.setTime(timestamp);
                        let yy = time.getFullYear();
                        let MM = padZero(time.getMonth() + 1);
                        let dd = padZero(time.getDate());
                        let hh = padZero(time.getHours());
                        let mm = padZero(time.getMinutes());
                        time_str = yy + "/" + MM + "/" + dd + " " + hh + ":" + mm;
                    }

                    return {
                        time_str: time_str,
                        time_str_full: time_str + ":" + padZero(time.getSeconds()),
                        time_str_remove: time_str_remove || time_str,
                        timestamp: timestamp,
                    }[format_str || "time_str"];
                },
                getTimedTaskTypeStr(source) {
                    if (classof(source, "Array")) {
                        if (source.length === 7) return "每日";
                        if (source.length) return "每周 [" + source.slice().map(x => +x || 7).sort().join(",") + "]";
                    }
                    return source === 0 ? "一次性" : source;
                },
                getStepsDialog(title, steps, finished_str) {
                    let initial_steps_str = "";
                    steps.forEach((str, idx) => {
                        initial_steps_str += idx ? "\n" : "";
                        initial_steps_str += "\u3000\x20" + (idx + 1) + ".\x20" + str;
                    });

                    let dialog = dialogsx.builds(
                        [title, initial_steps_str, 0, 0, "终止", 1],
                        {progress: {max: 100, showMinMax: false}}
                    );

                    let getStepsStrArrFromDiagContent = () => dialogsx.getContentText(dialog).split("\n");

                    dialog.__proto__ = dialog.__proto__ || {};
                    Object.assign(dialog.__proto__, {
                        setProgressNum(num) {
                            let _num = parseInt(num);
                            if (!isNaN(_num) && _num > 0) {
                                threadsx.starts(function () {
                                    ui.post(() => dialog.setProgress(Math.min(100, _num)));
                                });
                            }
                        },
                        setStep(step_num) {
                            step_num = step_num || 1;
                            $$num(step_num) && step_num--;

                            let content = "";
                            if (step_num.toString().match(/^finish/)) {
                                getStepsStrArrFromDiagContent().forEach((str, idx) => {
                                    content += (idx ? "\n" : "") + "\u2714" + str.slice(1);
                                });
                                content += "\n\n" + finished_str;
                                dialog.setProgressNum(100);
                                dialog.setActionButton("positive", "完成");
                            } else {
                                getStepsStrArrFromDiagContent().forEach((str, idx) => {
                                    content += (idx ? "\n" : "") + (step_num === idx ? "\u25b6" : "\u3000") + str.slice(1);
                                });
                                dialog.setProgressNum(0);
                            }
                            dialog.setContent(content);
                        },
                        stepText(step_num, str, mode) {
                            mode = mode || "replace";
                            step_num = +step_num - 1;
                            if (isNaN(step_num)) return;

                            let diag_content = getStepsStrArrFromDiagContent();
                            for (let i = 0, l = diag_content.length; i < l; i += 1) {
                                if (i === step_num) {
                                    diag_content[i] = (mode === "append" ? diag_content[i] : "") + str;
                                    break;
                                }
                            }
                            dialog.setContent(diag_content.join("\n"));
                        }
                    });

                    return dialog;
                },
                getFetchedFile(backup_path, url, file_ext_name) {
                    if (!url) return "";
                    let fetched_file_name = "." + url.split("/").pop() + (file_ext_name || "");
                    let fetched_file_path = backup_path + fetched_file_name;
                    files.createWithDirs(fetched_file_path);
                    return fetched_file_path;
                },
                getAllAppsJointStr(if_show_sys_app, excluded_data_arrays, force_refresh_flag) {
                    let show_sys_app = $$func(if_show_sys_app) ? if_show_sys_app() : if_show_sys_app;
                    if (show_sys_app !== false) show_sys_app = true;

                    if (force_refresh_flag) {
                        delete $$ses.user_apps_joint_str_arr;
                        delete $$ses.all_apps_joint_str_arr;
                    }

                    excluded_data_arrays = excluded_data_arrays || [];
                    let filterFunc = (str) => {
                        for (let i = 0, l = excluded_data_arrays.length; i < l; i += 1) {
                            if (~excluded_data_arrays[i].indexOf(str)) return false;
                        }
                        return true;
                    };

                    let {all_apps_joint_str_arr, user_apps_joint_str_arr} = $$ses;
                    if (show_sys_app && all_apps_joint_str_arr) return all_apps_joint_str_arr.filter(filterFunc);
                    if (!show_sys_app && user_apps_joint_str_arr) return user_apps_joint_str_arr.filter(filterFunc);

                    let filtered_items = [];
                    let all_items = [];
                    let pkg_mgr = context.getPackageManager();
                    let pkg_list = pkg_mgr.getInstalledPackages(0).toArray();
                    if (pkg_list.length) {
                        pkg_list.forEach((o) => {
                            let pkg_info = pkg_mgr.getPackageInfo(o.packageName, 0);
                            let pkg_name = o.packageName;
                            let {applicationInfo} = pkg_info;
                            let is_sys_app = (applicationInfo.flags & android.content.pm.ApplicationInfo.FLAG_SYSTEM) > 0;
                            let app_name = applicationInfo.loadLabel(pkg_mgr).toString();
                            let joint_str = app_name + "\n" + pkg_name;
                            if (filterFunc(joint_str)) {
                                is_sys_app || filtered_items.push(joint_str);
                                all_items.push(joint_str);
                            }
                        });
                    }
                    $$ses.user_apps_joint_str_arr = filtered_items.sort();
                    $$ses.all_apps_joint_str_arr = all_items.sort();

                    return show_sys_app ? all_items : filtered_items;
                },
                backupProjectFiles(local_backup_path, version_name, dialog, auto_flag) {
                    local_backup_path = local_backup_path || $$def.local_backup_path;
                    version_name = version_name || $$tool.getLocalVerName();
                    let backup_src_map = {
                        Modules: "folder",
                        Tools: "folder",
                        Documents: "folder",
                        "Ant_Forest_Launcher.js": "file",
                        "Ant_Forest_Settings.js": "file",
                        "LICENSE": "file",
                        "README.md": "file",
                        "jsconfig.json": "file",
                        ".gitignore": "file",
                    };
                    let now = new Date();
                    let time_str = getTimeStr(now);
                    let backup_dir = local_backup_path + "." + time_str + "/";
                    for (let name in backup_src_map) {
                        if (backup_src_map.hasOwnProperty(name)) {
                            let _suffix = backup_src_map[name] === "folder" ? "/" : "";
                            let _src = files.path("./") + name + _suffix;
                            if (files.exists(_src)) {
                                filesx.copyFolder(_src, backup_dir);
                            }
                        }
                    }
                    let zip_out_name = backup_dir.replace(/\/\.(\d{8}_\d{6})/, ($0, $1) => (
                        "/Ant_Forest_" + $1 + ".zip"
                    ));
                    if (!filesx.zip(backup_dir, zip_out_name, dialog)) {
                        return;
                    }
                    $$view.updateDataSource("project_backup_info", "update_unshift", {
                        file_name: files.getName(zip_out_name).replace(/\.zip$/, ""),
                        file_path: zip_out_name,
                        version_name: version_name,
                        timestamp: now.getTime(),
                        remark: auto_flag ? "自动备份" : ($$ses.proj_bak_info_remark || "手动备份"),
                    }, {is_quiet: true, sync_data_source: true});
                    $$view.updateViewByTag("restore_projects_from_local_page");

                    // write to storage right away
                    $$sto.af_backup.put("project", $$cfg.ses.project_backup_info);

                    delete $$ses.proj_bak_info_remark;
                    files.removeDir(backup_dir);
                    if (!auto_flag) {
                        dialog.setContent("备份完成");
                        dialog.setActionButton("positive", "返回");
                    }
                    return true;

                    // tool function(s) //

                    function getTimeStr(time) {
                        let now = time || new Date();
                        let zeroPadding = num => ("0" + num).slice(-2);
                        return now.getFullYear() + zeroPadding(now.getMonth() + 1) + zeroPadding(now.getDate()) + "_" +
                            zeroPadding(now.getHours()) + zeroPadding(now.getMinutes()) + zeroPadding(now.getSeconds());
                    }
                },
                restoreProjectFiles(source) {
                    delete global._$_dialog_streaming_intrp_sgn;

                    let mode = source.toString().match(/^http/) ? "server" : "local";

                    let conf = {
                        local: {
                            first_step_txt: "检查文件",
                            first_step_func() {
                                if (files.exists(source)) {
                                    return remainingStepsForRestoring();
                                }
                                dialogsx.alertContent(diag_restoring, "恢复失败:\n文件不存在", "append");
                            },
                        },
                        server: {
                            first_step_txt: "下载项目数据包",
                            first_step_func() {
                                let fetched_file_path = $$tool.getFetchedFile($$def.local_backup_path, source, ".zip");
                                $$tool.okHttpRequest(source, fetched_file_path, {
                                    onDownloadSuccess() {
                                        source = fetched_file_path;
                                        remainingStepsForRestoring();
                                    },
                                    onDownloading: diag_restoring.setProgressNum,
                                    onDownloadFailed: operation => operation(),
                                }, {
                                    dialog: diag_restoring,
                                    dialogReceiver: $$tool.appendHttpFileSizeToDialog,
                                });
                            },
                        }
                    };

                    let diag_restoring = $$tool.getStepsDialog(
                        "恢复中",
                        [conf[mode].first_step_txt, "解压缩", "文件替换", "清理并完成项目恢复"],
                        "恢复完成");
                    diag_restoring.on("positive", () => {
                        global._$_dialog_streaming_intrp_sgn = true;
                        diag_restoring.dismiss();
                    });
                    diag_restoring.show();
                    diag_restoring.setStep(1);
                    conf[mode].first_step_func();

                    // tool function(s) //

                    function remainingStepsForRestoring() {
                        diag_restoring.setStep(2);
                        if (!filesx.unzip(source, "", false, diag_restoring)) {
                            return;
                        }
                        diag_restoring.setStep(3);
                        let _proj_bak_path = global["_$_project_backup_path"];
                        let _cwd = files.path("./");
                        if (!filesx.copyFolder(_proj_bak_path, _cwd, "unbundle")) {
                            return;
                        }
                        diag_restoring.setProgress(100);
                        diag_restoring.setStep(4);
                        files.removeDir(_proj_bak_path);
                        delete global["_$_project_backup_path"];
                        diag_restoring.setStep("finished");
                        $$view.updateViewByTag("about");
                    }
                },
                restoreFromTimestamp(timestamp) {
                    let _ts = timestamp;
                    if (typeof timestamp === "number") {
                        _ts = timestamp.toString();
                    }
                    if (_ts.match(/^\d{13}$/)) {
                        return +_ts;
                    }
                    if (_ts === "永不") {
                        return Infinity;
                    }
                    let _args = _ts.split(/\D+/).map((s, i) => {
                        return (i === 1) ? s - 1 : +s;
                    });
                    _args.unshift(+"thisArgCanBeAny");
                    return (new (Function.prototype.bind.apply(Date, _args))).getTime();
                },
                restoreFromTimedTaskTypeStr(str) {
                    if (str === "每日") return [0, 1, 2, 3, 4, 5, 6];
                    if (str.match(/每周/)) return str.split(/\D/).filter(x => x !== "").map(x => +x === 7 ? 0 : +x).sort();
                    return str === "一次性" ? 0 : str;
                },
                refreshFriLstByLaunchAlipay(params) {
                    let {dialog_prompt, onTrigger, onResume} = params || {};

                    if (dialog_prompt) {
                        dialogsx.builds([
                            "刷新好友列表提示", '即将尝试打开"支付宝"\n自动获取最新的好友列表信息\n在此期间请勿操作设备',
                            0, "放弃", "开始刷新", 1
                        ]).on("negative", (diag) => {
                            diag.dismiss();
                        }).on("positive", (diag) => {
                            diag.dismiss();
                            refreshNow();
                        }).show();
                    } else {
                        refreshNow();
                    }

                    // tool function(s) //

                    function refreshNow() {
                        if ($$func(onTrigger)) {
                            onTrigger();
                        }
                        runJsFile("Ant_Forest_Launcher", {cmd: "get_rank_list_names"});
                        threadsx.starts(function () {
                            waitForAndClickAction(text("打开"), 3.5e3, 300, {click_strategy: "w"});
                        });

                        if ($$func(onResume)) {
                            ui.emitter.prependOnceListener("resume", onResume);
                        }

                        setTimeout(function () {
                            toast('即将打开"支付宝"刷新好友列表');
                        }, 500);
                    }
                },
                handleNewVersion(parent_diag, file_cnt, newest_ver, history_only) {
                    let url_svr = "https://github.com/SuperMonster003/Auto.js_Projects/archive/Ant_Forest.zip";
                    let fetched_path = $$tool.getFetchedFile($$def.local_backup_path, url_svr);
                    handleFileContent(file_cnt);

                    let steps_arr = ["下载项目数据包", "解压缩", "备份本地项目", "文件替换", "清理并完成部署"];
                    let diag_download = $$tool.getStepsDialog("正在部署项目最新版本", steps_arr, "更新完成");

                    if (history_only) {
                        return showUpdateHistories();
                    }

                    // update details
                    let diag_ud = dialogsx
                        .builds([newest_ver, "正在获取版本更新信息...",
                            0, "返回", [$$sto.af.get("update_dialog_prompt_prompted")
                                ? "立即更新" : "开始更新", "attraction_btn_color"], 1])
                        .on("neutral", showUpdateHistories)
                        .on("negative", (ds) => {
                            ds.dismiss();
                            parent_diag.show();
                        })
                        .on("positive", (ds) => {
                            ds.dismiss();
                            showUpdateDialogPrompt(ds);
                        })
                        .show();

                    // steps function(s) //

                    function downloadArchive() {
                        delete global._$_dialog_streaming_intrp_sgn;
                        parent_diag && parent_diag.dismiss();

                        diag_download.setStep(1);
                        diag_download.on("positive", () => {
                            global._$_dialog_streaming_intrp_sgn = true;
                            diag_download.dismiss();
                        });
                        diag_download.show();

                        $$tool.okHttpRequest(url_svr, fetched_path, {
                            onDownloadSuccess: unzipArchive,
                            onDownloading: diag_download.setProgressNum,
                            onDownloadFailed: operation => operation(),
                        }, {
                            dialog: diag_download,
                            dialogReceiver: $$tool.appendHttpFileSizeToDialog,
                        });
                    }

                    function unzipArchive() {
                        diag_download.setStep(2);
                        let {local_backup_path: _path} = $$def;
                        let src = _path + ".Ant_Forest.zip";
                        if (filesx.unzip(src, _path, false, diag_download)) {
                            diag_download.setStep(3);
                            return backupProject();
                        }
                    }

                    function backupProject() {
                        if ($$tool.backupProjectFiles($$def.local_backup_path, null, diag_download, "auto")) {
                            return replaceWithNewFiles();
                        }
                    }

                    function replaceWithNewFiles() {
                        diag_download.setStep(4);
                        let _src = global["_$_project_backup_path"];
                        let _tar = files.path("./");
                        if (!filesx.copyFolder(_src, _tar, "unbundle")) {
                            return;
                        }
                        diag_download.setProgressNum(100);
                        return cleanAndFinish();
                    }

                    function cleanAndFinish() {
                        diag_download.setStep(5);
                        files.removeDir(global["_$_project_backup_path"]);
                        delete global["_$_project_backup_path"];
                        files.remove(fetched_path);
                        diag_download.setStep("finished");
                        $$view.updateViewByTag("about");
                        return true;
                    }

                    // tool function(s) //

                    function showUpdateDialogPrompt(parent_dialog) {
                        let steps_str = steps_arr.join(" -> ");
                        let update_prompt_no_prompt_flag = $$sto.af.get("update_dialog_prompt_prompted", false);
                        if (update_prompt_no_prompt_flag) return downloadArchive();

                        let diag_update_prompt = dialogsx.builds([
                            "更新提示", "1. 更新过程中 本地项目将会被备份 可用于更新撤回/用户自行恢复数据/自定义代码的复原等操作\n" +
                            "2. 整个更新过程将按照以下步骤执行: " + steps_str,
                            [0, "hint_btn_bright_color"], "返回", ["立即更新", "attraction_btn_color"], 1, 1,
                        ]);
                        diag_update_prompt.on("check", checked => update_prompt_no_prompt_flag = !!checked);
                        diag_update_prompt.on("negative", () => {
                            diag_update_prompt.dismiss();
                            parent_dialog.show();
                        });
                        diag_update_prompt.on("positive", () => {
                            if (update_prompt_no_prompt_flag) $$sto.af.put("update_dialog_prompt_prompted", true);
                            diag_update_prompt.dismiss();
                            downloadArchive();
                        });
                        diag_update_prompt.show();
                    }

                    function handleFileContent(file_content) {
                        if (!file_content) {
                            return;
                        }
                        let updateDialogUpdateDetails = () => {
                            history_only || ui.post(() => {
                                dialogsx.setContentText(diag_ud, $$ses.update_info[newest_ver]);
                                diag_ud.setActionButton("neutral", "查看历史更新");
                            });
                        };
                        if (Object.keys($$ses.update_info || {}).length) {
                            return updateDialogUpdateDetails();
                        }

                        threadsx.starts(function () {
                            let info = {};
                            let rex_ver_name = /# v\d+\.\d+\.\d+.*/g;
                            let rex_remove_info = new RegExp(
                                /^(\s*\n\s*)+/.source // starts with multi blank lines
                                + "|" + /(# *){3,}/.source // over three hash symbols
                                + "|" + / +(?=\s+)/.source // ends with blank spaces in a single line
                                + "|" + /.*~~.*/.source // markdown strikethrough
                                + "|" + /.*`灵感`.*/.source // lines with inspiration label
                                + "|" + /\(http.+?\)/.source // URL content (not the whole line)
                                + "|" + /\[\/\/]:.+\(\n*.+?\n*\)/.source // markdown comments
                                + "|" + /\s*<br>/.source // line breaks
                                , "g" // global flag
                            );
                            let ver_names = file_content.match(rex_ver_name);
                            let ver_infos = file_content.split(rex_ver_name);
                            ver_names.forEach((n, i) => info["v" + n.split("v")[1]] = ver_infos[i + 1]
                                .replace(/ ?_\[`(issue |pr )?#(\d+)`](\(http.+?\))?_ ?/g, "[$2]")
                                .replace(rex_remove_info, "")
                                .replace(/(\[\d+])+/g, $ => " " + $.split(/\[]/).join(",").replace(/\d+/g, "#$&"))
                                .replace(/(\s*\n\s*){2,}/g, "\n"));
                            $$ses.update_info = info;
                            updateDialogUpdateDetails();
                        });
                    }

                    function showUpdateHistories() {
                        // update histories
                        let _diag_uh = dialogsx.builds([
                            "历史更新", "正在处理中...", 0, 0, "返回", 1
                        ]).on("positive", d => d.dismiss()).show();

                        threadsx.starts(function () {
                            let str = "";
                            let keys = null;
                            let cond = () => (keys = Object.keys($$ses.update_info || {})).length;
                            if (waitForAction(cond, 5e3)) {
                                keys.forEach((ver_name) => {
                                    str += ver_name + "\n" + $$ses.update_info[ver_name] + "\n";
                                });
                            } else {
                                str = "获取历史更新信息失败..";
                            }
                            ui.post(() => _diag_uh.getContentView().setText(str.slice(0, -2)));
                        });
                    }
                },
                okHttpRequest(url, path, listener, params) {
                    delete global._$_dialog_streaming_intrp_sgn;

                    let {
                        extra_headers: _headers,
                        dialog: _diag,
                        dialogReceiver: _diagReceiver,
                        total_bytes: _par_t_bytes,
                    } = params || {};

                    let _t_bytes = threads.atomic(_par_t_bytes || -1);
                    let _isTBytesAvail = () => _t_bytes.get() > 0;
                    let _setDiagReceiver = (len) => {
                        len > 0
                        && _t_bytes.compareAndSet(-1, len)
                        && $$func(_diagReceiver)
                        && _diagReceiver(_diag, len);
                    };

                    let _thd_t_bytes_by_http = threadsx.starts(function () {
                        while (!_isTBytesAvail()) {
                            try {
                                // may be -1 with a strong possibility
                                let _len = http.get(url).headers["Content-Length"];
                                _setDiagReceiver(_len);
                            } catch (e) {
                                sleep(200);
                            }
                        }
                    });

                    let _thd_t_bytes_by_url_cxn = threadsx.starts(function () {
                        while (!_isTBytesAvail()) {
                            try {
                                let _cxn = new java.net.URL(url).openConnection();
                                _cxn.setRequestProperty("Accept-Encoding", "identity");

                                // may be -1 with a strong possibility
                                let _len = _cxn.getContentLengthLong();
                                _setDiagReceiver(_len);
                                _cxn.disconnect();
                            } catch (e) {
                                sleep(200);
                            }
                        }
                    });

                    threadsx.starts(function () {
                        let _client = new OkHttpClient();
                        let _builder = new Packages.okhttp3.Request.Builder();
                        if (_headers) {
                            let _keys = Object.keys(_headers);
                            let _k_len = _keys.length;
                            for (let i = 0; i < _k_len; i += 1) {
                                let _key = _keys[i];
                                _builder.addHeader(_key, _headers[_key]);
                            }
                        }
                        let _req = _builder.url(url).get().build();
                        let _callback_o = {
                            onResponse(call, res) {
                                let {
                                    BufferedInputStream: BIS,
                                    BufferedOutputStream: BOS,
                                } = java.io;

                                let _buf_len = 1024;
                                let _buf_bytes = java.lang.reflect.Array.newInstance(
                                    java.lang.Byte.TYPE, _buf_len
                                );
                                let _read_bytes;
                                let _acc_bytes = 0;
                                let _bs, _fos, _bis, _bos;

                                try {
                                    let _code = res.code();
                                    if (_code !== 200) {
                                        return _errHandler(_code + " " + res.message());
                                    }
                                    _bs = res.body().byteStream();
                                    _bis = new BIS(_bs);
                                    _fos = new java.io.FileOutputStream(new java.io.File(path));
                                    _bos = new BOS(_fos);
                                    if (!_isTBytesAvail()) {
                                        // may be -1 with a strong possibility
                                        let _len = res.body().contentLength();
                                        _setDiagReceiver(_len);
                                    }

                                    while (~(_read_bytes = _bis.read(_buf_bytes, 0, _buf_len))) {
                                        if (global._$_dialog_streaming_intrp_sgn) {
                                            global._$_dialog_streaming_intrp_sgn = false;
                                            files.remove(path);
                                            _bs.close();
                                            return _errHandler("用户终止");
                                        }
                                        _fos.write(_buf_bytes, 0, _read_bytes);
                                        _acc_bytes += _read_bytes;
                                        if (_isTBytesAvail()) {
                                            listener.onDownloading(_acc_bytes / _t_bytes * 100);
                                        }
                                    }
                                    listener.onDownloadSuccess();
                                } catch (err) {
                                    _errHandler(err);
                                } finally {
                                    try {
                                        _thd_t_bytes_by_http.interrupt();
                                        _thd_t_bytes_by_url_cxn.interrupt();
                                        _bos && _bos.close();
                                        _fos.flush();
                                        _fos && _fos.close();
                                        _bis && _bis.close();
                                        _bs && _bs.close();
                                    } catch (err) {
                                        dialogsx.alertContent(_diag, "文件流处理失败:\n" + err, "append");
                                    }
                                }

                                // tool function(s) //

                                function _errHandler(err) {
                                    listener.onDownloadFailed(() => {
                                        dialogsx.alertContent(_diag, err.toString().replace(/^Error: ?/, ""), "append");
                                    });
                                }
                            },
                            onFailure(call, err) {
                                _diag.setActionButton("positive", "返回");
                                dialogsx.alertContent(_diag, "请求失败: \n" + err, "append");
                            },
                        };
                        _client.newCall(_req).enqueue(
                            new Packages.okhttp3.Callback(_callback_o)
                        );
                    });
                },
                accountNameConverter(str, opr) {
                    let _str = str || "";
                    let _res = "";
                    let _fct = {e: 1, d: -1}[opr[0]];
                    for (let i in _str) {
                        if (_str.hasOwnProperty(i)) {
                            _res += String.fromCharCode(
                                _str.charCodeAt(+i) + ((996).ICU + +i) * _fct
                            );
                        }
                    }
                    return _res;
                },
                appendHttpFileSizeToDialog(dialog, content_len) {
                    let content_view = dialog.getContentView();
                    let content_text = content_view.getText().toString();
                    let to_match_str = "下载项目数据包";
                    if (content_text.match(to_match_str)) {
                        let replaced_str = surroundWith(
                            $$cvt.bytes(content_len, "B", {space: true}), "  [ ", " ]"
                        );
                        content_view.setText(content_text.replace(to_match_str, to_match_str + replaced_str));
                    }
                },
                timeSectionToStr(arr) {
                    return arr.join(" - ") + (arr[1] <= arr[0] ? " (+1)" : "");
                },
                timeStrToSection(str) {
                    return str.replace(/ \(\+1\)/g, "").split(" - ");
                },
                restoreSessParListData(ds_k) {
                    let new_data = [];
                    $$ses[ds_k].forEach((o) => {
                        let _final_o = deepCloneObject(o);
                        Object.keys(_final_o).forEach((key) => {
                            if (_final_o[key] in _final_o) {
                                let _useless = _final_o[key];
                                _final_o[key] = _final_o[_final_o[key]];
                                delete _final_o[_useless];
                            }
                            if (key.match(/^width_\d$/)) {
                                delete _final_o[key];
                            }
                        });

                        $$cfg.list_heads[ds_k] && $$cfg.list_heads[ds_k].forEach((o) => {
                            if ("stringTransform" in o) {
                                let _aim_k = Object.keys(o).filter((k => $$str(o[k])))[0];
                                let _bw = o.stringTransform.backward;
                                if (_bw === "__delete__") {
                                    delete _final_o[_aim_k];
                                } else if ($$func(_bw)) {
                                    _final_o[_aim_k] = _bw.call(_final_o, _final_o[_aim_k]);
                                }
                            }
                        });

                        new_data.push(_final_o);
                    });
                    return new_data;
                },
            };

            global.$$enc = s => require("./Modules/MODULE_PWMAP").encrypt(s);

            global.Layout = function (title, hint, params) {
                let _par = $$obj(hint) ? hint : params || {};
                let _hint = $$obj(hint) ? "" : hint === "hint" ? "加载中..." : hint;

                Object.assign(this, {hint: _hint, title: title}, _par);

                let _conj = _par.config_conj;
                if (_conj) {
                    let _title_o = $$ses.title || {};
                    _title_o[_conj] = _title_o[_conj] || title;
                    $$ses.title = _title_o;
                }

                Object.defineProperties(this, (() => {
                    let _props = {
                        newWindow: {get: () => _par.newWindow.bind(this)},
                        infoWindow: {get: () => _par.infoWindow.bind(this)},
                        listeners: {get: () => _par.listeners},
                        updateOpr: {get: () => view => _par.updateOpr(view)},
                        custom_data_source: {get: () => _par.custom_data_source},
                    };
                    Object.keys(_props).forEach(k => _par[k] || delete _props[k]);
                    return _props;
                })());
            };
        }
    },
    config(reset) {
        if (reset) {
            let _mixed = _mixedWithDefault($$sto.def.af);
            $$cfg.sto = deepCloneObject(_mixed);
            $$cfg.ses = deepCloneObject(_mixed);
            $$sto.cfg.put("config", $$sto.def.af);
            $$lsn.emit("update_all");
        } else {
            let _refilled = Object.assign({},
                $$sto.def.af, $$sto.cfg.get("config")
            );
            // to forcibly refill storage data
            $$sto.cfg.put("config", _refilled);
            $$cfg.sto = _mixedWithDefault(_refilled);
            $$cfg.ses = deepCloneObject($$cfg.sto);
        }

        threadsx.starts(_initProjBackups);
        threadsx.starts(_initStatData);

        return this;

        // tool function(s) //

        function _mixedWithDefault(add_o) {
            return Object.assign({},
                add_o, $$sto.unlock.get("config"), _isolatedBlacklist()
            );
        }

        function _isolatedBlacklist() {
            let _blist_sto = $$sto.af_blist.get("blacklist", []);
            let _blist_data;
            let _blist_cvr = [];
            let _blist_usr = [];

            if (classof(_blist_sto, "Array")) {
                _blist_data = _blist_sto.slice();
            } else if (classof(_blist_sto, "Object")) {
                _blist_data = Object.keys(_blist_sto).map((name) => ({
                    name: name,
                    timestamp: _blist_sto[name].timestamp,
                    reason: _blist_sto[name].reason,
                }));
            }

            for (let o of _blist_data) {
                let _data = {name: o.name, timestamp: o.timestamp};
                if (o.reason === "protect_cover") {
                    _blist_cvr.push(_data);
                } else if (o.reason === "by_user") {
                    _blist_usr.push(_data);
                }
            }

            let _res = {
                blacklist_protect_cover: _blist_cvr,
                blacklist_by_user: _blist_usr,
            };
            Object.assign($$ses, _res);

            return _res;
        }

        function _initProjBackups() {
            delete $$ses.restore_proj_from_local_page_updated;

            let _sto_data = $$sto.af_backup.get("project", []);
            let _sto_names = _sto_data.map((o) => o.file_name);

            _transferOldStorage();
            _transferOldFiles();
            _scanBackupFolder();
            _tidyUpData();

            $$cfg.ses.project_backup_info = $$cfg.sto.project_backup_info = _sto_data;
            $$ses.restore_proj_from_local_page_updated = true;

            $$view.updateViewByTag("restore_projects_from_local_page");
            $$view.updateViewByTag("backup_projects_from_local");

            // tool function(s) //

            function _transferOldStorage() {
                let _sto_old_bak = $$sto.af.get("project_backup_info");
                if (typeof _sto_old_bak !== "undefined") {
                    _sto_data = _sto_data.concat(
                        _sto_old_bak.filter((o) => {
                            return !~_sto_names.indexOf(o.file_name);
                        }).map((o) => {
                            o.file_path = $$def.local_backup_path + o.file_name + ".zip";
                            return o;
                        })
                    );
                    $$ses.proj_sto_modified = true;
                    $$ses.old_proj_sto_exists = true;
                }
            }

            function _transferOldFiles() {
                let _new_path = $$def.local_backup_path;
                let _old_path = files.cwd() + "/BAK/Ant_Forest/";
                if (files.exists(_old_path)) {
                    files.remove(_old_path + ".Ant_Forest.zip");
                    files.createWithDirs(_new_path);
                    files.listDir(_old_path).forEach((name) => {
                        let _new_full_p = _new_path + name;
                        let _old_full_p = _old_path + name;
                        let _rex_a = /^\.v\d+\.\d+\.\d+\.zip$/;
                        let _rex_b = /^Ant_Forest_\d{8}_\d{6}\.zip$/;
                        if (name.match(_rex_a) || name.match(_rex_b)) {
                            files.move(_old_full_p, _new_full_p);
                        }
                    });
                    if (files.isEmptyDir(_old_path)) {
                        files.removeDir(_old_path);
                    }
                    let _old_path_parent = _old_path.slice(
                        0, _old_path.lastIndexOf("/", _old_path.length - 2)
                    );
                    if (files.isEmptyDir(_old_path_parent)) {
                        files.removeDir(_old_path_parent);
                    }
                }
            }

            function _scanBackupFolder() {
                let _path = $$def.local_backup_path;
                let _max = 200;
                for (let i = 0; i < _sto_data.length; i += 1) {
                    let _full_p = _path + _sto_data[i].file_name + ".zip";
                    if (!files.exists(_full_p)) {
                        _sto_data.splice(i--, 1);
                        $$ses.proj_sto_modified = true;
                    } else if (_sto_data[i].file_path !== _full_p) {
                        _sto_data[i].file_path = _full_p;
                        $$ses.proj_sto_modified = true;
                    }
                }
                let _files = files.listDir(_path, function (name) {
                    if (name.match(/^\.\d{8}_\d{6}$/) && files.isDir(_path + name)) {
                        files.removeDir(_path + name);
                        return false;
                    }
                    if (name === ".Ant_Forest.zip") {
                        files.remove(_path + name);
                        return false;
                    }
                    return !!name.match(/^Ant_Forest_\d{8}_\d{6}\.zip$/)
                        && !~_sto_names.indexOf(name.slice(0, -4));
                }).sort((a, b) => a === b ? 0 : a < b ? 1 : -1);
                let _ctr = _sto_data.length;
                for (let i = 0, l = _files.length; i < l; i += 1) {
                    let _name = _files[i];
                    let _full_p = _path + _name;
                    if (_ctr < _max && _fillStoData(_full_p)) {
                        _ctr += 1;
                    } else {
                        files.remove(_full_p);
                    }
                }

                function _fillStoData(full_path) {
                    let _file_name = files.getNameWithoutExtension(full_path);
                    let _ver = _getVer();
                    if (_ver) {
                        _sto_data.push({
                            version_name: _ver,
                            timestamp: _getTs(),
                            file_name: _file_name,
                            file_path: full_path,
                            remark: "扫描并自动添加的备份",
                        });
                        return $$ses.proj_sto_modified = true;
                    }

                    // tool function(s) //

                    function _getVer() {
                        if (full_path && files.isFile(full_path)) {
                            let _out_path = full_path.slice(0, full_path.lastIndexOf("/"));
                            filesx.unzip(full_path, _out_path);
                            let _unzipped_path = _out_path + "/." + _file_name.slice(11);
                            let _ver = _getLocalVerName(_unzipped_path + "/Ant_Forest_Launcher.js");
                            files.removeDir(_unzipped_path);
                            return _ver;
                        }

                        // tool function(s) //

                        function _getLocalVerName(file) {
                            try {
                                let _file = file || "./Ant_Forest_Launcher.js";
                                let _regexp = /version (\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/;
                                return "v" + files.read(_file).match(_regexp)[0].slice(8);
                            } catch (e) {
                                return "未知版本";
                            }
                        }
                    }

                    function _getTs() {
                        if (full_path && files.isFile(full_path)) {
                            let _str = _file_name.slice(11);
                            let _args = [
                                +_str.slice(0, 4), _str.slice(4, 6) - 1, +_str.slice(6, 8),
                                +_str.slice(9, 11), +_str.slice(11, 13), +_str.slice(13)
                            ];
                            _args.unshift(+"thisArgCanBeAny");
                            return (new (Function.prototype.bind.apply(Date, _args))).getTime();
                        }
                    }
                }
            }

            function _tidyUpData() {
                if ($$ses.proj_sto_modified) {
                    delete $$ses.proj_sto_modified;
                    $$sto.af_backup.put("project", _sto_data);
                }
                if ($$ses.old_proj_sto_exists) {
                    $$sto.af.remove("project_backup_info");
                }
            }
        }

        function _initStatData() {
            delete $$ses.stat_page_updated;
            threadsx.starts(function () {
                if (waitForAction(() => $$view && $$view.statListDataSource, 60e3)) {
                    $$ses.init_stat_list_data = $$view.statListDataSource("GET");
                    $$ses.stat_page_updated = true;
                    $$view.updateViewByTag("stat_page");
                }
            });
        }
    },
    listener() {
        // consume "back" keydown event and define a new one
        ui.emitter.on("back_pressed", (e) => {
            e.consumed = true; // make default "back" dysfunctional

            if ($$ses.back_btn_consumed) {
                let {back_btn_consumed_func: _f} = $$ses;
                if ($$func(_f)) {
                    _f();
                    delete $$ses.back_btn_consumed_func;
                }
            } else if ($$view.checkPageState()) {
                $$view.page.rolling.length === 1
                    ? $$save.trigger() ? _quitConfirm() : _quitNow()
                    : $$view.page.jump("back");
            }

            // tool function(s) //

            function _quitConfirm() {
                dialogsx
                    .builds([
                        "设置未保存", "确定要退出吗",
                        "返回", ["强制退出", "caution_btn_color"], ["保存并退出", "hint_btn_bright_color"], 1,
                    ])
                    .on("neutral", (d) => {
                        d.dismiss();
                    })
                    .on("negative", () => {
                        _quitNow();
                    })
                    .on("positive", (d) => {
                        $$save.config();
                        toast("已保存");
                        _quitNow(d);
                    })
                    .show();
            }

            function _quitNow(diag) {
                diag && diag.dismiss();
                if ($$sto.af.get("af_postponed")) {
                    toast("配置结束\n即将运行蚂蚁森林");
                    runJsFile("Ant_Forest_Launcher");
                    $$sto.af.remove("af_postponed");
                    $$sto.af.put("config_prompted", true);
                }
                ui.finish();
            }
        });

        // recycle some resource as far as possible
        // even if in vain with a strong possibility
        events.on("exit", () => {
            $$ses.on_exit_flag = true;
            $$view.updateViewByTag("global_log_switch");

            $$lsn.removeAllListeners();
            threads.shutDownAll();
            dialogsx.clearPool();
            ui.setContentView(ui.inflate(<frame/>));
            ui.main.getParent().removeAllViews();

            ui.finish();
        });

        // customized listeners
        global.$$lsn = events.emitter();
        $$lsn.addListener("sub_page_views_add", () => {
            let _idx = $$ses.sub_page_view_idx || 0;
            if (_idx < $$view.sub_pages.length) {
                setTimeout($$view.sub_pages[_idx++], 10);
                $$ses.sub_page_view_idx = _idx;
            }
        });
        $$lsn.addListener("update_all", () => {
            $$view.dyn_pages.forEach(view => view.updateOpr(view));
        });

        return this;
    },
};

// entrance //
$$init.check().global().config().listener();

$$view.setHomePage($$def.homepage_title)
    .add("subhead", new Layout("基本功能"))
    .add("page", new Layout("自收功能", "hint", {
        config_conj: "self_collect_switch",
        next_page: "self_collect_page",
        updateOpr(view) {
            $$view.udop.main_sw.call(this, view);
        },
    }))
    .add("page", new Layout("收取功能", "hint", {
        config_conj: "friend_collect_switch",
        next_page: "friend_collect_page",
        updateOpr(view) {
            $$view.udop.main_sw.call(this, view);
        },
    }))
    .add("page", new Layout("帮收功能", "hint", {
        config_conj: "help_collect_switch",
        next_page: "help_collect_page",
        updateOpr(view) {
            $$view.udop.main_sw.call(this, view);
        },
    }))
    .add("subhead", new Layout("高级功能"))
    .add("page", new Layout("自动解锁", "hint", {
        config_conj: "auto_unlock_switch",
        next_page: "auto_unlock_page",
        updateOpr(view) {
            $$view.udop.main_sw.call(this, view);
        },
    }))
    .add("page", new Layout("消息提示", "hint", {
        config_conj: "message_showing_switch",
        next_page: "message_showing_page",
        updateOpr(view) {
            $$view.udop.main_sw.call(this, view);
        },
    }))
    .add("page", new Layout("本地日志", "hint", {
        config_conj: "global_log_switch",
        next_page: "global_log_page",
        updateOpr(view) {
            $$view.udop.main_sw.call(this, view);
        },
    }))
    .add("page", new Layout("定时循环", "hint", {
        config_conj: "timers_switch",
        next_page: "timers_page",
        updateOpr(view) {
            $$view.udop.main_sw.call(this, view);
        },
    }))
    .add("page", new Layout("账户功能", "hint", {
        config_conj: "account_switch",
        next_page: "account_page",
        updateOpr(view) {
            $$view.udop.main_sw.call(this, view);
        },
    }))
    .add("page", new Layout("数据统计", {
        next_page: null,
        view_tag: "stat_page",
        updateOpr(view) {
            let _view_tag = this.view_tag;

            if ($$ses.stat_page_updated) {
                view.setNextPage("stat_page");
                threadsx.starts(_thdAddStatPageView);
            }

            // tool function(s) //

            function _thdAddStatPageView() {
                if (waitForAction(() => $$view.pages[_view_tag], 5e3) && !$$ses.stat_page_created) {
                    $$ses.stat_page_created = true;
                    ui.post(() => $$view.pages[_view_tag].add("list", new Layout("/*数据统计列表*/", {
                        list_head: "stat_list",
                        data_source_key_name: "stat_list",
                        custom_data_source: $$ses.init_stat_list_data,
                        list_checkbox: "gone",
                        listeners: {
                            _list_data: {
                                item_bind(item_view) {
                                    item_view["_checkbox"].setVisibility(8);
                                },
                                item_long_click(e, item) {
                                    e.consumed = true;

                                    let _name = item[item["name"]];

                                    dialogsx.builds([
                                        ["小心", "title_caution_color"],
                                        ["要删除以下用户的所有统计数据吗?\n\n" +
                                        "用户昵称:\n" + _name +
                                        "\n\n此操作无法撤销", "content_warn_color"],
                                        0, "放弃", ["确认", "caution_btn_color"], 1
                                    ]).on("negative", (d) => {
                                        d.dismiss();
                                    }).on("positive", (d) => {
                                        d.dismiss();
                                        $$ses.db.delete$("name=?", _name);
                                        $$view.statListDataSource("SET");
                                        toast("已删除");
                                    }).show();
                                },
                            },
                        },
                    })).ready());
                }
            }
        },
    }))
    .add("page", new Layout("黑名单管理", {next_page: "blacklist_page"}))
    .add("page", new Layout("运行与安全", {next_page: "script_security_page"}))
    .add("subhead", new Layout("备份与还原"))
    .add("button", new Layout("还原初始设置", {
        newWindow() {
            dialogsx
                .builds([
                    "还原初始设置", "restore_all_settings",
                    ["了解内部配置", "hint_btn_bright_color"],
                    "放弃", ["全部还原", "warn_btn_color"], 1
                ])
                .on("neutral", () => {
                    dialogsx.builds([
                        "保留内部配置", "keep_internal_config",
                        0, 0, "关闭", 1
                    ]).on("positive", d => d.dismiss()).show();
                })
                .on("negative", (d) => {
                    d.dismiss();
                })
                .on("positive", (d) => {
                    dialogsx
                        .builds([
                            "全部还原", "确定要还原全部设置吗",
                            0, "放弃", ["全部还原", "caution_btn_color"], 1
                        ])
                        .on("positive", (ds) => {
                            $$init.config("reset");

                            dialogsx.builds([
                                "还原完毕", "", 0, 0, "确定"
                            ]).on("positive", ds2 => dialogsx.dismiss(ds2, ds, d)).show();
                        })
                        .on("negative", ds => ds.dismiss())
                        .show();
                })
                .show();
        },
    }))
    .add("page", new Layout("项目备份还原", {next_page: "local_project_backup_restore_page"}))
    .add("subhead", new Layout("关于"))
    .add("button", new Layout("关于脚本及开发者", {
        hint: "正在读取中...",
        view_tag: "about",
        newWindow() {
            let _local_ver = this.view["_hint"].getText().toString();
            let _new_svr_ver = "";
            let _svr_md = "";
            let _is_checking = false;
            let _show_his_only = false;
            let _diag = dialogsx
                .builds(["关于", "", [0, "attraction_btn_color"], "返回", "检查更新", 1], {
                    content: "当前本地版本: " + _local_ver + "\n" + "服务器端版本: ",
                    items: ["开发者: " + "SuperMonster003"],
                })
                .on("negative", d => d.dismiss())
                .on("neutral", (d) => {
                    _diag.getActionButton("neutral") === "查看当前更新" && d.dismiss();
                    $$tool.handleNewVersion(d, _svr_md, _new_svr_ver, _show_his_only);
                })
                .on("positive", () => {
                    if (!_is_checking) {
                        $$ses.update_info = {};
                        _diag.setActionButton("neutral", null);
                        _checkUpdate();
                    }
                })
                .on("item_select", (idx, item, d) => {
                    $$ses.back_btn_consumed = true;
                    ui.main.getParent().addView(setAboutPageView());

                    // tool function(s) //

                    function setAboutPageView() {
                        d.dismiss();
                        $$ses.current_avatar_recycle_name = "avatar";
                        let _getImg = (k) => images.fromBase64($$def.image_base64_data[k]);
                        let _ic_outlook = _getImg("ic_outlook");
                        let _ic_qq = _getImg("ic_qq");
                        let _ic_github = _getImg("ic_github");
                        let _qr_alipay_dnt = _getImg("qr_alipay_dnt");
                        let _qr_wechat_dnt = _getImg("qr_wechat_dnt");
                        let _avt_det = _getImg("avt_detective");

                        let _local_avt_path = (() => {
                            let _path = files.getSdcardPath() + "/.local/Pics/";
                            files.createWithDirs(_path);
                            return _path + "super_monster_003_avatar.png";
                        })();
                        let _local_avt = images.read(_local_avt_path);
                        let _local_avt_txt = "";
                        let _dnt_txt = "Thank you for your donation";

                        let _add_view = ui.inflate(
                            <vertical bg="#ffffff" clickable="true" focusable="true">
                                <horizontal padding="0 24 0 0" gravity="center">
                                    <img id="_avatar" w="180" h="180" radius="20dp" scaleType="fitXY" alt=""/>
                                </horizontal>
                                <horizontal gravity="center">
                                    <text id="_avatar_desc"/>
                                </horizontal>
                                <horizontal gravity="center" margin="0 25 0 0">
                                    <img id="qq" w="50" h="50" scaleType="fitXY" margin="20" alt=""/>
                                    <img id="github" w="50" h="50" scaleType="fitXY" margin="20" alt=""/>
                                    <img id="outlook" w="50" h="50" scaleType="fitXY" margin="20" alt=""/>
                                </horizontal>
                                <horizontal gravity="center" margin="0 25 0 0">
                                    <button id="close" text="CLOSE" textColor="#31080D" backgroundTint="#f48fb1"/>
                                </horizontal>
                            </vertical>
                        );

                        let _thd_load_avt;

                        _add_view.setTag("about_page");
                        _add_view.close.on("click", () => {
                            _stop_load_avt_sgn = true;
                            _thd_load_avt && _thd_load_avt.interrupt();
                            _closeAbout();
                        });
                        _add_view.close.on("long_click", (e) => {
                            e.consumed = true;
                            if ($$ses.avatar_recycle_opr_working_flag) {
                                return;
                            }
                            $$ses.avatar_recycle_opr_working_flag = true;

                            let _recycle = [
                                {name: "avatar", src: _local_avt || _avt_det, desc: _local_avt_txt},
                                {name: "alipay", src: _qr_alipay_dnt, desc: _dnt_txt},
                                {name: "wechat", src: _qr_wechat_dnt, desc: _dnt_txt}
                            ];

                            _setAnm("vanish");

                            setTimeout(() => {
                                let _nxt = _recycle[_getNext()];
                                _add_view["_avatar"].setSource(_nxt.src);
                                _add_view["_avatar_desc"].setText(_nxt.desc);
                                $$ses.current_avatar_recycle_name = _nxt.name;
                            }, 300);

                            setTimeout(() => _setAnm("show_up"), 500);

                            delete $$ses.avatar_recycle_opr_working_flag;

                            // tool function(s) //

                            function _setAnm(flg) {
                                let _is_vanish = flg === "vanish";
                                let _anm_y = android.animation.ObjectAnimator.ofFloat(
                                    _add_view["_avatar_desc"], "translationY",
                                    [-100 * (+!_is_vanish), -100 * (+_is_vanish)]
                                );
                                let _anm_scale_x = android.animation.ObjectAnimator.ofFloat(
                                    _add_view["_avatar"], "scaleX",
                                    [+_is_vanish, +!_is_vanish]
                                );
                                let _anm_scale_y = android.animation.ObjectAnimator.ofFloat(
                                    _add_view["_avatar"], "scaleY",
                                    [+_is_vanish, +!_is_vanish]
                                );
                                let _anm_set = new android.animation.AnimatorSet();
                                _anm_set.playTogether([_anm_y, _anm_scale_x, _anm_scale_y]);
                                _anm_set.setDuration(200);
                                _anm_set.start();
                            }

                            function _getNext() {
                                let _len = _recycle.length;
                                let _cur_name = $$ses.current_avatar_recycle_name;
                                let _i = 0;
                                for (; _i < _len; _i += 1) {
                                    if (_cur_name === _recycle[_i].name) {
                                        break;
                                    }
                                }
                                return (_i + 1) % _len;
                            }
                        });

                        $$ses.back_btn_consumed_func = () => _add_view.close.click();

                        let _stat_bar_col_bak = activity.getWindow().getStatusBarColor();
                        ui.statusBarColor(android.graphics.Color.TRANSPARENT);

                        // let FLAG_FULLSCREEN = android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN;
                        // activity.getWindow().setFlags(FLAG_FULLSCREEN, FLAG_FULLSCREEN);

                        let _avt_txt = {
                            loading: "Online avatar image is loading...",
                            coffee: "Coffee, coffee, and coffee",
                            loading_failed: "Online avatar image loaded failed",
                        };
                        if (_local_avt) {
                            _add_view["_avatar"].setSource(_local_avt);
                            _add_view["_avatar_desc"].text(_local_avt_txt = _avt_txt.coffee);
                        } else {
                            _add_view["_avatar"].setSource(_avt_det);
                            _add_view["_avatar_desc"].text(_local_avt_txt = _avt_txt.loading);
                        }

                        let _stop_load_avt_sgn = false;
                        _thd_load_avt = threadsx.starts(function () {
                            try {
                                waitForAction(() => _add_view && _add_view["_avatar"], 5e3, 50);
                                let _avt_img = null;
                                let _avt_url = "https://avatars1.githubusercontent.com/u/30370009";
                                let _max = 3;
                                let _ctr = 0;
                                let _lmt = () => _ctr > _max;

                                while (!_lmt()) {
                                    if (waitForAction(() => _avt_img = images.load(_avt_url), 2)) {
                                        break;
                                    }
                                    if (_stop_load_avt_sgn) {
                                        return;
                                    }
                                }

                                if (_lmt()) {
                                    return _local_avt || ui.post(() => {
                                        _local_avt_txt = _avt_txt.loading_failed;
                                        _add_view["_avatar_desc"].text(_local_avt_txt);
                                    });
                                }

                                if (_local_avt && images.findImage(_local_avt, _avt_img)) {
                                    return;
                                }

                                images.save(_avt_img, _local_avt_path);

                                _local_avt = _avt_img;
                                _local_avt_txt = _avt_txt.coffee;
                                ui.post(() => {
                                    let _s = _add_view["_avatar_desc"].getText().toString();
                                    if (_s === _avt_txt.loading) {
                                        _add_view["_avatar_desc"].text(_local_avt_txt);
                                    }
                                    let _name = $$ses.current_avatar_recycle_name;
                                    if (_name === "avatar") {
                                        _add_view["_avatar"].setSource(_local_avt);
                                    }
                                });
                            } catch (e) {
                                // nothing to do here...
                            }
                        });

                        _add_view["qq"].setSource(_ic_qq);
                        _add_view["qq"].on("click", () => appx.startActivity({
                            data: decodeURIComponent("mqqwpa" + "%3A" + "%2F" + "%2F" +
                                "im" + "%2F" + "chat" + "%3F" + "chat_type" + "%3D" +
                                "wpa" + "%26" + "uin" + "%3D" + 0x36e63859.toString()),
                        }));
                        _add_view["github"].setSource(_ic_github);
                        _add_view["github"].on("click", () => app.openUrl(
                            "https://github.com/SuperMonster003"
                        ));
                        _add_view["outlook"].setSource(_ic_outlook);
                        _add_view["outlook"].on("click", () => appx.startActivity({
                            data: decodeURIComponent("mailto" + "%3A" + "%2F" + "%2F" +
                                "tencent_" + 0x36e63859.toString() + "%40" +
                                "outlook" + String.fromCharCode(0x2e) + "com"),
                        }));

                        return _add_view;

                        // tool function(s) //

                        function _closeAbout() {
                            delete $$ses.back_btn_consumed;

                            ui.statusBarColor(_stat_bar_col_bak);
                            // activity.getWindow().clearFlags(FLAG_FULLSCREEN);
                            _diag.show();

                            let _p = ui.main.getParent();
                            let _c_cnt = _p.getChildCount();
                            for (let i = 0; i < _c_cnt; i += 1) {
                                let _c_view = _p.getChildAt(i);
                                if (_c_view.findViewWithTag("about_page")) {
                                    _p.removeView(_c_view);
                                }
                            }
                        }
                    }
                })
                .show();

            _checkUpdate();

            // tool function(s) //

            function _checkUpdate() {
                _is_checking = true;
                _show_his_only = false;
                _new_svr_ver = "检查中...";
                let _ori_cnt = dialogsx.getContentText(_diag)
                    .replace(/([^]+服务器端版本: ).*/, "$1");
                _diag.setContent(_ori_cnt + _new_svr_ver);

                threadsx.starts(function () {
                    try {
                        timeRecorder("check_update");
                        _svr_md = _getSvrMdByBlob();
                        let _rex_ver = /版本历史[^]+?v(\d+\.?)+( ?(Alpha|Beta)(\d+)?)?/;
                        _new_svr_ver = "v" + _svr_md.match(_rex_ver)[0].split("v")[1];
                    } catch (e) {
                        let _et = timeRecorder("check_update", "load");
                        _new_svr_ver = _et > 999 ? "检查超时" : "检查失败";
                    } finally {
                        _diag.setContent(_ori_cnt + _new_svr_ver);
                        if (_new_svr_ver.match(/^v/) && isNewVer(_new_svr_ver, _local_ver)) {
                            _diag.setActionButton("neutral", "查看当前更新");
                        } else {
                            _show_his_only = true;
                            _diag.setActionButton("neutral", "查看历史更新");
                        }
                        _is_checking = false;
                    }

                    // tool function(s) //

                    function isNewVer(ver_new, ver_old) {
                        return _verWeight(ver_new) > _verWeight(ver_old);

                        // tool function(s) //

                        function _verWeight(ver) {
                            let _s = ver.replace(/[v ]/g, "");
                            if (_s.match(/[Aa]lpha$|[Bb]eta$/)) {
                                _s += "1";
                            }
                            if (!_s.match(/[Aa]lpha|[Bb]eta/)) {
                                _s += "#9.9999";
                            }
                            _s = _s
                                .replace(/[Aa]lpha/, "#1.")
                                .replace(/[Bb]eta/, "#2.");

                            let _split_s = _s.split("#");
                            let _calc = (s) => {
                                let _nums = s.split(".");
                                let _len = _nums.length;
                                let _sum = 0;
                                for (let i = 0; i < _len; i += 1) {
                                    _sum += _nums[i] * Math.pow(10, (16 - 4 * i));
                                }
                                return _sum;
                            };
                            return _calc(_split_s[0]) + "." + _calc(_split_s[1]);
                        }
                    }
                });

                // tool function(s) //

                function _getSvrMdByBlob() {
                    let _url_str = "https://github.com/SuperMonster003/" +
                        "Auto.js_Projects/blob/Ant_Forest/README.md";
                    let _response_str = _getRespByHttpCxn(_url_str);

                    return _response_str.match(/版本历史[^]+article/)[0]
                        .replace(/<path .+?\/path>/g, "")
                        .replace(
                            /<a .+?(<code>((issue |pr )?#\d+)<\/code>)?<\/a>/g,
                            ($0, $1, $2) => $2 ? "_[`" + $2 + "`]_" : ""
                        )
                        .replace(/<svg .+?\/svg>/g, "")
                        .replace(/<link>.+/g, "")
                        .replace(/<h1>/g, "# ")
                        .replace(/<h6>/g, "###### ")
                        .replace(/<\/?(li|ul|del|em|h\d)>/g, "")
                        .replace(/<code>/g, "* `")
                        .replace(/<\/code>/g, "`")
                        .replace(/\s*<\/articl.*/, "");

                    // tool function(s) //

                    function _getRespByHttpCxn(url) {
                        let URL = java.net.URL;
                        let HttpURLConnection = java.net.HttpURLConnection;
                        let ISR = java.io.InputStreamReader;
                        let BufferedReader = java.io.BufferedReader;
                        let StringBuilder = java.lang.StringBuilder;

                        let _url = new URL(url);
                        let _cxn = _url.openConnection();
                        _cxn.setRequestMethod("GET");
                        _cxn.setConnectTimeout(15e3);
                        _cxn.setReadTimeout(15e3);
                        _cxn.connect();

                        let _resp_code = _cxn.getResponseCode();
                        if (_resp_code !== HttpURLConnection["HTTP_OK"]) {
                            throw Error("请求失败: " + _resp_code);
                        }
                        let _is = _cxn.getInputStream();
                        let _reader = new BufferedReader(new ISR(_is));
                        let _resp = new StringBuilder();
                        let _line = null;
                        let _readLine = () => {
                            _line = _reader.readLine();
                            return _line !== null;
                        };
                        while (_readLine()) {
                            _resp.append(_line).append("\r\n");
                        }
                        return _resp.toString();
                    }
                }
            }
        },
        updateOpr(view) {
            view.setHintText($$tool.getLocalVerName());
        },
    }))
    .ready();

$$view.page.new("自收功能", "self_collect_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "self_collect_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("page", new Layout("循环监测", "hint", {
            config_conj: "homepage_monitor_switch",
            next_page: "homepage_monitor_page",
            updateOpr(view) {
                $$view.udop.main_sw.call(this, view, "timers_switch");
            },
        }))
        .add("page", new Layout("返检监控", "hint", {
            config_conj: "homepage_background_monitor_switch",
            next_page: "homepage_background_monitor_page",
            updateOpr(view) {
                $$view.udop.main_sw.call(this, view);
            },
        }))
        .add("page", new Layout("浇水回赠能量球检测", "hint", {
            config_conj: "homepage_wball_switch",
            next_page: "homepage_wball_page",
            updateOpr(view) {
                $$view.udop.main_sw.call(this, view);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("公用设置"))
        .add("page", new Layout("能量球样本采集", {
            next_page: "forest_samples_collect_page",
        }))
        .ready();
});
$$view.page.new("主页能量球循环监测", "homepage_monitor_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "homepage_monitor_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("监测阈值", "hint", {
            config_conj: "homepage_monitor_threshold",
            newWindow() {
                $$view.diag.numSetter.call(this, 1, 3, {
                    title: "主页能量球循环监测阈值",
                    positiveAddn(d, input) {
                        let _min = $$cfg.ses.homepage_bg_monitor_threshold;
                        if (input >= _min) {
                            return true;
                        }
                        dialogsx.builds([
                            ["请注意", "caution_btn_color"],
                            "监测阈值: " + input + "\n" +
                            "返检阈值: " + _min + "\n\n" +
                            "监测阈值不可小于返检阈值\n" +
                            "可设置更大的监测阈值\n" +
                            "或设置更小的返检阈值", 0, 0, "返回"
                        ]).show();
                    },
                });
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj].toString() + " min");
            },
        }))
        .add("split_line")
        .add("info", new Layout('"自收功能"与"定时循环"共用此页面配置'))
        .add("blank")
        .ready();
});
$$view.page.new("主页能量球返检监控", "homepage_background_monitor_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "homepage_background_monitor_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("返检阈值", "hint", {
            config_conj: "homepage_bg_monitor_threshold",
            newWindow() {
                $$view.diag.numSetter.call(this, 1, 3, {
                    title: "主页能量球返检阈值",
                    hint_set: "R",
                    positiveAddn(d, input) {
                        let _max = $$cfg.ses.homepage_monitor_threshold;
                        if (input <= _max) {
                            return true;
                        }
                        dialogsx.builds([
                            ["请注意", "caution_btn_color"],
                            "返检阈值: " + input + "\n" +
                            "监测阈值: " + _max + "\n\n" +
                            "返检阈值不可大于监测阈值\n" +
                            "可设置更小的返检阈值\n" +
                            "或设置更大的监测阈值", 0, 0, "返回"
                        ]).show();
                    },
                });
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj].toString() + " min");
            },
        }))
        .ready();
});
$$view.page.new("浇水回赠能量球检测", "homepage_wball_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "homepage_wball_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("最大检查次数", "hint", {
            config_conj: "homepage_wball_check_limit",
            newWindow() {
                $$view.diag.numSetter.call(this, 10, 300, {
                    title: "浇水回赠球最大检查次数",
                    content: "通常无需修改此参数\n" +
                        "仅用于避免功能失效等原因造成的无限循环",
                });
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.unlock[this.config_conj]).toString());
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("button", new Layout("最大色相值 (无蓝分量)", "hint", {
            config_conj: "homepage_wball_max_hue_b0",
            newWindow() {
                $$view.diag.numSetter.call(this, 12, 52, {hint_set: "R"});
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj].toString() + "°");
            },
        }))
        .ready();
});
$$view.page.new("收取功能", "friend_collect_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "friend_collect_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("公用设置"))
        .add("page", new Layout("排行榜样本采集", {
            next_page: "rank_list_samples_collect_page",
        }))
        .add("page", new Layout("能量球样本采集", {
            next_page: "forest_samples_collect_page",
        }))
        .ready();
});
$$view.page.new("排行榜样本采集", "rank_list_samples_collect_page", (t) => {
    $$view.setPage(t)
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("滑动距离", "hint", {
            config_conj: "rank_list_swipe_distance",
            newWindow() {
                let _icon_h = cYx(46);
                let _safe = (uH - staH - actH - _icon_h);
                $$view.diag.numSetter.call(this, 0.4, 0.9, {
                    title: "设置排行榜页面滑动距离",
                    hint_set: "R",
                    distance: "H",
                    content: [
                        "参数示例:\n" +
                        "1260: 每次滑动 1260 像素\n" +
                        "0.6: 每次滑动 60% 屏幕距离",
                        true,
                        "安全值: " + _safe + " [ " +
                        (_safe / H).toFixedNum(2) + " ]"
                    ],
                    positiveAddn(d, input, positiveFunc) {
                        if (input <= _safe) {
                            return true;
                        }
                        dialogsx
                            .builds([
                                ["请注意", "caution_btn_color"],
                                "当前值: " + input + "\n" +
                                "安全值: " + _safe + "\n\n" +
                                "当前设置值大于安全值\n" +
                                "滑动时可能出现遗漏采集目标的问题\n\n" +
                                "确定要保留当前设置值吗",
                                ["什么是安全值", "hint_btn_bright_color"],
                                "放弃", ["确定", "warn_btn_color"], 1,
                            ])
                            .on("neutral", () => {
                                dialogsx.builds(["滑动距离安全值", "", 0, 0, "返回"], {
                                    content: "安全值指排行榜滑动时" +
                                        "可避免采集目标遗漏的理论最大值\n\n" +
                                        "计算方法:\n屏幕高度 [ " + H + " ]\n" +
                                        "减去 导航栏高度 [ " + navH + " ]\n" +
                                        "减去 状态栏高度 [ " + staH + " ]\n" +
                                        "减去 ActionBar默认高度 [ " + actH + " ]\n" +
                                        "减去 帮收图标缩放高度 [ " + _icon_h + " ]\n" +
                                        "得到 安全值 [ " + _safe + " ]\n\n" +
                                        "* 括号中的数据均源自当前设备\n" +
                                        "* 安全值为理论值\n-- 不代表真实可操作的最佳值",
                                }).show();
                            })
                            .on("negative", (ds) => {
                                ds.dismiss();
                            })
                            .on("positive", (ds) => {
                                ds.dismiss();
                                positiveFunc.call(this, d);
                            })
                            .show();
                    },
                });
            },
            updateOpr(view) {
                let value = $$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj];
                if (value < 1) value = cY(value);
                view.setHintText(value.toString() + " px  [ " + Math.round(value / H * 100) + "% H ]");
            },
        }))
        .add("button", new Layout("滑动时长", "hint", {
            config_conj: "rank_list_swipe_time",
            newWindow() {
                $$view.diag.numSetter.call(this, 100, 800, {
                    title: "设置排行榜页面滑动时长",
                });
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]).toString() + " ms");
            },
        }))
        .add("button", new Layout("滑动间隔", "hint", {
            config_conj: "rank_list_swipe_interval",
            newWindow() {
                $$view.diag.numSetter.call(this, 100, 800, {
                    title: "设置排行榜页面滑动间隔",
                });
            },
            updateOpr(view) {
                let conj = this.config_conj;
                let data = $$cfg.ses[conj] || $$sto.def.af[conj];
                view.setHintText(data.toString() + " ms");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("page", new Layout("样本复查", "hint", {
            config_conj: "rank_list_review_switch",
            next_page: "rank_list_review_page",
            updateOpr(view) {
                $$view.udop.main_sw.call(this, view, "timers_switch");
            },
        }))
        .add("button", new Layout("截图样本池差异检测阈值", "hint", {
            config_conj: "rank_list_capt_pool_diff_check_threshold",
            newWindow() {
                $$view.diag.numSetter.call(this, 5, 800, {
                    title: "排行榜截图差异检测阈值",
                });
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]).toString());
            },
        }))
        .add("button", new Layout("列表底部控件图片模板", "hint", {
            newWindow() {
                let _path = $$cfg.sto.rank_list_bottom_template_file_path;
                let _diag = dialogsx
                    .builds([
                        "排行榜底部控件图片模板", "",
                        ["null", "caution_btn_color"], "返回",
                        ["null", "attraction_btn_color"], 1,
                    ])
                    .on("neutral", () => {
                        dialogsx
                            .builds([
                                "确认删除吗", "此操作无法撤销",
                                0, "放弃", ["确认", "caution_btn_color"], 1
                            ])
                            .on("negative", (ds) => {
                                ds.dismiss();
                            })
                            .on("positive", (ds) => {
                                files.remove(_path);
                                ds.dismiss();
                                this.updateOpr(this.view);
                                _updateDiag(_diag);
                            })
                            .show();
                    })
                    .on("negative", (d) => {
                        d.dismiss();
                    })
                    .on("positive", () => {
                        app.viewFile(_path);
                    })
                    .show();

                _updateDiag(_diag);

                // tool function(s) //

                function _updateDiag(d) {
                    let {
                        rank_list_bottom_template_hint_base: _base,
                        rank_list_bottom_template_hint_exists: _exists,
                        rank_list_bottom_template_hint_not_exists: _not_exists,
                    } = $$def.dialog_contents;
                    if (files.exists(_path)) {
                        d.setContent(_base + _exists);
                        d.setActionButton("neutral", "删除模板");
                        d.setActionButton("positive", "查看模板");
                    } else {
                        d.setContent(_base + _not_exists);
                        d.setActionButton("neutral", "");
                        d.setActionButton("positive", "");
                    }
                }
            },
            updateOpr(view) {
                let file_exists_flag = files.exists($$cfg.sto.rank_list_bottom_template_file_path);
                view.setHintText(file_exists_flag ? "已生成" : "暂未生成");
            },
        }))
        .add("split_line")
        .add("info", new Layout('"收取/帮收功能"共用此页面配置'))
        .add("blank")
        .ready();
});
$$view.page.new("排行榜样本复查", "rank_list_review_page", (t) => {
    $$view.setPage(t, null, {
        check_page_state(view) {
            if (!$$cfg.ses.rank_list_review_switch) {
                return true;
            }
            let _samp = [
                "threshold_switch",
                "samples_clicked_switch",
                "difference_switch",
            ];
            for (let i = 0, l = _samp.length; i < l; i += 1) {
                let _tag = "rank_list_review_" + _samp[i];
                let _view = $$view.findViewByTag(view, _tag);
                if (_view["_checkbox_switch"].checked) {
                    return true;
                }
            }
            dialogsx.builds([
                "提示", "样本复查条件需至少选择一个",
                0, 0, "返回", 1,
            ]).on("positive", d => d.dismiss()).show();
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "rank_list_review_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("复查条件", {subhead_color: $$def.subhead_highlight_color}))
        .add("checkbox_switch", new Layout("列表状态差异", {
            config_conj: "rank_list_review_difference_switch",
            view_tag: "rank_list_review_difference_switch",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                view["_checkbox_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("样本点击记录", {
            config_conj: "rank_list_review_samples_clicked_switch",
            view_tag: "rank_list_review_samples_clicked_switch",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                view["_checkbox_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("最小倒计时阈值", {
            config_conj: "rank_list_review_threshold_switch",
            view_tag: "rank_list_review_threshold_switch",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                view["_checkbox_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("seekbar", new Layout("阈值", {
            config_conj: "rank_list_review_threshold",
            nums: [1, 5],
            unit: "min",
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解更多", {
            newWindow() {
                dialogsx.builds([
                    "关于排行榜样本复查", "about_rank_list_review",
                    0, 0, "关闭", 1
                ]).on("positive", d => d.dismiss()).show();
            },
        }))
        .add("split_line")
        .add("info", new Layout('"收取/帮收功能"与"定时循环"共用此页面配置'))
        .add("blank")
        .ready();
});
$$view.page.new("能量球样本采集", "forest_samples_collect_page", (t) => {
    $$view.setPage(t)
        .add("subhead", new Layout("采集样本池", {subhead_color: $$def.subhead_highlight_color}))
        .add("button", new Layout("样本池总容量", "hint", {
            config_conj: "forest_balls_pool_limit",
            newWindow() {
                $$view.diag.numSetter.call(this, 1, 8);
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj].toString());
            },
        }))
        .add("button", new Layout("样本采集间隔", "hint", {
            config_conj: "forest_balls_pool_itv",
            newWindow() {
                $$view.diag.numSetter.call(this, 50, 500);
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj].toString());
            },
        }))
        .add("subhead", new Layout("识别与定位", {subhead_color: $$def.subhead_highlight_color}))
        .add("button", new Layout("能量球识别区域", "hint", {
            config_conj: "forest_balls_recog_region",
            newWindow() {
                $$view.diag.rectSetter.call(this, {
                    title: "森林页面能量球识别区域",
                });
            },
            updateOpr(view) {
                let _cfg_conj = this.config_conj;
                let [_l, _t, _r, _b] = $$cfg.ses[_cfg_conj]
                    .map((v, i) => (i % 2
                            ? v < 1 ? cY(v) : v
                            : v < 1 ? cX(v) : v
                    ));
                let _rect = [[_l, _t], [_r, _b]]
                    .map(a => a.join(" , ")).join("  -  ");
                view.setHintText("Rect  [ " + _rect + " ] ");
            },
        }))
        .add("button", new Layout("能量球最小球心间距", "hint", {
            config_conj: "min_balls_distance",
            newWindow() {
                $$view.diag.numSetter.call(this, 0.06, 0.15, {
                    title: "设置能量球最小球心间距",
                    hint_set: "R",
                    distance: "W",
                    content: "此参数应用于以下策略与方案:\n" +
                        "霍夫变换 / 覆盖检测 / 对称检测\n\n" +
                        "参数示例:\n" +
                        "40: 球心间距不小于 40 像素\n" +
                        "0.08: 球心间距不小于 8% 屏幕宽度",
                });
            },
            updateOpr(view) {
                let _cfg_conj = this.config_conj;
                let _v = $$cfg.ses[_cfg_conj] || $$sto.def.af[_cfg_conj];
                _v = cX(_v).toString();
                let _v_p = (_v * 100 / W).toFixedNum(2);
                view.setHintText(_v + " px  [ " + _v_p + "% W ]");
            },
        }))
        .add("page", new Layout("颜色与阈值调节", {
            next_page: "eballs_color_config_page",
        }))
        .add("page", new Layout("霍夫变换数据传入与处理", {
            next_page: "hough_strategy_page",
        }))
        .add("subhead", new Layout("操作与控制", {subhead_color: $$def.subhead_highlight_color}))
        .add("button", new Layout("能量球点击时长", "hint", {
            config_conj: "balls_click_duration",
            newWindow() {
                $$view.diag.numSetter.call(this, 10, 500);
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj].toString() + " ms");
            },
        }))
        .add("button", new Layout("能量球点击间隔", "hint", {
            config_conj: "balls_click_interval",
            newWindow() {
                $$view.diag.numSetter.call(this, 10, 500);
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj].toString() + " ms");
            },
        }))
        .add("split_line")
        .add("info", new Layout('"自收/收取/帮收功能"共用此页面配置'))
        .add("blank")
        .ready();
});
$$view.page.new("颜色与阈值", "eballs_color_config_page", (t) => {
    $$view.setPage(t)
        .add("subhead", new Layout("成熟 (绿色) 能量球", {
            subhead_color: $$def.subhead_highlight_color,
        }))
        .add("button", new Layout("识别色值", "hint", {
            config_conj: "ripe_ball_detect_color_val",
            newWindow() {
                $$view.diag.colorSetter.call(this, {
                    title: "成熟能量球颜色检测色值",
                });
            },
            updateOpr(view) {
                $$view.hint.colorSetter.call(this, view);
            },
        }))
        .add("button", new Layout("识别阈值", "hint", {
            config_conj: "ripe_ball_detect_threshold",
            newWindow() {
                $$view.diag.numSetter.call(this, 0, 40, {
                    title: "成熟能量球颜色检测阈值",
                });
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj].toString());
            },
        }))
        .add("invisible_split_line")
        .add("subhead", new Layout("帮收 (橙色) 能量球", {
            subhead_color: $$def.subhead_highlight_color,
        }))
        .add("button", new Layout("识别色值", "hint", {
            config_conj: "help_ball_detect_color_val",
            newWindow() {
                $$view.diag.colorSetter.call(this, {
                    title: "帮收能量球颜色检测色值",
                });
            },
            updateOpr(view) {
                $$view.hint.colorSetter.call(this, view);
            },
        }))
        .add("button", new Layout("识别阈值", "hint", {
            config_conj: "help_ball_detect_threshold",
            newWindow() {
                $$view.diag.numSetter.call(this, 23, 230, {
                    title: "帮收能量球颜色检测阈值",
                });
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj].toString());
            },
        }))
        .add("invisible_split_line")
        .add("subhead", new Layout("浇水回赠 (金色) 能量球", {
            subhead_color: $$def.subhead_highlight_color,
        }))
        .add("button", new Layout("最大色相值 (无蓝分量)", "hint", {
            config_conj: "homepage_wball_max_hue_b0",
            newWindow() {
                $$view.diag.numSetter.call(this, 12, 52, {hint_set: "R"});
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj].toString() + "°");
            },
        }))
        .add("split_line")
        .add("info", new Layout('"自收/收取/帮收功能"共用此页面配置'))
        .add("blank")
        .ready();
});
$$view.page.new("霍夫变换", "hough_strategy_page", (t) => {
    $$view.setPage(t)
        .add("subhead", new Layout("数据传入策略", {subhead_color: "#bf360c"}))
        .add("checkbox_switch", new Layout("灰度化 (grayscale)", {
            kk: "gray",
            config_conj: "hough_src_img_strategy",
            view_tag: "hough_src_stg_grayscale",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        let _cfg_conj = this.config_conj;
                        let _o = {};
                        _o[this.kk] = !!state;
                        $$save.session(_cfg_conj, Object.assign($$cfg.ses[_cfg_conj], _o));
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                let _sess_v = !!$$cfg.ses[this.config_conj][this.kk];
                view["_checkbox_switch"].setChecked(_sess_v);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("自适应阈值 (adaptiveThreshold)", {
            kk: "adapt_thrd",
            config_conj: "hough_src_img_strategy",
            view_tag: "hough_src_stg_adapt_thrd",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        let _cfg_conj = this.config_conj;
                        let _o = {};
                        _o[this.kk] = !!state;
                        $$save.session(_cfg_conj, Object.assign($$cfg.ses[_cfg_conj], _o));
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                let _sess_v = !!$$cfg.ses[this.config_conj][this.kk];
                view["_checkbox_switch"].setChecked(_sess_v);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("中值滤波 (medianBlur)", {
            kk: "med_blur",
            config_conj: "hough_src_img_strategy",
            view_tag: "hough_src_stg_median_blur",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        let _cfg_conj = this.config_conj;
                        let _o = {};
                        _o[this.kk] = !!state;
                        $$save.session(_cfg_conj, Object.assign($$cfg.ses[_cfg_conj], _o));
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                let _sess_v = !!$$cfg.ses[this.config_conj][this.kk];
                view["_checkbox_switch"].setChecked(_sess_v);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("均值滤波 (blur)", {
            kk: "blur",
            config_conj: "hough_src_img_strategy",
            view_tag: "hough_src_stg_blur",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        let _cfg_conj = this.config_conj;
                        let _o = {};
                        _o[this.kk] = !!state;
                        $$save.session(_cfg_conj, Object.assign($$cfg.ses[_cfg_conj], _o));
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                let _sess_v = !!$$cfg.ses[this.config_conj][this.kk];
                view["_checkbox_switch"].setChecked(_sess_v);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("双边滤波 (bilateralFilter)", {
            kk: "blt_fltr",
            config_conj: "hough_src_img_strategy",
            view_tag: "hough_src_stg_bilateral_filter",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        let _cfg_conj = this.config_conj;
                        let _o = {};
                        _o[this.kk] = !!state;
                        $$save.session(_cfg_conj, Object.assign($$cfg.ses[_cfg_conj], _o));
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                let _sess_v = !!$$cfg.ses[this.config_conj][this.kk];
                view["_checkbox_switch"].setChecked(_sess_v);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("数据处理策略", {subhead_color: "#bf360c"}))
        .add("checkbox_switch", new Layout("覆盖检测", {
            kk: "anti_ovl",
            config_conj: "hough_results_strategy",
            view_tag: "hough_results_anti_ovl",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        let _cfg_conj = this.config_conj;
                        let _o = {};
                        _o[this.kk] = !!state;
                        $$save.session(_cfg_conj, Object.assign($$cfg.ses[_cfg_conj], _o));
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                let _sess_v = !!$$cfg.ses[this.config_conj][this.kk];
                view["_checkbox_switch"].setChecked(_sess_v);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("对称检测", {
            kk: "symmetrical",
            config_conj: "hough_results_strategy",
            view_tag: "hough_results_symmetrical",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        let _cfg_conj = this.config_conj;
                        let _o = {};
                        _o[this.kk] = !!state;
                        $$save.session(_cfg_conj, Object.assign($$cfg.ses[_cfg_conj], _o));
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                let _sess_v = !!$$cfg.ses[this.config_conj][this.kk];
                view["_checkbox_switch"].setChecked(_sess_v);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("线性插值", {
            kk: "linear_itp",
            config_conj: "hough_results_strategy",
            view_tag: "hough_results_linear_itp",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        let _cfg_conj = this.config_conj;
                        let _o = {};
                        _o[this.kk] = !!state;
                        $$save.session(_cfg_conj, Object.assign($$cfg.ses[_cfg_conj], _o));
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                let _sess_v = !!$$cfg.ses[this.config_conj][this.kk];
                view["_checkbox_switch"].setChecked(_sess_v);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解更多", {
            newWindow() {
                dialogsx.builds([
                    "关于能量球识别与定位", "about_eballs_recognition",
                    0, 0, "关闭", 1
                ]).on("positive", d => d.dismiss()).show();
            },
        }))
        .add("split_line")
        .add("info", new Layout('"自收/收取/帮收功能"共用此页面配置'))
        .add("blank")
        .ready();
});
$$view.page.new("帮收功能", "help_collect_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "help_collect_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("有效时段", "hint", {
            config_conj: "help_collect_section",
            newWindow() {
                let _cfg_conj = this.config_conj;
                let _init_val = $$cfg.ses[_cfg_conj];
                $$view.setTimePickerView({
                    picker_views: [
                        {type: "time", text: "设置开始时间", init: _init_val[0]},
                        {type: "time", text: "设置结束时间", init: _init_val[1]},
                    ],
                    time_str: {
                        suffix(getStr) {
                            if (getStr(2).default() < getStr(1).default()) {
                                return "(+1)";
                            }
                        },
                        middle(getStr) {
                            if (getStr(2).default() === getStr(1).default()) {
                                return "全天";
                            }
                        },
                    },
                    buttons: {
                        reserved_btn: {
                            text: "设置 '全天'",
                            onClickListener(getTimeInfo, close) {
                                close("全天");
                            },
                        },
                    },
                    onFinish(ret) {
                        if (ret) {
                            let _sect = ret === "全天" ? [] : $$tool.timeStrToSection(ret);
                            if (_sect[0] === _sect[1]) {
                                _sect = $$sto.def.af[_cfg_conj];
                            }
                            $$save.session(_cfg_conj, _sect);
                        }
                    },
                });
            },
            updateOpr(view) {
                let _v = $$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]; // Array
                let hint_text = _v[0] === _v[1] ? "全天" : $$tool.timeSectionToStr(_v);
                view.setHintText(hint_text);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("公用设置"))
        .add("page", new Layout("排行榜样本采集", {
            next_page: "rank_list_samples_collect_page",
        }))
        .add("page", new Layout("能量球样本采集", {
            next_page: "forest_samples_collect_page",
        }))
        .ready();
});
$$view.page.new("自动解锁", "auto_unlock_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "auto_unlock_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("锁屏密码", "hint", {
            config_conj: "unlock_code",
            newWindow() {
                let _cfg_conj = this.config_conj;
                dialogsx
                    .builds([
                        "设置锁屏解锁密码", _cfg_conj,
                        ["查看示例", "hint_btn_bright_color"], "返回", "确认", 1
                    ], {inputHint: "密码将以密文形式存储在本地"})
                    .on("neutral", () => {
                        dialogsx.builds([
                            "锁屏密码示例", "unlock_code_demo",
                            ["了解点阵简化", "hint_btn_bright_color"], 0, "关闭", 1
                        ]).on("neutral", () => {
                            dialogsx.builds([
                                "图案解锁密码简化", "about_pattern_simplification",
                                0, 0, "关闭", 1
                            ]).on("positive", ds2 => ds2.dismiss()).show();
                        }).on("positive", ds => ds.dismiss()).show();
                    })
                    .on("negative", (d) => {
                        d.dismiss();
                    })
                    .on("positive", (d) => {
                        let _input = dialogsx.getInputText(d);
                        let _sto_k = "unlock_code_safe_dialog_prompt_prompted";
                        if (_input && _input.length < 3) {
                            return dialogsx.alertTitle(d, "密码长度不小于 3 位");
                        }
                        if (!input || $$sto.af.get(_sto_k)) {
                            return _saveSess();
                        }
                        let _unlk_safe_fg = false;
                        dialogsx
                            .builds([
                                "风险提示", "unlock_code_safe_confirm",
                                ["了解详情", "hint_btn_bright_color"],
                                "放弃", ["继续", "caution_btn_color"], 1, 1
                            ])
                            .on("check", (c) => {
                                _unlk_safe_fg = !!c;
                            })
                            .on("neutral", () => {
                                dialogsx.linkify(dialogsx.builds([
                                    "设备遗失对策", "about_lost_device_solution",
                                    0, 0, "关闭", 1
                                ]).on("positive", ds2 => ds2.dismiss()).show(), "WEB_URLS");
                            })
                            .on("negative", (ds) => {
                                ds.dismiss();
                            })
                            .on("positive", (ds) => {
                                if (_unlk_safe_fg) {
                                    $$sto.af.put(_sto_k, true);
                                }
                                ds.dismiss();
                                _saveSess();
                            })
                            .show();

                        // tool function(s) //

                        function _saveSess() {
                            $$save.session(_cfg_conj, _input ? $$enc(_input) : "");
                            d.dismiss();
                        }
                    })
                    .show();
            },
            updateOpr(view) {
                view.setHintText($$cfg.ses[this.config_conj] ? "已设置" : "空");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("button", new Layout("最大尝试次数", "hint", {
            config_conj: "unlock_max_try_times",
            newWindow() {
                $$view.diag.numSetter.call(this, 5, 50, {
                    title: "设置解锁最大尝试次数",
                    def_key: "unlock",
                    content: "",
                });
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.unlock[this.config_conj]).toString());
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("提示层页面设置", {subhead_color: "#bf360c"}))
        .add("button", new Layout("检测方式", "hint", {
            config_conj: "unlock_dismiss_layer_strategy",
            map: {
                preferred: "优先",
                deferred: "滞后",
                disabled: "禁用",
            },
            newWindow() {
                $$view.diag.radioSetter.call(this, {
                    title: "图案解锁滑动策略",
                    def_key: "unlock",
                    neutral() {
                        dialogsx.builds([
                            "关于提示层页面检测方式", "about_unlock_dismiss_layer_strategy",
                            0, 0, "关闭", 1
                        ]).on("positive", ds => ds.dismiss()).show();
                    },
                });
            },
            updateOpr(view) {
                view.setHintText(this.map[($$cfg.ses[this.config_conj] || $$sto.def.unlock[this.config_conj])]);
            },
        }))
        .add("button", new Layout("上滑时长", "hint", {
            config_conj: "unlock_dismiss_layer_swipe_time",
            newWindow() {
                $$view.diag.numSetter.call(this, 110, 1e3, {
                    title: "提示层页面上滑时长",
                    def_key: "unlock",
                });
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.unlock[this.config_conj]).toString() + " ms");
            },
        }))
        .add("button", new Layout("起点位置", "hint", {
            config_conj: "unlock_dismiss_layer_bottom",
            newWindow() {
                $$view.diag.numSetter.call(this, 0.5, 0.95, {
                    title: "提示层页面起点位置",
                    hint_set: "R",
                    def_key: "unlock",
                    neutral(d, f) {
                        f($$sto.def.unlock[this.config_conj].toString());
                    },
                });
            },
            updateOpr(view) {
                let value = ($$cfg.ses[this.config_conj] || $$sto.def.unlock[this.config_conj]) * 100;
                view.setHintText(value.toString() + "% H");
            },
        }))
        .add("button", new Layout("终点位置", "hint", {
            config_conj: "unlock_dismiss_layer_top",
            newWindow() {
                $$view.diag.numSetter.call(this, 0.05, 0.3, {
                    title: "提示层页面终点位置",
                    hint_set: "R",
                    def_key: "unlock",
                    neutral(d, f) {
                        f($$sto.def.unlock[this.config_conj].toString());
                    },
                });
            },
            updateOpr(view) {
                let value = ($$cfg.ses[this.config_conj] || $$sto.def.unlock[this.config_conj]) * 100;
                view.setHintText(value.toString() + "% H");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("图案解锁设置", {subhead_color: "#bf360c"}))
        .add("button", new Layout("滑动策略", "hint", {
            config_conj: "unlock_pattern_strategy",
            map: {
                segmental: "叠加路径", // gestures()
                solid: "连续路径", // gesture()
            },
            newWindow() {
                $$view.diag.radioSetter.call(this, {
                    title: "图案解锁滑动策略",
                    def_key: "unlock",
                    neutral() {
                        dialogsx.builds([
                            "关于图案解锁滑动策略", "about_unlock_pattern_strategy",
                            0, 0, "关闭", 1
                        ]).on("positive", ds => ds.dismiss()).show();
                    },
                });
            },
            updateOpr(view) {
                view.setHintText(this.map[($$cfg.ses[this.config_conj] || $$sto.def.unlock[this.config_conj]).toString()]);
            },
        }))
        .add("button", new Layout("滑动时长", "hint", {
            getConfigConj() {
                let _key = "unlock_pattern_strategy";
                let _stg = $$cfg.ses[_key] || $$sto.def.unlock[_key];
                return "unlock_pattern_swipe_time_" + _stg;
            },
            newWindow() {
                let _getConfigConj = this.getConfigConj.bind(this);
                $$view.diag.numSetter.call(this, 120, 3e3, {
                    get config_conj() {
                        return _getConfigConj();
                    },
                    title: "设置图案解锁滑动时长",
                    def_key: "unlock",
                });
            },
            updateOpr(view) {
                let _cfg_conj = this.getConfigConj();
                view.setHintText(($$cfg.ses[_cfg_conj] || $$sto.def.unlock[_cfg_conj]).toString() + " ms");
            },
        }))
        .add("button", new Layout("点阵边长", "hint", {
            config_conj: "unlock_pattern_size",
            newWindow() {
                $$view.diag.numSetter.call(this, 3, 6, {
                    title: "设置图案解锁边长",
                    def_key: "unlock",
                });
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.unlock[this.config_conj]).toString());
            },
        }))
        .ready();
});
$$view.page.new("消息提示", "message_showing_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "message_showing_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("switch", new Layout("控制台消息", {
            config_conj: "console_log_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("radio", new Layout(["详细", "简略"], {
            values: [true, false],
            config_conj: "console_log_details",
            listeners: {
                check(checked, view) {
                    checked && $$save.session(this.config_conj, this.values[this.title.indexOf(view.text)]);
                },
            },
            updateOpr(view) {
                let child_idx = this.values.indexOf($$cfg.ses[this.config_conj]);
                if (~child_idx) {
                    let child_view = view["_radiogroup"].getChildAt(child_idx);
                    !child_view.checked && child_view.setChecked(true);
                }
            },
        }))
        .add("checkbox_switch", new Layout("开发者测试模式", {
            default_state: false,
            config_conj: "debug_info_switch",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.weakOrStrongBySwitch(this, !state, -1);
                    },
                },
            },
            updateOpr(view) {
                view["_checkbox_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("switch", new Layout("运行前提示对话框", {
            config_conj: "prompt_before_running_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("button", new Layout("对话框倒计时时长", "hint", {
            config_conj: "prompt_before_running_countdown_seconds",
            newWindow() {
                $$view.diag.numSetter.call(this, 3, 30, {
                    title: "提示对话框倒计时时长",
                });
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]).toString() + " s");
            },
        }))
        .add("button", new Layout("推迟运行间隔时长", "hint", {
            config_conj: "prompt_before_running_postponed_minutes",
            map: Object.assign({
                0: "每次都询问",
            }, (() => {
                let _o = {};
                let _k = "prompt_before_running_postponed_minutes_map";
                $$sto.def.af[_k].forEach(n => _o[n] = n + " min");
                return _o;
            })()),
            newWindow() {
                $$view.diag.radioSetter.call(this);
            },
            updateOpr(view) {
                view.setHintText(this.map[($$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]).toString()]);
            },
        }))
        .add("checkbox_switch", new Layout("息屏或上锁启动时自动跳过", {
            default_state: true,
            config_conj: "prompt_before_running_auto_skip",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                    },
                },
            },
            updateOpr(view) {
                view["_checkbox_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("switch", new Layout("运行结果展示", {
            config_conj: "result_showing_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("radio", new Layout(["Floaty", "Toast"], {
            values: [true, false],
            config_conj: "floaty_result_switch",
            listeners: {
                check(checked, view) {
                    let {text} = view;
                    checked && $$save.session(this.config_conj, this.values[this.title.indexOf(text)]);
                    text === this.title[0] && $$view.showOrHideBySwitch(this, checked, false, "split_line");
                },
            },
            updateOpr(view) {
                let child_idx = this.values.indexOf($$cfg.ses[this.config_conj]);
                if (~child_idx) {
                    let child_view = view["_radiogroup"].getChildAt(child_idx);
                    child_view.checked || child_view.setChecked(true);
                }
            },
        }))
        .add("seekbar", new Layout("时长", {
            config_conj: "floaty_result_countdown",
            nums: [2, 9],
            unit: "s",
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow() {
                dialogsx.builds([
                    "关于消息提示配置", "about_message_showing_function",
                    0, 0, "关闭", 1
                ]).on("positive", d => d.dismiss()).show();
            },
        }))
        .ready();
});
$$view.page.new("本地日志", "global_log_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "global_log_switch",
            view_tag: "global_log_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                if ($$ses.on_exit_flag) {
                    $$cfg.sto[this.config_conj] ? _on() : _off();
                } else {
                    view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
                }

                // tool function(s) //

                function _on() {
                    console.setGlobalLogConfig({
                        file: $$cfg.sto.global_log_cfg_file_path + "AutoJsLog.log",
                        filePattern: $$cfg.sto.global_log_cfg_file_pattern,
                        maxBackupSize: $$cfg.sto.global_log_cfg_max_backup_size,
                        maxFileSize: $$cfg.sto.global_log_cfg_max_file_size * 1024,
                    });
                }

                function _off() {
                    let _lc = new Packages["de.mindpipe.android.logging.log4j"].LogConfigurator();
                    _lc.setRootLevel(org.apache.log4j.Level.OFF);
                    _lc.setUseFileAppender(false);
                    _lc.setResetConfiguration(true);
                    _lc.configure();
                }
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("文件路径", "hint", {
            config_conj: "global_log_cfg_file_path",
            newWindow() {
                let _is_valid = true;
                let _cfg_conj = this.config_conj;

                dialogsx
                    .builds(["本地日志文件路径", _buildContent(),
                            ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1
                        ], {inputHint: "输入路径"}
                    )
                    .on("input_change", d => d.setContent(_buildContent(d.getInputEditText())))
                    .on("neutral", d => dialogsx.setInputText(d, $$sto.def.af[_cfg_conj].toString()))
                    .on("negative", d => d.dismiss())
                    .on("positive", (d) => {
                        if (!_is_valid) {
                            return dialogsx.alertTitle(d, "路径输入不合法");
                        }
                        let _input = dialogsx.getInputText(d);
                        if (_input) {
                            $$save.session(_cfg_conj, _getShortenPath(_input));
                        }
                        d.dismiss();

                        // tool function(s) //

                        function _getShortenPath(path) {
                            let _path = files.path(path || "");
                            let _cwd = files.cwd();
                            let _idx = _path.search(_cwd);
                            if (!~_idx) {
                                return _path;
                            }
                            _path = "." + _path.slice(_idx + _cwd.length);
                            if (_path.lastIndexOf("/") !== _path.length - 1) {
                                _path += "/";
                            }
                            return _path;
                        }
                    })
                    .show();

                // tool function(s) //

                function _buildContent(input) {
                    return "支持相对路径\n" +
                        "如\"./Log/\"等同于\"" + files.cwd() + "/Log/\"\n\n" +
                        "当前输入的目录状态:\n" + _checkInput(input) + "\n";

                    // tool function(s) //

                    function _checkInput(input) {
                        let _input = input && input.getText().toString().trim() || "";
                        _is_valid = true;

                        if (!_input) {
                            return "等待输入";
                        }
                        let _path = files.path(_input);
                        if (_path.match(/[:*?"<>|]/)) {
                            _is_valid = false;
                            return "包含限制字符";
                        }
                        if (files.isFile(_path)) {
                            _is_valid = false;
                            return "已存在 (文件)";
                        }
                        if (files.isDir(_path)) {
                            return "已存在 (" + (files.isEmptyDir(_path) ? "空" : "非空") + "文件夹)";
                        }
                        return "不存在 (将自动创建)";
                    }

                }
            },
            updateOpr(view) {
                let _val = $$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj];
                view.setHintText(files.path(_val.toString()));
            },
        }))
        .add("seekbar", new Layout("文件数量限制", {
            config_conj: "global_log_cfg_max_backup_size",
            nums: [1, 9],
        }))
        .add("seekbar", new Layout("文件大小限制", {
            config_conj: "global_log_cfg_max_file_size",
            nums: [128, 960],
            inc: 64,
            unit: "KB",
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("button", new Layout("日志写入模式", "hint", {
            config_conj: "global_log_cfg_file_pattern",
            newWindow() {
                let _cfg_conj = this.config_conj;

                dialogsx.linkify(dialogsx
                    .builds(["本地日志写入模式", "写入模式示例:\n\n" +
                        "%m%n\n%d - [%p::%c::%C] - %m%n\n%d{yyyy-MM-dd HH:mm}%m%n\n\n" +
                        "详情参阅:\nhttp://logging.apache.org/log4j/1.2/apidocs/org/apache/" +
                        "log4j/PatternLayout.html",
                            ["使用默认值", "hint_btn_dark_color"], "返回", "确认修改", 1
                        ], {inputHint: "输入日志写入模式"}
                    )
                    .on("neutral", d => dialogsx.setInputText(d, $$sto.def.af[_cfg_conj].toString()))
                    .on("negative", d => d.dismiss())
                    .on("positive", (d) => {
                        let _input = dialogsx.getInputText(d);
                        _input && $$save.session(_cfg_conj, _input);
                        d.dismiss();
                    })
                    .show(), "WEB_URLS");
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]).toString());
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow() {
                dialogsx.builds([
                    "关于本地日志功能", "about_global_log_page",
                    0, 0, "关闭", 1
                ]).on("positive", d => d.dismiss()).show();
            },
        }))
        .ready();
});
$$view.page.new("定时循环", "timers_page", (t) => {
    $$view.setPage(t, null, {
        check_page_state() {
            // this is just a simple check
            let switches = [
                "homepage_monitor_switch",
                "rank_list_review_switch",
                "timers_self_manage_switch",
            ];
            for (let i = 0, l = switches.length; i < l; i += 1) {
                if ($$cfg.ses[switches[i]]) return true;
            }
            dialogsx.builds(["提示", "定时循环子功能需至少选择一个", 0, 0, "返回"]).show();
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "timers_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("循环监测", {subhead_color: $$def.subhead_highlight_color}))
        .add("page", new Layout("主页能量球循环监测", "hint", {
            config_conj: "homepage_monitor_switch",
            next_page: "homepage_monitor_page",
            updateOpr(view) {
                $$view.udop.main_sw.call(this, view, "self_collect_switch");
            },
        }))
        .add("page", new Layout("好友排行榜样本复查", "hint", {
            config_conj: "rank_list_review_switch",
            next_page: "rank_list_review_page",
            updateOpr(view) {
                $$view.udop.main_sw.call(this, view, [
                    "friend_collect_switch", "help_collect_switch"
                ]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("定时任务", {subhead_color: $$def.subhead_highlight_color}))
        .add("page", new Layout("定时任务自动管理", "hint", {
            config_conj: "timers_self_manage_switch",
            next_page: "timers_self_manage_page",
            updateOpr(view) {
                $$view.udop.main_sw.call(this, view);
            },
        }))
        .add("page", new Layout("定时任务控制面板", {
            next_page: "timers_control_panel_page",
        }))
        .ready();
});
$$view.page.new("定时任务自动管理", "timers_self_manage_page", (t) => {
    $$view.setPage(t, null, {
        check_page_state(view) {
            return _chkPageSw() && _chkAutoUnlockSw();

            // tool function(s) //

            function _chkPageSw() {
                if (!$$cfg.ses.timers_self_manage_switch) {
                    return true;
                }

                let _smp = [
                    "timers_countdown_check_own_switch",
                    "timers_countdown_check_friends_switch",
                    "timers_uninterrupted_check_switch",
                    "timers_insurance_switch",
                ];
                let _len = _smp.length;
                let _chk = (tag) => {
                    let _view = $$view.findViewByTag(view, tag);
                    return _view["_checkbox_switch"].checked;
                };
                for (let i = 0; i < _len; i += 1) {
                    if (_chk(_smp[i])) {
                        return true;
                    }
                }

                dialogsx.builds([
                    "提示", "自动管理机制需至少选择一个",
                    0, 0, "返回"
                ]).show();
            }

            function _chkAutoUnlockSw() {
                if ($$cfg.ses.auto_unlock_switch
                    || $$sto.af.get("timers_prefer_auto_unlock_dialog_prompt_prompted")
                ) return true;
                let timers_prefer_auto_unlock_dialog_prompt_prompted = false;
                let diag = dialogsx.builds([
                    ["请注意", "caution_btn_color"],
                    "timers_prefer_auto_unlock", 0, 0, " OK ", 1, 1
                ]);
                diag.on("check", checked => timers_prefer_auto_unlock_dialog_prompt_prompted = !!checked);
                diag.on("positive", () => {
                    if (timers_prefer_auto_unlock_dialog_prompt_prompted) {
                        $$sto.af.put("timers_prefer_auto_unlock_dialog_prompt_prompted", true);
                    }
                    diag.dismiss();
                    $$view.page.jump("back");
                });
                diag.show();
            }
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "timers_self_manage_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("自动管理机制", {subhead_color: $$def.subhead_highlight_color}))
        .add("checkbox_switch", new Layout("主页最小倒计时机制", {
            config_conj: "timers_countdown_check_own_switch",
            tag_name: "timers_countdown_check_own_switch",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                view["_checkbox_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("button", new Layout("定时任务提前运行", "hint", {
            config_conj: "timers_countdown_check_own_timed_task_ahead",
            newWindow() {
                $$view.diag.numSetter.call(this, 0, 3, {
                    content: "timers_countdown_check_timed_task_ahead",
                    positiveAddn(d, input, positiveFunc) {
                        let _saveSess = (ds) => {
                            positiveFunc.call(this, d);
                            ds && ds.dismiss();
                        };
                        if ($$0(+input)) {
                            return true;
                        }
                        let {
                            homepage_monitor_switch: _hp_mon_sw,
                            homepage_monitor_threshold: _hp_mon_thrd,
                        } = $$cfg.ses;
                        if (!_hp_mon_sw) {
                            dialogsx
                                .builds([
                                    ["请注意", "caution_btn_color"],
                                    "timers_ahead_prefer_monitor_own",
                                    0, "放弃", ["确定", "warn_btn_color"], 1
                                ])
                                .on("negative", ds => ds.dismiss())
                                .on("positive", ds => _saveSess(ds))
                                .show();
                        } else if (input > _hp_mon_thrd) {
                            dialogsx
                                .builds([
                                    ["请注意", "caution_btn_color"], "",
                                    0, "放弃", ["确定", "warn_btn_color"], 1
                                ], {
                                    content: "当前设置值: " + input + "\n" +
                                        "主页能量球监测阈值: " + _hp_mon_thrd + "\n\n" +
                                        "设置值大于主页能量球监测阈值\n\n" +
                                        "此情况下提前运行脚本\n" +
                                        "主页能量球最小倒计时可能未达到监测阈值\n" +
                                        "因此可能无法监测收取\n\n" +
                                        "确定要保留当前设置值吗",
                                })
                                .on("negative", ds => ds.dismiss())
                                .on("positive", ds => _saveSess(ds))
                                .show();
                        } else {
                            return true;
                        }
                    },
                });
            },
            updateOpr(view) {
                let session_value = +$$cfg.ses[this.config_conj];
                let value = isNaN(session_value) ? $$sto.def.af[this.config_conj] : session_value;
                view.setHintText(value === 0 ? "已关闭" : (value.toString() + " min"));
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("排行榜最小倒计时机制", {
            config_conj: "timers_countdown_check_friends_switch",
            tag_name: "timers_countdown_check_friends_switch",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                view["_checkbox_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("button", new Layout("定时任务提前运行", "hint", {
            config_conj: "timers_countdown_check_friends_timed_task_ahead",
            newWindow() {
                $$view.diag.numSetter.call(this, 0, 5, {
                    content: "timers_countdown_check_timed_task_ahead",
                    positiveAddn(d, input, positiveFunc) {
                        let _saveSess = (ds) => {
                            positiveFunc.call(this, d);
                            ds && ds.dismiss();
                        };
                        if ($$0(+input)) {
                            return true;
                        }
                        let {
                            rank_list_review_switch: _sw,
                            rank_list_review_threshold_switch: _thrd_sw,
                            rank_list_review_threshold: _thrd,
                        } = $$cfg.ses;
                        if (!(_sw && _thrd_sw)) {
                            dialogsx
                                .builds([
                                    ["请注意", "caution_btn_color"],
                                    "timers_ahead_prefer_rank_list_threshold_review",
                                    0, "放弃", ["确定", "warn_btn_color"], 1
                                ])
                                .on("negative", ds => ds.dismiss())
                                .on("positive", ds => _saveSess(ds))
                                .show();
                        } else if (_sw && _thrd_sw && input > _thrd) {
                            dialogsx
                                .builds([
                                    ["请注意", "caution_btn_color"], "",
                                    0, "放弃", ["确定", "warn_btn_color"], 1
                                ], {
                                    content: "当前设置值: " + input + "\n" +
                                        "排行榜样本复查最小倒计时阈值: " + _thrd + "\n\n" +
                                        "设置值大于样本复查最小倒计时阈值\n\n" +
                                        "此情况下提前运行脚本\n" +
                                        "排行榜样本最小倒计时可能未达到监测阈值\n" +
                                        "因此可能无法完成倒计时监测\n\n" +
                                        "确定要保留当前设置值吗",
                                })
                                .on("negative", ds => ds.dismiss())
                                .on("positive", ds => _saveSess(ds))
                                .show();
                        } else {
                            return true;
                        }
                    },
                });
            },
            updateOpr(view) {
                let session_value = +$$cfg.ses[this.config_conj];
                let value = isNaN(session_value) ? $$sto.def.af[this.config_conj] : session_value;
                view.setHintText(value === 0 ? "已关闭" : (value.toString() + " min"));
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("延时接力机制", {
            config_conj: "timers_uninterrupted_check_switch",
            view_tag: "timers_uninterrupted_check_switch",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                view["_checkbox_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("page", new Layout("时间区间管理", "hint", {
            config_conj: "timers_uninterrupted_check_sections",
            next_page: "timers_uninterrupted_check_sections_page",
            updateOpr(view) {
                let _areas = $$cfg.ses[this.config_conj];
                let _len = _areas ? _areas.length : 0;
                let _hint = "未设置";
                if (_len > 1) {
                    _hint = "包含区间: " + _len + " 组";
                } else if (_len === 1) {
                    let _sect = $$tool.timeSectionToStr(_areas[0].section);
                    let _itv = _areas[0].interval;
                    _hint = _sect + "  [ " + _itv + " min ]";
                }
                view.setHintText(_hint);
            },
        }))
        .add("split_line")
        .add("checkbox_switch", new Layout("意外保险机制", {
            config_conj: "timers_insurance_switch",
            view_tag: "timers_insurance_switch",
            listeners: {
                _checkbox_switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state, false, "split_line");
                    },
                },
            },
            updateOpr(view) {
                view["_checkbox_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("button", new Layout("保险任务运行间隔", "hint", {
            config_conj: "timers_insurance_interval",
            newWindow() {
                $$view.diag.numSetter.call(this, 1, 10);
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]).toString() + " min");
            },
        }))
        .add("button", new Layout("最大连续保险次数", "hint", {
            config_conj: "timers_insurance_max_continuous_times",
            newWindow() {
                $$view.diag.numSetter.call(this, 1, 5);
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]).toString());
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("自动管理功能有效时段", {subhead_color: $$def.subhead_highlight_color}))
        .add("button", new Layout("有效时段管理", "hint", {
            config_conj: "timers_auto_task_sections",
            newWindow() {
                let _this = this;
                let _tmp_areas = $$cfg.ses[_this.config_conj].slice();
                let _diag = dialogsx
                    .builds([
                        "有效时段管理", "",
                        "添加时段", "放弃", "确认", 1
                    ], {
                        items: ["\xa0"],
                    })
                    .on("neutral", (d) => {
                        d.dismiss();
                        $$view.setTimePickerView({
                            picker_views: [
                                {type: "time", text: "设置开始时间"},
                                {type: "time", text: "设置结束时间"},
                            ],
                            time_str: {
                                suffix(getStrFunc) {
                                    if (getStrFunc(2).default() <= getStrFunc(1).default()) return "(+1)";
                                },
                            },
                            onFinish(ret) {
                                d.show();
                                if (ret) {
                                    _tmp_areas.push($$tool.timeStrToSection(ret));
                                    _refreshItems();
                                }
                            },
                        });
                    })
                    .on("negative", (d) => {
                        _tmp_areas.splice(0);
                        _tmp_areas = null;
                        d.dismiss();
                    })
                    .on("positive", (d) => {
                        $$save.session(this.config_conj, _tmp_areas);
                        d.dismiss();
                    })
                    .on("item_select", (idx) => {
                        dialogsx
                            .builds([
                                "提示", "确定删除此时段吗",
                                0, "放弃", ["删除", "warn_btn_color"], 1,
                            ])
                            .on("negative", (d) => {
                                d.dismiss();
                            })
                            .on("positive", (d) => {
                                _tmp_areas.splice(idx, 1);
                                _refreshItems();
                                d.dismiss();
                            })
                            .show();
                    })
                    .show();

                _refreshItems();

                // tool function(s) //

                function _refreshItems() {
                    let _cnt = _tmp_areas.length
                        ? "所有时段取并集\n点击时段可删除"
                        : "点击\"添加时段\"按钮添加新时段";
                    _diag.setItems(_tmp_areas.map($$tool.timeSectionToStr));
                    _diag.setContent(_cnt);
                }
            },
            updateOpr(view) {
                let _areas = $$cfg.ses[this.config_conj];
                let _len = _areas ? _areas.length : 0;
                let _hint = "未设置 (全天有效)";
                if (_len > 1) {
                    _hint = "包含时段: " + _len + " 组";
                } else if (_len === 1) {
                    _hint = $$tool.timeSectionToStr(_areas[0]);
                }
                view.setHintText(_hint);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow() {
                let diag = dialogsx.builds(["关于定时任务自动管理机制", "about_timers_self_manage", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
});
$$view.page.new("定时任务控制面板", "timers_control_panel_page", (t) => {
    $$view.setPage(t, (p_view) => {
        $$view.setTimersControlPanelPageButtons(p_view, "timed_tasks", wizardFunc)
    }, {no_scroll_view: true})
        .add("list", new Layout("/*管理本项目定时任务*/", {
            list_head: "timed_tasks",
            data_source_key_name: "timed_tasks",
            custom_data_source() {
                let all_tasks = timersx.queryTimedTasks({
                    path: files.cwd() + "/Ant_Forest_Launcher.js",
                });

                let data_source = [];

                all_tasks.forEach(task => data_source.push({
                    task: task,
                    type: _getType(timedTaskTimeFlagConverter(task.getTimeFlag()), task.id),
                    next_run_time: task.getNextTime(),
                }));

                return data_source;

                // tool function(s) //

                function _getType(arr, id) {
                    if (arr.length) return arr;
                    let type_info = {
                        min_countdown: "最小倒计时",
                        min_countdown_restrained: "最小倒计时 (顺延)",
                        uninterrupted: "延时接力",
                        uninterrupted_restrained: "延时接力 (顺延)",
                        insurance: "意外保险",
                        postponed: "用户推迟",
                        postponed_auto: "自动推迟",
                    };

                    let sto_auto_task = $$sto.af.get("next_auto_task");
                    if (sto_auto_task && id === sto_auto_task.task_id) return type_info[sto_auto_task.type];

                    let sto_ins_tasks = $$sto.af.get("insurance_tasks", []);
                    if (sto_ins_tasks.length && ~sto_ins_tasks.indexOf(id)) return type_info.insurance;

                    return 0; // "一次性"
                }
            },
            list_checkbox: "gone",
            listeners: {
                _list_data: {
                    item_click(item) {
                        let {task, list_item_name_0} = item;
                        let [type, next_run_time] = [list_item_name_0, task.getNextTime()];
                        let type_code = $$tool.restoreFromTimedTaskTypeStr(type);
                        let task_id = task.id;

                        let {data_source_key_name: _ds_k, custom_data_source: _custom_ds} = this;
                        let reInitDataSource = () => {
                            $$view.updateDataSource(_ds_k, "re_init", _custom_ds.call(this));
                        };

                        let type_info = {
                            min_countdown: "最小倒计时",
                            uninterrupted: "延时接力",
                            insurance: "意外保险",
                            postponed: "用户推迟",
                            postponed_auto: "自动推迟",
                        };

                        let keys = Object.keys(type_info);
                        for (let i = 0, l = keys.length; i < l; i += 1) {
                            let key = keys[i];
                            if (type_info[key] === type_code) {
                                type_code = key;
                                break;
                            }
                        }

                        dialogsx
                            .builds([
                                "任务详情", showDiagContent(),
                                ["删除任务", "caution_btn_color"],
                                ["编辑任务", "warn_btn_color"],
                                "关闭", 1,
                            ])
                            .on("neutral", (d) => {
                                dialogsx
                                    .builds([
                                        "删除提示",
                                        "确认要删除当前任务吗\n此操作将立即生效且无法撤销",
                                        0, "放弃", ["删除", "caution_btn_color"], 1,
                                    ])
                                    .on("negative", (ds) => {
                                        ds.dismiss();
                                    })
                                    .on("positive", (ds) => {
                                        if (type_code === "min_countdown") {
                                            dialogsx.builds([
                                                ["小心", "title_caution_color"],
                                                ["delete_min_countdown_task_warn", "content_warn_color"],
                                                0, "放弃", ["确定", "caution_btn_color"], 1,
                                            ]).on("negative", (ds2) => {
                                                ds2.dismiss();
                                            }).on("positive", (ds2) => {
                                                ds2.dismiss();
                                                deleteNow();
                                            }).show();
                                        } else {
                                            deleteNow();
                                        }

                                        // tool function(s) //

                                        function deleteNow() {
                                            threadsx.starts(function () {
                                                d.dismiss();
                                                ds.dismiss();
                                                timersx.removeTimedTask(task_id, "wait");
                                                reInitDataSource();
                                            });
                                        }
                                    })
                                    .show();
                            })
                            .on("negative", (d) => {
                                if (type_code !== 0 && !classof(type_code, "Array")) {
                                    return dialogsx.builds([
                                        "无法编辑",
                                        "仅以下类型的任务可供编辑:\n\n" +
                                        "1. 一次性任务\n2. 每日任务\n3. 每周任务\n\n" +
                                        "自动管理的任务不提供编辑功能",
                                        0, 0, "返回", 1
                                    ]).on("positive", ds => ds.dismiss()).show();
                                }
                                if (!timersx.getTimedTask(task_id)) {
                                    return dialogsx.builds([
                                        "无法编辑", "该任务ID不存在\n可能是任务已自动完成或被删除",
                                        0, 0, "返回", 1
                                    ]).on("positive", ds => ds.dismiss()).show();
                                }
                                d.dismiss();
                                wizardFunc("modify", task, type_code, d);
                            })
                            .on("positive", (d) => {
                                d.dismiss();
                            })
                            .show();

                        // tool function(s) //

                        function showDiagContent() {
                            let is_weekly = type.match(/每周/);
                            let pad = type.match(/\)$/) ? " " : "";
                            return "任务ID: " + task_id + "\n\n" +
                                "任务类型: " + (is_weekly ? "每周" : type) + pad + "任务" + "\n\n" +
                                (is_weekly ? "任务周期: " + type.match(/\d/g).join(", ") + "\n\n" : "") +
                                "下次运行: " + $$tool.getTimeStrFromTs(next_run_time, "time_str_full");
                        }
                    },
                    item_bind(item_view) {
                        item_view["_checkbox"].setVisibility(8);
                    }
                },
                ui: {
                    resume() {
                        let {data_source_key_name: _ds_k, custom_data_source: _custom_ds} = this;
                        $$view.updateDataSource(_ds_k, "re_init", _custom_ds.call(this));
                    },
                }
            },
        }))
        .add("info", new Layout("此页全部操作将立即生效且无法撤销"))
        .add("blank")
        .ready();

    // tool function(s) //

    function wizardFunc(operation, task, type_code, diag) {
        let _is_modify_mode = operation === "modify";

        let _type_str = null;
        if (_is_modify_mode) {
            if ($$0(type_code)) {
                _type_str = "disposable";
            } else {
                let _l = type_code.length;
                _type_str = _l < 7 ? "weekly" : "daily";
            }
        }

        let _task_type_map = {
            disposable: "一次性任务",
            daily: "每日任务",
            weekly: "每周任务",
        };

        if (_is_modify_mode) {
            return _showTimePickView(_type_str, _is_modify_mode);
        }
        $$view.diag.radioSetter.bind({
            map: _task_type_map,
            showTimePickView: _showTimePickView,
        })({
            title: "选择定时任务类型",
            def_idx: 0,
            neutral() {
                dialogsx.builds([
                    "关于定时任务类型设置", "about_timed_task_type",
                    0, 0, "关闭", 1
                ]).on("positive", ds => ds.dismiss()).show();
            },
            positive: {value: "下一步", listeners: () => null},
            single_choice(i, v, d) {
                let _map = this.map;
                let _keys = Object.keys(_map);
                let _len = _keys.length;
                for (let i = 0; i < _len; i += 1) {
                    let _k = _keys[i];
                    if (v === _map[_k]) {
                        d.dismiss();
                        this.showTimePickView(_k, _is_modify_mode);
                        break;
                    }
                }
            },
        });

        // tool function(s) //

        function _showTimePickView(type_str, is_modify_mode) {
            // type_str
            // modify_mode
            let view_title_text_prefix = (is_modify_mode ? "修改" : "设置") + _task_type_map[type_str];
            $$view.setTimePickerView({
                picker_views: [type_str === "disposable" ? {
                    type: "date",
                    text: view_title_text_prefix + "日期",
                    init: task ? task.getNextTime() : null,
                } : {
                    type: "time",
                    text: view_title_text_prefix + "时间",
                    init: task ? task.getNextTime() : null,
                }, type_str === "weekly" ? {
                    type: "week",
                    text: view_title_text_prefix + "星期",
                    init: task ? task.getTimeFlag() : null,
                } : type_str === "daily" ? {} : {
                    type: "time",
                    text: view_title_text_prefix + "时间",
                    init: task ? task.getNextTime() : null,
                }],
                time_str: {
                    prefix: "已选择",
                },
                buttons: {
                    back_btn: {
                        onClickListener(getTimeInfoFromPicker, closeTimePickerPage) {
                            diag && diag.show();
                            closeTimePickerPage();
                        },
                    },
                    confirm_btn: {
                        onClickListener(getTimeInfoFromPicker, closeTimePickerPage) {
                            if (type_str === "weekly") {
                                let days_of_week = getTimeInfoFromPicker(2).daysOfWeek();
                                if (!days_of_week.length) return alert("需至少选择一个星期");
                                closeTimePickerPage({
                                    days_of_week: days_of_week,
                                    timestamp: getTimeInfoFromPicker(1).timestamp()
                                });
                            } else if (type_str === "disposable") {
                                let set_time = getTimeInfoFromPicker(0).timestamp();
                                if (set_time <= Date.now()) return alert("设置时间需大于当前时间");
                                closeTimePickerPage(set_time);
                            } else if (type_str === "daily") {
                                closeTimePickerPage(getTimeInfoFromPicker(1).timestamp());
                            }
                        },
                    },
                },
                onFinish(ret) {
                    threadsx.starts(function () {
                        ret && (update() || add());
                        // to fresh data list; maybe not a good way
                        ui.emitter.emit("resume");
                    });

                    // tool function(s) //

                    function trimTimestamp(time, string_flag) {
                        let d = new Date(time);
                        if (string_flag) return $$tool.getTimeStrFromTs(time).match(/\d+:\d+/)[0];
                        return time - +new Date(d.getFullYear(), d.getMonth(), d.getDate())
                    }

                    function update() {
                        let current_task = task && timersx.getTimedTask(task.id);
                        if (current_task) {
                            if (type_str === "disposable") {
                                current_task.setMillis(ret);
                            } else if (type_str === "daily") {
                                current_task.setMillis(trimTimestamp(ret));
                            } else if (type_str === "weekly") {
                                current_task.setMillis(trimTimestamp(ret.timestamp));
                                current_task.setTimeFlag(timedTaskTimeFlagConverter(ret.days_of_week));
                            } else {
                                return;
                            }
                            timersx.updateTimedTask(current_task);
                            return current_task;
                        }
                    }

                    function add() {
                        let path = files.cwd() + "/Ant_Forest_Launcher.js";
                        if (type_str === "disposable") {
                            timersx.addDisposableTask({
                                path: path,
                                date: ret,
                            }, "wait");
                        } else if (type_str === "daily") {
                            timersx.addDailyTask({
                                path: path,
                                time: trimTimestamp(ret, true),
                            }, "wait");
                        } else if (type_str === "weekly") {
                            timersx.addWeeklyTask({
                                path: path,
                                time: trimTimestamp(ret.timestamp, true),
                                daysOfWeek: ret.days_of_week,
                            }, "wait");
                        }
                    }
                },
            });
        }
    }
});
$$view.page.new("延时接力区间", "timers_uninterrupted_check_sections_page", (t) => {
    $$view.setPage(t, (p_view) => {
        let data_source_key_name = "timers_uninterrupted_check_sections";
        $$view.setTimersUninterruptedCheckAreasPageButtons(p_view, data_source_key_name);
    }, {no_scroll_view: true})
        .add("list", new Layout("/*延时接力时间区间*/", {
            list_head: "timers_uninterrupted_check_sections",
            data_source_key_name: "timers_uninterrupted_check_sections",
            list_checkbox: "visible",
            listeners: {
                _list_data: {
                    item_long_click(e, item, idx, item_view) {
                        item_view["_checkbox"].checked && item_view["_checkbox"].click();
                        e.consumed = true;
                        let {data_source_key_name: _ds_k} = this;
                        let edit_item_diag = dialogsx.builds([
                            "编辑列表项", "点击需要编辑的项",
                            0, "返回", "确认", 1
                        ], {items: ["\xa0"]});

                        refreshItems();

                        edit_item_diag
                            .on("positive", (d) => {
                                let sectionStringTransform = () => {
                                    let arr = $$cfg.list_heads[_ds_k];
                                    for (let i = 0, l = arr.length; i < l; i += 1) {
                                        let o = arr[i];
                                        if ("section" in o) {
                                            return o.stringTransform;
                                        }
                                    }
                                };
                                let _items = d.getItems().toArray();
                                let [_sect, _itv] = _items.map(x => x.split(": ")[1]);
                                $$view.updateDataSource(_ds_k, "splice", [idx, 1, {
                                    section: sectionStringTransform().backward(_sect),
                                    interval: +_itv,
                                }]);
                                if (!equalObjects($$cfg.ses[_ds_k], $$cfg.sto[_ds_k])) {
                                    $$ses[_ds_k + "_btn_restore"].switch_on();
                                }
                                d.dismiss();
                            })
                            .on("negative", (d) => {
                                d.dismiss();
                            })
                            .on("item_select", (idx, item) => {
                                let [_pref, _cnt] = item.split(": ");

                                if (_pref === "区间") {
                                    edit_item_diag.dismiss();
                                    $$view.setTimePickerView({
                                        picker_views: [
                                            {type: "time", text: "设置开始时间", init: $$tool.timeStrToSection(_cnt)[0]},
                                            {type: "time", text: "设置结束时间", init: $$tool.timeStrToSection(_cnt)[1]},
                                        ],
                                        time_str: {
                                            suffix(getStrFunc) {
                                                if (getStrFunc(2).default() <= getStrFunc(1).default()) {
                                                    return "(+1)";
                                                }
                                            },
                                        },
                                        onFinish(ret) {
                                            edit_item_diag.show();
                                            ret && refreshItems(_pref, ret);
                                        },
                                    });
                                }

                                if (_pref === "间隔") {
                                    $$view.diag.numSetter(1, 600, {
                                        title: "修改" + _pref,
                                        content: null,
                                        neutral: null,
                                        positive(d, min, max) {
                                            let _n = $$view.diag.checkInputRange(d, min, max);
                                            if (_n) {
                                                refreshItems(_pref, Math.trunc(+_n));
                                                d.dismiss();
                                            }
                                        },
                                    }, {inputPrefill: _cnt.toString()});
                                }
                            })
                            .show();

                        // tool function(s) //

                        function refreshItems(prefix, value) {
                            let value_obj = {};
                            let key_map = {
                                0: "区间",
                                1: "间隔",
                            };
                            if (!prefix && !value) {
                                value_obj = {};
                                value_obj[key_map[0]] = item[item.section];
                                value_obj[key_map[1]] = item[item.interval];
                            } else {
                                edit_item_diag.getItems().toArray().forEach((value, idx) => value_obj[key_map[idx]] = value.split(": ")[1])
                            }
                            if (prefix && (prefix in value_obj)) value_obj[prefix] = value;
                            let items = [];
                            Object.keys(value_obj).forEach(key => items.push(key + ": " + value_obj[key]));
                            edit_item_diag.setItems(items);
                        }
                    },
                    item_click(item, idx, item_view) {
                        item_view["_checkbox"].click();
                    },
                    item_bind(item_view, item_holder) {
                        item_view["_checkbox"].on("click", (checkbox_view) => {
                            return $$view.commonItemBindCheckboxClickListener
                                .call(this, checkbox_view, item_holder);
                        });
                    },
                },
                _check_all: {
                    click(view) {
                        let {data_source_key_name: _ds_k} = this;
                        let aim_checked = view.checked;
                        let blacklist_len = $$ses[_ds_k].length;
                        if (!blacklist_len) return view.checked = !aim_checked;

                        $$ses[_ds_k].forEach((o, idx) => {
                            let o_new = deepCloneObject(o);
                            o_new.checked = aim_checked;
                            $$view.updateDataSource(_ds_k, "splice", [idx, 1, o_new]);
                        });

                        let deleted_items_idx = _ds_k + "_deleted_items_idx";
                        let deleted_items_idx_count = _ds_k + "_deleted_items_idx_count";
                        $$ses[deleted_items_idx_count] = aim_checked ? blacklist_len : 0;
                        $$ses[deleted_items_idx] = $$ses[deleted_items_idx] || {};
                        for (let i = 0; i < blacklist_len; i += 1) {
                            $$ses[deleted_items_idx][i] = aim_checked;
                        }

                        let remove_btn = $$ses[_ds_k + "_btn_remove"];
                        aim_checked ? blacklist_len && remove_btn.switch_on() : remove_btn.switch_off();
                    },
                },
            },
        }))
        .add("info", new Layout("/*dynamic_info*/", {
            updateOpr(view) {
                let amount = $$cfg.ses.timers_uninterrupted_check_sections.length;
                view["_info_text"].setText(amount ? '时间区间的"+1"表示次日时间' : '点击添加按钮可添加区间');
            },
        }))
        .add("info", new Layout("长按列表项可编辑项目 点击标题可排序", {
            updateOpr(view) {
                let amount = $$cfg.ses.timers_uninterrupted_check_sections.length;
                view.setVisibility(amount ? 0 : 8);
            },
        }))
        .add("blank")
        .ready();
});
$$view.page.new("账户功能", "account_page", (t) => {
    $$view.setPage(t, null, {
        check_page_state(view) {
            let {main_account_info} = $$cfg.ses;
            if (!view["_switch"].checked) return true;
            if (classof(main_account_info, "Object") && Object.keys(main_account_info).length) return true;
            let diag_prompt = dialogsx.builds(["提示", "当前未设置主账户信息\n继续返回将关闭账户功能", 0, "放弃返回", ["继续返回", "warn_btn_color"]]);
            diag_prompt.on("positive", () => {
                view["_switch"].setChecked(false);
                $$view.page.jump("back");
            });
            diag_prompt.on("negative", () => diag_prompt.dismiss());
            diag_prompt.show();
        },
    })
        .add("switch", new Layout("总开关", {
            config_conj: "account_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("主账户设置", {subhead_color: $$def.subhead_highlight_color}))
        .add("button", new Layout("主账户信息", "hint", {
            config_conj: "main_account_info",
            checkMainAccountInfo() {
                let main_account_info = $$cfg.ses[this.config_conj];
                return classof(main_account_info, "Object") && Object.keys(main_account_info).length;
            },
            newWindow() {
                let _cfg_conj = this.config_conj;
                let {
                    account_name: _acc_n,
                    account_code: _acc_c,
                } = $$cfg.ses[_cfg_conj];

                $$view.setInfoInputView({
                    input_views: [{
                        type: "account", text: "账户",
                        hint_text: "未设置", init: _acc_n
                    }, {
                        type: "password", text: "密码",
                        hint_text: () => _acc_c ? "已设置 (点击修改)" : "未设置",
                    }],
                    buttons: {
                        reserved_btn: {
                            text: "帮助",
                            onClickListener() {
                                let diag = dialogsx.builds([
                                    "信息录入提示", "account_info_hint",
                                    ["了解密码存储", "hint_btn_bright_color"], 0, "关闭", 1
                                ]);
                                diag.on("neutral", () => dialogsx.builds(["密码存储方式", "how_password_stores", 0, 0, "关闭"]).show());
                                diag.on("positive", () => diag.dismiss());
                                diag.show();
                            },
                            // hint_color: "#ffcdd2",
                        },
                        confirm_btn: {
                            onClickListener(input_views_obj, closeInfoInputPage) {
                                let account_view = input_views_obj["账户"];
                                let code_view = input_views_obj["密码"];
                                let account_name = account_view["input_area"].getText().toString();
                                let account_code = code_view["input_area"].getText().toString();

                                let final_data = Object.assign({}, $$cfg.ses[_cfg_conj] || {});
                                if (account_name) {
                                    final_data.account_name = $$tool.accountNameConverter(account_name, "encrypt");
                                    if (account_code) final_data.account_code = $$enc(account_code);
                                    $$save.session(_cfg_conj, final_data);
                                    closeInfoInputPage();
                                } else {
                                    if (final_data.account_code) {
                                        let diag_confirm = dialogsx.builds([
                                            "提示", '未设置账户时\n已存在的密码数据将被销毁\n主账户信息恢复为"未设置"状态\n确定继续吗',
                                            0, "返回", "确定", 1
                                        ]);
                                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                                        diag_confirm.on("positive", () => {
                                            final_data = {};
                                            $$save.session(_cfg_conj, final_data);
                                            diag_confirm.dismiss();
                                            closeInfoInputPage();
                                        });
                                        diag_confirm.show();
                                    } else {
                                        $$save.session(_cfg_conj, final_data);
                                        closeInfoInputPage();
                                        final_data = {};
                                    }
                                }
                            },
                        },
                        additional: [
                            [{
                                text: "  信息销毁  ",
                                hint_color: "#ef9a9a",
                                onClickListener(input_views_obj) {
                                    let config_conj = "main_account_info";
                                    let checkMainAccountInfo = () => {
                                        let main_account_info = $$cfg.ses[config_conj];
                                        return classof(main_account_info, "Object") && Object.keys(main_account_info).length;
                                    };

                                    if (!checkMainAccountInfo()) return toast("无需销毁");

                                    let diag = dialogsx.builds([
                                        "主账户信息销毁", "destroy_main_account_info",
                                        0, "返回", ["销毁", "warn_btn_color"]
                                    ]);
                                    diag.on("negative", () => diag.dismiss());
                                    diag.on("positive", () => {
                                        let diag_confirm = dialogsx.builds([
                                            "确认销毁吗", '此操作本次会话无法撤销\n销毁后需在首页"保存"生效',
                                            0, "放弃", ["确认", "caution_btn_color"], 1
                                        ]);
                                        diag_confirm.on("negative", () => diag_confirm.dismiss());
                                        diag_confirm.on("positive", () => {
                                            $$save.session(config_conj, {});
                                            input_views_obj["账户"]["input_area"].setText("");
                                            let pw_input_area = input_views_obj["密码"]["input_area"];
                                            pw_input_area.setViewHintText("未设置");
                                            pw_input_area.setText("");
                                            toast("信息已销毁");
                                            diag_confirm.dismiss();
                                        });
                                        diag_confirm.show();
                                    });
                                    diag.show();
                                },
                            }],
                            [{
                                text: "从 [ 支付宝 ] 录入信息",
                                hint_color: "#c5cae9",
                                onClickListener(input_views_obj) {
                                    let diag = dialogsx.builds([
                                        "从支付宝录入信息", "get_account_name_from_alipay",
                                        0, "返回", "开始获取", 1
                                    ]);
                                    diag.on("negative", () => diag.dismiss());
                                    diag.on("positive", () => {
                                        let storage_key_name = "collected_current_account_name";
                                        $$sto.af.remove(storage_key_name);
                                        toast('即将打开"支付宝"采集当前账户名');
                                        diag.dismiss();
                                        runJsFile("Ant_Forest_Launcher", {cmd: "get_current_account_name"});
                                        threadsx.starts(function () {
                                            waitForAndClickAction(text("打开"), 3.5e3, 300, {click_strategy: "w"});
                                        });
                                        threadsx.starts(function () {
                                            waitForAction(() => currentPackage().match(/AlipayGphone/), 8e3);
                                            ui.emitter.prependOnceListener("resume", () => {
                                                let collected_name = $$sto.af.get(storage_key_name, "");
                                                $$sto.af.remove(storage_key_name);
                                                collected_name ? debugInfo("存储模块中发现账户名") : debugInfo("存储模块中未发现账户名");
                                                if (!collected_name) return toast("未能成功采集到当前账户名");

                                                let {input_area} = input_views_obj["账户"];
                                                let _acc = $$tool.accountNameConverter(collected_name, "decrypt");
                                                input_area.setText(_acc);

                                                threadsx.starts(function () {
                                                    let max_try_times_input = 3;
                                                    while (max_try_times_input--) {
                                                        if (waitForAction(() => {
                                                            return input_area.getText().toString() === _acc;
                                                        }, 1e3)) break;
                                                        ui.post(() => input_area.setText(_acc));
                                                    }
                                                    if (max_try_times_input >= 0) {
                                                        toast("已自动填入账户名");
                                                    } else {
                                                        let diag = dialogsx.builds([
                                                            "提示", '自动填入账户名失败\n账户名已复制到剪切板\n可手动粘贴至"账户"输入框内',
                                                            0, 0, "返回", 1
                                                        ]);
                                                        diag.on("negative", () => diag.dismiss());
                                                        diag.show();
                                                    }
                                                });
                                            });
                                        });
                                    });
                                    diag.show();
                                },
                            }, {
                                text: "从 [ 账户库 ] 录入信息",
                                hint_color: "#d1c4e9",
                                onClickListener() {
                                    dialogsx.builds(["从账户库录入信息", "此功能暂未完成开发", 0, 0, "返回"]).show();
                                },
                            }]
                        ],
                    },
                });

                if (!$$sto.af.get("before_use_main_account_dialog_prompt_prompted")) {
                    let before_use_main_account_dialog_prompt_prompted = false;
                    let diag = dialogsx.builds(["功能使用提示", "before_use_main_account", 0, 0, "继续使用", 1, 1]);
                    diag.on("check", checked => before_use_main_account_dialog_prompt_prompted = !!checked);
                    diag.on("positive", () => {
                        if (before_use_main_account_dialog_prompt_prompted) {
                            $$sto.af.put("before_use_main_account_dialog_prompt_prompted", true);
                        }
                        diag.dismiss();
                    });
                    diag.show();
                }
            },
            updateOpr(view) {
                view.setHintText(this.checkMainAccountInfo() ? "已设置" : "未设置");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("page", new Layout("旧账户回切", "hint", {
            config_conj: "account_log_back_in_switch",
            next_page: "account_log_back_in_page",
            updateOpr(view) {
                $$view.udop.main_sw.call(this, view);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow() {
                let diag = dialogsx.builds(["关于账户功能", "about_account_function", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
});
$$view.page.new("数据统计", "stat_page", (t) => {
    $$view.setPage(t, (p_view) => {
        let _ds_k = "stat_list";
        $$view.setStatPageButtons(p_view, _ds_k);
    }, {no_scroll_view: true})
        .ready();
});
$$view.page.new("旧账户回切", "account_log_back_in_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "account_log_back_in_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("最大连续回切次数", "hint", {
            config_conj: "account_log_back_in_max_continuous_times",
            newWindow() {
                $$view.diag.numSetter.call(this, 0, 10, {
                    title: "设置最大连续回切次数",
                });
            },
            updateOpr(view) {
                let session_value = +$$cfg.ses[this.config_conj];
                if (isNaN(session_value)) session_value = +$$sto.def.af[this.config_conj];
                view.setHintText((session_value === 0 ? "无限制" : session_value).toString());
            },
        }))
        .ready();
});
$$view.page.new("黑名单管理", "blacklist_page", (t) => {
    $$view.setPage(t)
        .add("subhead", new Layout("蚂蚁森林名单簿", {subhead_color: $$def.subhead_highlight_color}))
        .add("page", new Layout("能量罩黑名单", "hint", {
            next_page: "cover_blacklist_page",
            updateOpr(view) {
                let amount = $$cfg.ses.blacklist_protect_cover.length;
                view.setHintText(amount ? "包含成员:  " + amount + " 人" : "空名单");
            },
        }))
        .add("page", new Layout("收取/帮收黑名单", "hint", {
            next_page: "collect_blacklist_page",
            updateOpr(view) {
                let amount = $$cfg.ses.blacklist_by_user.length;
                view.setHintText(amount ? "包含成员:  " + amount + " 人" : "空名单");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("应用程序名单簿", {subhead_color: $$def.subhead_highlight_color}))
        .add("page", new Layout("前置应用黑名单", "hint", {
            next_page: "foreground_app_blacklist_page",
            updateOpr(view) {
                let hint_text = "空名单";
                let {foreground_app_blacklist: _fg_app_blist} = $$cfg.ses;
                _fg_app_blist = _fg_app_blist || [];
                let amount = _fg_app_blist.length;
                if (amount) {
                    hint_text = "包含应用:  " + amount + " 项";
                    let invalid_items_count = 0;
                    _fg_app_blist.forEach((o) => {
                        let {app_combined_name} = o;
                        if (app_combined_name) {
                            let pkg_name = app_combined_name.split("\n")[1];
                            if (!app.getAppName(pkg_name)) invalid_items_count += 1;
                        }
                    });
                    hint_text += invalid_items_count ? "  ( 含有 " + invalid_items_count + " 个无效项 )" : "";
                }
                view.setHintText(hint_text);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解详情", {
            newWindow() {
                let diag = dialogsx.builds(["关于黑名单管理", "about_blacklist", 0, 0, "关闭", 1]); //// PENDING ////
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
});
$$view.page.new("能量罩黑名单", "cover_blacklist_page", (t) => {
    $$view.setPage(t, null, {no_scroll_view: true})
        .add("list", new Layout("/*能量罩黑名单成员*/", {
            list_head: "blacklist_protect_cover",
            data_source_key_name: "blacklist_protect_cover",
            list_checkbox: "gone",
            listeners: {
                _list_data: {
                    item_bind(item_view) {
                        item_view["_checkbox"].setVisibility(8);
                    }
                },
            }
        }))
        .add("info", new Layout("能量罩黑名单由脚本自动管理"))
        .add("blank")
        .ready();
});
$$view.page.new("收取/帮收黑名单", "collect_blacklist_page", (t) => {
    $$view.setPage(t, (p_view) => {
        $$view.setListPageButtons(p_view, "blacklist_by_user")
    }, {no_scroll_view: true})
        .add("list", new Layout("/*收取/帮收黑名单成员*/", {
            list_head: "blacklist_by_user",
            data_source_key_name: "blacklist_by_user",
            list_checkbox: "visible",
            listeners: {
                _list_data: {
                    item_long_click(e, item, idx, item_view) {
                        item_view["_checkbox"].checked && item_view["_checkbox"].click();
                        e.consumed = true;
                        let {data_source_key_name: _ds_k} = this;
                        let edit_item_diag = dialogsx.builds(
                            ["编辑列表项", "点击需要编辑的项", 0, "返回", "确认", 1],
                            {items: ["\xa0"]}
                        );

                        refreshItems();

                        edit_item_diag.on("positive", () => {
                            let new_item = {};
                            new_item.name = edit_item_diag.getItems().toArray()[0].split(": ")[1];
                            let input = edit_item_diag.getItems().toArray()[1].split(": ")[1];
                            new_item.timestamp = $$tool.restoreFromTimestamp(input);
                            $$view.updateDataSource(_ds_k, "splice", [idx, 1, new_item]);
                            if (!equalObjects($$cfg.ses[_ds_k], $$cfg.sto[_ds_k])) {
                                $$ses[_ds_k + "_btn_restore"].switch_on();
                            }
                            edit_item_diag.dismiss();
                        });
                        edit_item_diag.on("negative", () => edit_item_diag.dismiss());
                        edit_item_diag.on("item_select", (idx, list_item) => {
                            let list_item_prefix = list_item.split(": ")[0];
                            let list_item_content = list_item.split(": ")[1];

                            if (list_item_prefix === "好友昵称") {
                                dialogsx.rawInput("修改" + list_item_prefix, list_item_content, (input) => {
                                    if (input) refreshItems(list_item_prefix, input);
                                });
                            }

                            if (list_item_prefix === "解除时间") {
                                edit_item_diag.dismiss();
                                let init_value = $$tool.restoreFromTimestamp(list_item_content);
                                if (!isFinite(init_value)) init_value = null;
                                $$view.setTimePickerView({
                                    picker_views: [
                                        {type: "date", text: "设置日期", init: init_value},
                                        {type: "time", text: "设置时间", init: init_value},
                                    ],
                                    time_str: {
                                        prefix: "已选择",
                                    },
                                    buttons: {
                                        reserved_btn: {
                                            text: "设置 '永不'",
                                            onClickListener(getTimeInfoFromPicker, closeTimePickerPage) {
                                                closeTimePickerPage(Infinity);
                                            },
                                        },
                                        confirm_btn: {
                                            onClickListener(getTimeInfoFromPicker, closeTimePickerPage) {
                                                let set_time = getTimeInfoFromPicker(0).timestamp();
                                                if (set_time <= Date.now()) return alert("设置时间需大于当前时间");
                                                closeTimePickerPage(set_time);
                                            },
                                        },
                                    },
                                    onFinish(ret) {
                                        edit_item_diag.show();
                                        ret && refreshItems(
                                            list_item_prefix,
                                            $$tool.getTimeStrFromTs(ret, "time_str_remove")
                                        );
                                    },
                                });
                            }
                        });
                        edit_item_diag.show();

                        // tool function(s) //

                        function refreshItems(prefix, value) {
                            let value_obj = {};
                            let key_map = {
                                0: "好友昵称",
                                1: "解除时间",
                            };
                            if (!prefix && !value) {
                                value_obj = {};
                                value_obj[key_map[0]] = item[item.name];
                                value_obj[key_map[1]] = item[item.timestamp];
                            } else {
                                edit_item_diag.getItems().toArray().forEach((value, idx) => value_obj[key_map[idx]] = value.split(": ")[1])
                            }
                            if (prefix && (prefix in value_obj)) value_obj[prefix] = value;
                            let items = [];
                            Object.keys(value_obj).forEach(key => items.push(key + ": " + value_obj[key]));
                            edit_item_diag.setItems(items);
                        }
                    },
                    item_click(item, idx, item_view) {
                        item_view["_checkbox"].click();
                    },
                    item_bind(item_view, item_holder) {
                        item_view["_checkbox"].on("click", (checkbox_view) => {
                            return $$view.commonItemBindCheckboxClickListener
                                .call(this, checkbox_view, item_holder);
                        });
                    },
                },
                _check_all: {
                    click(view) {
                        let {data_source_key_name: _ds_k} = this;
                        let aim_checked = view.checked;
                        let blacklist_len = $$ses[_ds_k].length;
                        if (!blacklist_len) return view.checked = !aim_checked;

                        $$ses[_ds_k].forEach((o, idx) => {
                            let o_new = deepCloneObject(o);
                            o_new.checked = aim_checked;
                            $$view.updateDataSource(_ds_k, "splice", [idx, 1, o_new]);
                        });

                        let deleted_items_idx = _ds_k + "_deleted_items_idx";
                        let deleted_items_idx_count = _ds_k + "_deleted_items_idx_count";
                        $$ses[deleted_items_idx_count] = aim_checked ? blacklist_len : 0;
                        $$ses[deleted_items_idx] = $$ses[deleted_items_idx] || {};
                        for (let i = 0; i < blacklist_len; i += 1) {
                            $$ses[deleted_items_idx][i] = aim_checked;
                        }

                        let remove_btn = $$ses[_ds_k + "_btn_remove"];
                        aim_checked ? blacklist_len && remove_btn.switch_on() : remove_btn.switch_off();
                    },
                },
            },
        }))
        .add("info", new Layout("/*dynamic_info*/", {
            updateOpr(view) {
                let amount = $$cfg.ses.blacklist_by_user.length;
                view["_info_text"].setText(amount ? "长按列表项可编辑项目" : "点击添加按钮可添加人员");
            },
        }))
        .add("info", new Layout("点击标题可排序", {
            updateOpr(view) {
                let amount = $$cfg.ses.blacklist_by_user.length;
                view.setVisibility(amount ? 0 : 8);
            },
        }))
        .add("blank")
        .ready();
});
$$view.page.new("前置应用黑名单", "foreground_app_blacklist_page", (t) => {
    $$view.setPage(t, (p_view) => {
        $$view.setListPageButtons(p_view, "foreground_app_blacklist");
    }, {no_scroll_view: true})
        .add("list", new Layout("/*前置应用黑名单项目*/", {
            list_head: "foreground_app_blacklist",
            data_source_key_name: "foreground_app_blacklist",
            list_checkbox: "visible",
            listeners: {
                _list_data: {
                    item_click(item, idx, item_view) {
                        item_view["_checkbox"].click();
                    },
                    item_bind(item_view, item_holder) {
                        item_view["_checkbox"].on("click", (checkbox_view) => {
                            return $$view.commonItemBindCheckboxClickListener
                                .call(this, checkbox_view, item_holder);
                        });
                    },
                },
                _check_all: {
                    click(view) {
                        let {data_source_key_name: _ds_k} = this;
                        let aim_checked = view.checked;
                        let blacklist_len = $$ses[_ds_k].length;
                        if (!blacklist_len) return view.checked = !aim_checked;

                        $$ses[_ds_k].forEach((o, idx) => {
                            let o_new = deepCloneObject(o);
                            o_new.checked = aim_checked;
                            $$view.updateDataSource(_ds_k, "splice", [idx, 1, o_new]);
                        });

                        let deleted_items_idx = _ds_k + "_deleted_items_idx";
                        let deleted_items_idx_count = _ds_k + "_deleted_items_idx_count";
                        $$ses[deleted_items_idx_count] = aim_checked ? blacklist_len : 0;
                        $$ses[deleted_items_idx] = $$ses[deleted_items_idx] || {};
                        for (let i = 0; i < blacklist_len; i += 1) {
                            $$ses[deleted_items_idx][i] = aim_checked;
                        }

                        let remove_btn = $$ses[_ds_k + "_btn_remove"];
                        aim_checked ? blacklist_len && remove_btn.switch_on() : remove_btn.switch_off();
                    },
                },
            },
        }))
        .add("info", new Layout("/*dynamic_info*/", {
            updateOpr(view) {
                let amount = $$cfg.ses.foreground_app_blacklist.length;
                view["_info_text"].setText(amount ? "点击标题可排序" : "点击添加按钮可添加应用");
            },
        }))
        .add("info", new Layout('"有效"标签表示应用是否存在于设备中', {
            updateOpr(view) {
                let amount = $$cfg.ses.foreground_app_blacklist.length;
                view.setVisibility(amount ? 0 : 8);
            },
        }))
        .add("blank")
        .ready();
});
$$view.page.new("运行与安全", "script_security_page", (t) => {
    $$view.setPage(t)
        .add("subhead", new Layout("基本设置"))
        .add("button", new Layout("单次运行最大时间", "hint", {
            config_conj: "max_running_time_global",
            newWindow() {
                $$view.diag.numSetter.call(this, 5, 90, {
                    title: "脚本单次运行最大时间",
                });
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]).toString() + " min");
            },
        }))
        .add("button", new Layout("排他性任务最大排队时间", "hint", {
            config_conj: "max_queue_time_global",
            newWindow() {
                $$view.diag.numSetter.call(this, 1, 120);
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]).toString() + " min");
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("button", new Layout("脚本炸弹预防阈值", "hint", {
            config_conj: "min_bomb_interval_global",
            newWindow() {
                $$view.diag.numSetter.call(this, 100, 800);
            },
            updateOpr(view) {
                view.setHintText(($$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj]).toString() + " ms");
            },
        }))
        .add("button", new Layout("自动开启无障碍服务", "hint", {
            config_conj: "auto_enable_a11y_svc",
            map: {
                ON: "启用自动开启",
                OFF: "禁用自动开启",
            },
            newWindow() {
                $$view.diag.radioSetter.call(this, {
                    neutral() {
                        dialogsx
                            .builds([
                                "关于自动开启无障碍服务", "about_auto_enable_a11y_svc",
                                ["复制授权指令", "hint_btn_bright_color"],
                                ["测试权限", "hint_btn_bright_color"],
                                "关闭", 1
                            ])
                            .on("neutral", () => {
                                let _pkg = context.packageName;
                                let _perm = "android.permission.WRITE_SECURE_SETTINGS";
                                let _shell_sc = "adb shell pm grant " + _pkg + " " + _perm;
                                setClip(_shell_sc);
                                toast("授权指令已复制到剪切板");
                            })
                            .on("negative", () => {
                                let _a11y = require("./Modules/EXT_DEVICE").a11y;
                                let _ts = Date.now();
                                let _par = ["%test%" + _ts, true];
                                _a11y.enable.apply(_a11y, _par);
                                let _res = _a11y.disable.apply(_a11y, _par);
                                dialogsx
                                    .builds([
                                        "权限测试结果", "测试" + (_res ? "" : "未") + "通过\n\n" +
                                        "此设备" + (_res ? "拥有" : "没有") + "以下权限:\n" +
                                        "WRITE_SECURE_SETTINGS",
                                        0, 0, "关闭", 1
                                    ])
                                    .on("positive", (d) => {
                                        d.dismiss();
                                    })
                                    .show();
                            })
                            .on("positive", (d) => {
                                d.dismiss();
                            })
                            .show();
                    },
                });
            },
            updateOpr(view) {
                let value = $$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj];
                view.setHintText("已" + this.map[value.toString()].slice(0, 2));
            },
        }))
        .add("button", new Layout("支付宝应用启动跳板", "hint", {
            config_conj: "app_launch_springboard",
            map: {
                ON: "开启跳板",
                OFF: "关闭跳板",
            },
            newWindow() {
                $$view.diag.radioSetter.call(this, {
                    neutral() {
                        dialogsx.builds([
                            "关于启动跳板", "about_app_launch_springboard",
                            0, 0, "关闭", 1
                        ]).on("positive", ds => ds.dismiss()).show();
                    },
                });
            },
            updateOpr(view) {
                let value = $$cfg.ses[this.config_conj] || $$sto.def.af[this.config_conj];
                view.setHintText("已" + this.map[value.toString()].slice(0, 2));
            },
        }))
        .add("page", new Layout("支付宝应用及页面保留", "hint", {
            config_conj: "kill_when_done_switch",
            next_page: "kill_when_done_page",
            updateOpr(view) {
                view.setHintText(!$$cfg.ses[this.config_conj] ? "已开启" : "已关闭");
            },
        }))
        .add("page", new Layout("通话状态监测", "hint", {
            config_conj: "phone_call_state_monitor_switch",
            next_page: "phone_call_state_monitor_page",
            updateOpr(view) {
                $$view.udop.main_sw.call(this, view);
            },
        }))
        .ready();
});
$$view.page.new("支付宝应用及页面保留", "kill_when_done_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "kill_when_done_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("支付宝应用保留", {subhead_color: $$def.subhead_highlight_color}))
        .add("radio", new Layout(["智能保留", "总是保留"], {
            values: [true, false],
            config_conj: "kill_when_done_intelligent",
            listeners: {
                check(checked, view) {
                    let {text} = view;
                    checked && $$save.session(this.config_conj, this.values[this.title.indexOf(text)]);
                    text === this.title[0] && $$view.showOrHideBySwitch(this, checked, false, "split_line");
                },
            },
            updateOpr(view) {
                let child_idx = this.values.indexOf($$cfg.ses[this.config_conj]);
                if (~child_idx) {
                    let child_view = view["_radiogroup"].getChildAt(child_idx);
                    child_view.checked || child_view.setChecked(true);
                }
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("蚂蚁森林页面保留", {subhead_color: $$def.subhead_highlight_color}))
        .add("radio", new Layout(["智能剔除", "全部保留"], {
            values: [false, true],
            config_conj: "kill_when_done_keep_af_pages",
            listeners: {
                check(checked, view) {
                    let {text} = view;
                    checked && $$save.session(this.config_conj, this.values[this.title.indexOf(text)]);
                    text === this.title[0] && $$view.showOrHideBySwitch(this, checked, false, "split_line");
                },
            },
            updateOpr(view) {
                let child_idx = this.values.indexOf($$cfg.ses[this.config_conj]);
                if (~child_idx) {
                    let child_view = view["_radiogroup"].getChildAt(child_idx);
                    child_view.checked || child_view.setChecked(true);
                }
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("帮助与支持"))
        .add("button", new Layout("了解更多", {
            newWindow() {
                let diag = dialogsx.builds(["关于支付宝应用保留", "about_kill_when_done", 0, 0, "关闭", 1]);
                diag.on("positive", () => diag.dismiss());
                diag.show();
            },
        }))
        .ready();
});
$$view.page.new("通话状态监测", "phone_call_state_monitor_page", (t) => {
    $$view.setPage(t)
        .add("switch", new Layout("总开关", {
            config_conj: "phone_call_state_monitor_switch",
            listeners: {
                _switch: {
                    check(state) {
                        $$save.session(this.config_conj, !!state);
                        $$view.showOrHideBySwitch(this, state);
                    },
                },
            },
            updateOpr(view) {
                view["_switch"].setChecked(!!$$cfg.ses[this.config_conj]);
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("高级设置"))
        .add("button", new Layout("空闲状态值", "hint", {
            config_conj: "phone_call_state_idle_value",
            newWindow() {
                dialogsx
                    .builds([
                        "通话空闲状态值", this.config_conj,
                        ["获取空闲值", "hint_btn_dark_color"], "返回", "确认修改", 1,
                    ], {inputHint: "{x|x∈N*}"})
                    .on("neutral", d => dialogsx.setInputText(d, devicex.getCallState()))
                    .on("negative", d => d.dismiss())
                    .on("positive", (d) => {
                        let _input = dialogsx.getInputText(d);
                        if (_input === "") {
                            return d.dismiss();
                        }
                        let _num = Number(_input);
                        if (isNaN(_num)) {
                            return dialogsx.alertTitle(d, "输入值类型不合法");
                        }
                        _num = Math.floor(_num);
                        if (_num !== devicex.getCallState()) {
                            dialogsx
                                .builds([
                                    ["小心", "title_caution_color"],
                                    ["phone_call_state_idle_value_warn", "content_warn_color"],
                                    0, "放弃", ["确定", "caution_btn_color"], 1,
                                ])
                                .on("negative", (ds) => ds.dismiss())
                                .on("positive", (ds) => {
                                    ds.dismiss();
                                    $$save.session(this.config_conj, _num);
                                    d.dismiss();
                                })
                                .show();
                        } else {
                            $$save.session(this.config_conj, _num);
                            d.dismiss();
                        }
                    })
                    .show();
            },
            updateOpr(view) {
                let value = $$sto.def.af[this.config_conj];
                let storage_value = $$cfg.ses[this.config_conj];
                if (!$$und(storage_value)) value = storage_value;
                view.setHintText(value === undefined ? "未配置" : value.toString());
            },
        }))
        .ready();
});
$$view.page.new("项目备份还原", "local_project_backup_restore_page", (t) => {
    $$view.setPage(t)
        .add("subhead", new Layout("备份", {subhead_color: $$def.subhead_highlight_color}))
        .add("button", new Layout("备份至本地", "等待\"本地还原\"准备就绪...", {
            view_tag: "backup_projects_from_local",
            newWindow() {
                $$ses.restore_proj_from_local_page_updated && dialogsx
                    .builds([
                        "备份项目至本地", "backup_to_local",
                        ["添加备注", "hint_btn_bright_color"], "放弃", "开始备份", 1
                    ])
                    .on("negative", d => d.dismiss())
                    .on("neutral", (d) => {
                        d.dismiss();
                        dialogsx
                            .builds(
                                ["为备份添加备注", "", 0, "放弃", "确定", 1],
                                {inputHint: ""}
                            )
                            .on("negative", (ds) => {
                                ds.dismiss();
                                d.show();
                            })
                            .on("positive", (ds) => {
                                $$ses.proj_bak_info_remark = dialogsx.getInputText(ds);
                                ds.dismiss();
                                d.show();
                            })
                            .show();
                    })
                    .on("positive", (d) => {
                        delete global._$_dialog_streaming_intrp_sgn;
                        d.dismiss();
                        threadsx.starts(function () {
                            $$tool.backupProjectFiles(null, null, dialogsx
                                .builds([
                                    "正在备份", "此过程可能需要一些时间", 0, 0, "终止", 1
                                ], {progress: {max: 100, showMinMax: false}})
                                .on("positive", (ds) => {
                                    global._$_dialog_streaming_intrp_sgn = true;
                                    ds.dismiss();
                                })
                                .show());
                        });
                    })
                    .show();
            },
            updateOpr(view) {
                view.setHintTextColor("#b0b0b0");
                if (!$$ses.restore_proj_from_local_page_updated) {
                    view.setTitleTextColor("#919191");
                    view.setHintVisibility(0);
                } else {
                    view.setTitleTextColor("#111111");
                    view.setHintVisibility(8);
                }
            },
        }))
        .add("split_line")
        .add("subhead", new Layout("还原", {subhead_color: $$def.subhead_highlight_color}))
        .add("page", new Layout("从本地还原", "hint", {
            view_tag: "restore_projects_from_local_page",
            next_page: null,
            updateOpr(view) {
                if (!$$ses.restore_proj_from_local_page_updated) {
                    view.setHintText("正在准备数据...");
                    return;
                }
                let _ds_k = "project_backup_info";
                let _view_tag = this.view_tag;
                let _amt = ($$cfg.ses[_ds_k] = $$cfg.ses[_ds_k] || []).length;
                view.setHintText(_amt ? "共计备份:  " + _amt + " 项" : "无备份");
                view.setNextPage(_view_tag);

                if ($$und($$ses.restore_proj_from_local_page_building)) {
                    $$ses.restore_proj_from_local_page_building = threads.atomic(0);
                }
                let _building = $$ses.restore_proj_from_local_page_building;
                if (!_building.get()) {
                    _building.incrementAndGet();
                    threadsx.starts(function () {
                        waitForAction(() => $$view.pages[_view_tag], 5e3)
                            ? ui.post(createPageView)
                            : _building.decrementAndGet();
                    });
                }

                // tool function(s) //

                function createPageView() {
                    $$view.pages[_view_tag]
                        .add("list", new Layout("/*本地项目还原*/", {
                            list_head: _ds_k,
                            data_source_key_name: _ds_k,
                            list_checkbox: "gone",
                            deleteItem(diag_p, idx) {
                                diag_p && diag_p.dismiss();
                                dialogsx
                                    .builds([
                                        "删除备份", "确定删除此备份吗\n此操作无法撤销",
                                        0, "放弃", ["删除", "caution_btn_color"], 1,
                                    ])
                                    .on("negative", (d) => {
                                        d.dismiss();
                                        diag_p && diag_p.show();
                                    })
                                    .on("positive", (d) => {
                                        d.dismiss();
                                        $$view.updateDataSource(_ds_k, "splice", [idx, 1], {
                                            is_quiet: true,
                                            sync_data_source: true,
                                        });
                                        $$view.updateViewByTag(_view_tag);
                                        $$sto.af_backup.put("project", $$cfg.ses[_ds_k]);
                                        files.remove($$cfg.ses[_ds_k][idx].file_path);
                                    })
                                    .show();
                            },
                            listeners: {
                                _list_data: {
                                    item_long_click(e, item, idx) {
                                        e.consumed = true;
                                        this.deleteItem(null, idx);
                                    },
                                    item_click(item, idx) {
                                        let _ds_k = this.data_source_key_name;
                                        let _details = [];
                                        let _cur_data = $$cfg.ses[_ds_k][idx] || {};
                                        let _map = {
                                            version_name: "版本",
                                            timestamp: "时间",
                                            file_path: "路径",
                                            remark: "备注",
                                        };
                                        Object.keys(_map).forEach((k) => {
                                            if (k in _cur_data) {
                                                let _val = _cur_data[k];
                                                if (k === "timestamp") {
                                                    _val = $$tool.getTimeStrFromTs(_val, "time_str_full");
                                                }
                                                _val && _details.push(_map[k] + ": " + _val);
                                            }
                                        });
                                        dialogsx
                                            .builds([
                                                "备份详情", _details.join("\n\n"),
                                                ["删除此备份", "caution_btn_color"], "返回",
                                                ["还原此备份", "warn_btn_color"], 1,
                                            ])
                                            .on("positive", (d) => {
                                                d.dismiss();
                                                dialogsx
                                                    .builds([
                                                        "还原本地备份", "restore_from_local",
                                                        0, "放弃", ["还原", "caution_btn_color"], 1,
                                                    ])
                                                    .on("negative", (ds) => {
                                                        ds.dismiss();
                                                        d.show();
                                                    })
                                                    .on("positive", (ds) => {
                                                        ds.dismiss();
                                                        $$tool.restoreProjectFiles(_cur_data.file_path);
                                                    })
                                                    .show();
                                            })
                                            .on("negative", d => d.dismiss())
                                            .on("neutral", d => this.deleteItem(d, idx))
                                            .show();
                                    },
                                    item_bind(item_view) {
                                        item_view["_checkbox"].setVisibility(8);
                                    },
                                },
                            },
                        }))
                        .add("info", new Layout("dynamic_info", {
                            view_tag: _view_tag,
                            updateOpr(view) {
                                view["_info_text"].setText($$cfg.ses[_ds_k].length
                                    ? "点击列表项可还原项目或删除备份项目"
                                    : "暂无备份项目"
                                );
                            },
                        }))
                        .add("info", new Layout("长按列表项可删除备份项目", {
                            view_tag: _view_tag,
                            updateOpr(view) {
                                view.setVisibility($$cfg.ses[_ds_k].length ? 0 : 8);
                            },
                        }))
                        .add("blank")
                        .ready();
                }
            },
        }))
        .add("page", new Layout("从服务器还原", "hint", {
            next_page: null,
            view_tag: "restore_projects_from_server_page",
            updateOpr(view) {
                if ($$ses.restore_proj_from_svr_page_updated) {
                    return;
                }
                let view_tag = this.view_tag;
                view.setChevronVisibility(8);
                view.setHintText("正在从服务器获取数据...");
                clearClickListener();
                $$ses.restore_proj_from_svr_page_updated = true;
                threadsx.starts(function () {
                    let max_try_times = 5;
                    while (max_try_times--) {
                        try {
                            let res = http.get(
                                "https://api.github.com/repos/SuperMonster003/" +
                                "Auto.js_Projects/releases?per_page=120"
                            );
                            $$ses.server_releases_info = res.body.json(); // array
                            let amount = $$ses.server_releases_info.length;
                            if (!amount) {
                                restoreClickListener();
                                return view.setHintText("无备份 (点击可重新检查)");
                            }
                            view.setNextPage("restore_projects_from_server_page");
                            view.setChevronVisibility(0);
                            view.restoreClickListener();
                            view.setHintText("共计备份:  " + amount + " 项");

                            if (!waitForAction(() => $$view.pages[view_tag], 5e3)) {
                                continue;
                            }
                            return ui.post(() => {
                                $$view.pages[view_tag]
                                    .add("list", new Layout("/*服务器项目还原*/", {
                                        list_head: "server_releases_info",
                                        data_source_key_name: "server_releases_info",
                                        list_checkbox: "gone",
                                        listeners: {
                                            _list_data: {
                                                item_click(item, idx) {
                                                    let _releases = [];
                                                    let _single_ses = $$ses.server_releases_info[idx] || {};
                                                    let _tag_name = _single_ses.tag_name;
                                                    let _def_cnt = $$def.dialog_contents;
                                                    let _labels = {
                                                        name: "标题",
                                                        tag_name: "标签",
                                                        published_at: "发布",
                                                        body: "版本更新内容描述",
                                                    };
                                                    Object.keys(_labels).forEach((k) => {
                                                        if (k in _single_ses) {
                                                            let _lbl = _labels[k];
                                                            let _v = _single_ses[k];
                                                            if (_v.match(/^list_item_name_\d+$/)) {
                                                                _v = _single_ses[_v];
                                                            }
                                                            if (k === "body") {
                                                                _v = "\n" + _v;
                                                            }
                                                            _v && _releases.push(_lbl + ": " + _v);
                                                        }
                                                    });
                                                    dialogsx
                                                        .builds([
                                                            "版本详情", _releases.join("\n\n"),
                                                            ["浏览器查看", "hint_btn_bright_color"], "返回",
                                                            ["还原此项目", "warn_btn_color"], 1,
                                                        ])
                                                        .on("negative", d => d.dismiss())
                                                        .on("neutral", (d) => {
                                                            d.dismiss();
                                                            app.openUrl(_single_ses["html_url"]);
                                                        })
                                                        .on("positive", (d) => {
                                                            d.dismiss();
                                                            let _diag = dialogsx.builds([
                                                                "还原项目", "restore_project_confirm",
                                                                0, "放弃", ["还原", "caution_btn_color"], 1,
                                                            ]);
                                                            if (_single_ses[_tag_name].match(/^v1\.6\.25/)) {
                                                                _diag.setContent(
                                                                    _def_cnt.v1_6_25_restore_confirm + "\n\n" +
                                                                    _def_cnt.restore_project_confirm
                                                                );
                                                                dialogsx.setTitleTextColor(_diag, "#880e4f");
                                                                dialogsx.setContentTextColor(_diag, "#ad1457");
                                                            }
                                                            _diag.on("negative", (ds) => {
                                                                ds.dismiss();
                                                                d.show();
                                                            }).on("positive", (ds) => {
                                                                ds.dismiss();
                                                                $$tool.restoreProjectFiles(_single_ses["zipball_url"]);
                                                            }).show();
                                                        })
                                                        .show();
                                                },
                                                item_bind(item_view) {
                                                    item_view["_checkbox"].setVisibility(8);
                                                },
                                            },
                                        },
                                    }))
                                    .add("info", new Layout("点击列表项可查看并还原项目"))
                                    .add("blank")
                                    .ready();
                            });
                        } catch (e) {
                            sleep(200);
                        }
                    }
                    restoreClickListener();
                    return threadsx.starts(function () {
                        view.setHintText("服务器数据获取失败 (点击重试)");
                    });
                });

                // tool function(s) //

                function clearClickListener() {
                    view.setClickListener(() => null);
                }

                function restoreClickListener() {
                    $$ses.restore_proj_from_svr_page_updated = false;
                    view.setClickListener(() => $$view.updateViewByTag(view_tag));
                }
            },
        }))
        .ready();
});
$$view.page.new("从本地还原项目", "restore_projects_from_local_page", (t) => {
    $$view.setPage(t, null, {no_scroll_view: true})
        .ready();
});
$$view.page.new("从服务器还原项目", "restore_projects_from_server_page", (t) => {
    $$view.setPage(t, null, {no_scroll_view: true})
        .ready();
});

$$view.page.flush();