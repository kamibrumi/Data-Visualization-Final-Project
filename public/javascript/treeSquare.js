/**
 * Interactive, zoomable treemap, using D3 v4
 *
 * A port to D3 v4 of Jacques Jahnichen's Block, using the same budget data
 * see: http://bl.ocks.org/JacquesJahnichen/42afd0cde7cbf72ecb81
 *
 * Author: Guglielmo Celata
 * Date: sept 1st 2017
 **/

var el_id = 'chart';
var obj = document.getElementById(el_id);
var divWidth = obj.offsetWidth;
var margin = {top: 30, right: 0, bottom: 20, left: 0},
    width = divWidth -25,
    height = 600 - margin.top - margin.bottom,
    formatNumber = d3.format(",");
// sets x and y scale to determine size of visible boxes
let x = d3.scaleLinear()
    .domain([0, width])
    .range([0, width]);
let y = d3.scaleLinear()
    .domain([0, height])
    .range([0, height]);
obj.innerHTML = "";
let treemap = d3.treemap()
    .size([width, height])
    .paddingInner(0)
    .round(false);
let svg = d3.select('#'+el_id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "root")
    .style("shape-rendering", "crispEdges");

function newTreeMap(page) {
    drawTreeMap(page);
}

function drawTreeMap(page) {
    findSimilar(page)
        .then((data) => {
            data = JSON.parse(data);
            console.log(data);
            var grandparent = svg.append("g")
                .attr("class", "grandparent");
            grandparent.append("rect")
                .attr("y", -margin.top)
                .attr("width", width)
                .attr("height", margin.top)
                .attr("fill", '#bbbbbb');
            grandparent.append("text")
                .attr("x", 6)
                .attr("y", 6 - margin.top)
                .attr("dy", ".75em");
            var d = d3.hierarchy(data);
            treemap(d
                .sum(function (d) {
                    return d.leafVal;
                })
                .sort(function (a, b) {
                    return b.height - a.height || b.value - a.value
                })
            );

            display(d);

            function display(d) {
                console.log(d);
                // write text into grandparent
                // and activate click's handler
                grandparent
                    .datum(d.parent)
                    .on("click", transition)
                    .select("text")
                    .text(name(d));
                // grandparent color
                grandparent
                    .datum(d.parent)
                    .select("rect")
                    .attr("fill", function () {
                        return '#bbbbbb'
                    });
                var g1 = svg.insert("g", ".grandparent")
                    .datum(d)
                    .attr("class", "depth");
                var g = g1.selectAll("g")
                    .data(d.children)
                    .enter()
                    .append("g");
                // add class and click handler to all g's with children
                g.filter(function (d) {
                    return d.children;
                })
                    .classed("children", true)
                    .on("click", transition);
                g.selectAll(".child")
                    .data(function (d) {
                        return d.children || [d];
                    })
                    .enter().append("rect")
                    .attr("class", "child")
                    .call(rect);
                // add title to parents
                g.append("rect")
                    .attr("class", "parent")
                    .call(rect)
                    .append("title")
                    .text(function (d) {
                        return d.data.title;
                    });
                /* Adding a foreign object instead of a text object, allows for text wrapping */
                g.append("foreignObject")
                    .call(rect)
                    .attr("class", "foreignobj")
                    .append("xhtml:div")
                    .attr("dy", ".75em")
                    .html(function (d) {
                        return '' +
                            '<p class="title">' + d.data.displaytitle + '</p>' +
                            '<p>' + formatNumber(d.value) + '</p>'
                            ;
                    })
                    .attr("class", "textdiv"); //textdiv class allows us to style the text easily with CSS

                async function transition(d) {
                    const title = d.data.title;
                    findSimilar(title)
                        .then((newChildren) => {
                            newChildren = JSON.parse(newChildren);
                            //display(newChildren);
                            const root = d3.hierarchy(newChildren);
                            treemap(root
                                .sum(function (d) {
                                    return d.leafVal;
                                })
                                .sort(function (a, b) {
                                    return b.height - a.height || b.value - a.value
                                })
                            );
                            display(root);
                            return;
                        })
                        .catch((err) => {
                            console.error("Status code: " + err.status);
                            console.error(err.statusText);
                        });
                }

                return g;
            }
        })
        .catch((err) => {
            console.error("Status code: " + err.status);
            console.error(err.statusText);
        });
    function text(text) {
        text.attr("x", function (d) {
            return x(d.x) + 6;
        })
            .attr("y", function (d) {
                return y(d.y) + 6;
            });
    }
    function rect(rect) {
        rect
            .attr("x", function (d) {
                return x(d.x0);
            })
            .attr("y", function (d) {
                return y(d.y0);
            })
            .attr("width", function (d) {
                return x(d.x1) - x(d.x0);
            })
            .attr("height", function (d) {
                return y(d.y1) - y(d.y0);
            })
            .attr("fill", function (d) {
                return '#bbbbbb';
            });
    }
    function foreign(foreign) { /* added */
        foreign
            .attr("x", function (d) {
                return x(d.x0);
            })
            .attr("y", function (d) {
                return y(d.y0);
            })
            .attr("width", function (d) {
                return x(d.x1) - x(d.x0);
            })
            .attr("height", function (d) {
                return y(d.y1) - y(d.y0);
            });
    }
    function name(d) {
        return breadcrumbs(d) +
            (d.parent
                ? " -  Click to zoom out"
                : " - Click inside square to zoom in");
    }
    function breadcrumbs(d) {
        var res = "";
        var sep = " > ";
        d.ancestors().reverse().forEach(function(i){
            res += i.data.displaytitle + sep;
        });
        return res
            .split(sep)
            .filter(function(i){
                return i!== "";
            })
            .join(sep);
    }
}
