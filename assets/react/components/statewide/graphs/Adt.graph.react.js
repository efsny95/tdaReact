'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../../utils/dependencies/nvd3'), 

    //-- Stores
    StateWideStore = require('../../../stores/StatewideStore'),

    //-- Utils
    colorRange = colorbrewer.RdBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange);



var GraphContainer = React.createClass({

    
    getDefaultProps:function(){
        return {
            height: 300,
            classByMonth:StateWideStore.getClassByMonth()
        }
    },


    _updateGraph: function(){
        var scope = this;
        

        if(Object.keys(scope.props.classByMonth.getDimensions()).length > 0){


            var stationADT = scope.props.classByMonth.getGroups()
                .ADT.order(function(p){return p.avg})
                .top(Infinity)


            AdtScale.domain(stationADT.map(function(ADT){
                return ADT.value.avg;
            }));
            //console.log('draw graph');
            //var colorScale = d3.scale.quantile
            nv.addGraph(function() {
                var chart = nv.models.discreteBarChart()
                  .x(function(d) { return d.label })    //Specify the data accessors.
                  .y(function(d) { return d.value })
                  .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                  .tooltips(true)        //Don't show tooltips
                  .showValues(false)       //...instead, show the bar value right on top of each bar.
                  .transitionDuration(350)
                  .showXAxis(false);
                
                d3.select('#adtchart svg')
                    .datum(
                        [{
                            key:"ADT",
                            values:scope.props.classByMonth.getGroups()
                                .ADT
                                .top(Infinity)
                                .filter(function(p){ 
                                    return !isNaN(p.value.avg);
                                })
                                .sort(function(a,b){
                                    return b.value.avg-a.value.avg;
                                })
                                .map(function (ADT){
                                    return {
                                        "label":ADT.key,
                                        "value":ADT.value.avg,
                                        "color":AdtScale(ADT.value.avg)
                                    }
                                })
                        }]
                    )
                    .call(chart);

                nv.utils.windowResize(chart.update);

                return chart;
            });
       }
    },
    render: function() {
        var svgStyle = {
          height: this.props.height+'px',
          width: '100%'
        };
        this._updateGraph();
        return (
        	<section className="widget large" style={{ background:'none'}}>
                <header>
                    <h4>
                        {this.props.selectedState}
                    </h4>
                    
                </header>
                <div className="body">
                    <div id="adtchart">
                        <svg style={svgStyle}></svg>
                    </div>
                </div>
            </section>
        );
    }
});

module.exports = GraphContainer;