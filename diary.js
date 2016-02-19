function sheetLoaded(spreadsheetdata) {
    // from the library that converts spreadsheets from https://github.com/scottbw/Google-SpreadSheet-to-D3-Dataframe
    var spreadsheetData_import = mapEntries(spreadsheetdata,null,1);
   //first line is the header
    var headers = spreadsheetData_import[0]

    var spreadsheetData = formatSpreadsheet(spreadsheetData_import)
    drawKey()
    var svg = d3.select("#chart").append("svg").attr("width",1200).attr("height",800)
    var groupedData = intoArray(groupSpreadsheet(spreadsheetData,initialViewColumn))
    drawNest(groupedData,svg,initialViewColumn)
    
    for(var k in headers){
       if(headers[k]!="duration"&& headers[k]!="timeOfDay"){
           addButton(headers[k],spreadsheetData,svg)
       }
    }

}
function formatSpreadsheet(data){
   // console.log(data)
    var headers = data[0]
    var jsonFormat = []
    for(var row in data){
        if(row>0){
            var entry = {}
            for(var i in headers){
                var headerKey = headers[i]
                var value = data[row][i]
                entry[headerKey]=value
                }
            jsonFormat.push(entry)
        }
        
    }
//  uses interval length to expand the duration into multiple entries
    var expandedData = []
    for(var j in jsonFormat){
        var duration = jsonFormat[j].duration
        var multipleEntries = Math.round(jsonFormat[j].duration/interval)
        if(multipleEntries<1){multipleEntries=1}
        for(var k=0; k<=multipleEntries;k++){
            expandedData.push(jsonFormat[j])
        }
    }
    return expandedData
}
function initGraph(data,svg,column){
    var groupedData = intoArray(groupSpreadsheet(data,column))
    drawLine(groupedData,svg,column)
}

function groupSpreadsheet(data,column){
    var groupedData = {}
    for(var i in data){
        var key = data[i][column]
        if(key in groupedData){
            groupedData[key].push(data[i])
        }else{
            groupedData[key]=[]
            groupedData[key].push(data[i])
        }
    }
    return groupedData
}
function intoArray(data){
    var groupId = 0
    var itemId = 0
    var array = []
    for(var group in data){
        groupId +=1
        itemId = 0
        for(var entry in data[group]){
            data[group][entry]=[data[group][entry],[groupId,itemId]]
            itemId +=1
            array.push(data[group][entry])
        }
        
    }
    return array
}
function drawKey(){
    //TODO: change hardcoded media var to be updated by column selector
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
function addButton(column,data,svg){
    var width = column.length*10
    var controlsSvg =  d3.select("#buttons").append("svg").attr("width",100).attr("height",20)
    controlsSvg.append("text").text(column).attr("fill","#000").attr("x",0).attr("y",15).attr("class","button").attr("class",column)
    .on("click",function(){
        d3.selectAll("#buttons text").attr("fill","#000")
        d3.select(this).attr("fill","red")
        var newData = intoArray(groupSpreadsheet(data,column))
        update(newData,column,svg) 
        })
    .attr("cursor","pointer")
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function update(data,column,svg){
    d3.selectAll("#chart text").remove()
    drawLine(data,svg,column)  
    d3.selectAll(".line").transition().delay(function(d,i){return i*2})
    .duration(100)
    .attr("x1",function(d,i){
        return lineOffset*d[1][1]+leftMargin + getRandomInt(0, slantScale(d[0][keyColumn])*2)
    })
    .attr("y1",function(d){
        return d[1][0]*lineGap+getRandomInt(0,slantScale(d[0][keyColumn]))
    })
    .attr("x2",function(d,i){
        //console.log(d[keyColumn])
        return lineOffset*d[1][1]+leftMargin - getRandomInt(slantScale(d[0][keyColumn]), slantScale(d[0][keyColumn])*2)
    })
    .attr("y2",function(d){
        return d[1][0]*lineGap+lineHeight-getRandomInt(0,slantScale(d[0][keyColumn]))
    })
    .attr("stroke",function(d){
        var colorIndex = d[0][colorKeyColumn]
        return colorScale(colorIndex)
    })
}

function drawLine(data,svg,column){
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
            return lineOffset*d[1][1]+leftMargin+getRandomInt(0,slantScale(d[0][keyColumn])*2)
        })
        .attr("y1",function(d){
            return d[1][0]*lineGap-getRandomInt(0,slantScale(d[0][keyColumn]))
        })
        .attr("x2",function(d,i){   
        //    console.log(d[keyColumn])
            return lineOffset*d[1][1]+leftMargin-getRandomInt(0,slantScale(d[0][keyColumn])*2)
        })
        .attr("y2",function(d){
            return d[1][0]*lineGap+lineHeight+getRandomInt(0,slantScale(d[0][keyColumn]))
        })
        .attr("stroke",function(d){
            var colorIndex = d[0][colorKeyColumn]
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
        .attr("opacity",.8)
    //.transition().duration(750).delay(function(d,i){return i*50})
   // .attr("transform", function(d, i) { return "translate(0," + 20 + ")"; });
    
   for(var i in data){
       if(data[i][1][1] == 1){
           d3.select("#chart svg").append("text").text(data[i][0][column])
           .attr("y",data[i][1][0]*lineGap+10)
           .attr("x",data[i][1][1]+leftMargin-10)
           .attr("text-anchor","end")
       }
   }

}
function drawNest(data,svg,column){
  //console.log(data)
  var xScale = d3.scale.linear()
      .domain([0,24])
      .range([leftMargin, leftMargin+24*lineOffset*12]);
  var randomCoords = []
  for(var item in data){
    //  console.log(item)
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
  })
  .attr("y1",function(d,i){
      return 200+randomCoords[i][1]*randomCoords[i][4]
  })
  .attr("x2",function(d,i){   
      var x2 = Math.sqrt(20*20-(randomCoords[i][2]*randomCoords[i][2]))
      //console.log(x2)
      return 400+randomCoords[i][0]*randomCoords[i][3]+x2
  })
  .attr("y2",function(d,i){
      return 200+randomCoords[i][1]*randomCoords[i][4]+randomCoords[i][2]*randomCoords[i][4]
  })
  .attr("stroke",function(d){
      var colorIndex = d[0][colorKeyColumn]
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