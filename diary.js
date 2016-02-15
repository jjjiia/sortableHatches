$(function() {
	queue()
		.defer(d3.csv, data)
        .await(dataDidLoad);
})

$("#topDifferences .hideTop").hide()
var timeOfDayDictionary = {
    "earlyMorning":1,
    "Morning":2,
    "Afternoon":3,
    "Night":4
}
var mediaDictionary = {
    "sound":1,
    "web":2,
    "image_sound":3,
    "image":4,
    "paper":5
}
var categoryDictionary = {
    "fun":5,
    "multi":3,
    "dissertation":0,
    "work":1
}
var colorScale = d3.scale.linear().domain([0,5]).range(["black","green"])
function dataDidLoad(error,data) {
//make 1 svg for everything
    var svg = d3.select("#chart").append("svg").attr("width",600).attr("height",400)
    var headers = d3.keys(data[0])
    initGraph(data,"day",svg)
    
    for(var k in headers){
        addButton(headers[k],data,svg)
    }
    
   // initGraph(data,"time",svg)
}
var table = {
	group: function(rows, fields) {
		var view = {}
		var pointer = null

		for(var i in rows) {
			var row = rows[i]

			pointer = view
			for(var j = 0; j < fields.length; j++) {
				var field = fields[j]

				if(!pointer[row[field]]) {
					if(j == fields.length - 1) {
						pointer[row[field]] = []
					} else {
						pointer[row[field]] = {}
					}
				}

				pointer = pointer[row[field]]
			}

			pointer.push(row)
		}

		return view
	},

	maxCount: function(view) {
		var largestName = null
		var largestCount = null

		for(var i in view) {
			var list = view[i]

			if(!largestName) {
				largestName = i
				largestCount = list.length
			} else {
				if(list.length > largestCount) {
					largestName = i
					largestCount = list.length
				}
			}
		}

		return {
			name: largestName,
			count: largestCount
		}
	},

	filter: function(view, callback) {
		var data = []

		for(var i in view) {
			var list = view[i]
			if(callback(list, i)) {
				data = data.concat(list)
			}
		}

		return data
	}
}

function addButton(column,data,svg){
    var width = column.length*10
    var controlsSvg =  d3.select("#buttons").append("svg").attr("width",width).attr("height",20)
    controlsSvg.append("text").text(column).attr("fill","#aaa").attr("x",0).attr("y",15).attr("class","button")
    .on("click",function(){
        initGraph(data,column,svg)
        d3.selectAll(".button").attr("fill","#aaa")
        d3.select(this).attr("fill","red")
        update(data,column,svg)
    })
}

function initGraph(data,column,svg){

    var formatedData = formatData(data,column,svg)
    drawLine(formatedData,svg)
   
}

function update(data,column,svg){
    var formatedData = formatData(data,column,svg)
    d3.selectAll(".line").transition()
    .duration(500).delay(function(d,i){return i*50})
    .attr("x1",function(d,i){
        //console.log(d)
        return 10*d.itemIndex+30
    })
    .attr("y1",function(d){
        return d.groupIndex*25
    })
    .attr("x2",function(d,i){
        var category = d.category
        return 10*d.itemIndex+30-categoryDictionary[category]
    })
    .attr("y2",function(d){
        return d.groupIndex*25+20
    })
    drawLine(formatedData,svg)
}

function formatData(data,column,svg){
//	data = table.filter(table.group(data, ["zipcode"]), function(list, zipcode) {return (zipcode == currentSelection.zipcode)})
 //   var svg = d3.select("#chart").append("svg").attr("width",600).attr("height",600)
	var groupedData = table.group(data, [column])
    var formatedData = []
    var groupIndex = 0
  //  console.log(groupedData)
    for(var i in groupedData){
        //console.log(i)
        groupIndex+=1
        itemIndex = 0
        //console.log(groupedData[group])
        for(var j in groupedData[i]){
            itemIndex+=1
           // var colorIndex = categoryDictionary[groupedData[group][record].category]
            //var color = colorScale(colorIndex)
            groupedData[i][j]["groupIndex"]=groupIndex
            groupedData[i][j]["itemIndex"]=itemIndex
            
            var formatedEntry = groupedData[i][j]
            formatedData.push(formatedEntry)
            
        }
//        drawDots(data,svg)
    }
        return formatedData
}

var mediaDictionary = {
    "web":1
}
function drawLine(data,svg){
    console.log(data)
    
  //  var lineSvg = d3.select("#chart").append("svg").attr("width",10).attr("height",20)
    svg.selectAll(".line")
    .data(data).enter()
    .append("line")
    .attr("class", "line")
    .attr("stroke-width","4px")
    .attr("x1",function(d,i){
        //console.log(d)
        return 10*d.itemIndex+30
    })
    .attr("y1",function(d){
        return d.groupIndex*25
    })
    .attr("x2",function(d,i){
        var category = d.category
        
        return 10*d.itemIndex+30-categoryDictionary[category]
    })
    .attr("y2",function(d){
        return d.groupIndex*25+20
    })
    .attr("stroke",function(d){
        var category = d.category
        var colorIndex = categoryDictionary[category]
        return colorScale(colorIndex)
    })
    .on("mouseover",function(d){
        d3.select(this).attr("stroke-width","6px")
        d3.select("#notes").html(d.description)
    })
    .on("mouseout",function(d){
        d3.select(this).attr("stroke-width","4px")
        
    })
    //.transition().duration(750).delay(function(d,i){return i*50})
   // .attr("transform", function(d, i) { return "translate(0," + 20 + ")"; });
    
    svg.selectAll("text")
    .data(data)
    .enter()
    .append("text")
}
function drawDots(data,svg){    
    svg.selectAll(".dots")
        .data(data)
        .enter()
        .append("circle")
        .attr("class","dots")
        .attr("r",function(d){
           // return 7
            return parseInt(d.amount)*0.2+3
        })
        .attr("cy",function(d){
          console.log(d.day)
            return d.day*60+20
        })
        .attr("cx",function(d,i){
            
           // return i*15
            return d.time*15
            return timeOfDayDictionary[d.timeOfDay]*40+40
        })
        .attr("fill",function(d){
            return colorScale(categoryDictionary[d.category])
        })
	    .style("opacity",.3)
        //on mouseover prints dot data
        .on("mouseover",function(d){
            console.log(d.description)
        })
        
}