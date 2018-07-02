
let data;
//Client side code to implement calculations with the data dynamically
function getList() {
    //functiion that gets the entire list of Primary Types

    $.ajax({//ajax call to get the array
        type: "GET",
        url: `http://localhost:3000/primarylist`,//the url collects data from server
        dataType: 'json',
        success: function (result) {
            addList(result);//the function calls the addList function to show the list
        }

    })
}   

//function that displays the list and accepts multiple selections
//using Bootstrap and JQuery
function addList(array) {
    $(function () {
        var htm = '';
        array.map((item) => {
            htm += '<option>' + item + '</option>';//dynamically appends the list
        })
        $('#addmenu').append(htm);
    });
    $(document).ready(function () {
        $("#apply").click(function () {//waits for apply button to be clicked for selections
            $(function () {
                var selections = [];
                $.each($("#addmenu option:selected"), function () {
                    selections.push($(this).val());
                });//selections contain the array of multiple selections
                data = selections;
                drawGraph(data);//sends data to be represented graphically
            });

        })
    });

}


//function to graph the data using ajax,jQuery,and d3
function drawGraph(data) {
    var url = 'http://localhost:3000/arrestgraph/' + data;
    //the data is an array which is concatenated as a string to the url
    //so that the query can be read in the server side
    // console.log("URL", url) can be used to check this logic
    $.ajax({
        type: "GET",
        url: url,//url is sent
        success: function (result) {
            let tempArray = converter(result);
            //converter simplifies the data by getting rid of nested objects
            let key = ["Arrests", "No Arrests"];
            let data = tempArray;
            var margin = { top: 20, right: 160, bottom: 35, left: 100 };

            var width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var svg = d3.select("#stackedbars")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Transpose the data into layers
            var dataset = d3.layout.stack()(key.map(function (item) {
                return data.map(function (d) {
                    return { x: d["label"], y: +d[item] };
                });
            }));


            // Set x, y and colors
            var x = d3.scale.ordinal()
                .domain(dataset[0].map(function (d) { return d.x; }))
                .rangeRoundBands([10, width - 10], 0.02);

            var y = d3.scale.linear()
                .domain([0, d3.max(dataset, function (d) { return d3.max(d, function (d) { return d.y0 + d.y; }); })])
                .range([height, 0]);

            var colors = ["red", "darkblue"];


            // Define and draw axes
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(5)
                .tickSize(-width, 0, 0)
                .tickFormat(function (d) { return d });

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickFormat(function (d) { return d });

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);


            // Create groups for each series, rects for each segment 
            var groups = svg.selectAll("g.cost")
                .data(dataset)
                .enter().append("g")
                .attr("class", "cost")
                .style("fill", function (d, i) { return colors[i]; });

            var rect = groups.selectAll("rect")
                .data(function (d) { return d; })
                .enter()
                .append("rect")
                .attr("x", function (d) { return x(d.x); })
                .attr("y", function (d) { return y(d.y0 + d.y); })
                .attr("height", function (d) { return y(d.y0) - y(d.y0 + d.y); })
                .attr("width", x.rangeBand())
                .on("mouseover", function () { tooltip.style("display", "null"); })
                .on("mouseout", function () { tooltip.style("display", "none"); })
                .on("mousemove", function (d) {
                    var xPosition = d3.mouse(this)[0] - 15;
                    var yPosition = d3.mouse(this)[1] - 25;
                    tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                    tooltip.select("text").text(d.y);
                });


            // Draw legend
            var legend = svg.selectAll(".legend")
                .data(colors)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) { return "translate(30," + i * 19 + ")"; });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", function (d, i) { return colors.slice().reverse()[i]; });

            legend.append("text")
                .attr("x", width + 5)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .text(function (d, i) {
                    switch (i) {
                        case 0: return "Arrests";
                        case 1: return "No Arrests";
                    }
                });


            // Prep the tooltip bits, initial display is hidden
            var tooltip = svg.append("g")
                .attr("class", "tooltip")
                .style("display", "none");

            tooltip.append("rect")
                .attr("width", 30)
                .attr("height", 20)
                .attr("fill", "white")
                .style("opacity", 0.5);

            tooltip.append("text")
                .attr("x", 15)
                .attr("dy", "1.2em")
                .style("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("font-weight", "bold");

            //the following code creates the table

            var table = document.createElement("table");
            table.className = "gridtable";
            var thead = document.createElement("thead");
            var tbody = document.createElement("tbody");
            var headRow = document.createElement("tr");
            ["Crime", "Arrests", "No Arrests", "Total Cases"].forEach(function (el) {
                var th = document.createElement("th");
                th.appendChild(document.createTextNode(el));
                headRow.appendChild(th);
            });
            //the header has now been added to a newly created table
            data.forEach((item) => {
                item["total"] = parseInt(item["Arrests"]) + parseInt(item["No Arrests"]);
            });
            //the code above adds an object value for representation
            thead.appendChild(headRow);
            table.appendChild(thead);
            data.forEach(function (el) {//the loops add each element to its right position
                var tr = document.createElement("tr");
                for (var o in el) {
                    var td = document.createElement("td");
                    td.appendChild(document.createTextNode(el[o]))
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            //the id from the HTML is referred in order to be rendered
            document.getElementById("content").appendChild(table);
        }
    })

}
//function to simplify data from nested objects to simple objects
function converter(arr) {

    let ans = [];
    arr.forEach(element => {
        let obj = {};
        obj["label"] = Object.keys(element)[0].toString();//label: "Arson" or "Arrest"
        obj["Arrests"] = element[obj["label"]]["Arrest"].toString();//the Arrests are given its value
        obj["No Arrests"] = element[obj["label"]]["noArrest"].toString();//they are converted to strings in order to be used correctly by d3
        ans.push(obj);
    });
    return ans;
}
