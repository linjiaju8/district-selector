/**
 * Create by jackie0 2015/07/31
 * 省、市、区县联动jquery插件
 */
;
(function ($, window) {
    'use strict';

    var $document = $(window.document);
    var _this;
    var $province;
    var $city;
    var $area;

    var DistrictSelector = function (opt) {
        this.defaults = {
            provinceId: "",
            cityId: "",
            areaId: "",
            emptyText:"请选择",
            provinceCallBack: null,
            cityCallBack: null,
            areaCallBack: null,
            ajaxMethod: {
                url: null,
                sendData: null,
                responseHandler: function (data) {
                    return data;
                }
            }
        };
        this.options = $.extend({}, this.defaults, opt);
        $province = $('#' + this.options.provinceId);
        $city = $('#' + this.options.cityId);
        $area = $('#' + this.options.areaId);
        _this = this;
        bindingData();
    };

    DistrictSelector.prototype = {
        initSelectedCodes: function (provinceCode, cityCode, areaCode) {
            if (provinceCode && provinceCode != 'unknown') {
                var $province = $('#' + this.options.provinceId);
                $province.val(provinceCode);
                $province.change();
                if (cityCode && cityCode != 'unknown') {
                    var $city = $('#' + this.options.cityId);
                    $city.val(cityCode);
                    $city.change();
                    if (areaCode && areaCode != 'unknown') {
                        $('#' + this.options.areaId).val(areaCode);
                    }
                }
            }
        }
    };

    var init = function () {
        var $province = $('#' + _this.options.provinceId);
        var $city = $('#' + _this.options.cityId);
        var $area = $('#' + _this.options.areaId);
        bindingData($province, $city, $area);
        bindingEvent($province, $city, $area);
    };

    var bindingData = function () {
        var emptyHtml = "<option value=''>"+_this.options.emptyText+"</option>";
        $province.append(emptyHtml);
        $city.append(emptyHtml);
        $area.append(emptyHtml);
        var districtCode;
        var districtName;
        var parentDistrictCode;
        var $opt;

        // 初始化省份数据
        var provinceData;
        if (_this.options.ajaxMethod.url) {
            $.getJSON(_this.options.ajaxMethod.url, _this.options.ajaxMethod.sendData, function (data) {
                var provinceData = _this.options.ajaxMethod.responseHandler(data);
                if (provinceData && provinceData.length && provinceData.length > 0) {
                    for (var i = 0; i < provinceData.length; i++) {
                        districtCode = provinceData[i].administrativeDivisionId;
                        districtName = provinceData[i].name;
                        pDistrictCode = provinceData[i].parentId;
                        $opt = $("<option value='" + districtCode + "'>" + districtName + "</option>");
                        // 根节点,即省份数据
                        $province.append($opt);
                        $opt.data(districtCode, provinceData[i]);
                    }
                    if ($.isFunction(_this.options.provinceCallBack)) {
                        // 省份数据初始化后回调
                        _this.options.provinceCallBack(provinceData);
                    }
                }
            });
        } else {
            provinceData = DistrictSelectorData;
            for (var k in provinceData) {
                districtCode = k;
                districtName = provinceData[k][0];
                parentDistrictCode = provinceData[k][1];
                $opt = $("<option value='" + districtCode + "'>" + districtName + "</option>");
                if (parentDistrictCode == "1") {
                    // 根节点,即省份数据
                    $province.append($opt);
                } else {
                    var oldData = $($document).data(pDistrictCode) ? $($document).data(pDistrictCode) : [$(emptyOpt)];
                    oldData.push($opt);
                    $document.data(pDistrictCode, oldData);
                }
            }
        }
    };

    var bindingEvent = function ($province, $city, $area) {
        $province.change(function () {
            // 初始化地市前先清理区县数据
            $area.empty();
            $area.append(emptyOpt);
            // 地市
            buildSubDistricts($city, $(this).val(), "2");
        });
        $city.change(function () {
            // 区县
            buildSubDistricts($area, $(this).val(), "3");
        });
    };

    var buildSubDistricts = function ($subDistricts, parentDistrictCode) {
        var $subDistrictsData;
        var emptyHtml = "<option value=''>"+_this.options.emptyText+"</option>";
        if (_this.options.ajaxMethod.url) {
            $subDistricts.empty();
            $subDistricts.append(emptyHtml);
            $.getJSON(_this.options.ajaxMethod.url, _this.options.ajaxMethod.sendData, function (data) {
                $subDistrictsData = _this.options.ajaxMethod.responseHandler(data);
                if ($subDistrictsData && $subDistrictsData.length && $subDistrictsData.length > 0) {
                    for (var i = 0; i < $subDistrictsData.length; i++) {
                        var districtCode = $subDistrictsData[i].administrativeDivisionId;
                        var districtName = $subDistrictsData[i].name;
                        var $opt = $("<option value='" + districtCode + "'>" + districtName + "</option>");
                        // 根节点,即省份数据
                        $subDistricts.append($opt);
                        $opt.data(districtCode, $subDistrictsData[i]);
                    }
                    if (level == "2" && $.isFunction(_this.options.cityCallBack)) {
                        // 地市数据初始化后回调
                        _this.options.cityCallBack($subDistrictsData);
                    }
                    if (level == "3" && $.isFunction(_this.options.areaCallBack)) {
                        // 区县数据初始化后回调
                        _this.options.areaCallBack($subDistrictsData);
                    }
                }
            });
        } else {
            $subDistrictsData = $document.data(parentId) ? $document.data(parentId) : emptyOpt;
            $subDistricts.html($subDistrictsData);
        }
    };

    $.initDistrictSelector = function (opt) {
        return new DistrictSelector(opt);
    };
})(jQuery, window);