//Global variable for all character data
var characterData;
var movieData;

//total svg margin
var margin = {top: 20, right: 60, bottom: 30, left: 40},
    width = 1200,
    height = 700;

//circles margin
var circlesMargin = {top: 20, right: 200, bottom: 30, left: 200}

//xScale setup
var xScale = d3.scaleLinear()
                .range([circlesMargin.left, width - circlesMargin.right]);

//yScale setup
var yScale = d3.scaleBand()
                .range([margin.top, height - margin.bottom]);

//roi bar scale setup
var roiScale = d3.scaleLinear() 
                    .range([10, circlesMargin.left - 100]);

d3.queue()
  .defer(d3.csv, "/data/CharacterData.csv")
  .defer(d3.json, "/data/movieData.json")
  .await(analyze);

function analyze(error, character, movie) {
    if(error) { 
        console.log(error); 
    }

    character.forEach(function (d) {
        // Convert numeric values to 'numbers'
        d.CHARACTER_WORDS = +d.CHARACTER_WORDS;
        d.TOTAL_MOVIE_WORDS = +d.TOTAL_MOVIE_WORDS;
        d.wordsPercent = (+d.CHARACTER_WORDS / +d.TOTAL_MOVIE_WORDS) * 100;
    });

    characterData = character;
    movieData = movie; 
    
    createChart();
   
}

