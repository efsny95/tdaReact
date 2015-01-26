'use strict';
/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 */

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/AppConstants'),
    EventEmitter = require('events').EventEmitter,
    assign = require('object-assign'),

    ActionTypes = Constants.ActionTypes,
    CHANGE_EVENT = 'change',

    SailsWebApi = require('../utils/api/SailsWebApi'),
    ClassFilter = require('../utils/dataFilters/classFilter.js');

var _selectedState = null,
    _classbyDay = {};

function _setState(fips){
  //console.log('StatewideStore / _setState ',fips)
  _selectedState = fips;
}

function _filterYear(year){
  ClassFilter.getDimension('year').filter(year);
}

var StatewideStore = assign({}, EventEmitter.prototype, {

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  
  /**
   * @param {function} callback
   */

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  getSelectedState:function(){
    return _selectedState;
  },

  getClassByDay:function(){
    
    //if data is loaded send it
    //console.log('StatewideStore / getClassByDay',_selectedState);
    if(_classbyDay[_selectedState] && _classbyDay[_selectedState] !== 'loading' ){
      ClassFilter.init(_classbyDay[_selectedState],_selectedState);
      return ClassFilter;
    }
    
    //if data hasn't start started loading, load it 
    if(_classbyDay[_selectedState] !== 'loading'){
      SailsWebApi.getClassByDay(_selectedState);
      _classbyDay[_selectedState] = 'loading';
    }

    //if requested data isn't loaded send most recent data
    // may want to rethink this
    return ClassFilter;
  }



});

StatewideStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case ActionTypes.SET_SELECTED_STATE:
      _setState(action.Id);
      StatewideStore.emitChange();
    break;

    case ActionTypes.FILTER_YEAR:
      _filterYear(action.year);
      StatewideStore.emitChange();
    break;

    case ActionTypes.TMG_CLASS_BYDAY:
      _classbyDay[action.fips] = action.data;
      StatewideStore.emitChange();
    break;

    default:
      // do nothing
  }

});

module.exports = StatewideStore;
