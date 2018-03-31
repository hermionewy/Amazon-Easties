var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width =  (document.getElementById('circle-graphic').clientWidth)  - margin.left - margin.right,
    height = document.getElementById('circle-graphic').clientHeight - margin.top - margin.bottom;

var svg = d3.select("#circle-graphic").append("svg")
    .attr('transform','translate(0,0)')
    .attr("width", width+margin.left+margin.right)
    .attr("height", height+margin.top+margin.bottom);
var circleR = 3;



var eb_json = [{"hispanic":55,"white":34,"black":5,"asian":3,"other":3}]; //41,000- 400 circles
var amazon_json = [{"hispanic":13,"white":48,"black":21,"asian":13,"other":5}]; //50,000 500 circles


var data = createCircleData();
console.log(data);
var simulation = d3.forceSimulation(data);

var axisData = ['hispanic', 'white', 'black', 'asian', 'other'];


var controller = new ScrollMagic.Controller();
var triggerEls =["#trigger-0", "#trigger-1", "#trigger-2","#trigger-3","#trigger-4","#trigger-5"];
var graphicPlot = d3.select('#circle-graphic');

var scenes = triggerEls.map(function(el) {
    var step = +el.split('-')[1];

    var scene = new ScrollMagic.Scene({
        triggerElement: el,
        triggerHook: 'onCenter',
    })

    scene
        .on('enter', function(event) {
            d3.selectAll('.trigger').style('color', '#a4a4a4')
            d3.select(el).style('color', '#000');
            graphicUpdate(step)
        })
        .on('leave', function(event) {
            var nextStep = Math.max(0, step - 1);
            console.log(nextStep);
            d3.selectAll('.trigger').style('color', '#a4a4a4')
            d3.select("#trigger-"+nextStep).style('color', '#000');
            graphicUpdate(nextStep)
            if(step==0){
                graphicPlot.classed('fixed', false);
                graphicPlot.classed('relativeTop', true);
            }
        })

    scene.addTo(controller);
});

function graphicUpdate(step) {

    if(step==0){
        var forceX = d3.forceX().x(function (d) {
            graphicPlot.classed('relativeTop', false);
            graphicPlot.classed('fixed', true);
            if(d.attr=='East Boston'){
                return width/3
            } else{
                return 2*width/3
            }
        }).strength(1);

        var forceY = d3.forceY().y(function (d) {
            return height/2
        }).strength(1);
        forceLayout(data, forceX, forceY);

    } else if(step ==1){

        var forceX = d3.forceX().x(function (d) {
            return barByRaceX(d);
        }).strength(2.5);

        var forceY = d3.forceY().y(function (d) {
            return barByRaceY(d)
        }).strength(2.5);
        forceLayout(data, forceX, forceY);
    } else if(step ==2){

        var forceX = d3.forceX().x(function (d) {
            return barByRaceX2(d);
        }).strength(2.5);

        var forceY = d3.forceY().y(function (d) {
            return barByRaceY2(d)
        }).strength(2.5);

        forceLayout(data, forceX, forceY);
    }
}




function barByRaceY(d) {
    return 4*height/5-Math.floor(d.count/4)*8
}
function barByRaceY2(d) {
    return 8*height/9-Math.floor(d.count2/5)*8
}

function barByRaceX(d) {
    var scaleX1 = d3.scaleBand()
        .domain(axisData)
        .range([0, width/3]);

    var scaleX2 = d3.scaleBand()
        .domain(axisData)
        .range([width/3+60, 2*width/3+60]);

    var baseX;
    if(d.attr=='East Boston'){
        baseX = scaleX1(d.race);
    } else{
        baseX = scaleX2(d.race)
    }

    if(d.count%4==0){
        return baseX-2*circleR-2
    } else if(d.count%4==1){
        return baseX
    } else if(d.count%4==2){
        return baseX+2*circleR+2
    }else if(d.count%4==3){
        return baseX+4*circleR+4
    }
}
function barByRaceX2(d) {
    var scaleX = d3.scaleBand()
        .domain(axisData)
        .range([width/4, 3*width/4]);

    var baseX = scaleX(d.race);

    if(d.count2%5==0){
        return baseX-4*circleR-4
    } else if(d.count2%5==1){
        return baseX-2*circleR-2
    } else if(d.count2%5==2){
        return baseX
    } else if(d.count2%5==3){
        return baseX+2*circleR+2
    }else if(d.count2%5==4){
        return baseX+4*circleR+4
    }
}


function forceLayout(data, forceX, forceY) {
    drawCircles(data);

    simulation
        .force("collide",d3.forceCollide(circleR).radius(circleR).strength(1) )
        .force("charge", d3.forceManyBody().strength(0.5))
        .restart()
        .alpha(0.06)
        .force('y', forceY)
        .force('x', forceX)
        .on('tick', ticked);
    
    function ticked() {
        d3.selectAll('.circleNode')
            .attr('cx',function(d){
                return d.x
                })
            .attr('cy',function(d){
                return d.y
            })
            .attr('fill', function (d) {
                return colorByRace(d.race)
            });
    }
    function colorByRace(d) {
        if(d=='hispanic'){
            return '#4281A4'
        } else if(d=='white'){
            return '#FE938C'
        } else if(d=='black'){
            return '#9CAFB7'
        } else if(d=='asian'){
            return '#E6B89C'
        } else {
            return '#EAD2AC'
        }
    }
}

function drawCircles(data) {
    var node = svg.selectAll('.node')
        .data([1]);

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform','translate('+margin.left +',' + margin.top+')');

    var circles = nodeEnter.merge(node).selectAll('.circleNode')
        .data(data)
        .enter();

    var circlesUpdate = circles
        .append('circle')
        .attr('class','circleNode');

    d3.selectAll('.circleNode')
        .attr('r', circleR);

    circles.exit().remove();
}


function createCircleData() {
    var data=[];
    for(var i = 0; i<900; i++){
        if(i< 400){
            var datum = {
                id: i,
                attr: 'East Boston',
                race: 'other',
            };

            if (i< 220){
                datum.race = 'hispanic';
                datum.count = i;
                datum.count2 = i;
            } else if(i< 356){
                datum.race = 'white';
                datum.count = i-220;
                datum.count2 = i-220; //136
            } else if(i< 376){
                datum.race = 'black';
                datum.count = i-356;
                datum.count2 = i-356;
            } else if(i< 388){
                datum.race = 'asian';
                datum.count = i-376;
                datum.count2 = i-376;
            } else {
                datum.race = 'other';
                datum.count = i-388;
                datum.count2 = i-388;
            }
        } else{
            var datum = {
                id: i,
                attr: 'Amazon'
            };
            if(i< 465){
                datum.race = 'hispanic';
                datum.count = i-400;
                datum.count2 = i-400+220; //65
            } else if(i< 705){
                datum.race = 'white';
                datum.count = i-465;
                datum.count2 = i-465+136; //65
            } else if(i< 810){
                datum.race = 'black';
                datum.count = i-705;
                datum.count2 = i-705+20;
            } else if(i< 875){
                datum.race = 'asian';
                datum.count = i-810;
                datum.count2 = i-810+12;
            } else{
                datum.race = 'other';
                datum.count = i-875;
                datum.count2 = i-875+12;
            }
        }
        data.push(datum);
    }
    return data;
}