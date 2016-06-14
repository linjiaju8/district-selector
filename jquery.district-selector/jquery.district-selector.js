/**
 * Create by jackie0 2015/07/31
 * 省、市、区县联动jquery插件
 */
;
(function ($, window) {
    'use strict';

    var $document = $(window.document);
    var rootDistrictCode = "1"; // 根行政区划ID，即所有省份的根节点的ID，虚拟的

    var DistrictSelector = function (opt) {
        var defaults = {
            provinceId: "", // 省份下拉框ID
            cityId: "", // 地市下拉框ID
            areaId: "", // 区县下拉框ID
            provinceCode: null, // 默认要初始化的省份的code
            cityCode: null, // 默认要初始化的地市的code
            areaCode: null, // 默认要初始化的区县的code
            emptyText: "请选择", // 空选项提示
            onLoadSuccess: null, // 初始化完成后执行
            ajaxConfig: {
                // 使用ajax远程数据时配置
                url: null, // 远程数据地址
                responseDataTemplate: {
                    // 插件默认使用的服务端返回数据格式是：{districtCode:'地区编码',districtName:'地区名称'}，如果不是此格式可通过此配置定制
                    // e.g：如果我使用的是regionCode和regionName可以使用如下代码转换districtCode: "regionCode",districtName: "regionName"
                    districtCode: "districtCode",
                    districtName: "districtName"
                }
            }
        };
        this.options = $.extend({}, defaults, opt);
        if (!this.options.ajaxConfig.url) {
            // 如果没有传入url时使用默认数据
            initLocalDistrictData(this);
        }
        bindingEvent(this);
        buildSubDistricts(this, $('#' + this.options.provinceId), rootDistrictCode, true);
    };

    DistrictSelector.prototype = {
        getEmptyHtml: function () {
            return "<option value=''>" + this.options.emptyText + "</option>";
        }
    };

    var initSelectedCodes = function (_this) {
        var $province = $('#' + _this.options.provinceId);
        if (_this.options.provinceCode && _this.options.provinceCode != 'unknown') {
            $province.val(_this.options.provinceCode);
            $province.change();
            var $city = $('#' + _this.options.cityId);
            if (_this.options.cityCode && _this.options.cityCode != 'unknown') {
                $city.val(_this.options.cityCode);
                $city.change();
                if (_this.options.areaCode && _this.options.areaCode != 'unknown') {
                    $('#' + _this.options.areaId).val(_this.options.areaCode);
                }
            }
        }
    };

    var initLocalDistrictData = function (_this) {
        for (var districtCode in DistrictSelectorData) {
            if (DistrictSelectorData.hasOwnProperty(districtCode)) {
                var districtData = DistrictSelectorData[districtCode];
                var districtName = districtData[0];
                var parentDistrictCode = districtData[1];
                var $option = $("<option value='" + districtCode + "'>" + districtName + "</option>");
                var oldDataHtml = $($document).data(parentDistrictCode) ? $($document).data(parentDistrictCode) : [$(_this.getEmptyHtml())];
                oldDataHtml.push($option);
                $option.data(districtCode, districtData);
                $document.data(parentDistrictCode, oldDataHtml); // 直接存option的html代码
            }
        }
    };

    var bindingEvent = function (_this) {
        var $province = $('#' + _this.options.provinceId);
        var $city = $('#' + _this.options.cityId);
        var $area = $('#' + _this.options.areaId);
        $province.change(function () {
            // 地市
            $city.html(_this.getEmptyHtml());
            $area.html(_this.getEmptyHtml());
            buildSubDistricts(_this, $city, $(this).find('option:selected'));
        });
        $city.change(function () {
            // 区县
            $area.html(_this.getEmptyHtml());
            buildSubDistricts(_this, $area, $(this).find('option:selected'));
        });
    };

    var buildSubDistricts = function (_this, $districts, $parentDistrictOption, initTag) {
        if (_this.options.ajaxConfig.url) {
            $districts.html(_this.getEmptyHtml());
            var sendData = $parentDistrictOption == rootDistrictCode ? null : $parentDistrictOption.data($parentDistrictOption.val());
            $.getJSON(_this.options.ajaxConfig.url, sendData, function (data) {
                $.each(data, function () {
                    var districtCode = this[_this.options.ajaxConfig.responseDataTemplate.districtCode];
                    var districtName = this[_this.options.ajaxConfig.responseDataTemplate.districtName];
                    var $option = $("<option value='" + districtCode + "'>" + districtName + "</option>");
                    $districts.append($option);
                    $option.data(districtCode, this);
                });
                afterInitData(_this, $districts, initTag);
            });
        } else {
            var $parentDistrictCode = $parentDistrictOption == rootDistrictCode ? rootDistrictCode : $parentDistrictOption.val();
            var $subDistrictsHtml = $document.data($parentDistrictCode) ? $document.data($parentDistrictCode) : _this.getEmptyHtml();
            $districts.html($subDistrictsHtml);
            afterInitData(_this, $districts, initTag);
        }
    };

    var afterInitData = function (_this, $districts, initTag) {
        $districts.val("");
        if ($.isFunction(_this.options.onLoadSuccess)) {
            _this.options.onLoadSuccess($districts);
        }
        if (initTag) {
            initSelectedCodes(_this);
        }
    };

    $.initDistrictSelector = function (opt) {
        return new DistrictSelector(opt);
    };
})(jQuery, window);