/*
*   This is where the main chart is created
*/
function createChart() {

    //creates array wordCountPercent to set x scale domain
    var wordCountPercent = characterData.map(function(d) {
        return (d.CHARACTER_WORDS / d.TOTAL_MOVIE_WORDS) * 100;
    });
  
    
    //create array movieROI to set y scale domain
    var movieROI = movieData.map(function(d) {
        return d.value["roi"];
    });
    
    //assign ROI values to character data array
    characterData.forEach(function (d) {
        
        movieData.forEach(function(m) {
            if (m.key == d.MOVIE) {

                d.roi = m.value["roi"];
            }
         })
    });
    
    //x scale axis (word spoken percentage)
    xScale.domain([0, d3.max(wordCountPercent)]); 
    
    //y scale (total words for now until JSON is complete)
    yScale.domain(movieROI);
    
    //X axis
    var xAxis = d3.axisBottom();
    
    xAxis.scale(xScale);
    
    /*
    //Y axis can be completed with JSON data is complete
    var yAxis = d3.svg.axisLeft(yScale);
    */
    // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
     // x-axis
    svg.append("g")
        //.attr("class", "x axis")
        .attr("transform", "translate(0," + (height - 50) + ")")
        .call(xAxis)
        .append("text")
        //.attr("class", "label")
        .attr("x", 50)
        .attr("y", 50)
        .style("text-anchor", "end")
        .text("% of Words Spoken");
/*
  // y-axis
  svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
      . text("Movie");
    */
    
    /*  These are the rows for each movie
    *
    */
    
    var backBars = svg.selectAll("rect").data(movieROI);
    
    backBars = backBars.enter()
                .append('rect')
                .merge(backBars);
    
    backBars.exit().remove();
    
    backBars
        .attr('x', 0)
        .attr('y', function (d) {
            return yScale(d) - 30;
        })
        .attr('width', width)
        .attr('height', function(d) {
            return (height - 50) / 10;
        })
        .attr('fill', function(d) {
            if(movieROI.indexOf(d) % 2 == 0) {
                return "#eee";
            } else {
                return "#fff";
            }
        });
    
    /*ROI BARS
    *   rect1:  black bar
    *   rect2:  green bar roi amount
    */
    
    roiScale.domain([d3.min(movieROI), d3.max(movieROI)]);
    
    var rect1 = svg.selectAll('.rect1')
	    .data(movieData);
    
    rect1 = rect1
	    .enter()
        .append("rect")
        .merge(rect1);
    
    rect1.exit().remove();
    
    rect1
        .attr('class', 'rect1')
        .attr("x", function(d, i) {
          return 0;
        })
        //
        .attr("y", function(d, i) {
          return yScale(d.value["roi"]) - 30;
        })
        //
        .attr("width", function(d) {
            //create scale for this
            console.log(roiScale(1 / d.value["roi"]));
          return roiScale(1 / d.value["roi"]);
        })
        //
        .attr("height", function(d) {
          return 20;
        });

   //rect2: ROI times rectangle
    var rect2 = svg.selectAll('.rect2')
	    .data(movieData);
    
    rect2 = rect2
	    .enter()
        .append("rect")
        .merge(rect2);
    
    rect2.exit().remove();
    
    rect2
        .attr('class', 'rect2')
        .attr("x", function(d, i) {
          return 0;
        })
        //
        .attr("y", function(d, i) {
          return yScale(d.value["roi"]);
        })
        //
        .attr("width", function(d) {
            console.log(d.key);
            console.log(roiScale(d.value["roi"]))
            return roiScale(d.value["roi"]);
        })
        .attr("height", function(d) {
          return 20;
        });
    
    /*TEXT
    *
    */
    var roiText = svg.selectAll(".roiText")
        .data(movieData)
        .enter()
        .append("text")
        .text(function(d) {
          return d.value["roi"] + 'x';
        })
        //
        .attr("text-anchor", "middle")
        //
        .attr("x", function(d, i) {
          return 60;
        })
        //
        .attr("y", function(d, i) {
          return yScale(d.value["roi"]) + 10;
        })
        //
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        //.attr("fill", "white");
    
    /*CHARACTER CIRCLES
    *   circles:  
    */
    
    var circles = svg.selectAll("circle").data(characterData);
    
    circles = circles.enter()
                .append('circle')
                .merge(circles);
    
    circles.exit().remove();
    
    var colorSet = "gray";
    
    circles
        .attr('cx', function(d) {  
            return xScale(d.wordsPercent);
        })
        .attr('cy', function(d) {        
            return yScale(d.roi);
        })
        .attr('r', function(d) {
            return 5;
        })
        .attr('fill', function(d){
            if (d.GENDER == "male"){
                return "white"
            }
            else if (d.RACE == "white"){
                return "#992288"
            } else if (d.RACE == "black"){
                return "#11AA99"
            } else if (d.RACE == "asian"){
                return "#ee7722"
            } else if (d.RACE == "indian"){
                return "#cccc55"
            } else if (d.RACE == "mexican"){
                return "#3366AA"
            } else if (d.RACE == "nonhuman"){
                return "#333333"
            } 
        })
     /*   .attr('fill-opacity', function(d) {
            //eventually this will need to go into filters
            if(d.GENDER == "male") {
                return 0;
            } else if (d.GENDER == "female") {
                return 1;
            }
        })*/
        .attr('stroke', function(d){
            if (d.RACE == "white"){
                return "#992288"
            } else if (d.RACE == "black"){
                return "#11AA99"
            } else if (d.RACE == "asian"){
                return "#ee7722"
            } else if (d.RACE == "indian"){
                return "#cccc55"
            } else if (d.RACE == "mexican"){
                return "#3366AA"
            } else {
                return "#333333"
            }
        })
        .attr('stroke-width', 3)
        .on('mouseover', function(d) {
            //Will need to display the hover information
              console.log(d.NAME + " - "+ d.MOVIE);
            
            //GET COORDINATES of mouse
            var coordinates = [0,0];
            coordinates = d3.mouse(this);
            var x = coordinates[0];
            var y = coordinates[1];
               
            //SET VALUES in tooltip from d
            $('#tooltip .char').text(d.NAME); //title
            $('#tooltip .movie').text(d.MOVIE); //movie
            $('#tooltip .total-words').text("Words Spoken: " + d.CHARACTER_WORDS); //words spoken
            //if statement to show "< 1%" if calculation rounds to 0
            var percent = (Math.round((d.CHARACTER_WORDS/d.TOTAL_MOVIE_WORDS)*100));
            if (percent === 0){
                percent = "<1";
            }else{
                percent = percent;
            };
            $('#tooltip .percent').text("Percent of Total Movie Words: " + percent + "%"); //percent words spoken
            $('#tooltip .gender').text(d.GENDER); //gender
            $('#tooltip .race').text(d.RACE);
            $('#tooltip .orientation').text(d.SEXUAL_ORIENTATION);
            
            //SHOW TOOL TIP
            //set x and y
            $("#tooltip").css("left", x+margin.left+'px');
            $("#tooltip").css("top", y+margin.top-10+'px');
            $("#tooltip").fadeIn(300);
            
            
        })
        .on('mouseout', function(d) {
            //Will need to clear the hover information
            //hide tool tip
            document.getElementById("tooltip").style.display = 'none';
        });
    
}




/*      
  // draw legend
  var legend = svg.selectAll(".legend")
      .data()
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
*/


