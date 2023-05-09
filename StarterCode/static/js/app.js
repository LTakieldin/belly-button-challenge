let selDataset = d3.select("#selDataset");
let data = [];

// setting dimensions and margins of graph
let margin = { top: 20, bottom: 40, left: 90, right: 30 };
let width = 460 - margin.left - margin.right;
let height = 400 - margin.top - margin.bottom;

//append svg
let svg = d3
  .select("#bar")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.right})`);

//append svg bubble
var svgBubble = d3
  .select("#bubble")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//tooltip
let tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("display", "none");

function optionChanged(value) {
  console.log(value);
  let metadata = dataset.metadata.find((md) => {
    return md.id === parseInt(value);
  });
  d3.select("#sample-metadata-id").text("id :" + metadata.id);
  d3.select("#sample-metadata-ethnicity").text(
    "ethnicity :" + metadata.ethnicity
  );
  d3.select("#sample-metadata-gender").text("gender :" + metadata.gender);
  d3.select("#sample-metadata-age").text("age :" + metadata.age);
  d3.select("#sample-metadata-location").text("location :" + metadata.location);
  d3.select("#sample-metadata-bbtype").text("bbtype :" + metadata.bbtype);

  d3.select("#sample-metadata-wfreq").text("wfreq :" + metadata.wfreq);

  let selectedData = data.find((d) => d.id === value);
  drawBar(selectedData);
  drawBubble(selectedData);
}
d3.json(
  "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json"
).then((generalData) => {
  generalData.names.forEach((name) => {
    selDataset.append("option").attr("value", name).text(name);
  });
  dataset = generalData;

  setTimeout(() => {
    optionChanged(document.getElementById("selDataset").value);
  }, 250);

  generalData.samples.map((d) => {
    let newD = {
      id: d.id,
      otu_ids: d.otu_ids.slice(0, 10),
      sample_values: d.sample_values.slice(0, 10),
      otu_labels: d.otu_labels.slice(0, 10),
    };
    data.push(newD);
  });
});

function mouseover(d) {
  tooltip.style("display", "inline");
  tooltip.text(d.otu_label);
}
function mousemove() {
  tooltip
    .style("left", d3.event.pageX - 50 + "px")
    .style("top", d3.event.pageY - 70 + "px");
}
function mouseout() {
  tooltip.style("display", "none");
}

function drawBar(data) {
  d3.selectAll(".xAxis").remove();
  d3.selectAll(".yAxis").remove();

  const { otu_ids, sample_values } = data;

  // add x axis
  let xAxis = d3.scaleLinear().domain([0, sample_values[0]]).range([0, width]);
  svg
    .append("g")
    .classed("xAxis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xAxis))
    .selectAll("text")
    .attr("transform", `translate(-10,0)`);

  // add y axis
  let yAxis = d3
    .scaleBand()
    .range([0, height])
    .domain(otu_ids.map((id) => "OTU " + id))
    .padding(0.1);
  svg.append("g").classed("yAxis", true).call(d3.axisLeft(yAxis));

  let newData = [];
  for (let i = 0; i < otu_ids.length; i++) {
    const otu_id = otu_ids[i];
    const sample_value = sample_values[i];
    const otu_label = data.otu_labels[i];
    newData.push({ otu_id, sample_value, otu_label });
  }

  // bars
  svg
    .selectAll("myRect")
    .data(newData)
    .enter()
    .append("rect")
    .attr("x", xAxis(0))
    .attr("y", (d) => yAxis("OTU " + d.otu_id))
    .attr("width", (d) => xAxis(d.sample_value))
    .attr("height", yAxis.bandwidth())
    .attr("fill", "blue")
    .on("mouseover", (d) => mouseover(d))
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);
}

function drawBubble(oldData) {
  const { otu_ids, sample_values, otu_labels } = oldData;
  let data = [];
  for (let i = 0; i < otu_ids.length; i++) {
    const otu_id = otu_ids[i];
    const sample_value = sample_values[i];
    const otu_label = otu_labels[i];
    data.push({ otu_id, sample_value, otu_label });
  }

  console.log("Bubble", data);
  // Add X axis
  var x = d3.scaleLinear().domain([0, 3500]).range([0, width]);
  svgBubble
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear().domain(0, sample_values[0]).range([height, 0]);
  svgBubble.append("g").call(d3.axisLeft(y));

  // Add a scale for bubble size
  var z = d3.scaleLinear().domain([2000, 13000]).range([4, 40]);

  // Add a scale for bubble color
  var myColor = d3
    .scaleOrdinal()
    .domain([...sample_values])
    .range(d3.schemeSet2);

  // -1- Create a tooltip div that is hidden by default:
  var tooltip = svgBubble
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white");

  // Add dots
  svgBubble
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "bubbles")
    .attr("cx", function (d) {
      console.log(d);
      return x(d.otu_id);
    })
    .attr("cy", function (d) {
      return y(d.sample_value);
    })
    .attr("r", function (d) {
      return 20;
    })
    .style("fill", function (d) {
      return myColor(d.otu_id);
    });
  // -3- Trigger the functions
}
