$(function() {
	queue()
		.defer(d3.csv, data)
        .await(dataDidLoad);
})

function dataDidLoad(error,data) {
//make 1 svg for everything
    var svg = d3.select("#chart").append("svg").attr("width",1200).attr("height",800)
    var headers = d3.keys(data[0])
    for(var k in headers){
        if(headers[k]!="duration"&& headers[k]!="timeOfDay"){
        addButton(headers[k],data,svg)
            
        }
    }
    drawKey()
    initGraph(data,initialViewColumn,svg)
    //d3.select("."+initialViewColumn).attr("fill","red")
}
function drawKey(){
    var media = ["","","sound","web","paper","images","video","person"]
    var gap = 20
    var keySvg = d3.select("#key").append("svg").attr("width",220).attr("height",220)
    keySvg.append("text").text("Key").attr("x",20).attr("y",15)
    
    keySvg.append("text").text("colors = media:").attr("x",20).attr("y",75)
    keySvg.selectAll("circle")
    .data(colors).enter()
    .append("circle")
    .attr("cy",function(d,i){return i*gap+90})
    .attr("cx",function(d,i){return 30})
    .attr("fill",function(d,i){return d})
    .attr("r",6)
    keySvg.selectAll("text")
    .data(media).enter()
    .append("text").text(function(d,i){return media[i]})
    .attr("y",function(d,i){return (i-1)*gap+75})
    .attr("x",function(d,i){return 42})
    .attr("class","keyText")
    
    keySvg.append("text").text("orderly lines = productive").attr("x",20).attr("y",35)
    keySvg.append("text").text("messy lines = unproductive").attr("x",20).attr("y",50)
    
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
var leftMargin = 160
var lineHeight = 20
var lineGap = 30
var lineOffset = 3
function addButton(column,data,svg){
    var width = column.length*10
    var controlsSvg =  d3.select("#buttons").append("svg").attr("width",100).attr("height",20)
    controlsSvg.append("text").text(column).attr("fill","#000").attr("x",0).attr("y",15).attr("class","button").attr("class",column)
    .on("click",function(){
        initGraph(data,column,svg)
        d3.selectAll("#buttons text").attr("fill","#000")
        d3.select(this).attr("fill","red")
        update(data,column,svg)
    })
    .attr("cursor","pointer")
}

function initGraph(data,column,svg){

    var formatedData = formatData(data,column,svg)
 //   drawLine(formatedData,svg,column)
   drawNest(formatedData,svg,column)
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function update(data,column,svg){
    var formatedData = formatData(data,column,svg)
    d3.selectAll(".line").transition()
    .duration(200).delay(function(d,i){return i*2})
    .attr("x1",function(d,i){
        //console.log(d)
        return lineOffset*d.itemIndex+leftMargin + getRandomInt(0, slantScale(d[keyColumn]))
    })
    .attr("y1",function(d){
        return d.groupIndex*lineGap+getRandomInt(0,slantScale(d[keyColumn]))
    })
    .attr("x2",function(d,i){
        //console.log(d[keyColumn])
        return lineOffset*d.itemIndex+leftMargin - getRandomInt(slantScale(d[keyColumn]), slantScale(d[keyColumn])*4)
    })
    .attr("y2",function(d){
        return d.groupIndex*lineGap+lineHeight-getRandomInt(0,slantScale(d[keyColumn]))
    })
    .attr("stroke",function(d){
        var colorIndex = d[colorKeyColumn]
        return colorScale(colorIndex)
    })
    d3.selectAll("#chart text").remove()
    drawLine(formatedData,svg,column)
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
function drawLine(data,svg,column){
  //  console.log(data)
    var xScale = d3.scale.linear()
        .domain([0,24])
        .range([leftMargin, leftMargin+24*lineOffset*12]);
    var axis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
        svg.append("g")
        .attr("class", "axis")
        .call(axis);
    svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(110,10)")  // text is drawn off the screen top left, move down and out and rotate
            .text("hours taken:");     
        
  //  var lineSvg = d3.select("#chart").append("svg").attr("width",10).attr("height",20)
    svg.selectAll(".line")
    .data(data).enter()
    .append("line")
    .attr("class", "line")
    .attr("stroke-width","1px")
    .attr("x1",function(d,i){
        //console.log(d)
        return lineOffset*d.itemIndex+leftMargin
    })
    .attr("y1",function(d){
        return d.groupIndex*lineGap+getRandomInt(0,slantScale(d[keyColumn]))
    })
    .attr("x2",function(d,i){   
    //    console.log(d[keyColumn])
        return lineOffset*d.itemIndex+leftMargin-getRandomInt(slantScale(d[keyColumn]), slantScale(d[keyColumn])*4)
    })
    .attr("y2",function(d){
        return d.groupIndex*lineGap+lineHeight-getRandomInt(0,slantScale(d[keyColumn]))
    })
    .attr("stroke",function(d){
        var colorIndex = d[colorKeyColumn]
        return colorScale(colorIndex)
    })
    .on("mouseover",function(d){
        d3.select(this).attr("stroke-width","6px")
        d3.select("#notes").html("Description:<br/>"+d.description)
    })
    .on("mouseout",function(d){
        d3.select(this).attr("stroke-width","1px")
        d3.select("#notes").html("Description:")
        
    })
    .attr("opacity",1)
    //.transition().duration(750).delay(function(d,i){return i*50})
   // .attr("transform", function(d, i) { return "translate(0," + 20 + ")"; });
    
   for(var i in data){
       if(data[i].itemIndex == 1){
         //  console.log(data[i][column])
           d3.select("#chart svg").append("text").text(data[i][column])
           .attr("y",data[i].groupIndex*lineGap+10)
           .attr("x",data[i].itemIndex+leftMargin-10)
           .attr("text-anchor","end")
       }
   }

}
function drawNest(data,svg,column){
//  console.log(data)
  var xScale = d3.scale.linear()
      .domain([0,24])
      .range([leftMargin, leftMargin+24*lineOffset*12]);
  var randomCoords = []
  for(var item in data){
      var randomX = getRandomInt(0,item)
      var randomY = getRandomInt(0,item)
      var randomA = getRandomInt(10,20)
      var randomC = (Math.random()-.5)*1.5
      var randomD =  (Math.random()-.5)*1.5
      
      randomCoords.push([randomX,randomY,randomA,randomC,randomD])
  }
//  console.log(randomCoords)
//  var lineSvg = d3.select("#chart").append("svg").attr("width",10).attr("height",20)
  svg.selectAll(".line")
  .data(data).enter()
  .append("line")
  .attr("class", "line")
  .attr("stroke-width","1px")
  .attr("opacity",0)
  .transition()
  .duration(500)
  .attr("opacity",.8)
  .delay(function(d,i){return i})
  .attr("x1",function(d,i){
      return 400+randomCoords[i][0]*randomCoords[i][3]
      return lineOffset*d.itemIndex+leftMargin
  })
  .attr("y1",function(d,i){
      return 200+randomCoords[i][1]*randomCoords[i][4]
      return d.groupIndex*lineGap+getRandomInt(0,slantScale(d[keyColumn]))
  })
  .attr("x2",function(d,i){   
      var x2 = Math.sqrt(20*20-(randomCoords[i][2]*randomCoords[i][2]))
      console.log(x2)

      return 400+randomCoords[i][0]*randomCoords[i][3]+x2
      return 400+randomCoords[i][0]*randomCoords[i][3]+5
      return lineOffset*d.itemIndex+leftMargin-getRandomInt(slantScale(d[keyColumn]), slantScale(d[keyColumn])*4)
  })
  .attr("y2",function(d,i){
      return 200+randomCoords[i][1]*randomCoords[i][4]+randomCoords[i][2]*randomCoords[i][4]
      
      return d.groupIndex*lineGap+lineHeight-getRandomInt(0,slantScale(d[keyColumn]))
  })
  .attr("stroke",function(d){
      var colorIndex = d[colorKeyColumn]
      return colorScale(colorIndex)
  })
 svg.selectAll(".line") .on("mouseover",function(d){
      d3.select(this).attr("stroke-width","6px")
      d3.select("#notes").html("Description:<br/>"+d.description)
  })
  .on("mouseout",function(d){
      d3.select(this).attr("stroke-width","1px")
      d3.select("#notes").html("Description:")
      
  })
  .attr("opacity",1)
  
  
  
//  svg.selectAll(".line")
//.transition()
//      .duration(750)
//  .attr("transform","translate("+getRandomInt(100,200)+","+getRandomInt(100,200)+")")
  //.transition().duration(750).delay(function(d,i){return i*50})
 // .attr("transform", function(d, i) { return "translate(0," + 20 + ")"; });


}