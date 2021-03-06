"use strict";

/*
   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
*/
var React = require("react");
var _ = require("underscore");
var ColumnProperties = require("./columnProperties.js");
var deep = require("./deep.js");

var GridRow = React.createClass({
    displayName: "GridRow",
    getDefaultProps: function () {
        return {
            isChildRow: false,
            showChildren: false,
            data: {},
            columnSettings: null,
            rowSettings: null,
            hasChildren: false,
            useGriddleStyles: true,
            useGriddleIcons: true,
            isSubGriddle: false,
            paddingHeight: null,
            rowHeight: null,
            parentRowCollapsedClassName: "parent-row",
            parentRowExpandedClassName: "parent-row expanded",
            parentRowCollapsedComponent: "▶",
            parentRowExpandedComponent: "▼",
            onRowClick: null,
            multipleSelectionSettings: null
        };
    },
    handleClick: function (e) {
        if (this.props.onRowClick !== null && _.isFunction(this.props.onRowClick)) {
            this.props.onRowClick(this, e);
        } else if (this.props.hasChildren) {
            this.props.toggleChildren();
        }
    },
    handleSelectionChange: function (e) {
        //hack to get around warning that's not super useful in this case
        return;
    },
    handleSelectClick: function (e) {
        if (this.props.multipleSelectionSettings.isMultipleSelection) {
            if (e.target.type === "checkbox") {
                this.props.multipleSelectionSettings.toggleSelectRow(this.props.data, this.refs.selected.getDOMNode().checked);
            } else {
                this.props.multipleSelectionSettings.toggleSelectRow(this.props.data, !this.refs.selected.getDOMNode().checked);
            }
        }
    },
    verifyProps: function () {
        if (this.props.columnSettings === null) {
            console.error("gridRow: The columnSettings prop is null and it shouldn't be");
        }
    },
    render: function () {
        var _this = this;
        this.verifyProps();
        var that = this;
        var columnStyles = null;

        if (this.props.useGriddleStyles) {
            columnStyles = {
                margin: "0",
                padding: that.props.paddingHeight + "px 5px " + that.props.paddingHeight + "px 5px",
                height: that.props.rowHeight ? this.props.rowHeight - that.props.paddingHeight * 2 + "px" : null,
                backgroundColor: "#FFF",
                borderTopColor: "#DDD",
                color: "#222"
            };
        }

        var columns = this.props.columnSettings.getColumns();

        // make sure that all the columns we need have default empty values
        // otherwise they will get clipped
        var defaults = _.object(columns, []);

        // creates a 'view' on top the data so we will not alter the original data but will allow us to add default values to missing columns
        var dataView = _.extend(this.props.data);

        _.defaults(dataView, defaults);

        var data = _.pairs(deep.pick(dataView, columns));

        var nodes = data.map(function (col, index) {
            var returnValue = null;
            var meta = _this.props.columnSettings.getColumnMetadataByName(col[0]);

            //todo: Make this not as ridiculous looking
            var firstColAppend = index === 0 && _this.props.hasChildren && _this.props.showChildren === false && _this.props.useGriddleIcons ? React.createElement(
                "span",
                { style: _this.props.useGriddleStyles ? { fontSize: "10px", marginRight: "5px" } : null },
                _this.props.parentRowCollapsedComponent
            ) : index === 0 && _this.props.hasChildren && _this.props.showChildren && _this.props.useGriddleIcons ? React.createElement(
                "span",
                { style: _this.props.useGriddleStyles ? { fontSize: "10px" } : null },
                _this.props.parentRowExpandedComponent
            ) : "";

            if (index === 0 && _this.props.isChildRow && _this.props.useGriddleStyles) {
                columnStyles = _.extend(columnStyles, { paddingLeft: 10 });
            }

            if (_this.props.columnSettings.hasColumnMetadata() && typeof meta !== "undefined") {
                var colData = typeof meta.customComponent === "undefined" || meta.customComponent === null ? col[1] : React.createElement(meta.customComponent, { data: col[1], rowData: dataView, metadata: meta });
                returnValue = meta == null ? returnValue : React.createElement(
                    "td",
                    { onClick: _this.handleClick, className: meta.cssClassName, key: index, style: columnStyles },
                    colData
                );
            }

            return returnValue || React.createElement(
                "td",
                { onClick: _this.handleClick, key: index, style: columnStyles },
                firstColAppend,
                col[1]
            );
        });

        if (nodes && this.props.multipleSelectionSettings && this.props.multipleSelectionSettings.isMultipleSelection) {
            var selectedRowIds = this.props.multipleSelectionSettings.getSelectedRowIds();

            nodes.unshift(React.createElement(
                "td",
                { key: "selection", style: columnStyles },
                React.createElement("input", {
                    type: "checkbox",
                    checked: this.props.multipleSelectionSettings.getIsRowChecked(dataView),
                    onChange: this.handleSelectionChange,
                    ref: "selected" })
            ));
        }

        //Get the row from the row settings.
        var className = that.props.rowSettings && that.props.rowSettings.getBodyRowMetadataClass(that.props.data) || "standard-row";

        if (that.props.isChildRow) {
            className = "child-row";
        } else if (that.props.hasChildren) {
            className = that.props.showChildren ? this.props.parentRowExpandedClassName : this.props.parentRowCollapsedClassName;
        }
        return React.createElement(
            "tr",
            { onClick: this.props.multipleSelectionSettings && this.props.multipleSelectionSettings.isMultipleSelection ? this.handleSelectClick : null, className: className },
            nodes
        );
    }
});

module.exports = GridRow;