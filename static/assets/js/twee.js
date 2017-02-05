//Chart.js for charting
//https://unpkg.com/simple-statistics@2.2.0/dist/simple-statistics.min.js for linear regression
//http://simplestatistics.org/docs/

window.onload=function() {
  console.log(window.INITIAL_STATE);
  let t=window.INITIAL_STATE.time;
  t.reverse();
  console.log(t);

  function parseTime(t) {
    //times are in formats like this:
    //Tue Jan 03 15:47:04 +0000 2017
    // 0   1  2     3       4    5 <<indices
    let a=t.split(" ");
    return `${a[1]} ${a[2]} ${a[5]}`;
  }

  let dates=t.map(t=>parseTime(t.time));
  let scores=t.map(t=>t.score);
  let comparative=t.map(t=>t.comparative);

  //fill out summary score stat box
  let sum=document.querySelector('div#summary');
  sum.innerHTML=`
  <div id="sumStats">
  <p>
  <h2>Score Summary Stats</h2>
  <h3>Mean:${ss.mean(scores).toFixed(3)}</h3>
  <h3>sampleStandardDeviation:${ss.sampleStandardDeviation(scores).toFixed(3)}</h3>
  <h3>Mode:${ss.mode(scores).toFixed(3)}</h3>
  <h3>Median:${ss.median(scores).toFixed(3)}</h3>
  <p>
  <h3>Mean:${ss.mean(comparative).toFixed(3)}</h3>
  <h3>sampleStandardDeviation:${ss.sampleStandardDeviation(comparative).toFixed(3)}</h3>
  <h3>Mode:${ss.mode(comparative).toFixed(3)}</h3>
  <h3>Median:${ss.median(comparative).toFixed(3)}</h3>
  </p>
  </div>`;

  //calculate the Y values for simple linear regression on the datapoints (using simple-statistics)
  let regressionArray=[];
  let lX=[];
  let lY=[];
  lY=t.map(t=>t.score);
  for (var i=0;i<scores.length;i++) { regressionArray[i]=[i,scores[i]]; }
  let l = ss.linearRegressionLine(ss.linearRegression(regressionArray));
  let lRegY=scores.map((s)=>l(s));
  //TODO strictly speaking this MIGHT BE INACCURATE for linear reg
  //as I think we're simply ignoring the date itself and counting the # of dates
  //so we're losing a little information
  let lRegX=regressionArray.map((p)=>p[0]);

  //draw the chart with the different datasets
  var ctx = document.getElementById("myChart");
  var myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: dates,
          datasets: [{
              label: 'Sentiment',
              data: scores,
              fill: false,
              backgroundColor: "rgba(75,192,192,0.4)",
              borderColor: "rgba(75,192,192,1)",
              pointBorderColor: "rgba(75,192,192,1)",
              pointBackgroundColor: "#fff",
              pointHoverBackgroundColor: "rgba(75,192,192,1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointHitRadius: 10,
          },
          {
              label: 'Comparative',
              data: comparative,
              fill: false,
              backgroundColor: "rgba(15,192,192,0.4)",
              borderColor: "rgba(15,192,192,0.4)",
              pointBorderColor: "rgba(15,192,192,0.4)",
              pointBackgroundColor: "#fff",
              pointHoverBackgroundColor: "rgba(15,192,192,0.4)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointHitRadius: 10,
          },
          {
            label: "Linear Regression Trendline",
            data: lRegY,
            fill: false,
            strokeColor: 'rgba(220,180,0,1)',
            pointColor: 'rgba(220,180,0,1)',
          }]
      },
      options: {
        title: {
        fontSize: 16,
        fontFamily: "'Helvetica Neue', 'Helvetica', 'sans-serif'",
        display: true,
        padding: 2,
        text: `Sentiment from ${dates[0]} to ${dates[dates.length-1]}`
    },
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });

}
