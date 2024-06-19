import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

const MARGIN = { top: 30, right: 30, bottom: 50, left: 70 };

export type DataPoint = { x: Date; y: number };

type AreaChartProps = {
  width: number;
  height: number;
  data: DataPoint[];
};

export const AreaChart = ({ width, height, data }: AreaChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const axesRef = useRef(null);
  const [containsPositive, setContainsPositive] = useState(false);
  const [containsNegative, setContainsNegative] = useState(true);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  useEffect(() => {
    setContainsNegative(data.filter((point) => point.y < 0).length > 0);
    setContainsPositive(data.filter((point) => point.y > 0).length > 0);
  }, [data]);

  // Y axis
  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([-1, 1]).range([boundsHeight, 0]);
  }, [data, height]);

  const [xMin, xMax] = d3.extent(data, (d) => d.x);

  const timeSpan = d3.timeDay.count(xMin!, xMax!); // Count days between min and max
  const tickInterval = Math.floor(timeSpan / 4); // Divide by desired number of ticks

  const allTickValues = d3.timeDay.range(xMin!, d3.timeDay.offset(xMax!, 1));

  const xScale = useMemo(() => {
    return d3
      .scaleTime() // Change to scaleTime for date values
      .domain([xMin || new Date(), xMax || new Date()]) // Use Date objects
      .range([0, boundsWidth]);
  }, [data, width]);

  // Render the X and Y axis using d3.js, not React
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();

    // Define the date format
    const timeFormat = d3.timeFormat("%Y-%m-%d");

    const xAxisGenerator = d3
      .axisBottom(xScale)
      .tickValues(allTickValues)
      .tickSize(-boundsHeight)
      .tickFormat((d) => {
        // Display label only for the first day of each month
        return ((d as Date).getDate() !== 2 &&
          (d as Date).getDate() % 2 === 0) ||
          (d as Date).getDate() === 1
          ? d3.timeFormat("%Y-%m-%d")(d as Date)
          : "";
      });

    const xAxis = svgElement
      .append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .attr("stroke", "white")
      .attr("color", "white")
      .call(xAxisGenerator);

    xAxis
      .selectAll(".tick line")
      .attr("stroke-opacity", 0.1) // Make grid lines less prominent
      .attr("shape-rendering", "crispEdges")
      .attr("stroke-dash", "2,2");

    // X Axis Label
    xAxis
      .append("text")
      .attr("class", "x axis-label")
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("x", boundsWidth / 2)
      .attr("y", 40) // Adjust this value to position the X-axis label below the tick marks
      .text("Date") // Replace with your actual X-axis label text
      .attr("fill", "white"); // Adjust text color if necessary

    const yAxisGenerator = d3.axisLeft(yScale).tickSize(-boundsWidth);

    const yAxis = svgElement
      .append("g")
      .attr("stroke", "white")
      .attr("color", "white")
      .call(yAxisGenerator);

    yAxis
      .selectAll(".tick line")
      .attr("stroke-opacity", 0.1) // Make grid lines less prominent
      .attr("shape-rendering", "crispEdges")
      .attr("stroke-dash", "2,2");

    // Y Axis Label
    yAxis
      .append("text")
      .attr("class", "y axis-label")
      .attr("font-size", "20px")
      .attr("transform", "rotate(-90)") // Rotate the text for Y-axis label
      .attr("y", -40) // Adjust this value to position the Y-axis label. Negative because of rotation.
      .attr("x", -boundsHeight / 2)
      .attr("text-anchor", "middle")
      .text("Sentiment") // Replace with your actual Y-axis label text
      .attr("fill", "white"); // Adjust text color if necessary

    svgElement.selectAll(".domain").remove();

    const yZero = yScale(0);

    // Append a white line at y=0
    svgElement
      .append("line")
      .attr("x1", 0)
      .attr("x2", boundsWidth)
      .attr("y1", yZero)
      .attr("y2", yZero)
      .attr("stroke", "white")
      .attr("stroke-width", 2); // Adjust the stroke width as needed

    const circleGroup = svgElement.append("g").attr("class", "circle-group");

    // Bind data to circles
    const circles = circleGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 3) // Radius of the circles, adjust as needed
      .attr("fill", "#8f59ab"); // Fill color of the circles, adjust as needed
  }, [xScale, yScale, boundsHeight]);

  const lineBuilder = d3
    .line<DataPoint>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));
  const linePath = lineBuilder(data);

  const areaBuilder = d3
    .area<DataPoint>()
    .x((d) => xScale(d.x))
    .y1((d) => yScale(d.y))
    .y0(yScale(0));
  const areaPath = areaBuilder(data);

  if (!linePath || !areaPath) {
    return null;
  }

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              {containsNegative && containsPositive ? (
                <>
                  <stop offset="0%" stopColor="green" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#9a6fb0" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#9a6fb0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="red" stopOpacity="0.4" />
                </>
              ) : containsNegative ? (
                <>
                  <stop offset="25%" stopColor="#9a6fb0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="red" stopOpacity="0.4" />
                </>
              ) : (
                <>
                  <stop offset="25%" stopColor="green" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#9a6fb0" stopOpacity="0.4" />
                </>
              )}
            </linearGradient>
          </defs>

          <path
            d={areaPath}
            opacity={1}
            stroke="none"
            fill="url(#areaGradient)"
          />

          <path
            d={linePath}
            opacity={1}
            stroke="#9a6fb0"
            fill="none"
            strokeWidth={2}
          />
        </g>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        />
      </svg>
    </div>
  );
};
