/**
 * File: plot-container.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 05.07.2016
 * Copyright: 2016, Institute for Automation of Complex Power Systems, EONERC
 *   This file is part of VILLASweb. All Rights Reserved. Proprietary and confidential.
 *   Unauthorized copying of this file, via any medium is strictly prohibited.
 **********************************************************************************/

import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: [ 'plots' ],
  attributeBindings: [ 'style' ],

  plots: null,
  editing: false,
  grid: true,

  style: function() {
    return Ember.String.htmlSafe('height: ' + this._calculateHeight() + 'px;');
  }.property('plots.@each.height', 'plots.@each.y'),

  _calculateHeight() {
    var maxHeight = 0;
    var plots = this.get('plots');

    plots.forEach(function(plot) {
      var plotHeight = plot.get('y') + plot.get('height');
      if (plotHeight > maxHeight) {
        maxHeight = plotHeight;
      }
    });

    // add padding to height
    maxHeight += 40;

    return maxHeight;
  }
});