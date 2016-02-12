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
    "fun":0,
    "multi":3,
    "dissertation":5,
    "work":4
}
var colorScale = d3.scale.linear().domain([0,5]).range(["red","green"])
function dataDidLoad(error,data) {
//make 1 svg for everything
    var mapSvg = d3.select("#map").append("svg").attr("width",1200).attr("height",800)
    formatData(data,"day")
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

function formatData(data,column){
//	data = table.filter(table.group(data, ["zipcode"]), function(list, zipcode) {return (zipcode == currentSelection.zipcode)})
 //   var svg = d3.select("#chart").append("svg").attr("width",600).attr("height",600)
	var groupedData = table.group(data, [column])
    console.log(groupedData)
    for(var group in groupedData){
        console.log(groupedData[group])
        for(var record in groupedData[group]){
            var colorIndex = categoryDictionary[groupedData[group][record].category]
            var color = colorScale(colorIndex)
            drawLine(color)
            console.log(record)
        }
//        drawDots(data,svg)
    }
}

var mediaDictionary = {
    "web":1
}
function drawLine(color){
    var lineSvg = d3.select("#chart").append("svg").attr("width",10).attr("height",20)
    lineSvg.append("line")
    .attr("class", "line")
    .attr("stroke-width","4px")
    .attr("stroke",color)
    .attr("x1",0).attr("y1",0).attr("x2",10).attr("y2",20)    
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