mxTooltipHandler.prototype.show = function(tip, x, y) {
  if (!this.destroyed && tip != null && tip.length > 0) {
    // Initializes the DOM nodes if required
    if (this.div == null) {
      this.init();
    }
    if (!mxUtils.isNode(tip)) {
      this.div.innerHTML = tip.replace(/\n/g, '<br>');
    } else {
      this.div.innerHTML = '';
      this.div.appendChild(tip);
    }
    this.$div.place_tt(x + 20, y);
    this.div.style.visibility = '';
    mxUtils.fit(this.div);
  }
};

mxTooltipHandler.prototype.init = function() {
  if (this.div === null || this.div === undefined) {
    this.$div = $('<div class="graph-tooltip">');
    this.div = this.$div[0];
    mxEvent.addGestureListeners(
      this.div,
      mxUtils.bind(this, function(evt) {
        this.hideTooltip();
      })
    );
  }
};

mxTooltipHandler.prototype.hideTooltip = function() {
  if (this.div != null) {
    this.div.style.visibility = 'hidden';
    this.div.innerHTML = '';
  }
};

Graph.prototype.getTooltipForCell = function(cell) {
  u.log(1, 'Graph_other.getTooltipForCell()');
  let tip = '';

  if (mxUtils.isNode(cell.value)) {
    let tmp = cell.value.getAttribute('tooltip');
    // Tooltip
    if (tmp != null) {
      if (tmp != null && this.isReplacePlaceholders(cell)) {
        tmp = this.replacePlaceholders(cell, tmp);
      }
      tip += '<div style="word-wrap:break-word;">' + this.sanitizeHtml(tmp) + '</div>';
    }

    let ignored = this.builtInProperties;
    let attrs = cell.value.attributes;
    let temp = [];

    // Hides links in edit mode
    if (this.isEnabled()) {
      ignored.push('link');
    }

    // Attributes
    for (var i = 0; i < attrs.length; i++) {
      if (mxUtils.indexOf(ignored, attrs[i].nodeName) < 0 && attrs[i].nodeValue.length > 0) {
        temp.push({ name: attrs[i].nodeName, value: attrs[i].nodeValue });
      }
    }

    // Sorts by name
    temp.sort(function(a, b) {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });
    tip += '<div>';
    for (var i = 0; i < temp.length; i++) {
      if (temp[i].name != 'link' || !this.isCustomLink(temp[i].value)) {
        tip +=
          (temp[i].name != 'link' ? '<b>' + temp[i].name + ':</b> ' : '') +
          mxUtils.htmlEntities(temp[i].value) +
          '\n';
      }
    }
    tip += '</div>';

    if (tip.length > 0) {
      tip = tip.substring(0, tip.length - 1);

      if (mxClient.IS_SVG) {
        tip = '<div style="max-width:360px;">' + tip + '</div>';
      }
    }
  }

  // Date : Last change
  if (cell.GF_lastChange !== undefined && cell.GF_lastChange !== null) {
    tip += `<div class="graph-tooltip-time"></br>${cell.GF_lastChange}</div>`;
  }

  // Metrics
  if (cell.GF_tooltips !== undefined && cell.GF_tooltips.length > 0) {
    let metrics = cell.GF_tooltips;
    tip += '<div></br>';
    for (var i = 0; i < metrics.length; i++) {
      const current = metrics[i];
      if (current !== undefined) {
        tip += `${current.name} : `;
        tip += `<span style="color:${current.color}"><b>${current.value}</b></span></br>`;
      }
    }
    tip += '</div>';
  }
  u.log(1, 'tip', tip);
  return tip;
};


// EditorUi.js

mxEvent.addMouseWheelListener(mxUtils.bind(this, function(evt, up)
{
  // Ctrl+wheel (or pinch on touchpad) is a native browser zoom event is OS X
  // LATER: Add support for zoom via pinch on trackpad for Chrome in OS X
  if ((this.dialogs == null || this.dialogs.length == 0) && Graph.prototype.isZoomWheelEvent(evt))
  {
    var source = mxEvent.getSource(evt);
    
    while (source != null)
    {
      if (source == Graph.container)
      {
        cursorPosition = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
        Graph.lazyZoom(up);
        mxEvent.consume(evt);
    
        return;
      }
      
      source = source.parentNode;
    }
  }
}));